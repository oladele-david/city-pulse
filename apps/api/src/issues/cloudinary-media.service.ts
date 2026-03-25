import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

interface UploadableIssueMediaFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface UploadedIssueMedia {
  secureUrl: string;
  resourceType: 'image' | 'video';
  publicId: string;
}

const SUPPORTED_ISSUE_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
]);

const MAX_ISSUE_MEDIA_SIZE_BYTES = 30 * 1024 * 1024;

@Injectable()
export class CloudinaryMediaService {
  private readonly cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  private readonly apiKey = process.env.CLOUDINARY_API_KEY;
  private readonly apiSecret = process.env.CLOUDINARY_API_SECRET;

  async uploadIssueMedia(file: UploadableIssueMediaFile): Promise<UploadedIssueMedia> {
    this.validateFile(file);

    if (!this.isConfigured()) {
      throw new ServiceUnavailableException({
        error: {
          code: 'media_upload_unavailable',
          message: 'Cloudinary is not configured for media uploads',
          details: [],
        },
      });
    }

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });

    const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'citypulse/issues',
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(
              new ServiceUnavailableException({
                error: {
                  code: 'media_upload_failed',
                  message: 'Issue media upload failed',
                  details: [],
                },
              }),
            );
            return;
          }

          resolve({
            secureUrl: result.secure_url,
            resourceType,
            publicId: result.public_id,
          });
        },
      );

      stream.end(file.buffer);
    });
  }

  async uploadIssueMediaBatch(files: UploadableIssueMediaFile[]): Promise<UploadedIssueMedia[]> {
    return Promise.all(files.map((file) => this.uploadIssueMedia(file)));
  }

  private isConfigured() {
    return Boolean(this.cloudName && this.apiKey && this.apiSecret);
  }

  private validateFile(file: UploadableIssueMediaFile) {
    if (!file?.buffer?.length) {
      throw new BadRequestException({
        error: {
          code: 'invalid_media',
          message: 'Uploaded media file is empty',
          details: [],
        },
      });
    }

    if (!SUPPORTED_ISSUE_MEDIA_TYPES.has(file.mimetype)) {
      throw new BadRequestException({
        error: {
          code: 'unsupported_media_type',
          message: 'Only JPEG, PNG, WebP, MP4, MOV, and WebM files are allowed',
          details: [],
        },
      });
    }

    if (file.size > MAX_ISSUE_MEDIA_SIZE_BYTES) {
      throw new BadRequestException({
        error: {
          code: 'media_too_large',
          message: 'Each uploaded media file must be 30MB or smaller',
          details: [],
        },
      });
    }
  }
}

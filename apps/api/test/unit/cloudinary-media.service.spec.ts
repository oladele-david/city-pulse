import { BadRequestException } from '@nestjs/common';
import { CloudinaryMediaService } from 'src/issues/cloudinary-media.service';

describe('CloudinaryMediaService', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('falls back to inline data URLs when Cloudinary is not configured', async () => {
    const service = new CloudinaryMediaService();

    const result = await service.uploadIssueMedia({
      originalname: 'refuse.jpg',
      mimetype: 'image/jpeg',
      size: 10,
      buffer: Buffer.from('fake-image'),
    });

    expect(result.resourceType).toBe('image');
    expect(result.secureUrl).toBe(
      `data:image/jpeg;base64,${Buffer.from('fake-image').toString('base64')}`,
    );
    expect(result.publicId).toMatch(/^local-inline\/image\//);
  });

  it('still rejects unsupported media types before attempting upload', async () => {
    const service = new CloudinaryMediaService();

    await expect(
      service.uploadIssueMedia({
        originalname: 'payload.gif',
        mimetype: 'image/gif',
        size: 10,
        buffer: Buffer.from('fake-image'),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

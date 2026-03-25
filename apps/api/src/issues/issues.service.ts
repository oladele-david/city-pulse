import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { AuthUser, IssueRecord, ReactionType } from 'src/domain/models';
import { calculateConfidenceScore } from 'src/domain/rules/confidence.rules';
import { POINTS_BY_REASON } from 'src/domain/rules/points.rules';
import { applyReactionTransition } from 'src/domain/rules/reaction.rules';
import { InMemoryDatabaseService } from 'src/infrastructure/in-memory/in-memory-database.service';
import { UsersRepository } from 'src/users/users.repository';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { UpdateReactionDto } from './dto/update-reaction.dto';
import { CloudinaryMediaService } from './cloudinary-media.service';
import { IssuesRepository } from './issues.repository';

interface IssueMediaFile {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface IssueUploadFiles {
  images?: IssueMediaFile[];
  video?: IssueMediaFile[];
}

@Injectable()
export class IssuesService {
  constructor(
    private readonly issuesRepository: IssuesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly db: InMemoryDatabaseService,
    private readonly cloudinaryMediaService: CloudinaryMediaService,
  ) {}

  list(filters: {
    lgaId?: string;
    communityId?: string;
    status?: string;
    severity?: string;
  }) {
    return this.issuesRepository.list(filters);
  }

  getByIdOrThrow(id: string): IssueRecord {
    const issue = this.issuesRepository.findById(id);
    if (!issue) {
      throw new NotFoundException({
        error: {
          code: 'not_found',
          message: 'Issue not found',
          details: [],
        },
      });
    }

    return issue;
  }

  async create(dto: CreateIssueDto, user: AuthUser, files?: IssueUploadFiles) {
    const reporter = this.usersRepository.findById(user.sub);
    if (!reporter) {
      throw new NotFoundException({
        error: {
          code: 'not_found',
          message: 'Reporter not found',
          details: [],
        },
      });
    }

    const lga = this.db.lgas.find((item) => item.id === dto.lgaId);
    const community = this.db.communities.find(
      (item) => item.id === dto.communityId && item.lgaId === dto.lgaId,
    );
    if (!lga || !community) {
      throw new NotFoundException({
        error: {
          code: 'not_found',
          message: 'Selected Lagos location was not found',
          details: [],
        },
      });
    }

    const similarNearbyIssueExists = Boolean(
      this.issuesRepository.findNearbySimilar({
        type: dto.type,
        communityId: dto.communityId,
        latitude: dto.latitude,
        longitude: dto.longitude,
      }),
    );

    const media = await this.resolveIssueMedia(dto, files);

    const confidence = calculateConfidenceScore({
      hasPhoto: Boolean(media.photoUrls.length || media.videoUrl),
      description: dto.description,
      similarNearbyIssueExists,
      confirmationsCount: 0,
      disagreementsCount: 0,
      reporterRank: reporter.rank,
    });

    const issue = this.issuesRepository.create({
      type: dto.type,
      title: dto.title,
      description: dto.description,
      severity: dto.severity,
      status: 'open',
      confidenceScore: confidence.score,
      confidenceBand: confidence.band,
      reportedByUserId: reporter.id,
      reporterTrustWeight: reporter.trustWeight,
      lgaId: dto.lgaId,
      communityId: dto.communityId,
      streetOrLandmark: dto.streetOrLandmark,
      latitude: dto.latitude,
      longitude: dto.longitude,
      photoUrls: media.photoUrls,
      videoUrl: media.videoUrl,
      confirmationsCount: 0,
      disagreementsCount: 0,
      fixedSignalsCount: 0,
      needsResolutionReview: false,
    });

    this.db.ledger.push({
      id: uuid(),
      userId: reporter.id,
      reason: 'report_submitted',
      pointsDelta: POINTS_BY_REASON.report_submitted,
      metadata: { issueId: issue.id },
      createdAt: new Date().toISOString(),
    });
    this.db.recalculateUserStanding(reporter.id);

    return issue;
  }

  private async resolveIssueMedia(dto: CreateIssueDto, files?: IssueUploadFiles) {
    const images = files?.images ?? [];
    const videos = files?.video ?? [];

    if ((images.length > 0 || videos.length > 0) && ((dto.photoUrls?.length ?? 0) > 0 || dto.videoUrl)) {
      throw new BadRequestException({
        error: {
          code: 'conflicting_media_input',
          message: 'Provide either uploaded media files or hosted media URLs, not both',
          details: [],
        },
      });
    }

    if ((dto.photoUrls?.length ?? 0) > 5) {
      throw new BadRequestException({
        error: {
          code: 'too_many_image_urls',
          message: 'Provide no more than 5 image URLs per issue report',
          details: [],
        },
      });
    }

    if (videos.length > 1) {
      throw new BadRequestException({
        error: {
          code: 'too_many_videos',
          message: 'Provide no more than 1 video per issue report',
          details: [],
        },
      });
    }

    if (images.length > 5) {
      throw new BadRequestException({
        error: {
          code: 'too_many_images',
          message: 'Provide no more than 5 images per issue report',
          details: [],
        },
      });
    }

    if (images.length === 0 && videos.length === 0) {
      return {
        photoUrls: dto.photoUrls ?? [],
        videoUrl: dto.videoUrl,
      };
    }

    const uploadedImages = await this.cloudinaryMediaService.uploadIssueMediaBatch(images);
    const uploadedVideo = videos[0]
      ? await this.cloudinaryMediaService.uploadIssueMedia(videos[0])
      : undefined;

    return {
      photoUrls: uploadedImages.map((item) => item.secureUrl),
      videoUrl: uploadedVideo?.secureUrl,
    };
  }

  updateStatus(id: string, dto: UpdateIssueStatusDto) {
    const issue = this.getByIdOrThrow(id);
    issue.status = dto.status;
    issue.updatedAt = new Date().toISOString();

    if (dto.status === 'in_progress') {
      this.db.ledger.push({
        id: uuid(),
        userId: issue.reportedByUserId,
        reason: 'report_validated',
        pointsDelta: POINTS_BY_REASON.report_validated,
        metadata: { issueId: issue.id },
        createdAt: new Date().toISOString(),
      });
      this.db.recalculateUserStanding(issue.reportedByUserId);
    }

    if (dto.status === 'resolved') {
      this.db.ledger.push({
        id: uuid(),
        userId: issue.reportedByUserId,
        reason: 'report_kept_valid',
        pointsDelta: POINTS_BY_REASON.report_kept_valid,
        metadata: { issueId: issue.id },
        createdAt: new Date().toISOString(),
      });
      this.db.recalculateUserStanding(issue.reportedByUserId);
      issue.needsResolutionReview = false;
    }

    return this.issuesRepository.update(issue);
  }

  getReaction(issueId: string, userId: string) {
    const reaction = this.issuesRepository.findReaction(issueId, userId);
    return {
      issueId,
      reaction: reaction?.reaction ?? ('none' as ReactionType),
    };
  }

  updateReaction(issueId: string, dto: UpdateReactionDto, user: AuthUser) {
    const issue = this.getByIdOrThrow(issueId);
    const currentReaction =
      this.issuesRepository.findReaction(issueId, user.sub)?.reaction ?? 'none';

    const reactionState = applyReactionTransition({
      issue: issue,
      currentReaction,
      requestedReaction: dto.reaction,
    });

    issue.confirmationsCount = reactionState.confirmationsCount;
    issue.disagreementsCount = reactionState.disagreementsCount;
    issue.fixedSignalsCount = reactionState.fixedSignalsCount;
    issue.needsResolutionReview = reactionState.needsResolutionReview;
    issue.updatedAt = new Date().toISOString();

    const reporter = this.usersRepository.findById(issue.reportedByUserId);
    if (reporter) {
      const confidence = calculateConfidenceScore({
        hasPhoto: Boolean(issue.photoUrls.length || issue.videoUrl),
        description: issue.description,
        similarNearbyIssueExists: true,
        confirmationsCount: issue.confirmationsCount,
        disagreementsCount: issue.disagreementsCount,
        reporterRank: reporter.rank,
      });
      issue.confidenceScore = confidence.score;
      issue.confidenceBand = confidence.band;
    }

    this.issuesRepository.update(issue);
    this.issuesRepository.upsertReaction({
      issueId,
      userId: user.sub,
      reaction: reactionState.nextReaction,
    });

    if (reactionState.nextReaction === 'confirm') {
      this.db.ledger.push({
        id: uuid(),
        userId: user.sub,
        reason: 'confirm_issue',
        pointsDelta: POINTS_BY_REASON.confirm_issue,
        metadata: { issueId },
        createdAt: new Date().toISOString(),
      });
      this.db.recalculateUserStanding(user.sub);
    }

    return {
      issueId,
      reaction: reactionState.nextReaction,
      counts: {
        confirmationsCount: issue.confirmationsCount,
        disagreementsCount: issue.disagreementsCount,
        fixedSignalsCount: issue.fixedSignalsCount,
      },
      needsResolutionReview: issue.needsResolutionReview,
      confidenceScore: issue.confidenceScore,
      confidenceBand: issue.confidenceBand,
    };
  }
}

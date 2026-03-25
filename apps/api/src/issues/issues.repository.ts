import { Injectable } from '@nestjs/common';
import { IssueReactionRecord, IssueRecord } from 'src/domain/models';
import {
  issueReactionRecordFromPrisma,
  issueRecordFromPrisma,
  toPrismaConfidenceBand,
  toPrismaReactionType,
  toPrismaSeverity,
} from 'src/infrastructure/prisma/prisma-mappers';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class IssuesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<IssueRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const issue = await this.prisma.issue.create({
      data: {
        type: data.type,
        title: data.title,
        description: data.description,
        severity: toPrismaSeverity(data.severity),
        status: data.status,
        confidenceScore: data.confidenceScore,
        confidenceBand: toPrismaConfidenceBand(data.confidenceBand),
        reportedByUserId: data.reportedByUserId,
        reporterTrustWeight: data.reporterTrustWeight,
        lgaId: data.lgaId,
        communityId: data.communityId,
        streetOrLandmark: data.streetOrLandmark,
        latitude: data.latitude,
        longitude: data.longitude,
        photoUrls: data.photoUrls,
        videoUrl: data.videoUrl,
        confirmationsCount: data.confirmationsCount,
        disagreementsCount: data.disagreementsCount,
        fixedSignalsCount: data.fixedSignalsCount,
        needsResolutionReview: data.needsResolutionReview,
      },
    });

    return issueRecordFromPrisma(issue);
  }

  async list(filters: {
    lgaId?: string;
    communityId?: string;
    status?: string;
    severity?: string;
  }): Promise<IssueRecord[]> {
    const issues = await this.prisma.issue.findMany({
      where: {
        lgaId: filters.lgaId,
        communityId: filters.communityId,
        status: filters.status as IssueRecord['status'] | undefined,
        severity: filters.severity as IssueRecord['severity'] | undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    return issues.map(issueRecordFromPrisma);
  }

  async findById(id: string) {
    const issue = await this.prisma.issue.findUnique({
      where: { id },
    });

    return issue ? issueRecordFromPrisma(issue) : undefined;
  }

  async update(issue: IssueRecord) {
    const updated = await this.prisma.issue.update({
      where: { id: issue.id },
      data: {
        type: issue.type,
        title: issue.title,
        description: issue.description,
        severity: toPrismaSeverity(issue.severity),
        status: issue.status,
        confidenceScore: issue.confidenceScore,
        confidenceBand: toPrismaConfidenceBand(issue.confidenceBand),
        reporterTrustWeight: issue.reporterTrustWeight,
        lgaId: issue.lgaId,
        communityId: issue.communityId,
        streetOrLandmark: issue.streetOrLandmark,
        latitude: issue.latitude,
        longitude: issue.longitude,
        photoUrls: issue.photoUrls,
        videoUrl: issue.videoUrl,
        confirmationsCount: issue.confirmationsCount,
        disagreementsCount: issue.disagreementsCount,
        fixedSignalsCount: issue.fixedSignalsCount,
        needsResolutionReview: issue.needsResolutionReview,
        updatedAt: new Date(issue.updatedAt),
      },
    });

    return issueRecordFromPrisma(updated);
  }

  async findNearbySimilar(params: {
    type: string;
    communityId: string;
    latitude: number;
    longitude: number;
  }) {
    const issue = await this.prisma.issue.findFirst({
      where: {
        type: params.type,
        communityId: params.communityId,
        latitude: {
          gte: params.latitude - 0.01,
          lte: params.latitude + 0.01,
        },
        longitude: {
          gte: params.longitude - 0.01,
          lte: params.longitude + 0.01,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return issue ? issueRecordFromPrisma(issue) : undefined;
  }

  async findReaction(
    issueId: string,
    userId: string,
  ): Promise<IssueReactionRecord | undefined> {
    const reaction = await this.prisma.issueReaction.findUnique({
      where: {
        issueId_userId: {
          issueId,
          userId,
        },
      },
    });

    return reaction ? issueReactionRecordFromPrisma(reaction) : undefined;
  }

  async upsertReaction(data: Omit<IssueReactionRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const reaction = await this.prisma.issueReaction.upsert({
      where: {
        issueId_userId: {
          issueId: data.issueId,
          userId: data.userId,
        },
      },
      update: {
        reaction: toPrismaReactionType(data.reaction),
      },
      create: {
        issueId: data.issueId,
        userId: data.userId,
        reaction: toPrismaReactionType(data.reaction),
      },
    });

    return issueReactionRecordFromPrisma(reaction);
  }
}

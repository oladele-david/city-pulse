import { Injectable } from '@nestjs/common';
import { calculateCommunityScore } from 'src/domain/rules/leaderboard.rules';
import { issueRecordFromPrisma } from 'src/infrastructure/prisma/prisma-mappers';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLagosLeaderboard() {
    return this.groupByCommunity();
  }

  async getLgaLeaderboard(lgaId: string) {
    return (await this.groupByCommunity()).filter((entry) => entry.lgaId === lgaId);
  }

  async getCommunityLeaderboard(communityId: string) {
    return (await this.groupByCommunity()).filter(
      (entry) => entry.communityId === communityId,
    );
  }

  private async groupByCommunity() {
    const communities = await this.prisma.community.findMany({
      include: {
        lga: true,
        issues: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return communities.map((community) => {
      const issues = community.issues.map(issueRecordFromPrisma);
      return {
        communityId: community.id,
        communityName: community.name,
        lgaId: community.lgaId,
        lgaName: community.lga?.name ?? null,
        score: calculateCommunityScore(issues, new Date()),
        resolvedIssueCount: issues.filter((issue) => issue.status === 'resolved').length,
        unresolvedIssueCount: issues.filter((issue) => issue.status !== 'resolved').length,
      };
    });
  }
}

import { Injectable } from '@nestjs/common';
import { calculateCommunityScore } from 'src/domain/rules/leaderboard.rules';
import { InMemoryDatabaseService } from 'src/infrastructure/in-memory/in-memory-database.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  getLagosLeaderboard() {
    return this.groupByCommunity();
  }

  getLgaLeaderboard(lgaId: string) {
    return this.groupByCommunity().filter((entry) => entry.lgaId === lgaId);
  }

  getCommunityLeaderboard(communityId: string) {
    return this.groupByCommunity().filter((entry) => entry.communityId === communityId);
  }

  private groupByCommunity() {
    return this.db.communities.map((community) => {
      const issues = this.db.issues.filter((issue) => issue.communityId === community.id);
      const lga = this.db.lgas.find((item) => item.id === community.lgaId);

      return {
        communityId: community.id,
        communityName: community.name,
        lgaId: community.lgaId,
        lgaName: lga?.name ?? null,
        score: calculateCommunityScore(issues, new Date()),
        resolvedIssueCount: issues.filter((issue) => issue.status === 'resolved').length,
        unresolvedIssueCount: issues.filter((issue) => issue.status !== 'resolved').length,
      };
    });
  }
}

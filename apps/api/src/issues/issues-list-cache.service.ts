import { Injectable } from '@nestjs/common';
import { IssueRecord } from 'src/domain/models';

interface ListIssuesFilters {
  lgaId?: string;
  communityId?: string;
  status?: string;
  severity?: string;
}

@Injectable()
export class IssuesListCacheService {
  private readonly cache = new Map<string, IssueRecord[]>();

  get(filters: ListIssuesFilters): IssueRecord[] | undefined {
    const cached = this.cache.get(this.toKey(filters));
    return cached?.map((issue) => this.cloneIssue(issue));
  }

  set(filters: ListIssuesFilters, issues: IssueRecord[]): IssueRecord[] {
    const clonedIssues = issues.map((issue) => this.cloneIssue(issue));
    this.cache.set(this.toKey(filters), clonedIssues);
    return clonedIssues.map((issue) => this.cloneIssue(issue));
  }

  invalidateAll() {
    this.cache.clear();
  }

  private toKey(filters: ListIssuesFilters): string {
    return JSON.stringify({
      communityId: filters.communityId ?? null,
      lgaId: filters.lgaId ?? null,
      severity: filters.severity ?? null,
      status: filters.status ?? null,
    });
  }

  private cloneIssue(issue: IssueRecord): IssueRecord {
    return {
      ...issue,
      photoUrls: [...issue.photoUrls],
    };
  }
}

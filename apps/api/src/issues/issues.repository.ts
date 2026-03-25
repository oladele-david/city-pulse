import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { IssueReactionRecord, IssueRecord } from 'src/domain/models';
import { InMemoryDatabaseService } from 'src/infrastructure/in-memory/in-memory-database.service';

@Injectable()
export class IssuesRepository {
  constructor(private readonly db: InMemoryDatabaseService) {}

  create(data: Omit<IssueRecord, 'id' | 'createdAt' | 'updatedAt'>): IssueRecord {
    const now = new Date().toISOString();
    const issue: IssueRecord = {
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };

    this.db.issues.unshift(issue);
    return issue;
  }

  list(filters: {
    lgaId?: string;
    communityId?: string;
    status?: string;
    severity?: string;
  }): IssueRecord[] {
    return this.db.issues.filter((issue) => {
      if (filters.lgaId && issue.lgaId !== filters.lgaId) {
        return false;
      }
      if (filters.communityId && issue.communityId !== filters.communityId) {
        return false;
      }
      if (filters.status && issue.status !== filters.status) {
        return false;
      }
      if (filters.severity && issue.severity !== filters.severity) {
        return false;
      }
      return true;
    });
  }

  findById(id: string) {
    return this.db.issues.find((issue) => issue.id === id);
  }

  update(issue: IssueRecord) {
    const targetIndex = this.db.issues.findIndex((item) => item.id === issue.id);
    this.db.issues[targetIndex] = issue;
    return issue;
  }

  findNearbySimilar(params: {
    type: string;
    communityId: string;
    latitude: number;
    longitude: number;
  }) {
    return this.db.issues.find(
      (issue) =>
        issue.type === params.type &&
        issue.communityId === params.communityId &&
        Math.abs(issue.latitude - params.latitude) < 0.01 &&
        Math.abs(issue.longitude - params.longitude) < 0.01,
    );
  }

  findReaction(issueId: string, userId: string): IssueReactionRecord | undefined {
    return this.db.reactions.find(
      (reaction) => reaction.issueId === issueId && reaction.userId === userId,
    );
  }

  upsertReaction(data: Omit<IssueReactionRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const existing = this.findReaction(data.issueId, data.userId);
    const now = new Date().toISOString();

    if (existing) {
      existing.reaction = data.reaction;
      existing.updatedAt = now;
      return existing;
    }

    const record: IssueReactionRecord = {
      ...data,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
    };
    this.db.reactions.push(record);
    return record;
  }
}

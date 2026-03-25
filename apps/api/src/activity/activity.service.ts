import { Injectable } from '@nestjs/common';
import { InMemoryDatabaseService } from 'src/infrastructure/in-memory/in-memory-database.service';

@Injectable()
export class ActivityService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  getMyActivity(userId: string) {
    return this.db.ledger
      .filter((entry) => entry.userId === userId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }
}

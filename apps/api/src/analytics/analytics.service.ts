import { Injectable } from '@nestjs/common';
import { InMemoryDatabaseService } from 'src/infrastructure/in-memory/in-memory-database.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly db: InMemoryDatabaseService) {}

  overview() {
    return {
      issues: {
        total: this.db.issues.length,
        open: this.db.issues.filter((issue) => issue.status === 'open').length,
        inProgress: this.db.issues.filter((issue) => issue.status === 'in_progress').length,
        resolved: this.db.issues.filter((issue) => issue.status === 'resolved').length,
      },
      payments: {
        total: this.db.payments.length,
        succeeded: this.db.payments.filter((payment) => payment.status === 'succeeded').length,
        pending: this.db.payments.filter((payment) => payment.status !== 'succeeded').length,
      },
      users: {
        citizens: this.db.users.filter((user) => user.role === 'citizen').length,
        admins: this.db.users.filter((user) => user.role === 'admin').length,
      },
    };
  }
}

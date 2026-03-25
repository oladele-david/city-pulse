import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      totalPayments,
      succeededPayments,
      nonSucceededPayments,
      citizens,
      admins,
    ] = await Promise.all([
      this.prisma.issue.count(),
      this.prisma.issue.count({ where: { status: 'open' } }),
      this.prisma.issue.count({ where: { status: 'in_progress' } }),
      this.prisma.issue.count({ where: { status: 'resolved' } }),
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: 'succeeded' } }),
      this.prisma.payment.count({ where: { status: { not: 'succeeded' } } }),
      this.prisma.user.count({ where: { role: 'citizen' } }),
      this.prisma.user.count({ where: { role: 'admin' } }),
    ]);

    return {
      issues: {
        total: totalIssues,
        open: openIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues,
      },
      payments: {
        total: totalPayments,
        succeeded: succeededPayments,
        pending: nonSucceededPayments,
      },
      users: {
        citizens,
        admins,
      },
    };
  }
}

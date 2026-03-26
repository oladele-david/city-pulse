import { Injectable } from '@nestjs/common';
import { LevyStatus, LevyTargetType, PaymentStatus, PaymentType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

const levyInclude = {
  targetCommunity: {
    select: {
      id: true,
      name: true,
      lgaId: true,
    },
  },
  targetLga: {
    select: {
      id: true,
      name: true,
      stateId: true,
    },
  },
  createdByAdmin: {
    select: {
      id: true,
      fullName: true,
      email: true,
    },
  },
} satisfies Prisma.LevyInclude;

@Injectable()
export class LeviesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description: string;
    levyType: PaymentType;
    amount: number;
    dueDate: Date;
    targetType: LevyTargetType;
    targetCommunityId?: string;
    targetLgaId?: string;
    status: LevyStatus;
    createdByAdminId: string;
  }) {
    return this.prisma.levy.create({
      data: {
        title: data.title,
        description: data.description,
        levyType: data.levyType,
        amount: data.amount,
        dueDate: data.dueDate,
        targetType: data.targetType,
        targetCommunityId: data.targetCommunityId,
        targetLgaId: data.targetLgaId,
        status: data.status,
        createdByAdminId: data.createdByAdminId,
      },
      include: levyInclude,
    });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      levyType: PaymentType;
      amount: number;
      dueDate: Date;
      targetType: LevyTargetType;
      targetCommunityId: string | null;
      targetLgaId: string | null;
      status: LevyStatus;
    }>,
  ) {
    return this.prisma.levy.update({
      where: { id },
      data,
      include: levyInclude,
    });
  }

  async findById(id: string) {
    return this.prisma.levy.findUnique({
      where: { id },
      include: levyInclude,
    });
  }

  async listAdmin(status?: LevyStatus) {
    return this.prisma.levy.findMany({
      where: status ? { status } : undefined,
      include: levyInclude,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async listApplicableForCitizen(user: { lgaId: string; communityId: string }) {
    return this.prisma.levy.findMany({
      where: {
        status: LevyStatus.published,
        OR: [
          {
            targetType: LevyTargetType.community,
            targetCommunityId: user.communityId,
          },
          {
            targetType: LevyTargetType.lga,
            targetLgaId: user.lgaId,
          },
        ],
      },
      include: levyInclude,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findSuccessfulPaymentForCitizen(levyId: string, userId: string) {
    return this.prisma.payment.findFirst({
      where: {
        levyId,
        userId,
        status: PaymentStatus.succeeded,
      },
    });
  }

  async getDashboard(levyId: string) {
    const [successful, pending, failed, payerCount] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { levyId, status: PaymentStatus.succeeded },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      this.prisma.payment.count({
        where: { levyId, status: { in: [PaymentStatus.pending, PaymentStatus.initialized] } },
      }),
      this.prisma.payment.count({
        where: { levyId, status: PaymentStatus.failed },
      }),
      this.prisma.payment.groupBy({
        by: ['userId'],
        where: { levyId, status: PaymentStatus.succeeded },
      }),
    ]);

    return {
      totalCollectedAmount: Number(successful._sum.amount ?? 0),
      successfulPaymentCount: successful._count._all,
      pendingPaymentCount: pending,
      failedPaymentCount: failed,
      payerCount: payerCount.length,
    };
  }

  async listPayments(levyId: string, status?: PaymentStatus) {
    return this.prisma.payment.findMany({
      where: {
        levyId,
        ...(status ? { status } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            lgaId: true,
            communityId: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }
}

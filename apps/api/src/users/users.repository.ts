import { Injectable } from '@nestjs/common';
import { UserRecord } from 'src/domain/models';
import { deriveRank, getTrustWeight } from 'src/domain/rules/points.rules';
import {
  toPrismaRank,
  toPrismaRole,
  userRecordFromPrisma,
} from 'src/infrastructure/prisma/prisma-mappers';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    const user = await this.prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: data.passwordHash,
        role: toPrismaRole(data.role),
        lgaId: data.lgaId,
        communityId: data.communityId,
        streetOrArea: data.streetOrArea,
        points: data.points,
        rank: toPrismaRank(data.rank),
        trustWeight: data.trustWeight,
      },
    });

    return userRecordFromPrisma(user);
  }

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    return user ? userRecordFromPrisma(user) : undefined;
  }

  async findById(id: string): Promise<UserRecord | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? userRecordFromPrisma(user) : undefined;
  }

  async listAdmins(): Promise<UserRecord[]> {
    const users = await this.prisma.user.findMany({
      where: { role: 'admin' },
      orderBy: { createdAt: 'asc' },
    });

    return users.map(userRecordFromPrisma);
  }

  async recalculateStanding(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return;
    }

    const aggregate = await this.prisma.pointsLedger.aggregate({
      where: { userId },
      _sum: { pointsDelta: true },
    });

    const totalPoints = aggregate._sum.pointsDelta ?? 0;
    const rank = deriveRank(totalPoints);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: totalPoints,
        rank: toPrismaRank(rank),
        trustWeight: getTrustWeight(rank),
      },
    });
  }
}

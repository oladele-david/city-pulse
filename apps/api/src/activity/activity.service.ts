import { Injectable } from '@nestjs/common';
import { pointsLedgerRecordFromPrisma } from 'src/infrastructure/prisma/prisma-mappers';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyActivity(userId: string) {
    const entries = await this.prisma.pointsLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map(pointsLedgerRecordFromPrisma);
  }
}

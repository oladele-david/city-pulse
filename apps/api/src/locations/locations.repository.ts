import { Injectable } from '@nestjs/common';
import {
  communityRecordFromPrisma,
  lgaRecordFromPrisma,
  stateRecordFromPrisma,
} from 'src/infrastructure/prisma/prisma-mappers';
import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

@Injectable()
export class LocationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getState() {
    const state = await this.prisma.state.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    return state ? stateRecordFromPrisma(state) : undefined;
  }

  async findLgaById(id: string) {
    const lga = await this.prisma.lga.findUnique({
      where: { id },
    });

    return lga ? lgaRecordFromPrisma(lga) : undefined;
  }

  async listLgas() {
    const lgas = await this.prisma.lga.findMany({
      orderBy: { name: 'asc' },
    });

    return lgas.map(lgaRecordFromPrisma);
  }

  async findCommunityById(id: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
    });

    return community ? communityRecordFromPrisma(community) : undefined;
  }

  async findCommunityInLga(id: string, lgaId: string) {
    const community = await this.prisma.community.findFirst({
      where: { id, lgaId },
    });

    return community ? communityRecordFromPrisma(community) : undefined;
  }

  async listCommunitiesByLga(lgaId: string) {
    const communities = await this.prisma.community.findMany({
      where: { lgaId },
      orderBy: { name: 'asc' },
    });

    return communities.map(communityRecordFromPrisma);
  }

  async listCommunities() {
    const communities = await this.prisma.community.findMany({
      orderBy: { name: 'asc' },
    });

    return communities.map(communityRecordFromPrisma);
  }
}

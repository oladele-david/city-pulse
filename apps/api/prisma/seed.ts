import { PrismaClient, Rank, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  lagosCommunities,
  lagosLgaCatalog,
  lagosLgas,
  lagosState,
} from '../src/locations/lagos-location-catalog';

const prisma = new PrismaClient();

async function main() {
  await prisma.state.upsert({
    where: { id: lagosState.id },
    update: { name: lagosState.name },
    create: { id: lagosState.id, name: lagosState.name },
  });

  await prisma.community.deleteMany({
    where: {
      id: {
        notIn: lagosCommunities.map((community) => community.id),
      },
    },
  });

  await prisma.lga.deleteMany({
    where: {
      id: {
        notIn: lagosLgas.map((lga) => lga.id),
      },
    },
  });

  for (const lga of lagosLgaCatalog) {
    await prisma.lga.upsert({
      where: { id: lga.id },
      update: {
        name: lga.name,
        latitude: lga.latitude,
        longitude: lga.longitude,
        stateId: lagosState.id,
      },
      create: {
        id: lga.id,
        name: lga.name,
        latitude: lga.latitude,
        longitude: lga.longitude,
        stateId: lagosState.id,
      },
    });

    for (const community of lga.communities) {
      await prisma.community.upsert({
        where: { id: community.id },
        update: {
          lgaId: lga.id,
          name: community.name,
          latitude: community.latitude,
          longitude: community.longitude,
        },
        create: {
          id: community.id,
          lgaId: lga.id,
          name: community.name,
          latitude: community.latitude,
          longitude: community.longitude,
        },
      });
    }
  }

  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const citizenPasswordHash = await bcrypt.hash('CitizenPass123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@citypulse.ng' },
    update: {},
    create: {
      fullName: 'CityPulse Admin',
      email: 'admin@citypulse.ng',
      passwordHash: adminPasswordHash,
      role: Role.admin,
      lgaId: 'ikeja',
      communityId: 'alausa',
      streetOrArea: 'Alausa Secretariat',
      points: 75,
      rank: Rank.COMMUNITY_SENTINEL,
      trustWeight: 1.5,
    },
  });

  await prisma.user.upsert({
    where: { email: 'citizen@citypulse.ng' },
    update: {},
    create: {
      fullName: 'Demo Citizen',
      email: 'citizen@citypulse.ng',
      passwordHash: citizenPasswordHash,
      role: Role.citizen,
      lgaId: 'surulere',
      communityId: 'adeniran-ogunsanya',
      streetOrArea: 'Adeniran Ogunsanya Street',
      points: 14,
      rank: Rank.RELIABLE,
      trustWeight: 1.15,
    },
  });
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

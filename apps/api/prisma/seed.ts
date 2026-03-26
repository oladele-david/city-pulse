import {
  IssueStatus,
  LedgerReason,
  LevyStatus,
  PaymentType,
  PrismaClient,
  Rank,
  Role,
  Severity,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { calculateConfidenceScore } from '../src/domain/rules/confidence.rules';
import { deriveRank, getTrustWeight, POINTS_BY_REASON } from '../src/domain/rules/points.rules';
import { toPrismaRank } from '../src/infrastructure/prisma/prisma-mappers';
import {
  lagosCommunities,
  lagosLgaCatalog,
  lagosLgas,
  lagosState,
} from '../src/locations/lagos-location-catalog';

const prisma = new PrismaClient();

type SeedIssue = {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: Severity;
  status: IssueStatus;
  lgaId: string;
  communityId: string;
  streetOrLandmark: string;
  latitude: number;
  longitude: number;
  photoUrls?: string[];
  videoUrl?: string;
  confirmationsCount: number;
  disagreementsCount: number;
  fixedSignalsCount: number;
  needsResolutionReview?: boolean;
  createdAt: string;
};

const DEMO_ADMIN_EMAIL = 'admin@citypulse.ng';
const DEMO_CITIZEN_EMAIL = 'citizen@citypulse.ng';
const DEMO_ISSUE_LEDGER_REASONS: LedgerReason[] = [
  'report_submitted',
  'report_validated',
  'report_kept_valid',
];

const demoLevySeeds = [
  {
    id: 'seed-levy-community-sanitation',
    title: 'Adeniran Ogunsanya sanitation levy',
    description:
      'Quarterly contribution for community sanitation materials and waste evacuation support.',
    levyType: PaymentType.sanitation_levy,
    amount: 15000,
    dueDate: '2026-04-30T00:00:00.000Z',
    targetType: 'community' as const,
    targetCommunityId: 'adeniran-ogunsanya',
    targetLgaId: null,
    status: LevyStatus.published,
  },
  {
    id: 'seed-levy-surulere-environmental',
    title: 'Surulere environmental response levy',
    description:
      'LGA-wide levy supporting drainage clearance and emergency environmental response.',
    levyType: PaymentType.environmental_fee,
    amount: 22000,
    dueDate: '2026-05-15T00:00:00.000Z',
    targetType: 'lga' as const,
    targetCommunityId: null,
    targetLgaId: 'surulere',
    status: LevyStatus.published,
  },
];

const demoIssueSeeds: SeedIssue[] = [
  {
    id: 'seed-demo-issue-drainage-surulere',
    type: 'drainage',
    title: 'Blocked drainage beside Adeniran Ogunsanya market stretch',
    description:
      'Drainage is packed with waste near the market entrance and water now spills onto the road after light rain.',
    severity: Severity.high,
    status: IssueStatus.in_progress,
    lgaId: 'surulere',
    communityId: 'adeniran-ogunsanya',
    streetOrLandmark: 'Adeniran Ogunsanya Road by the market bus stop',
    latitude: 6.506417,
    longitude: 3.346292,
    photoUrls: ['https://images.unsplash.com/photo-1524499982521-1ffd58dd89ea'],
    confirmationsCount: 3,
    disagreementsCount: 0,
    fixedSignalsCount: 0,
    createdAt: '2026-03-18T08:15:00.000Z',
  },
  {
    id: 'seed-demo-issue-lighting-yaba',
    type: 'lighting',
    title: 'Streetlights out around Yaba-Igbobi pedestrian route',
    description:
      'The lamps along the evening footpath have been out for days, leaving the corridor dark and unsafe after 7pm.',
    severity: Severity.medium,
    status: IssueStatus.open,
    lgaId: 'lagos-mainland',
    communityId: 'lagos-mainland-yaba-igbobi',
    streetOrLandmark: 'Herbert Macaulay corridor near Yaba College junction',
    latitude: 6.523159,
    longitude: 3.367497,
    confirmationsCount: 1,
    disagreementsCount: 0,
    fixedSignalsCount: 0,
    createdAt: '2026-03-19T18:40:00.000Z',
  },
  {
    id: 'seed-demo-issue-road-ikeja',
    type: 'road',
    title: 'Deep potholes forming around Alausa secretariat approach',
    description:
      'Multiple potholes have widened near the secretariat access road and vehicles now swerve into oncoming traffic to avoid them.',
    severity: Severity.high,
    status: IssueStatus.resolved,
    lgaId: 'ikeja',
    communityId: 'alausa',
    streetOrLandmark: 'Alausa Secretariat approach road',
    latitude: 6.614981,
    longitude: 3.35428,
    photoUrls: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd'],
    confirmationsCount: 4,
    disagreementsCount: 0,
    fixedSignalsCount: 2,
    createdAt: '2026-03-14T07:30:00.000Z',
  },
  {
    id: 'seed-demo-issue-waste-kosofe',
    type: 'waste',
    title: 'Overflowing refuse point attracting flies in Ojota-Ogudu',
    description:
      'Uncollected refuse has piled up at the corner collection point and nearby shops are complaining about odor and flies.',
    severity: Severity.medium,
    status: IssueStatus.in_progress,
    lgaId: 'kosofe',
    communityId: 'kosofe-ojota-ogudu',
    streetOrLandmark: 'Collection point off Ogudu Road',
    latitude: 6.59931,
    longitude: 3.39061,
    photoUrls: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b'],
    confirmationsCount: 2,
    disagreementsCount: 1,
    fixedSignalsCount: 0,
    createdAt: '2026-03-20T09:05:00.000Z',
  },
  {
    id: 'seed-demo-issue-flooding-ajah',
    type: 'flooding',
    title: 'Persistent flooding after rain around Ajah-Sangotedo access road',
    description:
      'Rainwater remains trapped across the access road for hours, slowing traffic and making it hard for residents to cross safely.',
    severity: Severity.high,
    status: IssueStatus.open,
    lgaId: 'eti-osa',
    communityId: 'eti-osa-ajah-sangotedo',
    streetOrLandmark: 'Ajah-Sangotedo access road near the inward slip lane',
    latitude: 6.473069,
    longitude: 3.607251,
    confirmationsCount: 5,
    disagreementsCount: 0,
    fixedSignalsCount: 0,
    createdAt: '2026-03-22T06:55:00.000Z',
  },
];

function getLedgerReasonsForStatus(status: IssueStatus): LedgerReason[] {
  if (status === IssueStatus.resolved) {
    return ['report_submitted', 'report_validated', 'report_kept_valid'];
  }

  if (status === IssueStatus.in_progress) {
    return ['report_submitted', 'report_validated'];
  }

  return ['report_submitted'];
}

function getLedgerEntryId(issueId: string, reason: LedgerReason) {
  return `${issueId}-${reason}`;
}

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

  const demoAdmin = await prisma.user.upsert({
    where: { email: DEMO_ADMIN_EMAIL },
    update: {
      fullName: 'CityPulse Admin',
      passwordHash: adminPasswordHash,
      role: Role.admin,
      lgaId: 'ikeja',
      communityId: 'alausa',
      streetOrArea: 'Alausa Secretariat',
      points: 75,
      rank: Rank.COMMUNITY_SENTINEL,
      trustWeight: 1.5,
    },
    create: {
      fullName: 'CityPulse Admin',
      email: DEMO_ADMIN_EMAIL,
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

  const demoCitizen = await prisma.user.upsert({
    where: { email: DEMO_CITIZEN_EMAIL },
    update: {
      fullName: 'Demo Citizen',
      passwordHash: citizenPasswordHash,
      role: Role.citizen,
      lgaId: 'surulere',
      communityId: 'adeniran-ogunsanya',
      streetOrArea: 'Adeniran Ogunsanya Street',
      points: 14,
      rank: Rank.RELIABLE,
      trustWeight: 1.15,
    },
    create: {
      fullName: 'Demo Citizen',
      email: DEMO_CITIZEN_EMAIL,
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

  await prisma.pointsLedger.deleteMany({
    where: {
      id: {
        in: demoIssueSeeds.flatMap((issue) =>
          DEMO_ISSUE_LEDGER_REASONS.map((reason) => getLedgerEntryId(issue.id, reason)),
        ),
      },
    },
  });

  for (const issue of demoIssueSeeds) {
    const confidence = calculateConfidenceScore({
      hasPhoto: Boolean(issue.photoUrls?.length || issue.videoUrl),
      description: issue.description,
      similarNearbyIssueExists: false,
      confirmationsCount: issue.confirmationsCount,
      disagreementsCount: issue.disagreementsCount,
      reporterRank: 'Reliable',
    });

    await prisma.issue.upsert({
      where: { id: issue.id },
      update: {
        type: issue.type,
        title: issue.title,
        description: issue.description,
        severity: issue.severity,
        status: issue.status,
        confidenceScore: confidence.score,
        confidenceBand: confidence.band,
        reportedByUserId: demoCitizen.id,
        reporterTrustWeight: 1.15,
        lgaId: issue.lgaId,
        communityId: issue.communityId,
        streetOrLandmark: issue.streetOrLandmark,
        latitude: issue.latitude,
        longitude: issue.longitude,
        photoUrls: issue.photoUrls ?? [],
        videoUrl: issue.videoUrl,
        confirmationsCount: issue.confirmationsCount,
        disagreementsCount: issue.disagreementsCount,
        fixedSignalsCount: issue.fixedSignalsCount,
        needsResolutionReview: issue.needsResolutionReview ?? false,
        createdAt: new Date(issue.createdAt),
      },
      create: {
        id: issue.id,
        type: issue.type,
        title: issue.title,
        description: issue.description,
        severity: issue.severity,
        status: issue.status,
        confidenceScore: confidence.score,
        confidenceBand: confidence.band,
        reportedByUserId: demoCitizen.id,
        reporterTrustWeight: 1.15,
        lgaId: issue.lgaId,
        communityId: issue.communityId,
        streetOrLandmark: issue.streetOrLandmark,
        latitude: issue.latitude,
        longitude: issue.longitude,
        photoUrls: issue.photoUrls ?? [],
        videoUrl: issue.videoUrl,
        confirmationsCount: issue.confirmationsCount,
        disagreementsCount: issue.disagreementsCount,
        fixedSignalsCount: issue.fixedSignalsCount,
        needsResolutionReview: issue.needsResolutionReview ?? false,
        createdAt: new Date(issue.createdAt),
      },
    });

    const ledgerReasons = getLedgerReasonsForStatus(issue.status);

    for (const [index, reason] of ledgerReasons.entries()) {
      await prisma.pointsLedger.create({
        data: {
          id: getLedgerEntryId(issue.id, reason),
          userId: demoCitizen.id,
          reason,
          pointsDelta: POINTS_BY_REASON[reason],
          metadata: { issueId: issue.id, seeded: true },
          createdAt: new Date(
            new Date(issue.createdAt).getTime() + index * 60 * 60 * 1000,
          ),
        },
      });
    }
  }

  const demoCitizenPoints = await prisma.pointsLedger.aggregate({
    where: { userId: demoCitizen.id },
    _sum: { pointsDelta: true },
  });

  const totalDemoCitizenPoints = demoCitizenPoints._sum.pointsDelta ?? 0;
  const demoCitizenRank = deriveRank(totalDemoCitizenPoints);

  await prisma.user.update({
    where: { id: demoCitizen.id },
    data: {
      points: totalDemoCitizenPoints,
      rank: toPrismaRank(demoCitizenRank),
      trustWeight: getTrustWeight(demoCitizenRank),
    },
  });

  for (const levy of demoLevySeeds) {
    await prisma.levy.upsert({
      where: { id: levy.id },
      update: {
        title: levy.title,
        description: levy.description,
        levyType: levy.levyType,
        amount: levy.amount,
        dueDate: new Date(levy.dueDate),
        targetType: levy.targetType,
        targetCommunityId: levy.targetCommunityId,
        targetLgaId: levy.targetLgaId,
        status: levy.status,
        createdByAdminId: demoAdmin.id,
      },
      create: {
        id: levy.id,
        title: levy.title,
        description: levy.description,
        levyType: levy.levyType,
        amount: levy.amount,
        dueDate: new Date(levy.dueDate),
        targetType: levy.targetType,
        targetCommunityId: levy.targetCommunityId,
        targetLgaId: levy.targetLgaId,
        status: levy.status,
        createdByAdminId: demoAdmin.id,
      },
    });
  }
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

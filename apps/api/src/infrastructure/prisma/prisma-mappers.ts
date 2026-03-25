import {
  Community,
  ConfidenceBand as PrismaConfidenceBand,
  Issue,
  IssueReaction,
  Lga,
  LedgerReason as PrismaLedgerReason,
  Payment,
  PaymentStatus as PrismaPaymentStatus,
  PaymentType as PrismaPaymentType,
  PointsLedger,
  Rank as PrismaRank,
  ReactionType as PrismaReactionType,
  Role as PrismaRole,
  Severity as PrismaSeverity,
  State,
} from '@prisma/client';
import {
  CommunityRecord,
  ConfidenceBand,
  IssueReactionRecord,
  IssueRecord,
  LgaRecord,
  LedgerReason,
  PaymentRecord,
  PaymentStatus,
  PaymentType,
  PointsLedgerRecord,
  Rank,
  ReactionType,
  Role,
  Severity,
  StateRecord,
  UserRecord,
} from 'src/domain/models';

function toNumber(value: { toString(): string } | number) {
  return Number(value);
}

function toPhotoUrls(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

export function toPrismaRank(rank: Rank): PrismaRank {
  switch (rank) {
    case 'Reliable':
      return PrismaRank.RELIABLE;
    case 'Trusted':
      return PrismaRank.TRUSTED;
    case 'Community Sentinel':
      return PrismaRank.COMMUNITY_SENTINEL;
    case 'New':
    default:
      return PrismaRank.NEW;
  }
}

export function toDomainRank(rank: PrismaRank): Rank {
  switch (rank) {
    case PrismaRank.RELIABLE:
      return 'Reliable';
    case PrismaRank.TRUSTED:
      return 'Trusted';
    case PrismaRank.COMMUNITY_SENTINEL:
      return 'Community Sentinel';
    case PrismaRank.NEW:
    default:
      return 'New';
  }
}

export function toPrismaRole(role: Role): PrismaRole {
  return role;
}

export function toDomainRole(role: PrismaRole): Role {
  return role;
}

export function toPrismaSeverity(severity: Severity): PrismaSeverity {
  return severity;
}

export function toDomainSeverity(severity: PrismaSeverity): Severity {
  return severity;
}

export function toPrismaConfidenceBand(
  confidenceBand: ConfidenceBand,
): PrismaConfidenceBand {
  return confidenceBand;
}

export function toDomainConfidenceBand(
  confidenceBand: PrismaConfidenceBand,
): ConfidenceBand {
  return confidenceBand;
}

export function toPrismaReactionType(reaction: ReactionType): PrismaReactionType {
  return reaction;
}

export function toDomainReactionType(reaction: PrismaReactionType): ReactionType {
  return reaction;
}

export function toPrismaPaymentType(paymentType: PaymentType): PrismaPaymentType {
  return paymentType;
}

export function toDomainPaymentType(paymentType: PrismaPaymentType): PaymentType {
  return paymentType;
}

export function toPrismaPaymentStatus(
  paymentStatus: PaymentStatus,
): PrismaPaymentStatus {
  return paymentStatus;
}

export function toDomainPaymentStatus(
  paymentStatus: PrismaPaymentStatus,
): PaymentStatus {
  return paymentStatus;
}

export function toPrismaLedgerReason(reason: LedgerReason): PrismaLedgerReason {
  return reason;
}

export function stateRecordFromPrisma(state: State): StateRecord {
  return {
    id: state.id,
    name: state.name,
  };
}

export function lgaRecordFromPrisma(lga: Lga): LgaRecord {
  return {
    id: lga.id,
    name: lga.name,
    stateId: lga.stateId,
    latitude: toNumber(lga.latitude),
    longitude: toNumber(lga.longitude),
  };
}

export function communityRecordFromPrisma(community: Community): CommunityRecord {
  return {
    id: community.id,
    name: community.name,
    lgaId: community.lgaId,
    latitude: toNumber(community.latitude),
    longitude: toNumber(community.longitude),
  };
}

export function userRecordFromPrisma(user: {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: PrismaRole;
  lgaId: string;
  communityId: string;
  streetOrArea: string;
  points: number;
  rank: PrismaRank;
  trustWeight: { toString(): string } | number;
  createdAt: Date;
  updatedAt: Date;
}): UserRecord {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    passwordHash: user.passwordHash,
    role: toDomainRole(user.role),
    lgaId: user.lgaId,
    communityId: user.communityId,
    streetOrArea: user.streetOrArea,
    points: user.points,
    rank: toDomainRank(user.rank),
    trustWeight: toNumber(user.trustWeight),
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function issueRecordFromPrisma(issue: Issue): IssueRecord {
  return {
    id: issue.id,
    type: issue.type,
    title: issue.title,
    description: issue.description,
    severity: toDomainSeverity(issue.severity),
    status: issue.status,
    confidenceScore: issue.confidenceScore,
    confidenceBand: toDomainConfidenceBand(issue.confidenceBand),
    reportedByUserId: issue.reportedByUserId,
    reporterTrustWeight: toNumber(issue.reporterTrustWeight),
    lgaId: issue.lgaId,
    communityId: issue.communityId,
    streetOrLandmark: issue.streetOrLandmark,
    latitude: toNumber(issue.latitude),
    longitude: toNumber(issue.longitude),
    photoUrls: toPhotoUrls(issue.photoUrls),
    videoUrl: issue.videoUrl,
    confirmationsCount: issue.confirmationsCount,
    disagreementsCount: issue.disagreementsCount,
    fixedSignalsCount: issue.fixedSignalsCount,
    needsResolutionReview: issue.needsResolutionReview,
    createdAt: issue.createdAt.toISOString(),
    updatedAt: issue.updatedAt.toISOString(),
  };
}

export function issueReactionRecordFromPrisma(
  reaction: IssueReaction,
): IssueReactionRecord {
  return {
    id: reaction.id,
    issueId: reaction.issueId,
    userId: reaction.userId,
    reaction: toDomainReactionType(reaction.reaction),
    createdAt: reaction.createdAt.toISOString(),
    updatedAt: reaction.updatedAt.toISOString(),
  };
}

export function pointsLedgerRecordFromPrisma(entry: PointsLedger): PointsLedgerRecord {
  return {
    id: entry.id,
    userId: entry.userId,
    reason: entry.reason,
    pointsDelta: entry.pointsDelta,
    metadata:
      entry.metadata && typeof entry.metadata === 'object' && !Array.isArray(entry.metadata)
        ? (entry.metadata as Record<string, unknown>)
        : undefined,
    createdAt: entry.createdAt.toISOString(),
  };
}

export function paymentRecordFromPrisma(payment: Payment): PaymentRecord {
  return {
    id: payment.id,
    userId: payment.userId,
    reference: payment.reference,
    paymentType: toDomainPaymentType(payment.paymentType),
    amount: toNumber(payment.amount),
    status: toDomainPaymentStatus(payment.status),
    checkoutUrl: payment.checkoutUrl ?? undefined,
    providerReference: payment.providerReference ?? undefined,
    metadata:
      payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata)
        ? (payment.metadata as Record<string, unknown>)
        : undefined,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  };
}

export type Role = 'citizen' | 'admin';
export type Rank = 'New' | 'Reliable' | 'Trusted' | 'Community Sentinel';
export type Severity = 'low' | 'medium' | 'high';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type ConfidenceBand = 'low' | 'medium' | 'high';
export type ReactionType = 'confirm' | 'disagree' | 'fixed_signal' | 'none';
export type PaymentType =
  | 'sanitation_levy'
  | 'environmental_fee'
  | 'community_due';
export type PaymentStatus = 'pending' | 'initialized' | 'succeeded' | 'failed';

export type LedgerReason =
  | 'report_submitted'
  | 'report_validated'
  | 'report_kept_valid'
  | 'confirm_issue'
  | 'valid_confirmation'
  | 'correct_disagreement'
  | 'fixed_signal_match'
  | 'false_report'
  | 'invalid_reaction'
  | 'fraud_abuse';

export interface StateRecord {
  id: string;
  name: string;
}

export interface LgaRecord {
  id: string;
  name: string;
  stateId: string;
  latitude: number;
  longitude: number;
}

export interface CommunityRecord {
  id: string;
  name: string;
  lgaId: string;
  latitude: number;
  longitude: number;
}

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  lgaId: string;
  communityId: string;
  streetOrArea: string;
  points: number;
  rank: Rank;
  trustWeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssueRecord {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: Severity;
  status: IssueStatus;
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
  reportedByUserId: string;
  reporterTrustWeight: number;
  lgaId: string;
  communityId: string;
  streetOrLandmark: string;
  latitude: number;
  longitude: number;
  photoUrls: string[];
  videoUrl?: string | null;
  confirmationsCount: number;
  disagreementsCount: number;
  fixedSignalsCount: number;
  needsResolutionReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IssueReactionRecord {
  id: string;
  issueId: string;
  userId: string;
  reaction: ReactionType;
  createdAt: string;
  updatedAt: string;
}

export interface PointsLedgerRecord {
  id: string;
  userId: string;
  reason: LedgerReason;
  pointsDelta: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  reference: string;
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  checkoutUrl?: string;
  providerReference?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentWebhookRecord {
  id: string;
  paymentId: string;
  eventId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AuthUser {
  sub: string;
  email: string;
  role: Role;
}

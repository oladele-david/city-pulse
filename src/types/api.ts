export type UserRole = "citizen" | "admin";
export type UserRank = "New" | "Reliable" | "Trusted" | "Community Sentinel";
export type IssueSeverity = "low" | "medium" | "high";
export type IssueStatus = "open" | "in_progress" | "resolved";
export type ConfidenceBand = "low" | "medium" | "high";
export type ReactionType = "confirm" | "disagree" | "fixed_signal" | "none";
export type PaymentType =
  | "sanitation_levy"
  | "environmental_fee"
  | "community_due";
export type LevyTargetType = "community" | "lga";
export type LevyStatus = "draft" | "published" | "closed";
export type PaymentStatus = "pending" | "initialized" | "succeeded" | "failed";

export interface ApiEnvelope<T> {
  data: T;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: ApiErrorDetail[];
  };
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  lgaId: string;
  communityId: string;
  streetOrArea: string;
  points: number;
  rank: UserRank;
  trustWeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserProfile;
}

export type AuthSession = AuthResponse;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterCitizenPayload extends LoginPayload {
  fullName: string;
  lgaId: string;
  communityId: string;
  streetOrArea: string;
}

export interface Lga {
  id: string;
  name: string;
  stateId: string;
  latitude: number;
  longitude: number;
}

export interface Community {
  id: string;
  name: string;
  lgaId: string;
  latitude: number;
  longitude: number;
}

export interface ResolvedLocation {
  state: {
    id: string;
    name: string;
  };
  lga: Lga;
  community: Community;
  street: string | null;
  distanceKm: number;
  weakMatch: boolean;
}

export interface IssueRecord {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: IssueSeverity;
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
  issueId: string;
  reaction: ReactionType;
}

export interface IssueReactionUpdate {
  issueId: string;
  reaction: ReactionType;
  counts: Pick<
    IssueRecord,
    "confirmationsCount" | "disagreementsCount" | "fixedSignalsCount"
  >;
  needsResolutionReview: boolean;
  confidenceScore: number;
  confidenceBand: ConfidenceBand;
}

export interface LeaderboardEntry {
  communityId: string;
  communityName: string;
  lgaId: string;
  lgaName: string | null;
  score: number;
  resolvedIssueCount: number;
  unresolvedIssueCount: number;
}

export type LedgerReason =
  | "report_submitted"
  | "report_validated"
  | "report_kept_valid"
  | "confirm_issue"
  | "valid_confirmation"
  | "correct_disagreement"
  | "fixed_signal_match"
  | "false_report"
  | "invalid_reaction"
  | "fraud_abuse";

export interface ActivityEntry {
  id: string;
  userId: string;
  reason: LedgerReason;
  pointsDelta: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface LevyTargetCommunity {
  id: string;
  name: string;
  lgaId: string;
}

export interface LevyTargetLga {
  id: string;
  name: string;
  stateId: string;
}

export interface LevyRecord {
  id: string;
  title: string;
  description: string;
  levyType: PaymentType;
  amount: number;
  dueDate: string;
  targetType: LevyTargetType;
  targetCommunityId?: string | null;
  targetLgaId?: string | null;
  status: LevyStatus;
  createdByAdminId: string;
  createdAt: string;
  updatedAt: string;
  targetCommunity?: LevyTargetCommunity | null;
  targetLga?: LevyTargetLga | null;
  createdByAdmin?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface CreateLevyPayload {
  title: string;
  description: string;
  levyType: PaymentType;
  amount: number;
  dueDate: string;
  targetType: LevyTargetType;
  targetCommunityId?: string;
  targetLgaId?: string;
}

export interface InterswitchCheckoutConfig {
  provider: "interswitch";
  method: "inline";
  scriptUrl: string;
  request: {
    merchant_code: string;
    pay_item_id: string;
    pay_item_name: string;
    txn_ref: string;
    site_redirect_url: string;
    amount: number;
    currency: string;
    cust_name: string;
    cust_email: string;
    cust_id: string;
    mode: "TEST" | "LIVE";
  };
}

export interface PaymentRecord {
  id: string;
  userId: string;
  levyId?: string | null;
  reference: string;
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  checkoutUrl?: string;
  providerReference?: string;
  gatewayProvider: string;
  gatewayStatus?: string;
  gatewayResponseCode?: string;
  gatewayResponseDescription?: string;
  providerPaymentReference?: string;
  providerRetrievalReferenceNumber?: string;
  providerTransactionDate?: string | null;
  lastWebhookEventId?: string;
  confirmedAt?: string | null;
  failedAt?: string | null;
  metadata?: Record<string, unknown>;
  levy?: LevyRecord;
  user?: {
    id: string;
    fullName: string;
    email: string;
    lgaId?: string;
    communityId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LevyPaymentInitialization {
  id: string;
  userId: string;
  levyId?: string | null;
  reference: string;
  paymentType: PaymentType;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  levy?: LevyRecord;
  checkout: InterswitchCheckoutConfig;
}

export interface AdminLevyDashboard {
  totalCollectedAmount: number;
  successfulPaymentCount: number;
  pendingPaymentCount: number;
  failedPaymentCount: number;
  payerCount: number;
}

export interface AnalyticsOverview {
  issues: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  payments: {
    total: number;
    succeeded: number;
    pending: number;
  };
  users: {
    citizens: number;
    admins: number;
  };
}

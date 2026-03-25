export type UserRole = "citizen" | "admin";
export type UserRank = "New" | "Reliable" | "Trusted" | "Community Sentinel";
export type IssueSeverity = "low" | "medium" | "high";
export type IssueStatus = "open" | "in_progress" | "resolved";
export type ConfidenceBand = "low" | "medium" | "high";
export type ReactionType = "confirm" | "disagree" | "fixed_signal" | "none";

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

import { LedgerReason, Rank } from 'src/domain/models';

export const POINTS_BY_REASON: Record<LedgerReason, number> = {
  report_submitted: 1,
  report_validated: 4,
  report_kept_valid: 5,
  confirm_issue: 1,
  valid_confirmation: 2,
  correct_disagreement: 2,
  fixed_signal_match: 2,
  false_report: -3,
  invalid_reaction: -2,
  fraud_abuse: -5,
};

export function deriveRank(points: number): Rank {
  if (points >= 60) {
    return 'Community Sentinel';
  }

  if (points >= 30) {
    return 'Trusted';
  }

  if (points >= 10) {
    return 'Reliable';
  }

  return 'New';
}

export function getTrustWeight(rank: Rank): number {
  switch (rank) {
    case 'Reliable':
      return 1.15;
    case 'Trusted':
      return 1.3;
    case 'Community Sentinel':
      return 1.5;
    case 'New':
    default:
      return 1;
  }
}

export function getReporterTrustBonus(rank: Rank): number {
  switch (rank) {
    case 'Reliable':
      return 3;
    case 'Trusted':
      return 6;
    case 'Community Sentinel':
      return 10;
    case 'New':
    default:
      return 0;
  }
}

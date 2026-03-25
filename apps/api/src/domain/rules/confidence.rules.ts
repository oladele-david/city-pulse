import { ConfidenceBand, Rank } from 'src/domain/models';
import { getReporterTrustBonus } from './points.rules';

export interface ConfidenceInput {
  hasPhoto: boolean;
  description: string;
  similarNearbyIssueExists: boolean;
  confirmationsCount: number;
  disagreementsCount: number;
  reporterRank: Rank;
}

export interface ConfidenceResult {
  score: number;
  band: ConfidenceBand;
}

export function isDescriptionClearEnough(description: string): boolean {
  const trimmed = description.trim();
  return trimmed.length >= 24 && trimmed.split(/\s+/).length >= 5;
}

export function getConfidenceBand(score: number): ConfidenceBand {
  if (score >= 75) {
    return 'high';
  }

  if (score >= 50) {
    return 'medium';
  }

  return 'low';
}

export function calculateConfidenceScore(
  input: ConfidenceInput,
): ConfidenceResult {
  let score = 50;

  if (input.hasPhoto) {
    score += 10;
  }

  if (isDescriptionClearEnough(input.description)) {
    score += 10;
  }

  if (input.similarNearbyIssueExists) {
    score += 10;
  }

  score += Math.min(10, input.confirmationsCount * 2);
  score -= Math.min(10, input.disagreementsCount * 5);
  score += getReporterTrustBonus(input.reporterRank);

  const bounded = Math.max(0, Math.min(100, score));

  return {
    score: bounded,
    band: getConfidenceBand(bounded),
  };
}

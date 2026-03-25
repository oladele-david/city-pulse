import { IssueRecord } from 'src/domain/models';

const TARGET_WINDOWS_HOURS: Record<IssueRecord['severity'], number> = {
  high: 48,
  medium: 120,
  low: 240,
};

export function calculateCommunityScore(issues: IssueRecord[], now: Date): number {
  let score = 0;

  for (const issue of issues) {
    const createdAt = new Date(issue.createdAt);
    const updatedAt = new Date(issue.updatedAt);
    const ageHours = Math.max(0, (now.getTime() - createdAt.getTime()) / 36e5);
    const resolutionHours = Math.max(
      0,
      (updatedAt.getTime() - createdAt.getTime()) / 36e5,
    );
    const targetHours = TARGET_WINDOWS_HOURS[issue.severity];

    if (issue.status === 'resolved') {
      score += 10;
      if (resolutionHours <= targetHours) {
        score += 5;
      }
      if (issue.confidenceBand !== 'low') {
        score += 3;
      }
      continue;
    }

    if (ageHours > targetHours) {
      score -= 3;
    } else {
      score += 1;
    }
  }

  return score;
}

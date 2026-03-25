import {
  deriveRank,
  getReporterTrustBonus,
  getTrustWeight,
  POINTS_BY_REASON,
} from 'src/domain/rules/points.rules';

describe('points and rank rules', () => {
  it('maps point totals to the expected rank and trust weight', () => {
    expect(deriveRank(0)).toBe('New');
    expect(deriveRank(18)).toBe('Reliable');
    expect(deriveRank(45)).toBe('Trusted');
    expect(deriveRank(60)).toBe('Community Sentinel');

    expect(getTrustWeight('Trusted')).toBe(1.3);
    expect(getReporterTrustBonus('Community Sentinel')).toBe(10);
  });

  it('keeps the configured ledger deltas stable', () => {
    expect(POINTS_BY_REASON.report_submitted).toBe(1);
    expect(POINTS_BY_REASON.false_report).toBe(-3);
    expect(POINTS_BY_REASON.fraud_abuse).toBe(-5);
  });
});

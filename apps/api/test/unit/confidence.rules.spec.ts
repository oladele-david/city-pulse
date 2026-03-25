import {
  calculateConfidenceScore,
  isDescriptionClearEnough,
} from 'src/domain/rules/confidence.rules';

describe('confidence rules', () => {
  it('scores rich evidence reports into the high band', () => {
    const result = calculateConfidenceScore({
      hasPhoto: true,
      description: 'Large drainage blockage causing flooding by the junction',
      similarNearbyIssueExists: true,
      confirmationsCount: 4,
      disagreementsCount: 0,
      reporterRank: 'Trusted',
    });

    expect(result.score).toBe(84);
    expect(result.band).toBe('high');
  });

  it('keeps weak reports in the low band', () => {
    const result = calculateConfidenceScore({
      hasPhoto: false,
      description: 'Bad road',
      similarNearbyIssueExists: false,
      confirmationsCount: 0,
      disagreementsCount: 2,
      reporterRank: 'New',
    });

    expect(isDescriptionClearEnough('Bad road')).toBe(false);
    expect(result.score).toBe(40);
    expect(result.band).toBe('low');
  });
});

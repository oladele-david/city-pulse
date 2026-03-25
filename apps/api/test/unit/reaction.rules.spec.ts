import { applyReactionTransition } from 'src/domain/rules/reaction.rules';

describe('reaction rules', () => {
  it('switches from confirm to disagree and updates counts', () => {
    const result = applyReactionTransition({
      issue: {
        confirmationsCount: 3,
        disagreementsCount: 0,
        fixedSignalsCount: 0,
        status: 'open',
      },
      currentReaction: 'confirm',
      requestedReaction: 'disagree',
    });

    expect(result.nextReaction).toBe('disagree');
    expect(result.confirmationsCount).toBe(2);
    expect(result.disagreementsCount).toBe(1);
  });

  it('undoes when the same reaction is tapped again', () => {
    const result = applyReactionTransition({
      issue: {
        confirmationsCount: 0,
        disagreementsCount: 0,
        fixedSignalsCount: 2,
        status: 'open',
      },
      currentReaction: 'fixed_signal',
      requestedReaction: 'fixed_signal',
    });

    expect(result.nextReaction).toBe('none');
    expect(result.fixedSignalsCount).toBe(1);
    expect(result.needsResolutionReview).toBe(false);
  });
});

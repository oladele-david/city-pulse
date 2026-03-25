import { IssueRecord, IssueStatus, ReactionType } from 'src/domain/models';

export interface ReactionTransitionResult {
  nextReaction: ReactionType;
  confirmationsCount: number;
  disagreementsCount: number;
  fixedSignalsCount: number;
  needsResolutionReview: boolean;
}

function deltaFor(reaction: ReactionType): {
  confirmations: number;
  disagreements: number;
  fixedSignals: number;
} {
  switch (reaction) {
    case 'confirm':
      return { confirmations: 1, disagreements: 0, fixedSignals: 0 };
    case 'disagree':
      return { confirmations: 0, disagreements: 1, fixedSignals: 0 };
    case 'fixed_signal':
      return { confirmations: 0, disagreements: 0, fixedSignals: 1 };
    case 'none':
    default:
      return { confirmations: 0, disagreements: 0, fixedSignals: 0 };
  }
}

export function applyReactionTransition(params: {
  issue: Pick<
    IssueRecord,
    | 'confirmationsCount'
    | 'disagreementsCount'
    | 'fixedSignalsCount'
    | 'status'
  >;
  currentReaction: ReactionType;
  requestedReaction: ReactionType;
}): ReactionTransitionResult {
  const nextReaction =
    params.currentReaction === params.requestedReaction
      ? 'none'
      : params.requestedReaction;

  const currentDelta = deltaFor(params.currentReaction);
  const nextDelta = deltaFor(nextReaction);

  const confirmationsCount = Math.max(
    0,
    params.issue.confirmationsCount - currentDelta.confirmations + nextDelta.confirmations,
  );
  const disagreementsCount = Math.max(
    0,
    params.issue.disagreementsCount - currentDelta.disagreements + nextDelta.disagreements,
  );
  const fixedSignalsCount = Math.max(
    0,
    params.issue.fixedSignalsCount - currentDelta.fixedSignals + nextDelta.fixedSignals,
  );

  return {
    nextReaction,
    confirmationsCount,
    disagreementsCount,
    fixedSignalsCount,
    needsResolutionReview:
      fixedSignalsCount >= 2 && params.issue.status !== ('resolved' as IssueStatus),
  };
}

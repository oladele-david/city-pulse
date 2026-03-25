import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCitizenAuth } from "@/hooks/use-auth";
import { ReactionType } from "@/types/api";

export const issueQueryKeys = {
  all: ["issues"] as const,
  reactions: ["issue-reactions"] as const,
};

export function useLiveIssues(scope: string, filters?: Parameters<typeof api.listIssues>[0]) {
  return useQuery({
    queryKey: [...issueQueryKeys.all, scope, filters ?? {}],
    queryFn: () => api.listIssues(filters),
    refetchInterval: 10000,
    staleTime: 5000,
  });
}

export function useIssueReaction(issueId: string | null) {
  const { session, isAuthenticated } = useCitizenAuth();

  return useQuery({
    queryKey: [...issueQueryKeys.reactions, issueId, session?.user.id],
    queryFn: () => api.getIssueReaction(issueId!, session!.accessToken),
    enabled: Boolean(issueId && isAuthenticated && session?.accessToken),
    staleTime: 5000,
  });
}

export function useIssueReactionMutation() {
  const queryClient = useQueryClient();
  const { session } = useCitizenAuth();

  return useMutation({
    mutationFn: async ({
      issueId,
      reaction,
    }: {
      issueId: string;
      reaction: ReactionType;
    }) => {
      if (!session?.accessToken) {
        throw new Error("Citizen session is not available.");
      }

      return api.updateIssueReaction(issueId, reaction, session.accessToken);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: issueQueryKeys.all });
      queryClient.setQueryData(
        [...issueQueryKeys.reactions, data.issueId, session?.user.id],
        { issueId: data.issueId, reaction: data.reaction },
      );
    },
  });
}

export function useLeaderboard(scope?: { lgaId?: string; communityId?: string }) {
  return useQuery({
    queryKey: ["leaderboard", scope ?? {}],
    queryFn: () => api.listLeaderboard(scope),
    staleTime: 15000,
    refetchInterval: 30000,
  });
}

export function useCommunityLeaderboardSpotlight(communityId?: string) {
  const leaderboardQuery = useLeaderboard();

  return useMemo(() => {
    const entries = leaderboardQuery.data ?? [];
    const rankedEntries = [...entries].sort((left, right) => right.score - left.score);
    const communityIndex = communityId
      ? rankedEntries.findIndex((entry) => entry.communityId === communityId)
      : -1;
    const topEntry = rankedEntries[0];
    const communityEntry =
      communityIndex >= 0 ? rankedEntries[communityIndex] : undefined;
    const spotlightEntry = communityEntry ?? topEntry;
    const spotlightRank =
      communityIndex >= 0 ? communityIndex + 1 : spotlightEntry ? 1 : undefined;

    return {
      ...leaderboardQuery,
      rankedEntries,
      topEntry,
      communityEntry,
      communityRank: communityIndex >= 0 ? communityIndex + 1 : undefined,
      spotlightEntry,
      spotlightRank,
    };
  }, [communityId, leaderboardQuery]);
}

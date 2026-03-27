import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowUpRight01Icon,
  Award01Icon,
  Medal02Icon,
} from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useCitizenAuth } from "@/hooks/use-auth";
import { useCommunityLeaderboardSpotlight } from "@/hooks/use-live-issues";
import { cn } from "@/lib/utils";

const MobileLeaderboard = () => {
  const navigate = useNavigate();
  const { session } = useCitizenAuth();
  const leaderboard = useCommunityLeaderboardSpotlight(session?.user.communityId);

  const topThree = useMemo(
    () => leaderboard.rankedEntries.slice(0, 3),
    [leaderboard.rankedEntries],
  );

  return (
    <div className="bg-white pb-32 px-4 pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border transition-transform active:scale-95"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Leaderboard</h1>
          <p className="text-xs text-muted-foreground">Community rankings in Lagos</p>
        </div>
      </div>

      {/* Spotlight card — activity-page style */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-primary p-4 text-white">
        <div className="relative z-10">
          <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
            <HugeiconsIcon icon={Award01Icon} className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold">Your community</span>
          </div>

          <div className="mt-4 mb-5 space-y-1">
            <span className="text-[10px] font-bold text-white/60">Rank</span>
            <div className="flex items-baseline gap-2">
              <h1 className="text-3xl font-semibold">
                {leaderboard.spotlightRank ? `#${leaderboard.spotlightRank}` : "--"}
              </h1>
            </div>
            <p className="text-sm font-semibold text-white/80">
              {leaderboard.spotlightEntry?.communityName ?? "Waiting for data"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/10 p-3">
              <span className="block text-[9px] font-bold text-white/60">Score</span>
              <span className="text-lg font-semibold">{leaderboard.spotlightEntry?.score ?? 0}</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/10 p-3">
              <span className="block text-[9px] font-bold text-white/60">Resolved</span>
              <span className="text-lg font-semibold">{leaderboard.spotlightEntry?.resolvedIssueCount ?? 0}</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Top 3 — horizontally scrollable */}
      {topThree.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
          {topThree.map((entry, index) => (
            <div
              key={entry.communityId}
              className={cn(
                "shrink-0 w-[44%] rounded-xl border p-3.5",
                index === 0 ? "border-amber-200 bg-amber-50" : "border-border/50",
              )}
            >
              <p className="text-[10px] font-bold text-muted-foreground">#{index + 1}</p>
              <p className="mt-2 text-sm font-bold text-foreground leading-snug break-words">{entry.communityName}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{entry.lgaName}</p>
              <div className="mt-3 flex items-center gap-1 text-sm font-bold">
                <HugeiconsIcon icon={Medal02Icon} className="h-3.5 w-3.5 text-amber-600" />
                {entry.score}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full list */}
      <div>
        <h2 className="text-sm font-bold text-foreground mb-3">All communities</h2>

        {leaderboard.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        ) : leaderboard.rankedEntries.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No leaderboard data available yet.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {leaderboard.rankedEntries.map((entry, index) => {
              const isYou = entry.communityId === session?.user.communityId;
              return (
                <div
                  key={entry.communityId}
                  className={cn(
                    "flex items-center gap-3 py-3 first:pt-0 last:pb-0",
                    isYou && "bg-primary/5 -mx-4 px-4 rounded-xl",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      index === 0
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : isYou
                          ? "bg-primary/10 text-primary"
                          : "bg-muted/30 text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold">{entry.communityName}</p>
                      {isYou && (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold text-white">You</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {entry.resolvedIssueCount} resolved · {entry.unresolvedIssueCount} open
                    </p>
                  </div>
                  <p className="text-sm font-bold shrink-0">{entry.score}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA */}
      {leaderboard.spotlightEntry && (
        <button
          onClick={() => navigate("/mobile/report")}
          className="flex w-full items-center justify-between rounded-xl border py-3 px-4 text-left transition-transform active:scale-[0.99]"
        >
          <p className="text-xs font-semibold text-foreground">Report an issue to improve your rank</p>
          <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-4 w-4 text-primary shrink-0" />
        </button>
      )}
    </div>
  );
};

export default MobileLeaderboard;

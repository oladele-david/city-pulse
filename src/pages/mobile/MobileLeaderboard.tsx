import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowUpRight01Icon,
  Award01Icon,
  CheckmarkBadge01Icon,
  Medal02Icon,
} from "@hugeicons/core-free-icons";
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
    <div className="flex flex-col bg-[linear-gradient(180deg,#fffaf0_0%,#ffffff_35%,#f8fafc_100%)] pb-32">
      <div className="px-6 pb-4 pt-6">
        <div className="rounded-[2rem] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm transition-transform active:scale-95"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5 text-foreground" />
            </button>

            <div className="min-w-0 flex-1 text-right">
              <p className="text-[10px] font-bold text-muted-foreground">
                Lagos Leaderboard
              </p>
              <h1 className="mt-1 text-2xl font-bold text-foreground">
                Community Rankings
              </h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                See which communities are surfacing issues and driving visible action.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.75rem] border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Award01Icon} className="h-4 w-4 text-amber-700" />
              <p className="text-[10px] font-bold text-amber-700">
                Spotlight
              </p>
            </div>

            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-amber-950">
                  {leaderboard.spotlightRank ? `#${leaderboard.spotlightRank}` : "--"}
                </p>
                <p className="mt-1 text-sm font-semibold text-amber-950">
                  {leaderboard.spotlightEntry?.communityName ?? "Waiting for leaderboard"}
                </p>
                <p className="mt-1 text-xs text-amber-900/70">
                  {leaderboard.spotlightEntry?.lgaName ?? "Lagos"}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200/80 bg-white/70 px-4 py-3 text-right">
                <p className="text-[10px] font-bold text-amber-700">
                  Score
                </p>
                <p className="mt-1 text-xl font-bold text-amber-950">
                  {leaderboard.spotlightEntry?.score ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-3 gap-3">
          {topThree.map((entry, index) => (
            <div
              key={entry.communityId}
              className={cn(
                "rounded-[1.75rem] border p-4 shadow-sm",
                index === 0
                  ? "border-amber-200 bg-amber-50"
                  : "border-border/50 bg-white/90",
              )}
            >
              <p className="text-[10px] font-bold text-muted-foreground">
                #{index + 1}
              </p>
              <p className="mt-3 line-clamp-2 text-sm font-bold text-foreground">
                {entry.communityName}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">{entry.lgaName}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-foreground">
                <HugeiconsIcon icon={Medal02Icon} className="h-4 w-4 text-amber-600" />
                {entry.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 px-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground">
              All Communities
            </p>
            <h2 className="mt-1 text-lg font-bold text-foreground">
              Full leaderboard standings
            </h2>
          </div>
          {leaderboard.communityEntry && (
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-2 text-[10px] font-bold text-primary">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} className="h-4 w-4" />
              Your community
            </div>
          )}
        </div>

        {leaderboard.isLoading ? (
          <div className="rounded-[1.75rem] border border-border/60 bg-white/80 p-5 text-sm text-muted-foreground shadow-sm">
            Loading Lagos leaderboard...
          </div>
        ) : leaderboard.rankedEntries.length === 0 ? (
          <div className="rounded-[1.75rem] border border-border/60 bg-white/80 p-5 text-sm text-muted-foreground shadow-sm">
            No leaderboard entries are available yet.
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.rankedEntries.map((entry, index) => {
              const isCurrentCommunity = entry.communityId === session?.user.communityId;

              return (
                <div
                  key={entry.communityId}
                  className={cn(
                    "rounded-[1.75rem] border p-4 shadow-sm transition-colors",
                    isCurrentCommunity
                      ? "border-primary/25 bg-primary/5"
                      : "border-border/60 bg-white/90",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-bold",
                          index === 0
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : isCurrentCommunity
                              ? "border-primary/20 bg-white text-primary"
                              : "border-border/60 bg-muted/30 text-foreground",
                        )}
                      >
                        #{index + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-base font-bold text-foreground">
                            {entry.communityName}
                          </p>
                          {isCurrentCommunity && (
                            <span className="rounded-full bg-primary px-2 py-1 text-[9px] font-bold text-white">
                              You
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{entry.lgaName}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{entry.resolvedIssueCount} resolved</span>
                          <span>{entry.unresolvedIssueCount} unresolved</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-bold text-muted-foreground">
                        Score
                      </p>
                      <p className="mt-1 text-xl font-bold text-foreground">{entry.score}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {leaderboard.spotlightEntry && (
          <button
            onClick={() => navigate("/mobile/report")}
            className="mt-5 flex w-full items-center justify-between rounded-[1.75rem] border border-border/60 bg-white/90 px-4 py-4 text-left shadow-sm transition-transform active:scale-[0.99]"
          >
            <div>
              <p className="text-[10px] font-bold text-muted-foreground">
                Improve Rank
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Report an issue to help your community move up
              </p>
            </div>
            <HugeiconsIcon icon={ArrowUpRight01Icon} className="h-5 w-5 text-primary" />
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileLeaderboard;

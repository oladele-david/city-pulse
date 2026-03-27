import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar01Icon,
  CheckmarkBadge01Icon,
  InformationCircleIcon,
  Medal02Icon,
} from "@hugeicons/core-free-icons";
import { MobileActivityDetailsSheet } from "@/components/mobile/sheets/MobileActivityDetailsSheet";
import { CredibilityInfoModal } from "@/components/mobile/modals/CredibilityInfoModal";
import { api } from "@/lib/api";
import { ActivityContribution, toActivityContribution } from "@/lib/activity";
import { cn } from "@/lib/utils";
import { useCitizenAuth } from "@/hooks/use-auth";

const MobileActivity = () => {
  const { session } = useCitizenAuth();
  const [selectedContribution, setSelectedContribution] =
    useState<ActivityContribution | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const activityQuery = useQuery({
    queryKey: ["activity", "me", session?.user.id],
    queryFn: () => api.getMyActivity(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const contributions = useMemo(
    () => (activityQuery.data ?? []).map(toActivityContribution),
    [activityQuery.data],
  );

  const totalPoints = contributions.reduce(
    (sum, item) => sum + Math.max(0, item.points),
    0,
  );
  const resolvedCount = contributions.filter((item) => item.status === "resolved").length;
  const rankLabel = session?.user.rank ?? "Citizen";

  return (
    <div className="flex flex-col bg-background pb-32">
      <div className="px-4 py-6 transition-all duration-300">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-primary p-4 text-white shadow-lg">
          <button
            onClick={() => setIsInfoOpen(true)}
            className="absolute right-4 top-4 z-50 rounded-full border border-white/5 bg-white/10 p-1 transition-all active:scale-90"
          >
            <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 text-white" />
          </button>

          <div className="relative z-10">
            <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5">
              <span className="text-[10px] font-bold">
                {rankLabel}
              </span>
              <HugeiconsIcon icon={CheckmarkBadge01Icon} className="h-3.5 w-3.5" />
            </div>

            <div className="mb-5 space-y-1">
              <span className="text-[10px] font-bold text-white/60">
                Total Points Earned
              </span>
              <div className="flex items-baseline gap-2">
                <h1 className="text-3xl font-semibold">{totalPoints}</h1>
                <HugeiconsIcon icon={Medal02Icon} className="h-6 w-6 text-white/30" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/5 bg-white/10 p-3">
                <span className="block text-[9px] font-bold text-white/60">
                  Contributions
                </span>
                <span className="text-lg font-semibold">{contributions.length}</span>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/10 p-3">
                <span className="block text-[9px] font-bold text-white/60">
                  Resolved
                </span>
                <span className="text-lg font-semibold">{resolvedCount}</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        </div>
      </div>

      <div className="px-6">
        <div className="mb-6 flex items-center justify-between px-1">
          <h2 className="text-[10px] font-bold text-muted-foreground italic">
            Contribution History
          </h2>
          <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground/90" />
        </div>

        {activityQuery.isLoading ? (
          <div className="rounded-3xl border border-border/50 bg-muted/20 p-5 text-sm text-muted-foreground">
            Loading your CityPulse activity...
          </div>
        ) : contributions.length === 0 ? (
          <div className="rounded-3xl border border-border/50 bg-muted/20 p-5 text-sm text-muted-foreground">
            Your reports and reactions will appear here once you start participating.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute bottom-4 left-[3px] top-4 w-px bg-border/40" />
            <div className="space-y-10">
              {contributions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedContribution(item);
                    setIsDetailsOpen(true);
                  }}
                  className="group relative pl-8 transition-all active:scale-[0.98]"
                >
                  <div
                    className={cn(
                      "absolute left-0 top-[6px] z-10 h-[7px] w-[7px] rounded-full ring-4 ring-background transition-all group-hover:scale-125",
                      item.status === "resolved"
                        ? "bg-green-500"
                        : item.status === "verified"
                          ? "bg-primary"
                          : item.status === "rejected"
                            ? "bg-rose-500"
                            : "bg-muted-foreground/40",
                    )}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-muted-foreground/60">
                          {item.timestamp}
                        </span>
                        <div className="h-1 w-1 rounded-full bg-border" />
                        <span
                          className={cn(
                            "text-[10px] font-semibold",
                            item.status === "resolved"
                              ? "text-green-600"
                              : item.status === "verified"
                                ? "text-primary/70"
                                : item.status === "rejected"
                                  ? "text-rose-600"
                                  : "text-muted-foreground",
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="mb-1 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="truncate text-[11px] font-medium text-muted-foreground/80">
                        {item.location}
                      </p>
                    </div>

                    {item.points !== 0 && (
                      <div className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-border/40 bg-muted/30 px-3 py-2 transition-all group-hover:border-primary/20 group-hover:bg-primary/5">
                        <span className="text-xs font-semibold text-foreground group-hover:text-primary">
                          {item.points > 0 ? `+${item.points}` : item.points}
                        </span>
                        <HugeiconsIcon
                          icon={Medal02Icon}
                          className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MobileActivityDetailsSheet
        contribution={selectedContribution}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />

      <CredibilityInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </div>
  );
};

export default MobileActivity;

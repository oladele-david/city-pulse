import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

const MobileLevies = () => {
  const navigate = useNavigate();
  const { session } = useCitizenAuth();
  const [targetFilter, setTargetFilter] = useState<"community" | "lga" | "all">("community");

  const leviesQuery = useQuery({
    queryKey: ["mobile-levies", session?.user.id],
    queryFn: () => api.listMyLevies(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const levies = leviesQuery.data ?? [];

  const totalAmountDue = useMemo(
    () => levies.reduce((sum, levy) => sum + levy.amount, 0),
    [levies],
  );

  const communityCount = useMemo(() => levies.filter((l) => l.targetType === "community").length, [levies]);
  const lgaCount = useMemo(() => levies.filter((l) => l.targetType === "lga").length, [levies]);

  const filteredLevies = useMemo(() => {
    if (targetFilter === "all") return levies;
    return levies.filter((l) => l.targetType === targetFilter);
  }, [levies, targetFilter]);

  return (
    <div className="bg-white px-4 pb-28 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border transition-transform active:scale-95"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">My Levies</h1>
          <p className="text-xs text-muted-foreground">Published levies for your area.</p>
        </div>
      </div>

      {/* Summary card — activity-page style */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-primary p-4 text-white">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-white/60">Total due</p>
          <p className="mt-1 text-3xl font-semibold">₦{totalAmountDue.toLocaleString()}</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/10 p-3">
              <span className="block text-[9px] font-bold text-white/60">Community</span>
              <span className="text-lg font-semibold">{communityCount}</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/10 p-3">
              <span className="block text-[9px] font-bold text-white/60">LGA</span>
              <span className="text-lg font-semibold">{lgaCount}</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Filter tabs */}
      <Tabs
        value={targetFilter}
        onValueChange={(v) => setTargetFilter(v as typeof targetFilter)}
        className="w-full"
      >
        <TabsList className="grid h-9 w-full grid-cols-3 rounded-xl bg-muted/40 p-0.5">
          <TabsTrigger value="community" className="rounded-lg text-xs">Community</TabsTrigger>
          <TabsTrigger value="lga" className="rounded-lg text-xs">LGA</TabsTrigger>
          <TabsTrigger value="all" className="rounded-lg text-xs">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Levy list */}
      {leviesQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-3 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      ) : filteredLevies.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No levies match this filter.
        </p>
      ) : (
        <div className="divide-y divide-border/60">
          {filteredLevies.map((levy) => (
            <Link
              key={levy.id}
              to={`/mobile/levies/${levy.id}`}
              className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{levy.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="capitalize">{levy.targetType}</span>
                  <span>·</span>
                  <span>Due {format(new Date(levy.dueDate), "dd MMM yyyy")}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="text-sm font-bold text-foreground">₦{levy.amount.toLocaleString()}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileLevies;

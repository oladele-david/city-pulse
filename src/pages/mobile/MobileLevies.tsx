import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Building2, MapPinned, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

const MobileLevies = () => {
  const { session } = useCitizenAuth();
  const [targetFilter, setTargetFilter] = useState<"community" | "lga" | "all">("community");

  const leviesQuery = useQuery({
    queryKey: ["mobile-levies", session?.user.id],
    queryFn: () => api.listMyLevies(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const groupedLevies = useMemo(() => {
    const levies = leviesQuery.data ?? [];

    const communityLevies = levies.filter((levy) => levy.targetType === "community");
    const lgaLevies = levies.filter((levy) => levy.targetType === "lga");

    return [
      {
        key: "community",
        title: "Community levies",
        description: "Charges assigned directly to your community are shown first.",
        icon: Users,
        accent: "from-amber-100 via-white to-white",
        items: communityLevies,
      },
      {
        key: "lga",
        title: "LGA levies",
        description: "These cover wider levies issued across your local government area.",
        icon: Building2,
        accent: "from-sky-100 via-white to-white",
        items: lgaLevies,
      },
    ];
  }, [leviesQuery.data]);

  const totalAmountDue = useMemo(
    () => (leviesQuery.data ?? []).reduce((sum, levy) => sum + levy.amount, 0),
    [leviesQuery.data],
  );

  const visibleGroups = useMemo(() => {
    if (targetFilter === "all") {
      return groupedLevies;
    }

    return groupedLevies.filter((group) => group.key === targetFilter);
  }, [groupedLevies, targetFilter]);

  return (
    <div className="space-y-5 bg-[linear-gradient(180deg,#fff9ef_0%,#f8fbff_45%,#ffffff_100%)] px-4 pb-28 pt-6">
      <div>
        <h1 className="text-2xl font-bold">My Levies</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Published levies for your community and LGA appear here.
        </p>
      </div>

      <Card className="overflow-hidden rounded-[2rem] border-none bg-[linear-gradient(135deg,#1f2937_0%,#0f172a_45%,#1d4ed8_100%)] text-white shadow-xl shadow-slate-200/70">
        <CardContent className="space-y-5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-white/70">
                Levy overview
              </div>
              <div className="mt-3 text-3xl font-semibold">
                NGN {totalAmountDue.toLocaleString()}
              </div>
              <p className="mt-2 max-w-xs text-sm text-white/75">
                Your levy feed is now grouped so community obligations appear before wider LGA bills.
              </p>
            </div>
            <Badge className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white hover:bg-white/10">
              {(leviesQuery.data ?? []).length} active
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {groupedLevies.map((group) => (
              <div key={group.key} className="rounded-3xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <div className="text-xs text-white/60">
                  {group.title}
                </div>
                <div className="mt-2 text-2xl font-semibold">{group.items.length}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-500">
            Show levies by target
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Community levies are selected by default, and you can switch to LGA or all levies anytime.
          </p>
        </div>
        <Tabs
          value={targetFilter}
          onValueChange={(value) => setTargetFilter(value as typeof targetFilter)}
          className="w-full"
        >
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-[1.25rem] bg-slate-100 p-1">
            <TabsTrigger value="community" className="rounded-[1rem] py-2.5">
              Community
            </TabsTrigger>
            <TabsTrigger value="lga" className="rounded-[1rem] py-2.5">
              LGA
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-[1rem] py-2.5">
              All
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {leviesQuery.isLoading ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Loading your levy feed...
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {visibleGroups.map((group) => {
            const Icon = group.icon;

            if (!group.items.length) {
              return null;
            }

            return (
              <section key={group.key} className="space-y-3">
                <div className={`rounded-[1.75rem] border border-slate-200/70 bg-gradient-to-br ${group.accent} p-4 shadow-sm`}>
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-white/80 p-3 text-slate-700 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{group.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">{group.description}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {group.items.map((levy) => (
                    <Card key={levy.id} className="rounded-[2rem] border-white/70 bg-white/95 shadow-sm">
                      <CardHeader className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                          <div className="space-y-3 min-w-0">
                            <Badge variant="outline" className="rounded-full border-slate-300 bg-slate-50 px-3 py-1">
                              {levy.targetType}
                            </Badge>
                            <div>
                              <CardTitle className="text-xl leading-tight">{levy.title}</CardTitle>
                              <CardDescription className="mt-2">{levy.description}</CardDescription>
                            </div>
                          </div>
                          <div className="rounded-3xl bg-slate-950 px-4 py-3 text-left text-white md:min-w-[170px] md:text-right">
                            <div className="text-xs text-white/55">
                              Amount
                            </div>
                            <div className="mt-2 text-lg font-semibold">
                              NGN {levy.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <div className="text-xs text-muted-foreground">
                              Due date
                            </div>
                            <div className="mt-2 font-semibold text-slate-900">
                              {format(new Date(levy.dueDate), "dd MMM yyyy")}
                            </div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 px-4 py-3">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPinned className="h-3.5 w-3.5" />
                              Applies to
                            </div>
                            <div className="mt-2 font-semibold text-slate-900">
                              {levy.targetType === "community"
                                ? levy.targetCommunity?.name ?? levy.targetCommunityId
                                : levy.targetLga?.name ?? levy.targetLgaId}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button asChild className="flex-1 rounded-full bg-slate-950 text-white hover:bg-slate-800">
                            <Link to={`/mobile/levies/${levy.id}`}>
                              Open levy
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="rounded-full border-slate-300 px-5">
                            <Link to="/mobile/payments">Payments</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}

          {!visibleGroups.some((group) => group.items.length) ? (
            <Card className="rounded-[2rem]">
              <CardContent className="py-8 text-sm text-muted-foreground">
                No levies match the current filter for your location.
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default MobileLevies;

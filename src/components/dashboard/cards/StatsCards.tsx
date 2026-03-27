import { useQuery } from "@tanstack/react-query";
import { KPICard } from "./KPICard";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

export const StatsCards = () => {
    const { session } = useAuth();

    const overviewQuery = useQuery({
        queryKey: ["analytics-overview"],
        queryFn: () => api.getAnalyticsOverview(session!.accessToken),
        enabled: Boolean(session?.accessToken),
    });

    const issuesQuery = useQuery({
        queryKey: ["issues"],
        queryFn: () => api.listIssues(),
    });

    const issues = issuesQuery.data ?? [];
    const highSeverity = issues.filter((i) => i.severity === "high").length;
    const overview = overviewQuery.data;

    if (overviewQuery.isLoading) {
        return (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card shadow-sm p-5 pt-8 space-y-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-7 w-16" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
                title="Open Issues"
                value={overview?.issues.open ?? 0}
                description="Currently unresolved"
                iconClassName="bg-orange-500"
            />
            <KPICard
                title="High Severity"
                value={highSeverity}
                description="Across all issues"
                iconClassName="bg-red-500"
            />
            <KPICard
                title="Resolved"
                value={overview?.issues.resolved ?? 0}
                description="Total resolved"
                iconClassName="bg-green-500"
            />
            <KPICard
                title="Citizens"
                value={overview?.users.citizens ?? 0}
                description="Registered users"
                iconClassName="bg-blue-500"
            />
        </div>
    );
};

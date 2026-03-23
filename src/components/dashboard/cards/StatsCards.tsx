import { KPICard } from "./KPICard";

export const StatsCards = () => {
    return (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
                title="Active Issues"
                value="24"
                trend="+12%"
                trendUp={false}
                description="All time"
                iconClassName="bg-orange-500"
            />
            <KPICard
                title="High Severity"
                value="7"
                trend="+2"
                trendUp={false}
                description="All time"
                iconClassName="bg-red-500"
            />
            <KPICard
                title="Resolved"
                value="128"
                trend="+8%"
                trendUp={true}
                description="Last 7 days"
                iconClassName="bg-green-500"
            />
            <KPICard
                title="Avg. Resolution"
                value="24h"
                trend="-2h"
                trendUp={true}
                description="All time"
                iconClassName="bg-yellow-500"
            />
        </div>
    );
};

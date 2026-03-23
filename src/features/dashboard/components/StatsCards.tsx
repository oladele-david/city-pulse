import {
    Alert02Icon,
    AlertCircleIcon,
    CheckmarkCircle02Icon,
    Time02Icon
} from "@hugeicons/core-free-icons";
import { KPICard } from "./KPICard";

export const StatsCards = () => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
                title="Active Issues"
                value="24"
                icon={Alert02Icon}
                trend="+12%"
                trendUp={false}
                description="from last week"
                iconClassName="bg-blue-500/10 text-blue-600"
            />
            <KPICard
                title="High Severity"
                value="7"
                icon={AlertCircleIcon}
                trend="+2"
                trendUp={false}
                description="new alerts"
                iconClassName="bg-red-500/10 text-red-600"
            />
            <KPICard
                title="Resolved"
                value="128"
                icon={CheckmarkCircle02Icon}
                trend="+8%"
                trendUp={true}
                description="last 7 days"
                iconClassName="bg-green-500/10 text-green-600"
            />
            <KPICard
                title="Avg. Resolution"
                value="24h"
                icon={Time02Icon}
                trend="-2h"
                trendUp={true}
                description="improvement"
                iconClassName="bg-purple-500/10 text-purple-600"
            />
        </div>
    );
};

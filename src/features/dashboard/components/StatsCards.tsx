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
            />
            <KPICard
                title="High Severity"
                value="7"
                icon={AlertCircleIcon}
                trend="+2"
                trendUp={false}
                description="new alerts"
                className="border-l-4 border-l-orange-500"
            />
            <KPICard
                title="Resolved"
                value="128"
                icon={CheckmarkCircle02Icon}
                trend="+8%"
                trendUp={true}
                description="last 7 days"
            />
            <KPICard
                title="Avg. Resolution"
                value="24h"
                icon={Time02Icon}
                trend="-2h"
                trendUp={true}
                description="improvement"
            />
        </div>
    );
};

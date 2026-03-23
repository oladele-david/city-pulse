import { IssuesDistributionChart } from "@/components/dashboard/analytics/IssuesDistributionChart";
import { HeatZonesTable } from "@/components/dashboard/analytics/HeatZonesTable";
import { ResolutionTimeTrendChart } from "@/components/dashboard/analytics/ResolutionTimeTrendChart";

const Analytics = () => {
    return (
        <div className="space-y-3">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground mt-1">Insights and trends across civic infrastructure</p>
            </div>

            {/* Top Row: Pie Chart + Heat Zones Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <IssuesDistributionChart />
                <HeatZonesTable />
            </div>

            {/* Bottom Row: Resolution Time Trend */}
            <ResolutionTimeTrendChart />
        </div>
    );
};

export default Analytics;

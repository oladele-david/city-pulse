import { StatsCards } from "../../components/dashboard/cards/StatsCards";
import { HeatmapCard } from "../../components/dashboard/cards/HeatmapCard";
import { RecentActivityCard } from "../../components/dashboard/cards/RecentActivityCard";

const Dashboard = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Real-time overview of city operations and infrastructure health.
                </p>
            </div>

            <StatsCards />

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7 h-[450px]">
                <HeatmapCard className="col-span-4 h-full" />
                <RecentActivityCard className="col-span-3 h-full" />
            </div>
        </div>
    );
};

export default Dashboard;

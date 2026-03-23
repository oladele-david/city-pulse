import { StatsCards } from "../features/dashboard/components/StatsCards";

const Index = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Real-time overview of city operations and infrastructure health.
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6 min-h-[400px]">
          <h3 className="font-semibold mb-4">Issue Density Heatmap</h3>
          <div className="h-full w-full bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground">
            Map Preview Placeholder
          </div>
        </div>
        <div className="col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">New road issue detected in Al Quoz</p>
                  <p className="text-xs text-muted-foreground">10 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

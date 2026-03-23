import { cn } from "@/lib/utils";
import { mockRecentActivity } from "@/data/mockRecentActivity";

export const RecentActivityCard = ({ className }: { className?: string }) => {
    return (
        <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden", className)}>
            <div className="p-6 pb-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Recent Activity</h3>
                <a href="/dashboard/issues">
                    <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        View All Issues
                    </button>
                </a>
            </div>
            {/* Separator Line */}
            <div className="h-px w-full bg-border shrink-0" />

            <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/80">
                {mockRecentActivity.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className={cn(
                            "h-2 w-2 mt-2 rounded-full shrink-0",
                            item.severity === "high" ? "bg-red-500" :
                                item.severity === "medium" ? "bg-orange-500" : "bg-blue-500"
                        )} />
                        <div>
                            <p className="text-sm font-medium leading-none">{item.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

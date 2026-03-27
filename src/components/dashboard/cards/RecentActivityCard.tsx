import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export const RecentActivityCard = ({ className }: { className?: string }) => {
    const issuesQuery = useQuery({
        queryKey: ["issues"],
        queryFn: () => api.listIssues(),
    });

    const recentIssues = (issuesQuery.data ?? [])
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12);

    return (
        <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden", className)}>
            <div className="p-6 pb-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Recent Activity</h3>
                <Link to="/console/dashboard/issues">
                    <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                        View All Issues
                    </button>
                </Link>
            </div>
            <div className="h-px w-full bg-border shrink-0" />

            <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/80">
                {issuesQuery.isLoading &&
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                            <Skeleton className="h-2 w-2 mt-2 rounded-full shrink-0" />
                            <div className="space-y-1.5 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    ))}

                {!issuesQuery.isLoading && recentIssues.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No issues reported yet.</p>
                )}

                {recentIssues.map((issue) => (
                    <div key={issue.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                        <div className={cn(
                            "h-2 w-2 mt-2 rounded-full shrink-0",
                            issue.severity === "high" ? "bg-red-500" :
                                issue.severity === "medium" ? "bg-orange-500" : "bg-blue-500"
                        )} />
                        <div>
                            <p className="text-sm font-medium leading-none">{issue.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

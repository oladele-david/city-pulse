import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { IssueRecord } from "@/types/api";
import { format } from "date-fns";

interface ResolutionTimeTrendChartProps {
    className?: string;
}

function computeResolutionTrend(issues: IssueRecord[]) {
    // Group resolved issues by month, compute average resolution time per severity
    const resolved = issues.filter((i) => i.status === "resolved");
    const byMonth = new Map<string, { high: number[]; medium: number[]; low: number[] }>();

    for (const issue of resolved) {
        const month = format(new Date(issue.createdAt), "MMM");
        const days =
            (new Date(issue.updatedAt).getTime() - new Date(issue.createdAt).getTime()) /
            (1000 * 60 * 60 * 24);

        if (!byMonth.has(month)) {
            byMonth.set(month, { high: [], medium: [], low: [] });
        }
        const bucket = byMonth.get(month)!;
        if (issue.severity === "high") bucket.high.push(days);
        else if (issue.severity === "medium") bucket.medium.push(days);
        else bucket.low.push(days);
    }

    const avg = (arr: number[]) => (arr.length > 0 ? Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 10) / 10 : 0);

    // Also include months with open issues for broader coverage
    const allIssues = issues;
    for (const issue of allIssues) {
        const month = format(new Date(issue.createdAt), "MMM");
        if (!byMonth.has(month)) {
            byMonth.set(month, { high: [], medium: [], low: [] });
        }
    }

    return Array.from(byMonth.entries()).map(([month, data]) => ({
        month,
        high: avg(data.high),
        medium: avg(data.medium),
        low: avg(data.low),
    }));
}

export const ResolutionTimeTrendChart = ({ className }: ResolutionTimeTrendChartProps) => {
    const issuesQuery = useQuery({
        queryKey: ["issues"],
        queryFn: () => api.listIssues(),
    });

    const trendData = useMemo(
        () => computeResolutionTrend(issuesQuery.data ?? []),
        [issuesQuery.data],
    );

    return (
        <div className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden", className)}>
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">Resolution Time Trend</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <div className="w-3 h-0.5 bg-[#ef4444]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] -ml-0.5" />
                                <div className="w-3 h-0.5 bg-[#ef4444] -ml-0.5" />
                            </div>
                            <span className="text-xs text-muted-foreground">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <div className="w-3 h-0.5 bg-[#f59e0b]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] -ml-0.5" />
                                <div className="w-3 h-0.5 bg-[#f59e0b] -ml-0.5" />
                            </div>
                            <span className="text-xs text-muted-foreground">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <div className="w-3 h-0.5 bg-[#10b981]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] -ml-0.5" />
                                <div className="w-3 h-0.5 bg-[#10b981] -ml-0.5" />
                            </div>
                            <span className="text-xs text-muted-foreground">Low</span>
                        </div>
                    </div>
                </div>
                <div className="h-px bg-border" />
            </div>

            <div className="px-6 pb-6">
                {issuesQuery.isLoading ? (
                    <div className="h-[320px] flex items-center justify-center">
                        <Skeleton className="h-[280px] w-full rounded-lg" />
                    </div>
                ) : trendData.length === 0 ? (
                    <div className="h-[320px] flex items-center justify-center text-sm text-muted-foreground">
                        No resolved issues to show trend data.
                    </div>
                ) : (
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                                <YAxis
                                    label={{ value: 'Days', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                                    tick={{ fontSize: 12 }}
                                    stroke="#9ca3af"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line type="linear" dataKey="high" stroke="#ef4444" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} activeDot={{ r: 5 }} />
                                <Line type="linear" dataKey="medium" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} activeDot={{ r: 5 }} />
                                <Line type="linear" dataKey="low" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

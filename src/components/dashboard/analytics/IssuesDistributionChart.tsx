import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { IssueRecord } from "@/types/api";

interface IssuesDistributionChartProps {
    className?: string;
}

const TYPE_COLORS = ["#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#10b981", "#06b6d4", "#6366f1"];

function formatType(type: string) {
    return type.split("_").join(" ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function computeByType(issues: IssueRecord[]) {
    const map = new Map<string, number>();
    for (const issue of issues) {
        map.set(issue.type, (map.get(issue.type) ?? 0) + 1);
    }
    return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([type, count], i) => ({
            name: formatType(type),
            count,
            color: TYPE_COLORS[i % TYPE_COLORS.length],
        }));
}

function computeBySeverity(issues: IssueRecord[]) {
    const map = new Map<string, number>();
    for (const issue of issues) {
        map.set(issue.severity, (map.get(issue.severity) ?? 0) + 1);
    }
    const severityColors: Record<string, string> = {
        high: "#ef4444",
        medium: "#f59e0b",
        low: "#3b82f6",
    };
    return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([severity, count]) => ({
            name: severity.charAt(0).toUpperCase() + severity.slice(1),
            count,
            color: severityColors[severity] ?? "#6b7280",
        }));
}

export const IssuesDistributionChart = ({ className }: IssuesDistributionChartProps) => {
    const [view, setView] = useState<'type' | 'severity'>('type');

    const issuesQuery = useQuery({
        queryKey: ["issues"],
        queryFn: () => api.listIssues(),
    });

    const issues = issuesQuery.data ?? [];
    const pieData = useMemo(
        () => (view === 'type' ? computeByType(issues) : computeBySeverity(issues)),
        [issues, view],
    );
    const totalIssues = pieData.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden", className)}>
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">Issues Distribution</h3>
                    <div className="flex gap-0 bg-grey/50 border rounded-full p-0.5">
                        <button
                            onClick={() => setView('type')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                                view === 'type'
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            By Type
                        </button>
                        <button
                            onClick={() => setView('severity')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                                view === 'severity'
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            By Severity
                        </button>
                    </div>
                </div>
                <div className="h-px bg-border" />
            </div>

            <div className="px-6 pb-6">
                {issuesQuery.isLoading ? (
                    <div className="h-[300px] flex items-center justify-center gap-6">
                        <Skeleton className="h-[200px] w-[200px] rounded-full" />
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-4 w-28" />
                            ))}
                        </div>
                    </div>
                ) : pieData.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                        No issue data available.
                    </div>
                ) : (
                    <>
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="w-[220px]">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={100}
                                            paddingAngle={3}
                                            dataKey="count"
                                            cornerRadius={6}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="ml-6 space-y-2">
                                {pieData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: entry.color }}
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            {entry.name}
                                        </span>
                                        <span className="text-xs font-medium text-foreground ml-auto">
                                            {entry.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                Total Issues: <span className="font-semibold text-foreground">{totalIssues}</span>
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

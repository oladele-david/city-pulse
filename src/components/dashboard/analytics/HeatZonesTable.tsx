import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { IssueRecord } from "@/types/api";

interface HeatZonesTableProps {
    className?: string;
}

function computeHeatZones(issues: IssueRecord[]) {
    const byStreet = new Map<string, IssueRecord[]>();
    for (const issue of issues) {
        const key = issue.streetOrLandmark || "Unknown";
        const list = byStreet.get(key) ?? [];
        list.push(issue);
        byStreet.set(key, list);
    }

    return Array.from(byStreet.entries())
        .map(([zone, zoneIssues]) => {
            const resolved = zoneIssues.filter((i) => i.status === "resolved");
            const avgDays =
                resolved.length > 0
                    ? resolved.reduce((sum, i) => {
                          const created = new Date(i.createdAt).getTime();
                          const updated = new Date(i.updatedAt).getTime();
                          return sum + (updated - created) / (1000 * 60 * 60 * 24);
                      }, 0) / resolved.length
                    : 0;

            return {
                zone,
                issueCount: zoneIssues.length,
                avgResolutionDays: Math.round(avgDays * 10) / 10,
                openCount: zoneIssues.filter((i) => i.status === "open").length,
            };
        })
        .sort((a, b) => b.issueCount - a.issueCount)
        .slice(0, 10);
}

export const HeatZonesTable = ({ className }: HeatZonesTableProps) => {
    const issuesQuery = useQuery({
        queryKey: ["issues"],
        queryFn: () => api.listIssues(),
    });

    const zones = useMemo(() => computeHeatZones(issuesQuery.data ?? []), [issuesQuery.data]);

    return (
        <div className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden", className)}>
            <div className="p-6 pb-4">
                <h3 className="text-base font-semibold text-foreground mb-4">Heat Zones</h3>
                <div className="h-px bg-border" />
            </div>

            <div className="px-6 pb-6">
                <div className="overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-card z-10">
                            <tr className="border-b">
                                <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground">Zone</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-muted-foreground">Issues</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-muted-foreground">Avg Resolve</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-muted-foreground">Open</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issuesQuery.isLoading &&
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-b last:border-0">
                                        <td className="py-3 px-2"><Skeleton className="h-4 w-28" /></td>
                                        <td className="py-3 px-2"><Skeleton className="h-4 w-8 mx-auto" /></td>
                                        <td className="py-3 px-2"><Skeleton className="h-4 w-10 mx-auto" /></td>
                                        <td className="py-3 px-2"><Skeleton className="h-4 w-8 mx-auto" /></td>
                                    </tr>
                                ))}

                            {!issuesQuery.isLoading && zones.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                                        No issue data available.
                                    </td>
                                </tr>
                            )}

                            {zones.map((zone) => (
                                <tr
                                    key={zone.zone}
                                    className="border-b last:border-0 hover:bg-muted/5 transition-colors"
                                >
                                    <td className="py-3 px-2 text-sm font-medium text-foreground">{zone.zone}</td>
                                    <td className="py-3 px-2 text-sm text-center text-muted-foreground">{zone.issueCount}</td>
                                    <td className="py-3 px-2 text-sm text-center text-muted-foreground">
                                        {zone.avgResolutionDays > 0 ? `${zone.avgResolutionDays}d` : "—"}
                                    </td>
                                    <td className="py-3 px-2 text-sm text-center text-muted-foreground">{zone.openCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #d1d5db;
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </div>
    );
};

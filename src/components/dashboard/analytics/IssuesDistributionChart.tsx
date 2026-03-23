import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from "@/lib/utils";
import { issuesByType, issuesByArea } from "@/data/analyticsData";

interface IssuesDistributionChartProps {
    className?: string;
}

export const IssuesDistributionChart = ({ className }: IssuesDistributionChartProps) => {
    const [view, setView] = useState<'type' | 'area'>('type');
    const pieData = view === 'type' ? issuesByType : issuesByArea;
    const totalIssues = pieData.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden", className)}>
            {/* Header with tabs */}
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
                            onClick={() => setView('area')}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                                view === 'area'
                                    ? "bg-accent text-white shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            By Area
                        </button>
                    </div>
                </div>
                <div className="h-px bg-border" />
            </div>

            {/* Chart Content */}
            <div className="px-6 pb-6">
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

                    {/* Custom Legend */}
                    <div className="ml-6 space-y-2">
                        {pieData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {view === 'type' ? entry.type : entry.area}
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
            </div>
        </div>
    );
};

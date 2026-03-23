import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from "@/lib/utils";
import { resolutionTimeTrend } from "@/data/analyticsData";

interface ResolutionTimeTrendChartProps {
    className?: string;
}

export const ResolutionTimeTrendChart = ({ className }: ResolutionTimeTrendChartProps) => {
    return (
        <div className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden", className)}>
            {/* Header with Legend */}
            <div className="p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">Resolution Time Trend</h3>

                    {/* Custom Legend */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <div className="w-3 h-0.5 bg-[#ef4444]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] -ml-0.5" />
                                <div className="w-3 h-0.5 bg-[#ef4444] -ml-0.5" />
                            </div>
                            <span className="text-xs text-muted-foreground">High Severity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <div className="w-3 h-0.5 bg-[#f59e0b]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] -ml-0.5" />
                                <div className="w-3 h-0.5 bg-[#f59e0b] -ml-0.5" />
                            </div>
                            <span className="text-xs text-muted-foreground">Medium Severity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center">
                                <div className="w-3 h-0.5 bg-[#10b981]" />
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] -ml-0.5" />
                                <div className="w-3 h-0.5 bg-[#10b981] -ml-0.5" />
                            </div>
                            <span className="text-xs text-muted-foreground">Low Severity</span>
                        </div>
                    </div>
                </div>
                <div className="h-px bg-border" />
            </div>

            {/* Chart Content */}
            <div className="px-6 pb-6">
                <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={resolutionTimeTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12 }}
                                stroke="#9ca3af"
                            />
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
                            <Line
                                type="linear"
                                dataKey="high"
                                stroke="#ef4444"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#ef4444' }}
                                activeDot={{ r: 5 }}
                            />
                            <Line
                                type="linear"
                                dataKey="medium"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#f59e0b' }}
                                activeDot={{ r: 5 }}
                            />
                            <Line
                                type="linear"
                                dataKey="low"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ r: 3, fill: '#10b981' }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

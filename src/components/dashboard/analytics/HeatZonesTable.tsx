import { cn } from "@/lib/utils";
import { heatZones } from "@/data/analyticsData";
import { ArrowUpIcon, ArrowDownIcon, Remove01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface HeatZonesTableProps {
    className?: string;
}

export const HeatZonesTable = ({ className }: HeatZonesTableProps) => {
    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up':
                return <HugeiconsIcon icon={ArrowUpIcon} className="w-3.5 h-3.5 text-red-600" />;
            case 'down':
                return <HugeiconsIcon icon={ArrowDownIcon} className="w-3.5 h-3.5 text-green-600" />;
            case 'stable':
                return <HugeiconsIcon icon={Remove01Icon} className="w-3.5 h-3.5 text-gray-600" />;
        }
    };

    return (
        <div className={cn("rounded-2xl border bg-card shadow-sm overflow-hidden", className)}>
            {/* Header */}
            <div className="p-6 pb-4">
                <h3 className="text-base font-semibold text-foreground mb-4">Heat Zones</h3>
                <div className="h-px bg-border" />
            </div>

            {/* Table Content */}
            <div className="px-6 pb-6">
                <div className="overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-card z-10">
                            <tr className="border-b">
                                <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Zone</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issues</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Time</th>
                                <th className="text-center py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            {heatZones.map((zone, index) => (
                                <tr
                                    key={index}
                                    className="border-b last:border-0 hover:bg-muted/5 transition-colors"
                                >
                                    <td className="py-3 px-2 text-sm font-medium text-foreground">{zone.zone}</td>
                                    <td className="py-3 px-2 text-sm text-center text-muted-foreground">{zone.issueCount}</td>
                                    <td className="py-3 px-2 text-sm text-center text-muted-foreground">{zone.avgResolutionTime}d</td>
                                    <td className="py-3 px-2">
                                        <div className="flex items-center justify-center">
                                            {getTrendIcon(zone.trend)}
                                        </div>
                                    </td>
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

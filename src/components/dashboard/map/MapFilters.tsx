import { Button } from "@/components/ui/button";
import {
    FilterHorizontalIcon,
    Sun03Icon,
    Moon02Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface MapFiltersProps {
    isDrawerOpen: boolean;
    filters: { severity: string; status: string };
    onFilterChange: (key: string, value: string) => void;
    mapTheme: 'light' | 'dark';
    onThemeToggle: () => void;
}

export const MapFilters = ({ isDrawerOpen, filters, onFilterChange, mapTheme, onThemeToggle }: MapFiltersProps) => {
    const textColor = mapTheme === 'dark' ? 'text-white' : 'text-foreground';
    const iconColor = mapTheme === 'dark' ? 'text-white' : 'text-foreground';

    return (
        <div className={cn(
            "absolute top-4 z-10 flex gap-2 transition-all duration-300 ease-in-out",
            isDrawerOpen ? "right-[410px]" : "right-4"
        )}>
            <div className="backdrop-blur-md p-1 rounded-xl shadow-lg border border-white/10 flex gap-2">
                {/* Severity Filter */}
                <Select value={filters.severity} onValueChange={(val) => onFilterChange('severity', val)}>
                    <SelectTrigger className={cn("h-8 gap-2 text-xs font-medium border-0 focus:ring-0 bg-transparent hover:bg-white/10 w-[130px]", textColor)}>
                        <HugeiconsIcon icon={FilterHorizontalIcon} className={cn("w-3.5 h-3.5", iconColor)} />
                        <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="high">High Only</SelectItem>
                        <SelectItem value="medium">Medium Only</SelectItem>
                        <SelectItem value="low">Low Only</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-px bg-white/20 my-1" />

                {/* Status Filter */}
                <Select value={filters.status} onValueChange={(val) => onFilterChange('status', val)}>
                    <SelectTrigger className={cn("h-8 gap-2 text-xs font-medium border-0 focus:ring-0 bg-transparent hover:bg-white/10 w-[120px]", textColor)}>
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open Only</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                </Select>

                <div className="w-px bg-white/20 my-1" />

                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onThemeToggle}
                    className={cn("h-8 w-8 p-0 hover:bg-white/10 transition-colors", textColor)}
                    title={mapTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    <HugeiconsIcon
                        icon={mapTheme === 'dark' ? Sun03Icon : Moon02Icon}
                        className={cn("w-4 h-4", iconColor)}
                    />
                </Button>
            </div>
        </div>
    );
};

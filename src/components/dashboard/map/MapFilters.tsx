import { Button } from "@/components/ui/button";
import {
    FilterHorizontalIcon,
    Calendar03Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export const MapFilters = ({ isDrawerOpen }: { isDrawerOpen: boolean }) => {
    return (
        <div className={cn(
            "absolute top-4 z-10 flex gap-2 transition-all duration-300 ease-in-out",
            isDrawerOpen ? "right-[410px]" : "right-4"
        )}>
            <div className="bg-background/95 backdrop-blur-md p-1 rounded-lg shadow-sm border border-border/10 flex gap-2">
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-medium">
                    <HugeiconsIcon icon={FilterHorizontalIcon} className="w-3.5 h-3.5" />
                    Filters
                </Button>
                <div className="w-px bg-border/20 my-1" />
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs font-medium">
                    <HugeiconsIcon icon={Calendar03Icon} className="w-3.5 h-3.5" />
                    Date Range
                </Button>
            </div>
        </div>
    );
};

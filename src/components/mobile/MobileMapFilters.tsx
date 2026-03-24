import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    IdeaIcon,
    DropletIcon,
    Road01Icon,
    VolumeHighIcon,
    ThermometerIcon
} from "@hugeicons/core-free-icons";

interface FilterOption {
    id: string;
    label: string;
    icon?: any;
}

const SEVERITY_FILTERS: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'high', label: 'High' },
    { id: 'medium', label: 'Medium' },
    { id: 'low', label: 'Low' },
];

const TYPE_FILTERS: FilterOption[] = [
    { id: 'all', label: 'All Types' },
    { id: 'road', label: 'Roads', icon: Road01Icon },
    { id: 'drainage', label: 'Drainage', icon: DropletIcon },
    { id: 'lighting', label: 'Lighting', icon: IdeaIcon },
    { id: 'noise', label: 'Noise', icon: VolumeHighIcon },
    { id: 'heat', label: 'Heat', icon: ThermometerIcon },
];

interface MobileMapFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    activeFilters: {
        severity: string;
        type: string;
    };
    onFilterChange: (key: 'severity' | 'type', value: string) => void;
}

export const MobileMapFilters = ({ isOpen, onClose, activeFilters, onFilterChange }: MobileMapFiltersProps) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop to close filters */}
            <div
                className="fixed inset-0 z-20 bg-black/5"
                onClick={onClose}
            />
            <div className="absolute top-[88px] left-4 right-4 z-30 bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl p-5 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Severity Level</p>
                    <div className="flex flex-wrap gap-2">
                        {SEVERITY_FILTERS.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => onFilterChange('severity', f.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95",
                                    activeFilters.severity === f.id
                                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                        : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/60"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Issue Category</p>
                    <div className="grid grid-cols-2 gap-2">
                        {TYPE_FILTERS.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => onFilterChange('type', f.id)}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-3 rounded-xl text-xs font-bold border transition-all active:scale-95",
                                    activeFilters.type === f.id
                                        ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                                        : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/60"
                                )}
                            >
                                {f.icon && <HugeiconsIcon icon={f.icon} className="w-4 h-4" />}
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

// Retaining interface for backwards compatibility or clarity
// But modifying the implementation to match the new design
interface KPICardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    description?: string;
    className?: string;
    iconClassName?: string; // Using this as the border color prop now
}

export const KPICard = ({
    title,
    value,
    trend,
    trendUp,
    description,
    className,
    iconClassName
}: KPICardProps) => {
    return (
        <div className={cn("relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md", className)}>
            <div className={cn("absolute top-0 left-0 right-0 h-2", iconClassName /* Temporarily mapping this to the border color class passed in from parent */)} />

            <div className="p-5 pt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
                <div className="text-2xl font-semibold tracking-tight text-foreground mb-3">{value}</div>

                <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{description}</span>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                            <span>{trendUp ? "↑" : "↓"}</span>
                            <span>{trend}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

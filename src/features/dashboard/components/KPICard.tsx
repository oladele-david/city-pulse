import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: string | number;
    icon: any;
    trend?: string;
    trendUp?: boolean;
    description?: string;
    className?: string;
    iconClassName?: string;
}

export const KPICard = ({
    title,
    value,
    icon,
    trend,
    trendUp,
    description,
    className,
    iconClassName
}: KPICardProps) => {
    return (
        <div className={cn("p-6 rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md", className)}>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", iconClassName || "bg-primary/10 text-primary")}>
                    <HugeiconsIcon icon={icon} className="h-5 w-5" />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                {(trend || description) && (
                    <div className="flex items-center gap-2 text-xs">
                        {trend && (
                            <span className={cn(
                                "font-medium px-1.5 py-0.5 rounded-md",
                                trendUp ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                            )}>
                                {trend}
                            </span>
                        )}
                        {description && (
                            <span className="text-muted-foreground">{description}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

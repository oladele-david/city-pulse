import { cn } from "@/lib/utils";

interface ReportProgressProps {
    step: number;
    totalSteps?: number;
}

export const ReportProgress = ({ step, totalSteps = 3 }: ReportProgressProps) => {
    if (step > totalSteps) return null;

    return (
        <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex gap-1.5 flex-1 max-w-[120px]">
                {Array.from({ length: totalSteps }).map((_, i) => {
                    const s = i + 1;
                    return (
                        <div
                            key={s}
                            className={cn(
                                "h-1.5 rounded-full flex-1 transition-all duration-500",
                                step >= s ? "bg-primary" : "bg-muted"
                            )}
                        />
                    );
                })}
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                Step {step} of {totalSteps}
            </span>
        </div>
    );
};

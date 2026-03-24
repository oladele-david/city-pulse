import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface ReportActionsProps {
    step: number;
    onBack: () => void;
    onNext: () => void;
    isSubmitting?: boolean;
    nextLabel?: string;
    showBack?: boolean;
    disabled?: boolean;
}

export const ReportActions = ({
    step,
    onBack,
    onNext,
    isSubmitting = false,
    nextLabel,
    showBack = true,
    disabled = false
}: ReportActionsProps) => {
    return (
        <div className="flex items-center gap-3 mt-10 mb-8">
            {showBack && (
                <button
                    onClick={onBack}
                    className="h-14 w-14 shrink-0 bg-muted/40 text-foreground rounded-2xl flex items-center justify-center active:scale-95 transition-all border border-border/50"
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
                </button>
            )}

            <button
                onClick={onNext}
                disabled={isSubmitting || disabled}
                className={cn(
                    "flex-1 h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-primary/20",
                    (isSubmitting || disabled) && "opacity-40 grayscale-[0.5] cursor-not-allowed active:scale-100"
                )}
            >
                {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        <span>{nextLabel || (step === 3 ? 'SUBMIT REPORT' : 'CONTINUE')}</span>
                        {step < 3 && <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4 rotate-180" />}
                    </>
                )}
            </button>
        </div>
    );
};

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    AiBrain01Icon,
    MagicWand01Icon,
    SparklesIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface AiAnalysis {
    rootCause: string;
    recommendation: string;
}

interface AiAnalysisSectionProps {
    aiAnalysis: AiAnalysis | null;
    isGenerating: boolean;
    onGenerate: () => void;
    onViewFull: () => void;
}

export const AiAnalysisSection = ({
    aiAnalysis,
    isGenerating,
    onGenerate,
    onViewFull
}: AiAnalysisSectionProps) => {
    return (
        <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={AiBrain01Icon} className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-foreground uppercase tracking-tight">AI Insights</h4>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    title="Generate AI Analysis"
                >
                    <HugeiconsIcon
                        icon={MagicWand01Icon}
                        className={cn(
                            "w-4 h-4",
                            isGenerating ? "animate-spin text-primary" : "text-muted-foreground"
                        )}
                    />
                </Button>
            </div>

            {isGenerating && !aiAnalysis && (
                <div className="space-y-2 py-2">
                    <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                        <div className="h-full bg-primary/40 animate-progress" style={{ width: '40%' }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic animate-pulse">
                        Scanning infrastructure patterns...
                    </p>
                </div>
            )}

            {aiAnalysis && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-500">
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <HugeiconsIcon icon={SparklesIcon} className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-muted-foreground leading-relaxed italic line-clamp-3">
                                {aiAnalysis.rootCause}
                            </p>
                        </div>
                    </div>

                    <Button
                        size="sm"
                        variant="link"
                        onClick={onViewFull}
                        className="h-auto p-0 text-[10px] text-primary font-semibold uppercase tracking-widest hover:no-underline flex items-center gap-1 group"
                    >
                        Read Strategic Report
                        <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Button>
                </div>
            )}
        </div>
    );
};

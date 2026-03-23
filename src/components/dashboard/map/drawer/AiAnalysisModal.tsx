import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AiBrain01Icon,
    SparklesIcon,
    CheckmarkCircle02Icon,
    Cancel01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AiAnalysis {
    rootCause: string;
    recommendation: string;
}

interface AiAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    analysis: AiAnalysis | null;
    isGenerating: boolean;
}

export const AiAnalysisModal = ({
    isOpen,
    onClose,
    analysis,
    isGenerating
}: AiAnalysisModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
                <DialogHeader className="p-6 bg-primary text-primary-foreground relative">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <HugeiconsIcon icon={AiBrain01Icon} className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">AI Advanced Analysis</DialogTitle>
                            <DialogDescription className="text-primary-foreground/70">
                                Detailed predictive insights and technical recommendations
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-medium text-muted-foreground animate-pulse">
                                Analyzing historical patterns and sensor data...
                            </p>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-8">
                            {/* Root Cause Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-primary">
                                    <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
                                    <h3 className="font-bold text-lg uppercase tracking-wider">Root Cause Prediction</h3>
                                </div>
                                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                                    <p className="text-sm leading-relaxed text-foreground/80 first-letter:text-2xl first-letter:font-bold first-letter:mr-1">
                                        {analysis.rootCause}
                                    </p>
                                </div>
                            </div>

                            {/* Recommendation Section */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-primary">
                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5" />
                                    <h3 className="font-bold text-lg uppercase tracking-wider">Strategic Recommendation</h3>
                                </div>
                                <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                                    <p className="text-sm leading-relaxed text-foreground/80">
                                        {analysis.recommendation}
                                    </p>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="p-4 bg-muted/20 rounded-xl border border-dashed text-[10px] text-muted-foreground">
                                <p>
                                    Confidence Level: 85% | Based on historical municipal data, local environmental patterns,
                                    and reported sensor anomalies. Human verification is required before critical intervention.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-sm text-muted-foreground">No analysis data available.</p>
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t bg-muted/10 flex justify-end">
                    <Button onClick={onClose} className="rounded-xl px-8">
                        Dismiss
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

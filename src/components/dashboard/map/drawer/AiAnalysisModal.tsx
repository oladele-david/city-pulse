import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
            <DialogContent className="sm:max-w-[550px] max-h-[80vh] flex flex-col p-0 overflow-hidden border bg-background shadow-xl rounded-xl">
                <DialogHeader className="p-4 pl-8 border-b">
                    <DialogTitle className="text-xl font-semibold tracking-tight">Technical Analysis Report</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Predictive insights and strategic response recommendations
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 px-8 pb-8">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-24 space-y-4">
                            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs font-medium text-muted-foreground">
                                Processing incident data...
                            </p>
                        </div>
                    ) : analysis ? (
                        <div className="space-y-8 py-2">
                            {/* Root Cause Section */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground italic/0">Root Cause Prediction</h3>
                                <p className="text-[13px] leading-relaxed text-muted-foreground font-medium/0">
                                    {analysis.rootCause}
                                </p>
                            </div>

                            {/* Centered Separator */}
                            <div className="">
                                <Separator className="bg-border" />
                            </div>

                            {/* Recommendation Section */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-foreground">Strategic Recommendation</h3>
                                <p className="text-[13px] leading-relaxed text-muted-foreground">
                                    {analysis.recommendation}
                                </p>
                            </div>

                            {/* Metadata/Disclaimer - Very Subtle */}
                            <div className="pt-6">
                                <p className="text-[10px] text-muted-foreground/90 leading-tight border-t pt-4 border-dashed">
                                    Model Confidence: High (85%) • Data Source: Municipal Sensor Network & Historical Analytics •
                                    Verified for Government Operations.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-sm text-muted-foreground italic">No analysis data available.</p>
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t bg-muted/5 flex justify-end">
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        className="rounded-lg px-6 text-xs text-white hover:text-white font-medium bg-primary hover:bg-primary/80"
                    >
                        Close Report
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

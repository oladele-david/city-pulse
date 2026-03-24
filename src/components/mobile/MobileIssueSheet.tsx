import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    CheckmarkCircle02Icon,
    Cancel01Icon,
    MapsLocation01Icon,
    AiBrain01Icon,
    AlertCircleIcon
} from "@hugeicons/core-free-icons";
import { Issue } from "@/data/mockIssues";
import { cn } from "@/lib/utils";

interface MobileIssueSheetProps {
    issue: Issue | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string) => void;
    onDisagree: (id: string) => void;
}

export const MobileIssueSheet = ({
    issue,
    isOpen,
    onClose,
    onConfirm,
    onDisagree
}: MobileIssueSheetProps) => {
    if (!issue) return null;

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="max-w-md mx-auto rounded-t-2xl border-t">
                <DrawerHeader className="text-left border-b pb-4 pt-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            issue.severity === 'high' ? "bg-red-50 text-red-700 border-red-200" :
                                issue.severity === 'medium' ? "bg-orange-50 text-orange-700 border-orange-200" :
                                    "bg-yellow-50 text-yellow-700 border-yellow-200"
                        )}>
                            {issue.severity} Severity
                        </span>
                        <span className="text-[10px] text-muted-foreground border px-2 py-0.5 rounded-full font-bold">
                            {Math.round(issue.confidence * 100)}% Confidence
                        </span>
                    </div>
                    <DrawerTitle className="text-xl font-bold">{issue.title}</DrawerTitle>
                    <DrawerDescription className="text-sm mt-1">
                        {issue.description}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="p-6 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Status</p>
                            <p className="text-sm font-bold capitalize">{issue.status.replace('_', ' ')}</p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-2xl border border-border/50">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mb-1">Confirmations</p>
                            <p className="text-sm font-bold">{issue.reports_count} Citizens</p>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="flex items-center gap-3 text-muted-foreground bg-muted/20 p-3 rounded-2xl border border-dashed">
                        <HugeiconsIcon icon={MapsLocation01Icon} className="w-5 h-5 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground">{issue.location_name}</span>
                            <span className="text-[10px]">{issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}</span>
                        </div>
                    </div>

                    {/* Action Prompt - Metadata/Disclaimer Style */}
                    <div className="pt-2">
                        <div className="border-t border-dashed pt-4 flex gap-3">
                            <HugeiconsIcon icon={AiBrain01Icon} className="w-4 h-4 text-muted-foreground/90 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-muted-foreground/90 leading-relaxed font-medium">
                                <span className="text-foreground font-bold mr-1">Verify this incident:</span>
                                Your confirmation helps authorities prioritize and resolve this issue faster.
                                Points are awarded for accuracy and consistent participation in the CityPulse network.
                            </p>
                        </div>
                    </div>
                </div>

                <DrawerFooter className="flex-row gap-3 pt-2 pb-8 px-6 border-t">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 rounded-2xl gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDisagree(issue.id)}
                    >
                        <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                        <span className="font-bold">Disagree</span>
                    </Button>
                    <Button
                        className="flex-1 h-12 rounded-2xl gap-2 bg-primary text-white"
                        onClick={() => onConfirm(issue.id)}
                    >
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
                        <span className="font-bold">Confirm</span>
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

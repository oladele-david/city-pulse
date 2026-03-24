import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    MapsLocation01Icon,
    Calendar01Icon,
    Tag01Icon,
    CheckmarkBadge01Icon,
    Medal02Icon
} from "@hugeicons/core-free-icons";
import { ActivityContribution } from "@/data/activityData";

interface MobileActivityDetailsSheetProps {
    contribution: ActivityContribution | null;
    isOpen: boolean;
    onClose: () => void;
}

export const MobileActivityDetailsSheet = ({ contribution, isOpen, onClose }: MobileActivityDetailsSheetProps) => {
    if (!contribution) return null;

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="max-w-md mx-auto rounded-t-2xl">
                <DrawerHeader className="text-left pb-4 pt-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                            contribution.status === 'resolved' ? "bg-green-50 text-green-600 border-green-200" :
                                contribution.status === 'verified' ? "bg-blue-50 text-blue-600 border-blue-200" :
                                    "bg-amber-50 text-amber-600 border-amber-200"
                        )}>
                            {contribution.status}
                        </div>
                        {contribution.points > 0 && (
                            <div className="flex items-center gap-1.5 text-primary">
                                <span className="text-sm font-bold">+{contribution.points}</span>
                                <HugeiconsIcon icon={Medal02Icon} className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                    <DrawerTitle className="text-xl font-bold leading-tight tracking-tight">
                        {contribution.title}
                    </DrawerTitle>
                    <DrawerDescription className="text-sm mt-2 leading-relaxed">
                        {contribution.description}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="p-6 pt-0 space-y-5">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-2xl border border-border/50">
                            <HugeiconsIcon icon={MapsLocation01Icon} className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Location</p>
                                <p className="text-sm font-bold text-foreground">{contribution.location}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-2xl border border-border/50">
                            <HugeiconsIcon icon={Calendar01Icon} className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Reported On</p>
                                <p className="text-sm font-bold text-foreground">{contribution.fullDate}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-2xl border border-border/50">
                            <HugeiconsIcon icon={Tag01Icon} className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Category</p>
                                <p className="text-sm font-bold text-foreground">{contribution.category}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 pb-8">
                        <button
                            onClick={onClose}
                            className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
                        >
                            CLOSE DETAILS
                        </button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};

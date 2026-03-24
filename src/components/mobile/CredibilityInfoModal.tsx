import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    CheckmarkBadge01Icon,
    Shield01Icon,
    EnergyIcon,
    UserGroupIcon
} from "@hugeicons/core-free-icons";
import { Separator } from "@/components/ui/separator";

interface CredibilityInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CredibilityInfoModal = ({ isOpen, onClose }: CredibilityInfoModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[90vw] rounded-3xl border border-border/40 p-0 overflow-hidden bg-background shadow-2xl">
                <DialogHeader className="p-6 pb-4 text-left border-b border-border/40">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-5 h-5 text-primary" />
                        </div>
                        <DialogTitle className="text-lg font-bold tracking-tight">Credibility System</DialogTitle>
                    </div>
                    <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground font-medium">
                        CityPulse uses a trust-based algorithm to verify civic reports. Your credibility level determines the weight of your reports.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 border border-border/40">
                                <HugeiconsIcon icon={Shield01Icon} className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[13px] mb-0.5 text-foreground">Fast-Track Verification</h4>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">
                                    High credibility means your reports are verified faster by city services.
                                </p>
                            </div>
                        </div>

                        <Separator className="bg-border/40" />

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 border border-border/40">
                                <HugeiconsIcon icon={EnergyIcon} className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[13px] mb-0.5 text-foreground">Contribution Rewards</h4>
                                <p className="text-[12px] text-muted-foreground leading-relaxed">
                                    Submit accurate reports and confirm existing issues to build your ranking.
                                </p>
                            </div>
                        </div>

                        <Separator className="bg-border/40" />

                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 border border-border/40">
                                <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div>
                                <h4 className="font-bold text-[13px] mb-0.5 text-foreground">Verification Tiers</h4>
                                <p className="text-[12px] text-muted-foreground leading-relaxed italic">
                                    New → Reliable → Trusted → Expert
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full h-12 bg-primary text-white rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                    >
                        Understood
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

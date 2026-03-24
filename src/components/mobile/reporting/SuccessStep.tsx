import { useNavigate } from 'react-router-dom';
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkBadge01Icon, ArrowRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons";

interface SuccessStepProps {
    onReset: () => void;
}

export const SuccessStep = ({ onReset }: SuccessStepProps) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center px-8 text-center animate-in fade-in zoom-in-95 duration-700 pt-20 pb-12">
            <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-accent/10 rounded-full animate-ping duration-[3000ms]" />
                <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-12 h-12 text-accent relative z-10" />
            </div>

            <div className="space-y-2 mb-12">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Report Submitted!</h2>
                <p className="text-muted-foreground font-medium leading-relaxed px-4">
                    Thank you, Ahmed. Your contribution helps keep Dubai running smoothly.
                </p>
            </div>

            <div className="w-full space-y-4">
                <div className="p-5 bg-muted/20 rounded-[2rem] border border-border/50 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">+3</span>
                        </div>
                        <div className="text-left">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Score Preview</p>
                            <p className="text-sm font-semibold text-foreground">Community Points</p>
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-accent bg-accent/5 px-2 py-1 rounded-full uppercase tracking-widest border border-accent/20">
                        Pending
                    </span>
                </div>

                <div className="pt-4 space-y-3">
                    <button
                        onClick={() => navigate('/mobile/activity')}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 group"
                    >
                        <span>VIEW ACTIVITY</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={onReset}
                        className="w-full h-14 bg-background text-foreground border-2 border-border/60 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-muted/10"
                    >
                        <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4" />
                        <span>REPORT ANOTHER</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

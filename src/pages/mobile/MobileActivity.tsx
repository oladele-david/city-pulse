import { useState } from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import {
    CheckmarkBadge01Icon,
    InformationCircleIcon,
    Medal02Icon,
    Calendar01Icon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { activityContributions, ActivityContribution } from '@/data/activityData';
import { MobileActivityDetailsSheet } from '@/components/mobile/MobileActivityDetailsSheet';
import { CredibilityInfoModal } from '@/components/mobile/CredibilityInfoModal';

const MobileActivity = () => {
    const [selectedContribution, setSelectedContribution] = useState<ActivityContribution | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const handleItemClick = (item: ActivityContribution) => {
        setSelectedContribution(item);
        setIsDetailsOpen(true);
    };

    return (
        <div className="flex flex-col bg-background pb-32">
            {/* Fintech Style Header Card */}
            <div className="px-6 py-6 transition-all duration-300">
                <div className="bg-primary rounded-3xl p-4 text-white relative overflow-hidden border border-primary/10 shadow-lg">
                    {/* Information Button */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsInfoOpen(true);
                        }}
                        className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-all active:scale-90 z-50 border border-white/5"
                    >
                        <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 text-white" />
                    </button>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10">
                            <span className="text-[10px] font-bold uppercase tracking-wider">Expert Citizen</span>
                            <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-3.5 h-3.5" />
                        </div>

                        <div className="space-y-1 mb-5">
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Total Points</span>
                            <div className="flex items-baseline gap-2">
                                <h1 className="text-3xl font-semibold tracking-tighter">1,240</h1>
                                <HugeiconsIcon icon={Medal02Icon} className="w-6 h-6 text-white/30" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/10 p-2 rounded-2xl border border-white/5">
                                <span className="block text-[9px] text-white/60 font-bold uppercase">Accuracy</span>
                                <span className="text-lg font-semibold">94.2%</span>
                            </div>
                            <div className="bg-white/10 p-2 rounded-2xl border border-white/5">
                                <span className="block text-[9px] text-white/60 font-bold uppercase">Rank</span>
                                <span className="text-lg font-semibold">#12 <span className="text-xs font-medium text-white/50">Local</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Blob */}
                    <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-3xl shrink-0" />
                </div>
            </div>

            {/* Timeline List */}
            <div className="px-6">
                <div className="flex items-center justify-between mb-6 px-1">
                    <h2 className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em] italic">Contribution History</h2>
                    <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4 text-muted-foreground/70" />
                </div>

                <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[3px] top-4 bottom-4 w-px bg-border/40" />

                    <div className="space-y-10">
                        {activityContributions.map((item, idx) => (
                            <div
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className="relative pl-8 group active:scale-[0.98] transition-all"
                            >
                                {/* Dot */}
                                <div className={cn(
                                    "absolute left-0 top-[6px] w-[7px] h-[7px] rounded-full ring-4 ring-background transition-all group-hover:scale-125 z-10",
                                    item.status === 'resolved' ? "bg-green-500" :
                                        item.status === 'verified' ? "bg-primary" : "bg-muted-foreground/40"
                                )} />

                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest">{item.timestamp}</span>
                                            <div className="w-1 h-1 bg-border rounded-full shrink-0" />
                                            <span className={cn(
                                                "text-[10px] font-semibold uppercase",
                                                item.status === 'resolved' ? "text-green-600" :
                                                    item.status === 'verified' ? "text-primary/70" : "text-muted-foreground"
                                            )}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-semibold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-[11px] text-muted-foreground/80 font-medium truncate">
                                            {item.location}
                                        </p>
                                    </div>

                                    {item.points > 0 && (
                                        <div className="bg-muted/30 px-3 py-2 rounded-2xl border border-border/40 flex items-center gap-1.5 shrink-0 group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                            <span className="text-xs font-semibold text-foreground group-hover:text-primary">+{item.points}</span>
                                            <HugeiconsIcon icon={Medal02Icon} className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-primary" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sheets & Modals */}
            <MobileActivityDetailsSheet
                contribution={selectedContribution}
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
            />

            <CredibilityInfoModal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
            />
        </div>
    );
};

export default MobileActivity;

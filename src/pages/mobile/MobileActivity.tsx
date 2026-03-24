import { useMemo } from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import {
    TickDouble02Icon,
    CheckmarkBadge01Icon,
    Alert01Icon,
    ArrowRight01Icon,
    Medal02Icon,
    Clock01Icon,
    CheckmarkCircle02Icon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface ActivityItem {
    id: string;
    type: 'report' | 'confirmation' | 'resolution';
    title: string;
    timestamp: string;
    points: number;
    status: 'pending' | 'verified' | 'resolved';
}

const MobileActivity = () => {
    // Activity mock data
    const activities: ActivityItem[] = [
        {
            id: '1',
            type: 'resolution',
            title: "Road issue you confirmed has been resolved.",
            timestamp: "2h ago",
            points: 5,
            status: 'resolved'
        },
        {
            id: '2',
            type: 'report',
            title: "Pothole in Downtown Dubai",
            timestamp: "1d ago",
            points: 3,
            status: 'verified'
        },
        {
            id: '3',
            type: 'confirmation',
            title: "Confirmed: Streetlight Outage in Marina",
            timestamp: "3d ago",
            points: 1,
            status: 'verified'
        },
        {
            id: '4',
            type: 'report',
            title: "Burst water pipe reported",
            timestamp: "5d ago",
            points: 0,
            status: 'pending'
        }
    ];

    const credibilityTier = "Reliable"; // New, Reliable, Trusted

    return (
        <div className="flex flex-col h-full bg-background mt-4">
            {/* Header / Trust Score */}
            <div className="px-6 py-6">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 relative overflow-hidden">
                    <div className="relative z-10 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Credibility Level</span>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black text-foreground italic/0 tracking-tight">{credibilityTier}</h1>
                            <HugeiconsIcon icon={CheckmarkBadge01Icon} className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium mt-1 leading-relaxed max-w-[80%]">
                            Your status is based on report accuracy and community verification consistency.
                        </p>
                    </div>
                    {/* Abstract background element */}
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                </div>
            </div>

            {/* Stats Bar */}
            <div className="px-6 flex gap-3">
                <div className="flex-1 bg-muted/20 border border-border/40 rounded-3xl p-4 flex flex-col items-center">
                    <span className="text-xl font-bold text-foreground">1,240</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Total Points</span>
                </div>
                <div className="flex-1 bg-muted/20 border border-border/40 rounded-3xl p-4 flex flex-col items-center">
                    <span className="text-xl font-bold text-foreground">94%</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Accuracy</span>
                </div>
            </div>

            {/* Contribution List */}
            <div className="mt-8 px-6 pb-24 flex-1">
                <div className="flex items-center justify-between mb-4 px-1">
                    <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em]">My Contributions</h2>
                    <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 text-muted-foreground/40" />
                </div>

                <div className="space-y-3">
                    {activities.map((item) => (
                        <div
                            key={item.id}
                            className="p-4 bg-background border border-border/40 rounded-3xl flex items-center gap-4 active:scale-[0.98] transition-all hover:bg-muted/5 group"
                        >
                            <div className={cn(
                                "w-11 h-11 rounded-2xl flex items-center justify-center transition-colors",
                                item.type === 'resolution' ? "bg-green-50 text-green-600" :
                                    item.type === 'report' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                            )}>
                                <HugeiconsIcon
                                    icon={item.type === 'resolution' ? CheckmarkCircle02Icon : item.type === 'report' ? Alert01Icon : TickDouble02Icon}
                                    className="w-5 h-5"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-foreground leading-tight truncate pr-2">
                                    {item.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">{item.timestamp}</span>
                                    <div className="w-1 h-1 bg-border rounded-full" />
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase",
                                        item.status === 'resolved' ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            {item.points > 0 && (
                                <div className="bg-primary/5 px-2.5 py-1.5 rounded-xl border border-primary/10 flex items-center gap-1.5">
                                    <span className="text-[11px] font-black text-primary">+{item.points}</span>
                                    <HugeiconsIcon icon={Medal02Icon} className="w-3 h-3 text-primary" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MobileActivity;

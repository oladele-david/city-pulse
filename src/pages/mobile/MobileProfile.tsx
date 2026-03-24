import { useState } from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserCircleIcon,
    Settings02Icon,
    Task01Icon,
    CheckmarkCircle02Icon,
    Medal02Icon,
    Logout01Icon,
    Shield01Icon,
    InformationCircleIcon
} from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";
import { MobileProfileSheet } from '@/components/mobile/MobileProfileSheet';

const MobileProfile = () => {
    const navigate = useNavigate();
    const [activeSheet, setActiveSheet] = useState<string | null>(null);

    const stats = [
        { label: "Points", value: "1,240", icon: Medal02Icon },
        { label: "Reports", value: "24", icon: Task01Icon },
        { label: "Verified", value: "18", icon: CheckmarkCircle02Icon },
    ];

    const menuItems = [
        { label: "Personal Information", icon: UserCircleIcon },
        { label: "Security & Privacy", icon: Shield01Icon },
        { label: "Settings", icon: Settings02Icon },
        { label: "Help & Support", icon: InformationCircleIcon },
    ];

    return (
        <div className="flex flex-col h-full bg-background mt-4">
            {/* Minimal Header */}
            <div className="px-6 py-8 flex items-center gap-5">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-background border-4 border-muted/50 shadow-sm overflow-hidden ring-1 ring-border/30">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"
                            alt="Ahmed"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute bottom-0 right-1 w-5 h-5 bg-green-500 border-2 border-background rounded-full" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-foreground">Ahmed Al-Maktoum</h1>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5 leading-none">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3.5 h-3.5 text-primary" />
                        Verified Citizen
                    </p>
                </div>
            </div>

            {/* Stats - Mature Styling */}
            <div className="px-6">
                <div className="grid grid-cols-3 gap-3">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center p-4 rounded-3xl bg-muted/20 border border-border/50 transition-all hover:bg-muted/30">
                            <div className="w-9 h-9 flex items-center justify-center mb-3">
                                <HugeiconsIcon icon={stat.icon} className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-base font-bold text-foreground">{stat.value}</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Divider */}
            <div className="mt-8 px-6">
                <div className="h-px bg-border/40 w-full" />
            </div>

            {/* Menu List */}
            <div className="mt-8 px-6 space-y-2.5 pb-24">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em] mb-4 ml-1">Account & Governance</p>
                {menuItems.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveSheet(item.label)}
                        className="w-full flex items-center gap-4 p-4.5 bg-background border border-border/40 rounded-2xl active:scale-[0.98] transition-all hover:bg-muted/5 group shadow-sm/0"
                    >
                        <div className="w-11 h-11 flex items-center justify-center text-muted-foreground transition-colors border border-transparent group-hover:border-primary/20">
                            <HugeiconsIcon icon={item.icon} className="w-5 h-5" />
                        </div>
                        <span className="flex-1 text-[14px] font-bold text-left text-foreground">{item.label}</span>
                    </button>
                ))}

                <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center gap-4 p-4.5 mt-4 bg-red-50 border border-red-100 rounded-2xl active:scale-[0.98] transition-all group hover:bg-red-100"
                >
                    <div className="w-11 h-11 flex items-center justify-center text-red-600 transition-colors border border-transparent">
                        <HugeiconsIcon icon={Logout01Icon} className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-[14px] font-bold text-left text-red-600">Sign Out</span>
                </button>
            </div>

            {/* Bottom Sheets */}
            <MobileProfileSheet
                type={activeSheet}
                isOpen={!!activeSheet}
                onClose={() => setActiveSheet(null)}
            />
        </div>
    );
};

export default MobileProfile;

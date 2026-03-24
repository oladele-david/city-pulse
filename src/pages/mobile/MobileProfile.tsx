import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserCircleIcon,
    Settings02Icon,
    Task01Icon,
    CheckmarkCircle02Icon,
    Medal02Icon,
    ArrowRight01Icon,
    Logout01Icon,
    Shield01Icon,
    InformationCircleIcon
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MobileProfile = () => {
    const navigate = useNavigate();

    const stats = [
        { label: "Points", value: "1,240", icon: Medal02Icon, color: "text-amber-500", bg: "bg-amber-50" },
        { label: "Reports", value: "24", icon: Task01Icon, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Verified", value: "18", icon: CheckmarkCircle02Icon, color: "text-green-500", bg: "bg-green-50" },
    ];

    const menuItems = [
        { label: "Personal Information", icon: UserCircleIcon, path: "/mobile/profile/info" },
        { label: "My Reports", icon: Task01Icon, path: "/mobile/activity" },
        { label: "Security & Privacy", icon: Shield01Icon, path: "/mobile/profile/security" },
        { label: "Settings", icon: Settings02Icon, path: "/mobile/profile/settings" },
        { label: "Help & Support", icon: InformationCircleIcon, path: "/mobile/profile/help" },
    ];

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header / Cover */}
            <div className="relative h-48 bg-primary/10 shrink-0">
                <div className="absolute -bottom-12 left-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-background border-4 border-background shadow-xl overflow-hidden">
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed"
                                alt="Ahmed"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute bottom-1 right-2 w-5 h-5 bg-green-500 border-4 border-background rounded-full" />
                    </div>
                </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 px-6">
                <h1 className="text-2xl font-bold text-foreground">Ahmed Al-Maktoum</h1>
                <p className="text-sm text-muted-foreground font-medium">Verified Citizen • Dubai, UAE</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mt-8">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center p-3 rounded-2xl bg-muted/30 border border-border/50">
                            <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
                                <HugeiconsIcon icon={stat.icon} className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-foreground">{stat.value}</span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Menu List */}
            <div className="mt-8 px-6 space-y-2 pb-24">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 px-1">Account & Preference</p>
                {menuItems.map((item, idx) => (
                    <button
                        key={idx}
                        className="w-full flex items-center gap-4 p-4 bg-background border border-border/40 rounded-2xl active:scale-[0.98] transition-all hover:bg-muted/5 group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <HugeiconsIcon icon={item.icon} className="w-5 h-5" />
                        </div>
                        <span className="flex-1 text-sm font-bold text-left text-foreground">{item.label}</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 text-muted-foreground/30" />
                    </button>
                ))}

                <button
                    onClick={() => navigate('/login')}
                    className="w-full flex items-center gap-4 p-4 mt-4 bg-red-50/50 border border-red-100 rounded-2xl active:scale-[0.98] transition-all group hover:bg-red-50"
                >
                    <div className="w-10 h-10 rounded-xl bg-red-100/50 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                        <HugeiconsIcon icon={Logout01Icon} className="w-5 h-5" />
                    </div>
                    <span className="flex-1 text-sm font-bold text-left text-red-600">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default MobileProfile;

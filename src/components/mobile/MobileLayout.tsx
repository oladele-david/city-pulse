import { Outlet, Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Home01Icon,
    MapsLocation01Icon,
    Task01Icon,
    UserCircleIcon,
    Add01Icon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const MobileLayout = () => {
    const location = useLocation();

    const navItems = [
        { path: "/mobile", icon: Home01Icon, label: "Home" },
        { path: "/mobile/map", icon: MapsLocation01Icon, label: "Map" },
        { path: "/mobile/report", icon: null, label: "Report", isFab: true },
        { path: "/mobile/activity", icon: Task01Icon, label: "Activity" },
        { path: "/mobile/profile", icon: UserCircleIcon, label: "Profile" },
    ];

    return (
        <div className="flex flex-col h-screen bg-background overflow-hidden relative max-w-md mx-auto border-x shadow-2xl">
            {/* Mobile Viewport Container */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <Outlet />
            </main>

            {/* Navigation */}
            <div className="h-20 border-t bg-background/80 backdrop-blur-md flex items-center justify-around px-2 shrink-0 pb-safe relative">
                {navItems.map((item, idx) => {
                    if (item.isFab) {
                        return (
                            <Link
                                key={idx}
                                to={item.path}
                                className="w-14 h-14 bg-primary rounded-full flex items-center justify-center -mt-10 shadow-lg shadow-primary/30 active:scale-95 transition-transform z-10"
                            >
                                <HugeiconsIcon icon={Add01Icon} className="w-7 h-7 text-white" />
                            </Link>
                        );
                    }

                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={idx}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center gap-1 min-w-[64px] transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <HugeiconsIcon
                                icon={item.icon}
                                className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileLayout;

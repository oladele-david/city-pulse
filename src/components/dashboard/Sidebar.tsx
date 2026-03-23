import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    DashboardSquare01Icon,
    MapsLocation01Icon,
    Alert02Icon,
    Analytics01Icon,
    Settings01Icon,
    SidebarLeft01Icon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: DashboardSquare01Icon,
    },
    {
        name: "Live Map",
        href: "/dashboard/map",
        icon: MapsLocation01Icon,
    },
    {
        name: "Issues",
        href: "/dashboard/issues",
        icon: Alert02Icon,
    },
    {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: Analytics01Icon,
    },
    {
        name: "Settings",
        href: "/dashboard/settings",
        icon: Settings01Icon,
    },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const location = useLocation();

    return (
        <aside
            className={cn(
                "fixed z-40 bg-primary rounded-2xl flex flex-col shrink-0 shadow-xl text-primary-foreground transition-all duration-300 ease-in-out overflow-hidden border-none",
                isOpen ? "w-[280px] m-4 translate-x-0 opacity-100 h-[calc(100vh-2rem)]" : "w-0 m-0 -translate-x-full opacity-0 pointer-events-none"
            )}
        >
            <div className="w-[280px] flex flex-col h-full">
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-primary-foreground/10 shrink-0">
                    <div className="h-10 w-24">
                        <img
                            src="/assets/logo-inverse.svg"
                            alt="CityPulse"
                            className="w-full h-full object-contain object-left"
                        />
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white transition-colors p-1 hover:bg-primary-foreground/10 rounded-md"
                    >
                        <HugeiconsIcon icon={SidebarLeft01Icon} className="w-6 h-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-white text-primary shadow-sm"
                                        : "text-white hover:bg-primary-foreground/10 hover:text-primary-foreground"
                                )}
                            >
                                <HugeiconsIcon icon={item.icon} className="w-5 h-5" />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer - User Profile */}
                <div className="p-4 border-t border-primary-foreground/10 shrink-0">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors cursor-pointer">
                        <Avatar className="h-10 w-10 bg-white border-2 border-primary-foreground/20">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                            <AvatarFallback className="bg-accent text-primary font-medium">AD</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white">Admin User</p>
                            <p className="text-xs text-primary-foreground/60 truncate">Operator</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

import { Link, useLocation } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    DashboardSquare01Icon,
    MapsLocation01Icon,
    Alert02Icon,
    Analytics01Icon,
    Coins01Icon,
    Settings01Icon,
    SidebarLeft01Icon
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    {
        name: "Dashboard",
        href: "/console/dashboard",
        icon: DashboardSquare01Icon,
    },
    {
        name: "Live Map",
        href: "/console/dashboard/map",
        icon: MapsLocation01Icon,
    },
    {
        name: "Issues",
        href: "/console/dashboard/issues",
        icon: Alert02Icon,
    },
    {
        name: "Analytics",
        href: "/console/dashboard/analytics",
        icon: Analytics01Icon,
    },
    {
        name: "Levies",
        href: "/console/dashboard/levies",
        icon: Coins01Icon,
    },
    {
        name: "Settings",
        href: "/console/dashboard/settings",
        icon: Settings01Icon,
    },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const location = useLocation();
    const { session, logout } = useAuth();
    const initials = session?.user.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ?? "CP";

    return (
        <aside
            className={cn(
                "fixed z-40 bg-primary rounded-2xl flex flex-col shrink-0 shadow-xl text-primary-foreground transition-all duration-300 ease-in-out overflow-hidden border-none",
                isOpen ? "w-[250px] m-2 translate-x-0 opacity-100 h-[calc(100vh-1rem)]" : "w-0 m-0 -translate-x-full opacity-0 pointer-events-none"
            )}
        >
            <div className="w-[250px] flex flex-col h-full">
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
                    <div className="flex items-center gap-3 p-2 rounded-lg transition-colors">
                        <Avatar className="h-10 w-10 bg-white border-2 border-primary-foreground/20">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                            <AvatarFallback className="bg-accent text-primary font-medium">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white">{session?.user.fullName ?? "CityPulse Admin"}</p>
                            <p className="text-xs text-primary-foreground/60 truncate">{session?.user.email ?? "admin@citypulse.ng"}</p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={logout}
                        className="mt-3 w-full justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    >
                        Sign out
                    </Button>
                </div>
            </div>
        </aside>
    );
};

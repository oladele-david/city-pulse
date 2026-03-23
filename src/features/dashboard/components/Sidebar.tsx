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

    if (!isOpen) return null;

    return (
        <aside className="w-[280px] h-[calc(100vh-2rem)] bg-background border m-4 rounded-2xl flex flex-col shrink-0 animate-in slide-in-from-left duration-300 shadow-sm fixed lg:static z-40">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-6 border-b">
                <div className="h-10 w-24">
                    <img
                        src="/assets/logo.svg"
                        alt="CityPulse"
                        className="w-full h-full object-contain object-left"
                    />
                </div>
                <button
                    onClick={onClose}
                    className="text-muted-foreground hover:text-primary transition-colors p-1 hover:bg-muted rounded-md"
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
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <HugeiconsIcon icon={item.icon} className="w-5 h-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer - User Profile */}
            <div className="p-4 border-t">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">AD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">Admin User</p>
                        <p className="text-xs text-muted-foreground truncate">Operator</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

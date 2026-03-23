import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { pathname } = useLocation();
    const isMapPage = pathname === "/dashboard/map";
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMapPage);

    // Auto-collapse sidebar when entering map page
    useEffect(() => {
        if (isMapPage) {
            setIsSidebarOpen(false);
        } else {
            setIsSidebarOpen(true);
        }
    }, [pathname, isMapPage]);

    return (
        <div className="flex min-h-screen bg-slate-50 w-full overflow-hidden font-sans text-foreground">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Always fixed */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className={cn(
                "flex-1 transition-all duration-300 ease-in-out",
                isMapPage
                    ? "p-0 overflow-hidden h-screen"
                    : "p-8 overflow-y-auto min-h-screen",
                // Add left margin when sidebar is open on non-map pages
                !isMapPage && isSidebarOpen ? "ml-[296px]" : "ml-0"
            )}>
                {!isSidebarOpen && (
                    <div className="absolute top-6 left-6 z-30">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className={cn(
                                "p-2 bg-white rounded-lg transition-colors shadow-sm",
                                isMapPage ? "bg-white/90 text-primary hover:bg-white" : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <HugeiconsIcon icon={SidebarLeftIcon} className="w-6 h-6" />
                        </button>
                    </div>
                )}

                {/* Content wrapper with centering */}
                <div className={cn(
                    "w-full h-full",
                    isMapPage ? "" : "max-w-6xl mx-auto"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
};

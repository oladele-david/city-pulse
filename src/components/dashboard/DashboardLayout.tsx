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

            {/* Sidebar Container - Adjust z-index and position for floating effect if needed, though Sidebar component handles its own fixed positioning on mobile. 
                For Map page, we want it to float OVER the map if it opens.
                The existing Sidebar is relative in flow (lg:static).
                We might need to wrap it or adjust classes based on isMapPage.
            */}
            <div className={cn(
                "transition-all duration-300 ease-in-out z-40",
                isMapPage ? "fixed left-0 top-0 h-full" : "relative"
            )}>
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </div>


            <main className={cn(
                "flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300",
                isMapPage && "w-full h-screen" // detailed styling for map mode
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

                <div className={cn(
                    "flex-1 w-full h-full overflow-hidden",
                    isMapPage ? "bg-slate-100" : "bg-transparent"
                )}>
                    <div className={cn(
                        "h-full w-full overflow-y-auto",
                        !isMapPage && "p-6 md:p-8"
                    )}>
                        <div className={cn(
                            "w-full h-full",
                            !isMapPage && "max-w-7xl mx-auto"
                        )}>
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

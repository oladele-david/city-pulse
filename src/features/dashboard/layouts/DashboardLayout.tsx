import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col h-full relative overflow-hidden transition-all duration-300">
                {!isSidebarOpen && (
                    <div className="absolute top-6 left-6 z-50">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className="bg-background shadow-md hover:bg-muted"
                        >
                            <HugeiconsIcon icon={SidebarLeftIcon} className="w-5 h-5" />
                        </Button>
                    </div>
                )}

                <div className="flex-1 w-full h-full overflow-hidden bg-background">
                    <div className="h-full w-full overflow-y-auto p-6 md:p-8">
                        <div className="max-w-7xl mx-auto w-full">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

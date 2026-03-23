import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/dashboard/Dashboard";
import LiveMap from "./pages/dashboard/LiveMap";
import Issues from "./pages/dashboard/Issues";
import Analytics from "./pages/dashboard/Analytics";
import Settings from "./pages/dashboard/Settings";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/LoginPage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { MobileBlocker } from "./components/MobileBlocker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Mobile Blocker - Hidden on desktop (lg and above) */}
      <div className="lg:hidden">
        <MobileBlocker />
      </div>
      {/* Main App - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:block">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/dashboard/map" element={<DashboardLayout><LiveMap /></DashboardLayout>} />
            <Route path="/dashboard/issues" element={<DashboardLayout><Issues /></DashboardLayout>} />
            <Route path="/dashboard/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
            <Route path="/dashboard/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
            <Route path="/dashboard/*" element={
              <DashboardLayout>
                <Routes>
                  <Route index element={<Index />} />
                  {/* Add sub-routes here later */}
                </Routes>
              </DashboardLayout>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

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
import MobileLayout from "./components/mobile/MobileLayout";
import MobileHome from "./pages/mobile/MobileHome";
import MobileMap from "./pages/mobile/MobileMap";
import MobileProfile from "./pages/mobile/MobileProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" expand={true} richColors closeButton theme="light" toastOptions={{ style: { zIndex: 99999 } }} />
      <BrowserRouter>
        <Routes>
          {/* Mobile Citizen App Routes */}
          <Route path="/mobile" element={<MobileLayout />}>
            <Route index element={<MobileHome />} />
            <Route path="map" element={<MobileMap />} />
            <Route path="activity" element={<div className="p-10 font-bold">Activity View Coming Soon</div>} />
            <Route path="profile" element={<MobileProfile />} />
            <Route path="report" element={<div className="p-10 font-bold">Reporting Flow Coming Soon</div>} />
          </Route>

          {/* Core App Routes */}
          <Route path="/*" element={
            <>
              {/* Desktop View */}
              <div className="hidden lg:block">
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
                      </Routes>
                    </DashboardLayout>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>

              {/* Mobile Block View for Admin/Dashboard (Except /mobile) */}
              <div className="lg:hidden">
                <MobileBlocker />
              </div>
            </>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

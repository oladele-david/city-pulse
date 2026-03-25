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
import MobileLayout from "./components/mobile/layout/MobileLayout";
import MobileHome from "./pages/mobile/MobileHome";
import MobileMap from "./pages/mobile/MobileMap";
import MobileProfile from "./pages/mobile/MobileProfile";
import MobileActivity from "./pages/mobile/MobileActivity";
import MobileReport from "./pages/mobile/MobileReport";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute, PublicOnlyRoute } from "./components/auth/RouteGuards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" expand={true} richColors closeButton theme="light" toastOptions={{ style: { zIndex: 99999 } }} />
        <BrowserRouter>
          <Routes>
            {/* Mobile Citizen App Routes */}
            <Route path="/mobile" element={<MobileLayout />}>
              <Route index element={<MobileHome />} />
              <Route path="map" element={<MobileMap />} />
              <Route path="activity" element={<MobileActivity />} />
              <Route path="profile" element={<MobileProfile />} />
              <Route path="report" element={<MobileReport />} />
            </Route>

            {/* Core App Routes */}
            <Route path="/*" element={
              <>
                {/* Desktop View */}
                <div className="hidden lg:block">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Navigate to="/console/login" replace />} />
                    <Route path="/dashboard" element={<Navigate to="/console/dashboard" replace />} />
                    <Route path="/dashboard/map" element={<Navigate to="/console/dashboard/map" replace />} />
                    <Route path="/dashboard/issues" element={<Navigate to="/console/dashboard/issues" replace />} />
                    <Route path="/dashboard/analytics" element={<Navigate to="/console/dashboard/analytics" replace />} />
                    <Route path="/dashboard/settings" element={<Navigate to="/console/dashboard/settings" replace />} />
                    <Route path="/console/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                    <Route path="/console/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/console/dashboard/map" element={<ProtectedRoute><DashboardLayout><LiveMap /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/console/dashboard/issues" element={<ProtectedRoute><DashboardLayout><Issues /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/console/dashboard/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/console/dashboard/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
                    <Route path="/console/dashboard/*" element={
                      <ProtectedRoute>
                        <DashboardLayout>
                          <Routes>
                            <Route index element={<Dashboard />} />
                          </Routes>
                        </DashboardLayout>
                      </ProtectedRoute>
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

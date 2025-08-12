import { useState, useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Lock, Command } from "lucide-react";
import Index from "./pages/Index";
import SiriAssistant from "./components/SiriAssistant";
import Sidebar from "./components/Sidebar";
import ClientBillingKit from "./pages/ClientBillingKit";
import BusinessOverview from "./pages/BusinessOverview";
import BillingLogic from "./pages/BillingLogic";
import CommCenter from "./pages/CommCenter";
import MarketingAutomation from "./pages/MarketingAutomation";
import Integrations from "./pages/Integrations";
import TwilioVault from "./pages/TwilioVault";
import MemberPortal from "./pages/MemberPortal";
import Fulfillment from "./pages/Fulfillment";
import IntelligentAI from "./pages/IntelligentAI";
import ChargebackTracker from "./pages/ChargebackTracker";
import ClientPortal from "./pages/ClientPortal";
import LeadJourney from "./pages/LeadJourney";
import Overview from "./pages/Overview";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CampaignScheduler from "./pages/CampaignScheduler";
import BillingLayout from "./components/BillingLayout";
import MarketingLayout from "./components/MarketingLayout";
import CommandPalette from "./components/CommandPalette";

const queryClient = new QueryClient();

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const DevOpsCenter = lazy(() => import("./pages/DevOpsCenter"));
const TestModule = lazy(() => import("./pages/TestModule"));

function AuthGate({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('echelonx_auth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'ECHELONX2025') {
      setIsAuthenticated(true);
      sessionStorage.setItem('echelonx_auth', 'authenticated');
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Command className="h-8 w-8 text-blue-400" />
              <Lock className="h-6 w-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">ECHELONX Access</h1>
            <p className="text-gray-300">Secure Command Center Access</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Access Command Center
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthGate>
          <SiriAssistant />
          <BrowserRouter>
            <div className="flex min-h-screen bg-gradient-to-br from-white to-blue-50">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                <Suspense fallback={<div className="p-4 text-sm text-gray-600">Loading…</div>}>
                  <Routes>
                    <Route path="/" element={<Overview />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/merchant" element={<BillingLogic />} />
                    <Route path="/billing-kit" element={<ClientBillingKit />} />
                    <Route path="/business-overview" element={<BusinessOverview />} />

                    <Route path="/billing" element={<BillingLayout />}>
                      <Route index element={<BillingLogic />} />
                      <Route path="gateway" element={<BillingLogic />} />
                      <Route path="logs" element={<BillingLogic />} />
                      <Route path="chargebacks" element={<ChargebackTracker />} />
                    </Route>

                    <Route path="/comm-center" element={<CommCenter />} />

                    <Route path="/marketing-automation" element={<MarketingLayout />}>
                      <Route index element={<MarketingAutomation />} />
                      <Route path="scheduler" element={<CampaignScheduler />} />
                    </Route>

                    <Route path="/members" element={<MemberPortal />} />
                    <Route path="/member-portal" element={<MemberPortal />} />
                    <Route path="/client-portal" element={<ClientPortal />} />
                    <Route path="/lead-journey" element={<LeadJourney />} />
                    <Route path="/fulfillment" element={<Fulfillment />} />
                    <Route path="/ai" element={<IntelligentAI />} />
                    <Route path="/chargeback-tracker" element={<ChargebackTracker />} />
                    <Route path="/devops" element={<DevOpsCenter />} />
                    <Route path="/integrations" element={<Integrations />} />
                    <Route path="/twilio-vault" element={<TwilioVault />} />
                    <Route path="/test" element={<TestModule />} />
                    <Route path="/campaign-scheduler" element={<CampaignScheduler />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/settings/nmi" element={<BillingLogic />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
            </div>
            <CommandPalette />
          </BrowserRouter>
        </AuthGate>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

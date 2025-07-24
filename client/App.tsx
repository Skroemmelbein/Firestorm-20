import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SiriAssistant from "./components/SiriAssistant";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./pages/AdminDashboard";
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
import DevOpsCenter from "./pages/DevOpsCenter";
import ClientPortal from "./pages/ClientPortal";
import LeadJourney from "./pages/LeadJourney";
import Overview from "./pages/Overview";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SiriAssistant />
        <BrowserRouter>
          <div className="flex min-h-screen bg-[#111111]">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/merchant" element={<BillingLogic />} />
                <Route path="/billing-kit" element={<ClientBillingKit />} />
                <Route path="/business-overview" element={<BusinessOverview />} />
                <Route path="/billing" element={<BillingLogic />} />
                <Route path="/comm-center" element={<CommCenter />} />
                <Route
                  path="/marketing-automation"
                  element={<MarketingAutomation />}
                />
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
                <Route path="/settings" element={<Integrations />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

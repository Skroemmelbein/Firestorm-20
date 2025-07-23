import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import ClientBillingKit from "./pages/ClientBillingKit";
import BusinessOverview from "./pages/BusinessOverview";
import BillingLogic from "./pages/BillingLogic";
import CommCenter from "./pages/CommCenter";
import Integrations from "./pages/Integrations";
import TwilioVault from "./pages/TwilioVault";
import MemberPortal from "./pages/MemberPortal";
import Fulfillment from "./pages/Fulfillment";
import IntelligentAI from "./pages/IntelligentAI";
import ChargebackTracker from "./pages/ChargebackTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/merchant" element={<BillingLogic />} />
          <Route path="/billing-kit" element={<ClientBillingKit />} />
          <Route path="/business-overview" element={<BusinessOverview />} />
          <Route path="/billing" element={<BillingLogic />} />
          <Route path="/comm-center" element={<CommCenter />} />
          <Route path="/members" element={<MemberPortal />} />
          <Route path="/fulfillment" element={<Fulfillment />} />
          <Route path="/ai" element={<IntelligentAI />} />
          <Route path="/chargeback-tracker" element={<ChargebackTracker />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/twilio-vault" element={<TwilioVault />} />
          <Route path="/settings" element={<Integrations />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

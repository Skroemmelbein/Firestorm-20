import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Database,
  Zap,
  RefreshCw,
  DollarSign,
  Calendar,
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Settings,
  Send,
  Shield,
  Lock,
  Webhook,
  ArrowRightLeft,
  Clock,
  TrendingUp,
} from "lucide-react";

interface RecurringPlan {
  id: string;
  name: string;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  status: "active" | "paused" | "cancelled";
  subscribers: number;
  nextBilling: Date;
  xanoTable: string;
  nmiVaultId: string;
}

interface BillingEvent {
  id: string;
  planId: string;
  customerId: string;
  amount: number;
  status: "pending" | "processed" | "failed" | "retry";
  timestamp: Date;
  nmiResponse?: any;
  twilioNotification?: boolean;
}

export default function NMIRecurringBilling() {
  const [plans, setPlans] = useState<RecurringPlan[]>([
    {
      id: "plan_001",
      name: "ELITE MEMBERSHIP",
      amount: 297.0,
      frequency: "monthly",
      status: "active",
      subscribers: 1847,
      nextBilling: new Date("2024-01-01"),
      xanoTable: "elite_members",
      nmiVaultId: "vault_elite_001",
    },
    {
      id: "plan_002",
      name: "PREMIUM PACKAGE",
      amount: 97.0,
      frequency: "monthly",
      status: "active",
      subscribers: 3249,
      nextBilling: new Date("2024-01-01"),
      xanoTable: "premium_members",
      nmiVaultId: "vault_premium_001",
    },
  ]);

  const [billingEvents, setBillingEvents] = useState<BillingEvent[]>([
    {
      id: "event_001",
      planId: "plan_001",
      customerId: "cust_123",
      amount: 297.0,
      status: "processed",
      timestamp: new Date(),
      nmiResponse: { transactionId: "nmi_12345", status: "approved" },
      twilioNotification: true,
    },
  ]);

  const [integrationStatus, setIntegrationStatus] = useState({
    xano: { connected: true, lastSync: new Date() },
    nmi: { connected: true, vaultActive: true },
    twilio: { connected: true, webhooksActive: true },
  });

  const [newPlan, setNewPlan] = useState({
    name: "",
    amount: 0,
    frequency: "monthly",
    xanoTable: "",
    description: "",
  });

  const processRecurringBilling = async (planId: string) => {
    console.log("Processing recurring billing for plan:", planId);

    // 1. Fetch subscribers from Xano
    const xanoResponse = await fetch(`/api/xano/subscribers/${planId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!xanoResponse.ok) {
      throw new Error("Failed to fetch subscribers from Xano");
    }

    const subscribers = await xanoResponse.json();

    // 2. Process each subscriber through NMI
    for (const subscriber of subscribers) {
      try {
        const nmiResponse = await fetch("/api/nmi/charge-vault", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vaultId: subscriber.nmi_vault_id,
            amount: plans.find((p) => p.id === planId)?.amount,
            description: `Recurring billing - ${planId}`,
          }),
        });

        const nmiResult = await nmiResponse.json();

        // 3. Update Xano with billing result
        await fetch("/api/xano/update-billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriberId: subscriber.id,
            transactionId: nmiResult.transactionId,
            status: nmiResult.status,
            amount: nmiResult.amount,
          }),
        });

        // 4. Send Twilio notification if successful
        if (nmiResult.status === "approved") {
          await fetch("/api/twilio/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: subscriber.phone,
              body: `Payment processed successfully! Your ${plans.find((p) => p.id === planId)?.name} membership is active. Amount: $${nmiResult.amount}`,
            }),
          });
        } else {
          // Send failure notification
          await fetch("/api/twilio/send-sms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: subscriber.phone,
              body: `Payment failed for your ${plans.find((p) => p.id === planId)?.name} membership. Please update your payment method.`,
            }),
          });
        }
      } catch (error) {
        console.error("Billing error for subscriber:", subscriber.id, error);
      }
    }
  };

  const createNewPlan = async () => {
    const plan: RecurringPlan = {
      id: `plan_${Date.now()}`,
      name: newPlan.name,
      amount: newPlan.amount,
      frequency: newPlan.frequency as any,
      status: "active",
      subscribers: 0,
      nextBilling: new Date(),
      xanoTable: newPlan.xanoTable,
      nmiVaultId: `vault_${Date.now()}`,
    };

    setPlans([...plans, plan]);
    setNewPlan({
      name: "",
      amount: 0,
      frequency: "monthly",
      xanoTable: "",
      description: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "processed":
      case "approved":
        return "#00E676";
      case "pending":
        return "#FFD700";
      case "failed":
      case "cancelled":
        return "#FF2D55";
      case "paused":
        return "#FF6A00";
      default:
        return "#00CED1";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#32CD32]/10 via-[#0F0F10] to-[#00E676]/10">
      {/* Header */}
      <div className="border-b border-[#00E676]/20 bg-black/90 backdrop-blur-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#00E676] to-[#32CD32] flex items-center justify-center supreme-glow">
              <RefreshCw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">
                NMI RECURRING BILLING MATRIX
              </h1>
              <p className="text-sm text-[#00E676]">
                Xano → NMI → Twilio Integration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50">
              <Database className="w-4 h-4 text-[#00E676]" />
              <span className="text-xs font-bold text-[#00E676]">
                XANO LIVE
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50">
              <CreditCard className="w-4 h-4 text-[#00E676]" />
              <span className="text-xs font-bold text-[#00E676]">
                NMI VAULT
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50">
              <Zap className="w-4 h-4 text-[#00E676]" />
              <span className="text-xs font-bold text-[#00E676]">
                TWILIO SMS
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Integration Status Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1E1E22] border border-[#00E676]/30 p-6 supreme-float">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
                XANO DATABASE
              </h3>
              <Database className="w-4 h-4 text-[#00E676]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#00E676] animate-pulse"></div>
              <span className="text-sm font-bold text-white">
                CONNECTED & SYNCED
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Last sync: {integrationStatus.xano.lastSync.toLocaleTimeString()}
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#32CD32]/30 p-6 supreme-float">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#32CD32] uppercase tracking-wider">
                NMI VAULT
              </h3>
              <CreditCard className="w-4 h-4 text-[#32CD32]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#32CD32] animate-pulse"></div>
              <span className="text-sm font-bold text-white">VAULT ACTIVE</span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Processing recurring charges
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#20B2AA]/30 p-6 supreme-float">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#20B2AA] uppercase tracking-wider">
                TWILIO SMS
              </h3>
              <Zap className="w-4 h-4 text-[#20B2AA]" />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#20B2AA] animate-pulse"></div>
              <span className="text-sm font-bold text-white">
                NOTIFICATIONS LIVE
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Webhooks configured
            </div>
          </div>
        </div>

        {/* Billing Flow Diagram */}
        <div className="bg-[#1E1E22] border border-[#00E676]/30 p-8 mb-8 supreme-glow">
          <h3 className="text-xl font-black text-[#00E676] uppercase mb-6">
            AUTOMATED BILLING FLOW
          </h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00E676] to-[#32CD32] flex items-center justify-center mb-3 supreme-pulse">
                <Database className="w-10 h-10 text-white" />
              </div>
              <div className="text-sm font-bold text-white">XANO</div>
              <div className="text-xs text-gray-400">Fetch Subscribers</div>
            </div>
            <ArrowRightLeft className="w-8 h-8 text-[#00E676] animate-pulse" />
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#32CD32] to-[#20B2AA] flex items-center justify-center mb-3 supreme-pulse">
                <CreditCard className="w-10 h-10 text-white" />
              </div>
              <div className="text-sm font-bold text-white">NMI</div>
              <div className="text-xs text-gray-400">Process Payment</div>
            </div>
            <ArrowRightLeft className="w-8 h-8 text-[#00E676] animate-pulse" />
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#20B2AA] to-[#00E676] flex items-center justify-center mb-3 supreme-pulse">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div className="text-sm font-bold text-white">TWILIO</div>
              <div className="text-xs text-gray-400">Send Notification</div>
            </div>
          </div>
        </div>

        {/* Recurring Plans Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#1E1E22] border border-[#00E676]/30 p-6">
            <h3 className="text-lg font-black text-[#00E676] uppercase mb-6">
              ACTIVE RECURRING PLANS
            </h3>
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-[#2A2A2E] border border-[#00E676]/20 p-4 supreme-shimmer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-bold text-white">
                      {plan.name}
                    </h4>
                    <div
                      className="px-2 py-1 text-xs font-bold"
                      style={{
                        backgroundColor: `${getStatusColor(plan.status)}20`,
                        color: getStatusColor(plan.status),
                        border: `1px solid ${getStatusColor(plan.status)}50`,
                      }}
                    >
                      {plan.status.toUpperCase()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Amount: </span>
                      <span className="text-[#00E676] font-bold">
                        ${plan.amount}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Frequency: </span>
                      <span className="text-white">{plan.frequency}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Subscribers: </span>
                      <span className="text-[#00E676] font-bold">
                        {plan.subscribers}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Xano Table: </span>
                      <span className="text-white font-mono text-xs">
                        {plan.xanoTable}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => processRecurringBilling(plan.id)}
                      className="bg-[#00E676] hover:bg-[#32CD32] text-black"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      PROCESS NOW
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#00E676]/50 text-[#00E676]"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      CONFIGURE
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#32CD32]/30 p-6">
            <h3 className="text-lg font-black text-[#32CD32] uppercase mb-6">
              CREATE NEW PLAN
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-white text-xs">Plan Name</Label>
                <Input
                  value={newPlan.name}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, name: e.target.value })
                  }
                  className="bg-[#2A2A2E] border-[#32CD32]/30 text-white"
                  placeholder="e.g., VIP MEMBERSHIP"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white text-xs">Amount ($)</Label>
                  <Input
                    type="number"
                    value={newPlan.amount}
                    onChange={(e) =>
                      setNewPlan({
                        ...newPlan,
                        amount: parseFloat(e.target.value),
                      })
                    }
                    className="bg-[#2A2A2E] border-[#32CD32]/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white text-xs">Frequency</Label>
                  <Select
                    value={newPlan.frequency}
                    onValueChange={(value) =>
                      setNewPlan({ ...newPlan, frequency: value })
                    }
                  >
                    <SelectTrigger className="bg-[#2A2A2E] border-[#32CD32]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-white text-xs">Xano Table</Label>
                <Input
                  value={newPlan.xanoTable}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, xanoTable: e.target.value })
                  }
                  className="bg-[#2A2A2E] border-[#32CD32]/30 text-white"
                  placeholder="e.g., vip_members"
                />
              </div>
              <Button
                onClick={createNewPlan}
                className="w-full bg-gradient-to-r from-[#00E676] to-[#32CD32] text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                CREATE RECURRING PLAN
              </Button>
            </div>
          </div>
        </div>

        {/* Recent Billing Events */}
        <div className="bg-[#1E1E22] border border-[#20B2AA]/30 p-6">
          <h3 className="text-lg font-black text-[#20B2AA] uppercase mb-6">
            RECENT BILLING EVENTS
          </h3>
          <div className="space-y-3">
            {billingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-3 bg-[#2A2A2E] border border-[#20B2AA]/20"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3"
                    style={{
                      backgroundColor: getStatusColor(event.status),
                      boxShadow: `0 0 10px ${getStatusColor(event.status)}50`,
                    }}
                  />
                  <div>
                    <div className="text-sm font-bold text-white">
                      Plan: {plans.find((p) => p.id === event.planId)?.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      Customer: {event.customerId} • ${event.amount}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-xs font-bold"
                    style={{ color: getStatusColor(event.status) }}
                  >
                    {event.status.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {event.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

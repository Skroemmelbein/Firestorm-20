import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Shield,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Command,
  Zap,
  Lock,
  FileText,
  BarChart,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Search,
  Download,
  Plus,
  RefreshCw,
} from "lucide-react";

interface Chargeback {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  reason: string;
  status: "pending" | "disputed" | "won" | "lost" | "prevented";
  riskScore: number;
  customer: string;
  date: Date;
  processor: string;
  category: "fraud" | "processing" | "authorization" | "consumer";
}

interface ProtectionMetrics {
  totalChargebacks: number;
  preventedChargebacks: number;
  chargebackRate: number;
  recoveryRate: number;
  totalProtected: number;
  riskScore: number;
}

export default function ChargebackTracker() {
  const [selectedTab, setSelectedTab] = useState("command");
  const [chargebacks] = useState<Chargeback[]>([
    {
      id: "CB001",
      transactionId: "TXN-2024-001847",
      amount: 2500.00,
      currency: "USD",
      reason: "Fraudulent Transaction",
      status: "prevented",
      riskScore: 8.7,
      customer: "John Smith",
      date: new Date("2024-01-15"),
      processor: "NMI",
      category: "fraud",
    },
    {
      id: "CB002", 
      transactionId: "TXN-2024-001832",
      amount: 1875.50,
      currency: "USD",
      reason: "Processing Error",
      status: "won",
      riskScore: 3.2,
      customer: "Sarah Johnson",
      date: new Date("2024-01-14"),
      processor: "NMI",
      category: "processing",
    },
    {
      id: "CB003",
      transactionId: "TXN-2024-001798",
      amount: 850.00,
      currency: "USD", 
      reason: "Authorization Dispute",
      status: "disputed",
      riskScore: 6.1,
      customer: "Mike Wilson",
      date: new Date("2024-01-13"),
      processor: "NMI",
      category: "authorization",
    },
  ]);

  const metrics: ProtectionMetrics = {
    totalChargebacks: 47,
    preventedChargebacks: 156,
    chargebackRate: 0.3,
    recoveryRate: 87.4,
    totalProtected: 2100000,
    riskScore: 2.1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "prevented":
        return "#10B981";
      case "won":
        return "#10B981";
      case "disputed":
        return "#F59E0B";
      case "lost":
        return "#EF4444";
      case "pending":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "prevented":
      case "won":
        return CheckCircle;
      case "disputed":
        return Clock;
      case "lost":
        return XCircle;
      case "pending":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fraud":
        return "#EF4444";
      case "processing":
        return "#F59E0B";
      case "authorization":
        return "#3B82F6";
      case "consumer":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 8) return { level: "HIGH", color: "#EF4444" };
    if (score >= 5) return { level: "MEDIUM", color: "#F59E0B" };
    if (score >= 3) return { level: "LOW", color: "#10B981" };
    return { level: "MINIMAL", color: "#6B7280" };
  };

  return (
    <div className="min-h-screen bg-[#111111] fortress-theme">
      {/* ZERO-CB FORTRESS Command Header */}
      <div className="f10-command-header" style={{ background: "linear-gradient(135deg, #0a1a0a 0%, #1a2d1a 100%)" }}>
        <div className="f10-command-title">
          <CreditCard className="w-8 h-8 text-[#32CD32]" />
          <div>
            <h1 className="f10-heading-lg text-white">ZERO-CB FORTRESS</h1>
            <p className="f10-command-subtitle">Chargeback Defense & Revenue Protection</p>
          </div>
        </div>
        <div className="f10-command-status">
          <div className="f10-env-status">
            <div className="f10-status-dot"></div>
            <span>Protection: Active</span>
          </div>
          <div className="f10-env-status">
            <Shield className="w-4 h-4" />
            <span>{metrics.chargebackRate}% Chargeback Rate</span>
          </div>
        </div>
      </div>

      <div className="f10-ops-zone">
        {/* Protection Metrics */}
        <div className="f10-grid-4 mb-8">
          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Prevented This Month</span>
              <Shield className="w-4 h-4 text-[#32CD32]" />
            </div>
            <div className="f10-metric-value text-[#32CD32]">
              {metrics.preventedChargebacks}
            </div>
            <div className="f10-metric-trend positive">
              <TrendingUp className="w-3 h-3" />
              <span>+23% from last month</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Total Protected</span>
              <DollarSign className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">
              ${(metrics.totalProtected / 1000000).toFixed(1)}M
            </div>
            <div className="f10-metric-trend positive">
              <span>Revenue secured</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Recovery Rate</span>
              <Target className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">
              {metrics.recoveryRate}%
            </div>
            <div className="f10-metric-trend positive">
              <span>Industry leading</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Risk Score</span>
              <Activity className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">
              {metrics.riskScore}
            </div>
            <div className="f10-metric-trend positive">
              <span>Minimal risk</span>
            </div>
          </div>
        </div>

        {/* Command Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#1a1a1a] border border-[#32CD32]/30">
            <TabsTrigger
              value="command"
              className="data-[state=active]:bg-[#32CD32] data-[state=active]:text-black text-white hover:text-[#32CD32] transition-colors"
            >
              <Command className="w-4 h-4 mr-2" />
              Defense Command
            </TabsTrigger>
            <TabsTrigger
              value="monitoring"
              className="data-[state=active]:bg-[#32CD32] data-[state=active]:text-black text-white hover:text-[#32CD32] transition-colors"
            >
              <Activity className="w-4 h-4 mr-2" />
              Risk Monitoring
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#32CD32] data-[state=active]:text-black text-white hover:text-[#32CD32] transition-colors"
            >
              <BarChart className="w-4 h-4 mr-2" />
              Defense Analytics
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#32CD32] data-[state=active]:text-black text-white hover:text-[#32CD32] transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Protection Config
            </TabsTrigger>
          </TabsList>

          {/* Defense Command Tab */}
          <TabsContent value="command" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="f10-heading-md text-white">Chargeback Defense Command</h2>
                <p className="f10-text-sm text-[#b3b3b3] mt-1">Real-time chargeback monitoring and prevention system</p>
              </div>
              <div className="flex gap-3">
                <Button className="f10-btn f10-btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button className="f10-btn accent-bg text-black font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </div>

            {/* Chargeback List */}
            <div className="space-y-4">
              {chargebacks.map((chargeback) => {
                const StatusIcon = getStatusIcon(chargeback.status);
                const riskInfo = getRiskLevel(chargeback.riskScore);
                
                return (
                  <div key={chargeback.id} className="f10-card hover:accent-glow transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[#32CD32]/20">
                          <CreditCard className="w-5 h-5 text-[#32CD32]" />
                        </div>
                        <div>
                          <h3 className="f10-text-lg font-semibold text-white">{chargeback.transactionId}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div
                              className="f10-status"
                              style={{
                                backgroundColor: `${getStatusColor(chargeback.status)}20`,
                                color: getStatusColor(chargeback.status),
                                borderColor: `${getStatusColor(chargeback.status)}40`
                              }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {chargeback.status.toUpperCase()}
                            </div>
                            <div
                              className="f10-status"
                              style={{
                                backgroundColor: `${getCategoryColor(chargeback.category)}20`,
                                color: getCategoryColor(chargeback.category),
                                borderColor: `${getCategoryColor(chargeback.category)}40`
                              }}
                            >
                              {chargeback.category.toUpperCase()}
                            </div>
                            <div
                              className="f10-status"
                              style={{
                                backgroundColor: `${riskInfo.color}20`,
                                color: riskInfo.color,
                                borderColor: `${riskInfo.color}40`
                              }}
                            >
                              {riskInfo.level} RISK
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-6">
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#00E676]">
                          ${chargeback.amount.toFixed(2)}
                        </div>
                        <div className="f10-text-xs text-[#737373]">AMOUNT</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-white">
                          {chargeback.customer}
                        </div>
                        <div className="f10-text-xs text-[#737373]">CUSTOMER</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#FF6A00]">
                          {chargeback.riskScore}/10
                        </div>
                        <div className="f10-text-xs text-[#737373]">RISK SCORE</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#00BFFF]">
                          {chargeback.processor}
                        </div>
                        <div className="f10-text-xs text-[#737373]">PROCESSOR</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-white">
                          {chargeback.date.toLocaleDateString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">DATE</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#737373] truncate">
                          {chargeback.reason}
                        </div>
                        <div className="f10-text-xs text-[#737373]">REASON</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Risk Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto text-[#32CD32] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">Advanced Risk Monitoring</h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                Real-time risk assessment and fraud detection system
              </p>
              <Button className="f10-btn accent-bg text-black font-medium mt-6">
                <Activity className="w-4 h-4 mr-2" />
                Monitor Risks
              </Button>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <BarChart className="w-16 h-16 mx-auto text-[#32CD32] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">Defense Analytics Engine</h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                Advanced analytics for chargeback patterns and prevention optimization
              </p>
              <Button className="f10-btn accent-bg text-black font-medium mt-6">
                <BarChart className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 mx-auto text-[#32CD32] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">Protection Configuration</h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                Configure defense rules, risk thresholds, and automated responses
              </p>
              <Button className="f10-btn accent-bg text-black font-medium mt-6">
                <Settings className="w-4 h-4 mr-2" />
                Protection Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

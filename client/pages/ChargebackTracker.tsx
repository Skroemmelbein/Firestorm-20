import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Send,
  Eye,
  Edit,
  Trash2,
  FileText,
  Gavel,
  Target,
  Zap,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  CreditCard,
  UserCheck,
  Database,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Crosshair,
  Swords,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Chargeback {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  amount: number;
  disputeCode: string;
  disputeReason: string;
  dateDisputed: Date;
  dueDate: Date;
  status: "new" | "investigating" | "responded" | "won" | "lost" | "expired";
  priority: "low" | "medium" | "high" | "critical";
  evidenceStatus: "none" | "partial" | "complete";
  autoResponse: boolean;
  winProbability: number;
}

interface ChargebackStats {
  thisMonth: number;
  thisQuarter: number;
  ytd: number;
  winRate: number;
  avgResponseTime: number;
  totalDisputed: number;
}

export default function ChargebackTracker() {
  const [chargebacks, setChargebacks] = useState<Chargeback[]>([
    {
      id: "CB001",
      transactionId: "80595924715",
      customerId: "CUST_001",
      customerName: "Jeffrey Lesmeister",
      amount: 84.99,
      disputeCode: "53",
      disputeReason: "Not as Described",
      dateDisputed: new Date("2024-08-15"),
      dueDate: new Date("2024-08-29"),
      status: "investigating",
      priority: "high",
      evidenceStatus: "complete",
      autoResponse: true,
      winProbability: 94,
    },
    {
      id: "CB002",
      transactionId: "80595924716",
      customerId: "CUST_002",
      customerName: "Sarah Johnson",
      amount: 299.99,
      disputeCode: "62",
      disputeReason: "Duplicate Processing",
      dateDisputed: new Date("2024-08-18"),
      dueDate: new Date("2024-09-01"),
      status: "new",
      priority: "critical",
      evidenceStatus: "none",
      autoResponse: false,
      winProbability: 78,
    },
    {
      id: "CB003",
      transactionId: "80595924717",
      customerId: "CUST_003",
      customerName: "Mike Chen",
      amount: 149.99,
      disputeCode: "13",
      disputeReason: "Credit Not Processed",
      dateDisputed: new Date("2024-08-20"),
      dueDate: new Date("2024-09-03"),
      status: "responded",
      priority: "medium",
      evidenceStatus: "complete",
      autoResponse: true,
      winProbability: 87,
    },
  ]);

  const [stats, setStats] = useState<ChargebackStats>({
    thisMonth: 23,
    thisQuarter: 67,
    ytd: 234,
    winRate: 89.2,
    avgResponseTime: 2.3,
    totalDisputed: 45280,
  });

  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChargebacks = chargebacks.filter((cb) => {
    const matchesStatus = filterStatus === "all" || cb.status === filterStatus;
    const matchesSearch =
      cb.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cb.transactionId.includes(searchTerm) ||
      cb.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "#FF2D55";
      case "investigating":
        return "#FFD700";
      case "responded":
        return "#00CED1";
      case "won":
        return "#00E676";
      case "lost":
        return "#DC143C";
      case "expired":
        return "#808080";
      default:
        return "#FF6A00";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "#DC143C";
      case "high":
        return "#FF2D55";
      case "medium":
        return "#FFD700";
      case "low":
        return "#00E676";
      default:
        return "#FF6A00";
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white">
      {/* Fortress Command Header */}
      <div className="border-b border-[#DC143C]/20 bg-black/90 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#DC143C] via-[#B22222] to-[#8B0000] flex items-center justify-center border border-[#DC143C]/30 shadow-2xl shadow-[#DC143C]/20">
                  <Shield className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-[#DC143C]/20 animate-pulse border border-[#DC143C]/50"></div>
              </div>
              <div>
                <h1 className="text-6xl font-black tracking-wider text-white mb-1">
                  CHARGEBACK TRACKER
                </h1>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-16 bg-gradient-to-r from-[#DC143C] to-[#FF2D55]"></div>
                  <p className="text-sm font-bold text-[#DC143C] uppercase tracking-widest">
                    Stop Chargebacks & Protect Revenue
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#1E1E22] border border-[#00E676]/30 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00E676] animate-pulse"></div>
                  <span className="text-xs font-bold text-[#00E676]">
                    FORTRESS ACTIVE
                  </span>
                </div>
              </div>
              <div className="bg-[#1E1E22] border border-[#DC143C]/30 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-3 h-3 text-[#DC143C]" />
                  <span className="text-xs font-bold text-white">
                    {stats.winRate}% WIN RATE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defense Matrix Dashboard */}
      <div className="container mx-auto px-6 py-8">
        {/* Critical Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1E1E22] border border-[#DC143C]/30 p-6 hover:border-[#DC143C] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#DC143C] uppercase tracking-wider">
                THREATS THIS MONTH
              </h3>
              <AlertTriangle className="w-4 h-4 text-[#DC143C]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {stats.thisMonth}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[65%] h-full bg-[#DC143C]"></div>
              </div>
              <span className="text-xs text-[#DC143C] font-bold">-23%</span>
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#00E676]/30 p-6 hover:border-[#00E676] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
                DEFENSE SUCCESS RATE
              </h3>
              <Shield className="w-4 h-4 text-[#00E676]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {stats.winRate}%
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[89%] h-full bg-[#00E676]"></div>
              </div>
              <span className="text-xs text-[#00E676] font-bold">+5.2%</span>
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#FFD700]/30 p-6 hover:border-[#FFD700] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                AVG RESPONSE TIME
              </h3>
              <Clock className="w-4 h-4 text-[#FFD700]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {stats.avgResponseTime}h
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[45%] h-full bg-[#FFD700]"></div>
              </div>
              <span className="text-xs text-[#FFD700] font-bold">-1.2h</span>
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6 hover:border-[#FF6A00] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
                REVENUE PROTECTED
              </h3>
              <DollarSign className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              ${stats.totalDisputed.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[78%] h-full bg-[#FF6A00]"></div>
              </div>
              <span className="text-xs text-[#FF6A00] font-bold">+12%</span>
            </div>
          </div>
        </div>

        {/* Command Center Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-[#1E1E22] border border-[#DC143C]/30 p-1">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-[#DC143C] data-[state=active]:text-white text-white hover:text-[#DC143C] transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              FORTRESS COMMAND
            </TabsTrigger>
            <TabsTrigger
              value="threats"
              className="data-[state=active]:bg-[#DC143C] data-[state=active]:text-white text-white hover:text-[#DC143C] transition-colors"
            >
              <Crosshair className="w-4 h-4 mr-2" />
              ACTIVE THREATS
            </TabsTrigger>
            <TabsTrigger
              value="evidence"
              className="data-[state=active]:bg-[#DC143C] data-[state=active]:text-white text-white hover:text-[#DC143C] transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              EVIDENCE VAULT
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#DC143C] data-[state=active]:text-white text-white hover:text-[#DC143C] transition-colors"
            >
              <Target className="w-4 h-4 mr-2" />
              BATTLE ANALYTICS
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#DC143C] data-[state=active]:text-white text-white hover:text-[#DC143C] transition-colors"
            >
              <Gavel className="w-4 h-4 mr-2" />
              DEFENSE CONFIG
            </TabsTrigger>
          </TabsList>

          {/* Active Threats Tab */}
          <TabsContent value="threats" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">
                ACTIVE THREAT MATRIX
              </h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-[#DC143C]/50 text-[#DC143C] hover:bg-[#DC143C] hover:text-white transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  FILTER THREATS
                </Button>
                <Button className="bg-gradient-to-r from-[#DC143C] to-[#FF2D55] text-white font-bold hover:from-[#FF2D55] hover:to-[#DC143C] transition-all">
                  <Swords className="w-4 h-4 mr-2" />
                  LAUNCH COUNTERATTACK
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredChargebacks.map((chargeback) => (
                <div
                  key={chargeback.id}
                  className="bg-[#1E1E22] border border-[#DC143C]/30 p-6 hover:border-[#DC143C] transition-all hover:shadow-lg hover:shadow-[#DC143C]/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-3 h-3"
                        style={{
                          backgroundColor: getPriorityColor(
                            chargeback.priority,
                          ),
                          boxShadow: `0 0 10px ${getPriorityColor(chargeback.priority)}50`,
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wide">
                          THREAT ID: {chargeback.id}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div
                            className="px-3 py-1 border text-xs font-bold uppercase"
                            style={{
                              backgroundColor: `${getStatusColor(chargeback.status)}20`,
                              borderColor: `${getStatusColor(chargeback.status)}50`,
                              color: getStatusColor(chargeback.status),
                            }}
                          >
                            {chargeback.status}
                          </div>
                          <div
                            className="px-3 py-1 border text-xs font-bold uppercase"
                            style={{
                              backgroundColor: `${getPriorityColor(chargeback.priority)}20`,
                              borderColor: `${getPriorityColor(chargeback.priority)}50`,
                              color: getPriorityColor(chargeback.priority),
                            }}
                          >
                            {chargeback.priority} PRIORITY
                          </div>
                          {chargeback.autoResponse && (
                            <div className="px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] text-xs font-bold uppercase">
                              AUTO DEFENSE
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#DC143C]/50 text-[#DC143C] hover:bg-[#DC143C] hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#DC143C]/50 text-[#DC143C] hover:bg-[#DC143C] hover:text-white"
                      >
                        <Gavel className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#DC143C]">
                        ${chargeback.amount}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        DISPUTED AMOUNT
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#FFD700]">
                        {chargeback.disputeCode}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        THREAT CODE
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#00E676]">
                        {chargeback.winProbability}%
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        WIN PROBABILITY
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#FF6A00]">
                        {Math.floor(
                          (chargeback.dueDate.getTime() -
                            new Date().getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}
                        d
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        TIME REMAINING
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">
                        {chargeback.customerName.split(" ")[0]}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        TARGET NAME
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#00CED1]">
                        {chargeback.evidenceStatus.toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        EVIDENCE STATUS
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">
                        THREAT REASON
                      </span>
                      <span className="text-sm text-[#DC143C] font-bold">
                        {chargeback.disputeReason}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">
                        TRANSACTION ID
                      </span>
                      <span className="text-sm text-white font-mono">
                        {chargeback.transactionId}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">
              FORTRESS OVERVIEW
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1E1E22] border border-[#DC143C]/30 p-6">
                <h3 className="text-lg font-black text-[#DC143C] uppercase mb-6">
                  THREAT DISTRIBUTION
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">
                      NEW THREATS
                    </span>
                    <span className="text-lg font-black text-[#FF2D55]">
                      12
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1E1E22]">
                    <div className="w-[52%] h-full bg-[#FF2D55]"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">
                      UNDER INVESTIGATION
                    </span>
                    <span className="text-lg font-black text-[#FFD700]">8</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E1E22]">
                    <div className="w-[35%] h-full bg-[#FFD700]"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">
                      DEFENDED
                    </span>
                    <span className="text-lg font-black text-[#00E676]">3</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E1E22]">
                    <div className="w-[13%] h-full bg-[#00E676]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E1E22] border border-[#00E676]/30 p-6">
                <h3 className="text-lg font-black text-[#00E676] uppercase mb-6">
                  DEFENSE EFFECTIVENESS
                </h3>
                <div className="text-center">
                  <div className="text-6xl font-black text-white mb-4">
                    {stats.winRate}%
                  </div>
                  <div className="text-sm text-gray-400 uppercase mb-4">
                    OVERALL WIN RATE
                  </div>
                  <div className="px-4 py-2 bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] text-xs font-bold uppercase">
                    +5.2% THIS QUARTER
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Evidence Vault Tab */}
          <TabsContent value="evidence" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">
              EVIDENCE VAULT
            </h2>
            <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-[#FF6A00] mb-4" />
                <p className="text-white">
                  Evidence management system coming online
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">
              BATTLE ANALYTICS
            </h2>
            <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6">
              <div className="text-center py-12">
                <Target className="w-12 h-12 mx-auto text-[#FF6A00] mb-4" />
                <p className="text-white">
                  Advanced analytics dashboard deploying
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">
              DEFENSE CONFIGURATION
            </h2>

            <div className="grid gap-6">
              <div className="bg-[#1E1E22] border border-[#DC143C]/30 p-6">
                <h3 className="text-lg font-black text-[#DC143C] uppercase mb-4">
                  AUTO-DEFENSE SYSTEM
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      AUTOMATIC RESPONSE
                    </span>
                    <div className="px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] text-xs font-bold">
                      ENABLED
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      THREAT MONITORING
                    </span>
                    <div className="px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] text-xs font-bold">
                      ACTIVE
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">
                      ALERT NOTIFICATIONS
                    </span>
                    <div className="px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] text-xs font-bold">
                      ENABLED
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

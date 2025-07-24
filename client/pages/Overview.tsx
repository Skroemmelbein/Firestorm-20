import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Zap,
  Users,
  Package,
  Database,
  Shield,
  Settings,
  TrendingUp,
  MessageSquare,
  Bot,
  Send,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface ModuleKPI {
  id: string;
  label: string;
  value: string | number;
  change: string;
  trend: "up" | "down" | "neutral";
  color: string;
}

interface ModuleData {
  id: string;
  name: string;
  description: string;
  color: string;
  personality: string;
  status: "optimal" | "warning" | "critical";
  kpis: ModuleKPI[];
}

export default function Overview() {
  const [moduleData, setModuleData] = useState<ModuleData[]>([
    {
      id: "firestorm",
      name: "FIRESTORM",
      description: "High-Energy Marketing Engine",
      color: "from-red-600 via-orange-500 to-yellow-400",
      personality: "explosive-energy",
      status: "optimal",
      kpis: [
        { id: "campaigns", label: "Active Campaigns", value: 12, change: "+3", trend: "up", color: "text-yellow-400" },
        { id: "messages", label: "Messages Sent", value: "16.3K", change: "+18%", trend: "up", color: "text-orange-400" },
        { id: "conversion", label: "Conversion Rate", value: "23.4%", change: "+5.2%", trend: "up", color: "text-red-400" },
      ],
    },
    {
      id: "dream-portal",
      name: "DREAM PORTAL",
      description: "Premium Member Experience",
      color: "from-purple-600 via-pink-500 to-blue-500",
      personality: "luxurious-premium",
      status: "optimal",
      kpis: [
        { id: "members", label: "Active Members", value: "1,247", change: "+89", trend: "up", color: "text-purple-400" },
        { id: "satisfaction", label: "Satisfaction Score", value: "94.8%", change: "+2.1%", trend: "up", color: "text-pink-400" },
        { id: "engagement", label: "Engagement Rate", value: "87.3%", change: "+12%", trend: "up", color: "text-blue-400" },
      ],
    },
    {
      id: "velocify-hub",
      name: "VELOCIFY HUB",
      description: "Ultra-Efficient Fulfillment",
      color: "from-cyan-400 via-blue-500 to-indigo-600",
      personality: "speed-efficiency",
      status: "optimal",
      kpis: [
        { id: "velocity", label: "Avg Fulfillment", value: "2.3min", change: "-45sec", trend: "up", color: "text-cyan-400" },
        { id: "orders", label: "Orders Processed", value: "892", change: "+156", trend: "up", color: "text-blue-400" },
        { id: "efficiency", label: "Efficiency Rate", value: "98.7%", change: "+3.2%", trend: "up", color: "text-indigo-400" },
      ],
    },
    {
      id: "nexus-sync",
      name: "NEXUS SYNC",
      description: "Data Integration Hub",
      color: "from-emerald-500 via-teal-500 to-green-600",
      personality: "data-nexus",
      status: "optimal",
      kpis: [
        { id: "syncs", label: "Data Syncs", value: "45.2K", change: "+892", trend: "up", color: "text-emerald-400" },
        { id: "uptime", label: "System Uptime", value: "99.97%", change: "+0.02%", trend: "up", color: "text-teal-400" },
        { id: "integrations", label: "Active Integrations", value: 8, change: "+2", trend: "up", color: "text-green-400" },
      ],
    },
    {
      id: "zero-cb-fortress",
      name: "ZERO CB FORTRESS",
      description: "Chargeback Defense",
      color: "from-amber-600 via-orange-500 to-red-500",
      personality: "fortress-defense",
      status: "optimal",
      kpis: [
        { id: "blocked", label: "Chargebacks Blocked", value: "23", change: "+12", trend: "up", color: "text-amber-400" },
        { id: "success", label: "Defense Rate", value: "96.4%", change: "+4.1%", trend: "up", color: "text-orange-400" },
        { id: "savings", label: "Cost Savings", value: "$127K", change: "+$45K", trend: "up", color: "text-red-400" },
      ],
    },
    {
      id: "command-center",
      name: "COMMAND CENTER",
      description: "Mission Control Hub",
      color: "from-gray-700 via-slate-600 to-zinc-800",
      personality: "mission-control",
      status: "optimal",
      kpis: [
        { id: "systems", label: "Systems Online", value: "12/12", change: "100%", trend: "up", color: "text-slate-400" },
        { id: "alerts", label: "Active Alerts", value: 0, change: "-3", trend: "up", color: "text-zinc-400" },
        { id: "performance", label: "Performance", value: "Optimal", change: "+12%", trend: "up", color: "text-gray-400" },
      ],
    },
  ]);

  const getTrendIcon = (trend: "up" | "down" | "neutral") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case "down":
        return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
      default:
        return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "optimal":
        return <Badge className="bg-green-900/50 text-green-400 border-green-500/30">OPTIMAL</Badge>;
      case "warning":
        return <Badge className="bg-yellow-900/50 text-yellow-400 border-yellow-500/30">WARNING</Badge>;
      case "critical":
        return <Badge className="bg-red-900/50 text-red-400 border-red-500/30">CRITICAL</Badge>;
      default:
        return <Badge className="bg-gray-900/50 text-gray-400 border-gray-500/30">UNKNOWN</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/50 to-zinc-800/50 backdrop-blur-sm border-b border-slate-700/50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-widest">
                    OVERVIEW
                  </h1>
                  <p className="text-cyan-300/80 font-bold uppercase tracking-wide">
                    🚀 ECELONX System Performance Dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-green-900/50 text-green-400 border-green-500/30 px-4 py-2">
                  <Activity className="w-4 h-4 mr-2" />
                  ALL SYSTEMS OPTIMAL
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Module KPIs Grid */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {moduleData.map((module) => (
              <Card 
                key={module.id} 
                className="bg-gradient-to-br from-slate-800/60 to-gray-900/60 backdrop-blur-sm border border-slate-700/50 shadow-2xl"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className={`text-2xl font-black bg-gradient-to-r ${module.color} bg-clip-text text-transparent tracking-wider`}>
                        {module.name}
                      </CardTitle>
                      <CardDescription className="text-slate-400 font-medium">
                        {module.description}
                      </CardDescription>
                    </div>
                    {getStatusBadge(module.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {module.kpis.map((kpi, index) => (
                    <div key={kpi.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-300">{kpi.label}</span>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(kpi.trend)}
                          <span className="text-xs text-slate-400">{kpi.change}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-2xl font-bold ${kpi.color}`}>
                          {kpi.value}
                        </span>
                        <Progress 
                          value={75 + index * 5} 
                          className="w-16 h-2 bg-slate-800"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Status Bar */}
          <div className="mt-8">
            <Card className="bg-gradient-to-r from-slate-800/60 to-gray-900/60 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-slate-200 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  ECELONX System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="text-green-400 font-bold">Twilio SMS</div>
                    <Badge className="bg-green-900/50 text-green-400 border-green-500/30 text-xs">ACTIVE</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-bold">OpenAI</div>
                    <Badge className="bg-blue-900/50 text-blue-400 border-blue-500/30 text-xs">CONNECTED</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">Database</div>
                    <Badge className="bg-purple-900/50 text-purple-400 border-purple-500/30 text-xs">ONLINE</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-orange-400 font-bold">API Gateway</div>
                    <Badge className="bg-orange-900/50 text-orange-400 border-orange-500/30 text-xs">RUNNING</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-cyan-400 font-bold">Security</div>
                    <Badge className="bg-cyan-900/50 text-cyan-400 border-cyan-500/30 text-xs">SECURED</Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold">Uptime</div>
                    <Badge className="bg-green-900/50 text-green-400 border-green-500/30 text-xs">99.97%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

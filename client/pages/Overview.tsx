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
  Flame,
  Crown,
  Rocket,
  Brain,
  Command,
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
      description: "TACTICAL MARKETING ENGINE",
      color: "#FF6A00",
      personality: "explosive-warfare",
      status: "optimal",
      kpis: [
        { id: "campaigns", label: "ACTIVE OPERATIONS", value: 12, change: "+3", trend: "up", color: "#FF6A00" },
        { id: "messages", label: "MESSAGES DEPLOYED", value: "16.3K", change: "+18%", trend: "up", color: "#FF2D55" },
        { id: "conversion", label: "CONVERSION RATE", value: "23.4%", change: "+5.2%", trend: "up", color: "#00E676" },
      ],
    },
    {
      id: "dream-portal",
      name: "DREAM PORTAL",
      description: "PREMIUM MEMBER COMMAND",
      color: "#8A2BE2",
      personality: "elite-luxury",
      status: "optimal",
      kpis: [
        { id: "members", label: "ACTIVE MEMBERS", value: "1,247", change: "+89", trend: "up", color: "#8A2BE2" },
        { id: "satisfaction", label: "SATISFACTION RATE", value: "94.8%", change: "+2.1%", trend: "up", color: "#FF69B4" },
        { id: "engagement", label: "ENGAGEMENT SCORE", value: "87.3%", change: "+12%", trend: "up", color: "#4169E1" },
      ],
    },
    {
      id: "velocify-hub",
      name: "VELOCIFY HUB",
      description: "ULTRA-EFFICIENT FULFILLMENT",
      color: "#00CED1",
      personality: "speed-precision",
      status: "optimal",
      kpis: [
        { id: "velocity", label: "AVG FULFILLMENT", value: "2.3min", change: "-45sec", trend: "up", color: "#00CED1" },
        { id: "orders", label: "ORDERS PROCESSED", value: "892", change: "+156", trend: "up", color: "#1E90FF" },
        { id: "efficiency", label: "EFFICIENCY RATE", value: "98.7%", change: "+3.2%", trend: "up", color: "#4682B4" },
      ],
    },
    {
      id: "nexus-sync",
      name: "NEXUS SYNC",
      description: "DATA INTELLIGENCE HUB",
      color: "#00E676",
      personality: "data-nexus",
      status: "optimal",
      kpis: [
        { id: "syncs", label: "DATA SYNCS", value: "45.2K", change: "+892", trend: "up", color: "#00E676" },
        { id: "uptime", label: "SYSTEM UPTIME", value: "99.97%", change: "+0.02%", trend: "up", color: "#20B2AA" },
        { id: "integrations", label: "LIVE INTEGRATIONS", value: 8, change: "+2", trend: "up", color: "#32CD32" },
      ],
    },
    {
      id: "zero-cb-fortress",
      name: "ZERO CB FORTRESS",
      description: "CHARGEBACK DEFENSE MATRIX",
      color: "#DC143C",
      personality: "fortress-defense",
      status: "optimal",
      kpis: [
        { id: "blocked", label: "THREATS BLOCKED", value: "156", change: "+12", trend: "up", color: "#DC143C" },
        { id: "rate", label: "DEFENSE RATE", value: "97.8%", change: "+1.2%", trend: "up", color: "#B22222" },
        { id: "saved", label: "REVENUE PROTECTED", value: "$45.2K", change: "+$8.9K", trend: "up", color: "#8B0000" },
      ],
    },
  ]);

  const systemOverview = {
    totalRevenue: 847200,
    activeUsers: 8934,
    systemUptime: 99.97,
    threatsBlocked: 2847,
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white">
      {/* Command Center Header */}
      <div className="border-b border-[#FF6A00]/20 bg-black/90 backdrop-blur-xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-black tracking-wider text-white mb-2">
              ECELONX COMMAND CENTER
            </h1>
            <div className="flex items-center gap-4">
              <div className="h-1 w-20 bg-gradient-to-r from-[#FF6A00] to-[#FF2D55]"></div>
              <p className="text-sm font-bold text-[#FF6A00] uppercase tracking-widest">
                ELITE GLOBAL OPERATIONS MATRIX
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-[#1E1E22] border border-[#00E676]/30 px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00E676] animate-pulse"></div>
                <span className="text-xs font-bold text-[#00E676]">ALL SYSTEMS OPERATIONAL</span>
              </div>
            </div>
            <div className="bg-[#1E1E22] border border-[#FF6A00]/30 px-4 py-2">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-[#FF6A00]" />
                <span className="text-xs font-bold text-white">{systemOverview.systemUptime}% UPTIME</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Metrics Dashboard */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#1E1E22] border border-[#00E676]/30 p-6 hover:border-[#00E676] transition-colors tactical-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
                TOTAL REVENUE
              </h3>
              <DollarSign className="w-4 h-4 text-[#00E676]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              ${systemOverview.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[78%] h-full bg-[#00E676]"></div>
              </div>
              <span className="text-xs text-[#00E676] font-bold">+23.4%</span>
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6 hover:border-[#FF6A00] transition-colors tactical-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
                ACTIVE USERS
              </h3>
              <Users className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {systemOverview.activeUsers.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[65%] h-full bg-[#FF6A00]"></div>
              </div>
              <span className="text-xs text-[#FF6A00] font-bold">+12.8%</span>
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#FF2D55]/30 p-6 hover:border-[#FF2D55] transition-colors tactical-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#FF2D55] uppercase tracking-wider">
                SYSTEM HEALTH
              </h3>
              <Activity className="w-4 h-4 text-[#FF2D55]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {systemOverview.systemUptime}%
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[99%] h-full bg-[#FF2D55]"></div>
              </div>
              <span className="text-xs text-[#FF2D55] font-bold">OPTIMAL</span>
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#DC143C]/30 p-6 hover:border-[#DC143C] transition-colors tactical-hover">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#DC143C] uppercase tracking-wider">
                THREATS BLOCKED
              </h3>
              <Shield className="w-4 h-4 text-[#DC143C]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {systemOverview.threatsBlocked.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[92%] h-full bg-[#DC143C]"></div>
              </div>
              <span className="text-xs text-[#DC143C] font-bold">+15.6%</span>
            </div>
          </div>
        </div>

        {/* Module Status Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-wide mb-6">
            MODULE OPERATIONS STATUS
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {moduleData.map((module) => (
              <div
                key={module.id}
                className="bg-[#1E1E22] border-2 border-transparent hover:border-[#FF6A00]/50 transition-all tactical-hover p-6"
                style={{ borderLeftColor: module.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wide mb-1">
                      {module.name}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {module.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {module.id === "firestorm" && <Flame className="w-5 h-5" style={{ color: module.color }} />}
                    {module.id === "dream-portal" && <Crown className="w-5 h-5" style={{ color: module.color }} />}
                    {module.id === "velocify-hub" && <Rocket className="w-5 h-5" style={{ color: module.color }} />}
                    {module.id === "nexus-sync" && <Database className="w-5 h-5" style={{ color: module.color }} />}
                    {module.id === "zero-cb-fortress" && <Shield className="w-5 h-5" style={{ color: module.color }} />}
                    <div className="px-2 py-1 bg-[#00E676]/20 border border-[#00E676]/50">
                      <span className="text-xs font-bold text-[#00E676] uppercase">OPERATIONAL</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {module.kpis.map((kpi) => (
                    <div key={kpi.id} className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white uppercase tracking-wide">
                        {kpi.label}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-white">
                          {kpi.value}
                        </span>
                        <span 
                          className="text-xs font-bold"
                          style={{ color: kpi.color }}
                        >
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-700">
                  <Button 
                    className="w-full bg-gradient-to-r from-[#FF6A00] to-[#FF2D55] text-black font-bold hover:from-[#FF2D55] hover:to-[#FF6A00] transition-all"
                  >
                    <Command className="w-4 h-4 mr-2" />
                    ACCESS MODULE
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Activity Feed */}
        <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6">
          <h3 className="text-lg font-black text-[#FF6A00] uppercase mb-6">REAL-TIME ACTIVITY FEED</h3>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="text-[#00E676] font-bold">[FIRESTORM]</span>
              <span className="text-white">Campaign "HOLIDAY SURGE" deployed to 15.4K targets</span>
              <span className="text-gray-400">2 mins ago</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#8A2BE2] font-bold">[DREAM PORTAL]</span>
              <span className="text-white">89 new premium members onboarded</span>
              <span className="text-gray-400">5 mins ago</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#00CED1] font-bold">[VELOCIFY HUB]</span>
              <span className="text-white">Order fulfillment rate optimized to 98.7%</span>
              <span className="text-gray-400">8 mins ago</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#DC143C] font-bold">[FORTRESS]</span>
              <span className="text-white">12 chargeback threats neutralized</span>
              <span className="text-gray-400">12 mins ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

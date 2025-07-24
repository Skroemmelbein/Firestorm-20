import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Building,
  Shield,
  Crown,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Upload,
  Settings,
  Bell,
  Lock,
  Eye,
  Edit,
  Plus,
  Trash2,
  MessageSquare,
  Video,
  CreditCard,
  BarChart,
  Target,
  Award,
  Briefcase,
  Globe,
  Zap,
  Heart,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Rocket,
  Gauge,
  Command,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Officer {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  role: "owner" | "admin" | "manager" | "user";
  permissions: string[];
  lastLogin: Date;
  avatar?: string;
  department: string;
  joinedDate: Date;
  status: "active" | "inactive" | "pending";
}

interface Client {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  foundedYear: number;
  employees: string;
  revenue: string;
  accountStatus: "active" | "trial" | "suspended" | "cancelled";
  subscriptionTier: "basic" | "professional" | "enterprise";
  monthlySpend: number;
  totalSpend: number;
  contractStart: Date;
  contractEnd: Date;
  officers: Officer[];
  fulfillmentMetrics: {
    avgProcessingTime: number;
    ordersCompleted: number;
    efficiencyRate: number;
    throughputRate: number;
  };
}

export default function ClientPortal() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [clients, setClients] = useState<Client[]>([
    {
      id: "CLT001",
      companyName: "APEX DYNAMICS CORP",
      industry: "Technology",
      website: "https://apexdynamics.com",
      phone: "+1 (555) 123-4567",
      email: "contact@apexdynamics.com",
      address: "500 Corporate Plaza",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "USA",
      foundedYear: 2018,
      employees: "250-500",
      revenue: "$50M-100M",
      accountStatus: "active",
      subscriptionTier: "enterprise",
      monthlySpend: 45000,
      totalSpend: 540000,
      contractStart: new Date("2023-01-15"),
      contractEnd: new Date("2024-12-31"),
      officers: [],
      fulfillmentMetrics: {
        avgProcessingTime: 1.8,
        ordersCompleted: 2847,
        efficiencyRate: 98.7,
        throughputRate: 156.3,
      },
    },
    {
      id: "CLT002",
      companyName: "STELLAR ENTERPRISES",
      industry: "Manufacturing",
      website: "https://stellarenterprises.com",
      phone: "+1 (555) 987-6543",
      email: "info@stellarenterprises.com",
      address: "1200 Industrial Blvd",
      city: "Chicago",
      state: "IL",
      zip: "60607",
      country: "USA",
      foundedYear: 2015,
      employees: "100-250",
      revenue: "$25M-50M",
      accountStatus: "active",
      subscriptionTier: "professional",
      monthlySpend: 28000,
      totalSpend: 336000,
      contractStart: new Date("2023-03-01"),
      contractEnd: new Date("2024-12-31"),
      officers: [],
      fulfillmentMetrics: {
        avgProcessingTime: 2.1,
        ordersCompleted: 1893,
        efficiencyRate: 96.4,
        throughputRate: 142.7,
      },
    },
  ]);

  const systemMetrics = {
    totalClients: clients.length,
    activeOrders: 847,
    avgFulfillmentTime: 1.9,
    systemEfficiency: 97.8,
    totalRevenue: clients.reduce((sum, client) => sum + client.totalSpend, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "#00E676";
      case "trial": return "#FFD700";
      case "suspended": return "#FF6A00";
      case "cancelled": return "#FF2D55";
      default: return "#00CED1";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "enterprise": return "#8A2BE2";
      case "professional": return "#00CED1";
      case "basic": return "#32CD32";
      default: return "#FF6A00";
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white">
      {/* Velocify Command Header */}
      <div className="border-b border-[#00CED1]/20 bg-black/90 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#00CED1] via-[#1E90FF] to-[#4682B4] flex items-center justify-center border border-[#00CED1]/30 shadow-2xl shadow-[#00CED1]/20">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-[#00CED1]/20 animate-pulse border border-[#00CED1]/50"></div>
              </div>
              <div>
                <h1 className="text-6xl font-black tracking-wider text-white mb-1">
                  VELOCIFY HUB
                </h1>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-16 bg-gradient-to-r from-[#00CED1] to-[#1E90FF]"></div>
                  <p className="text-sm font-bold text-[#00CED1] uppercase tracking-widest">
                    ULTRA-EFFICIENT FULFILLMENT MATRIX
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#1E1E22] border border-[#00E676]/30 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00E676] animate-pulse"></div>
                  <span className="text-xs font-bold text-[#00E676]">VELOCITY OPTIMAL</span>
                </div>
              </div>
              <div className="bg-[#1E1E22] border border-[#00CED1]/30 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-3 h-3 text-[#00CED1]" />
                  <span className="text-xs font-bold text-white">{systemMetrics.avgFulfillmentTime}min AVG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Velocity Metrics Dashboard */}
      <div className="container mx-auto px-6 py-8">
        {/* Speed Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-[#1E1E22] border border-[#00E676]/30 p-6 hover:border-[#00E676] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
                TOTAL CLIENTS
              </h3>
              <Building className="w-4 h-4 text-[#00E676]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {systemMetrics.totalClients}
            </div>
            <div className="text-xs text-[#00E676] font-bold">ENTERPRISE GRADE</div>
          </div>

          <div className="bg-[#1E1E22] border border-[#00CED1]/30 p-6 hover:border-[#00CED1] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#00CED1] uppercase tracking-wider">
                ACTIVE ORDERS
              </h3>
              <Activity className="w-4 h-4 text-[#00CED1]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {systemMetrics.activeOrders}
            </div>
            <div className="text-xs text-[#00CED1] font-bold">PROCESSING</div>
          </div>

          <div className="bg-[#1E1E22] border border-[#FFD700]/30 p-6 hover:border-[#FFD700] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                AVG FULFILLMENT
              </h3>
              <Clock className="w-4 h-4 text-[#FFD700]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {systemMetrics.avgFulfillmentTime}min
            </div>
            <div className="text-xs text-[#FFD700] font-bold">LIGHTNING FAST</div>
          </div>

          <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6 hover:border-[#FF6A00] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
                EFFICIENCY RATE
              </h3>
              <Gauge className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {systemMetrics.systemEfficiency}%
            </div>
            <div className="text-xs text-[#FF6A00] font-bold">OPTIMAL</div>
          </div>

          <div className="bg-[#1E1E22] border border-[#8A2BE2]/30 p-6 hover:border-[#8A2BE2] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#8A2BE2] uppercase tracking-wider">
                TOTAL REVENUE
              </h3>
              <DollarSign className="w-4 h-4 text-[#8A2BE2]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              ${(systemMetrics.totalRevenue / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-[#8A2BE2] font-bold">ACCELERATING</div>
          </div>
        </div>

        {/* Command Center Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-[#1E1E22] border border-[#00CED1]/30 p-1">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black text-white hover:text-[#00CED1] transition-colors"
            >
              <Gauge className="w-4 h-4 mr-2" />
              VELOCITY COMMAND
            </TabsTrigger>
            <TabsTrigger 
              value="clients" 
              className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black text-white hover:text-[#00CED1] transition-colors"
            >
              <Building className="w-4 h-4 mr-2" />
              CLIENT MATRIX
            </TabsTrigger>
            <TabsTrigger 
              value="fulfillment" 
              className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black text-white hover:text-[#00CED1] transition-colors"
            >
              <Rocket className="w-4 h-4 mr-2" />
              FULFILLMENT OPS
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black text-white hover:text-[#00CED1] transition-colors"
            >
              <BarChart className="w-4 h-4 mr-2" />
              VELOCITY ANALYTICS
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black text-white hover:text-[#00CED1] transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              SYSTEM CONFIG
            </TabsTrigger>
          </TabsList>

          {/* Client Matrix Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">CLIENT MATRIX</h2>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="border-[#00CED1]/50 text-[#00CED1] hover:bg-[#00CED1] hover:text-black transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  ANALYZE PERFORMANCE
                </Button>
                <Button className="bg-gradient-to-r from-[#00CED1] to-[#1E90FF] text-black font-bold hover:from-[#1E90FF] hover:to-[#00CED1] transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  ONBOARD CLIENT
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {clients.map((client) => (
                <div
                  key={client.id}
                  className="bg-[#1E1E22] border border-[#00CED1]/30 p-6 hover:border-[#00CED1] transition-all hover:shadow-lg hover:shadow-[#00CED1]/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-3 h-3"
                        style={{
                          backgroundColor: getStatusColor(client.accountStatus),
                          boxShadow: `0 0 10px ${getStatusColor(client.accountStatus)}50`
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wide">
                          {client.companyName}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div 
                            className="px-3 py-1 border text-xs font-bold uppercase"
                            style={{
                              backgroundColor: `${getStatusColor(client.accountStatus)}20`,
                              borderColor: `${getStatusColor(client.accountStatus)}50`,
                              color: getStatusColor(client.accountStatus)
                            }}
                          >
                            {client.accountStatus}
                          </div>
                          <div 
                            className="px-3 py-1 border text-xs font-bold uppercase"
                            style={{
                              backgroundColor: `${getTierColor(client.subscriptionTier)}20`,
                              borderColor: `${getTierColor(client.subscriptionTier)}50`,
                              color: getTierColor(client.subscriptionTier)
                            }}
                          >
                            {client.subscriptionTier}
                          </div>
                          <div className="text-white text-sm font-bold">
                            {client.industry}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-[#00CED1]/50 text-[#00CED1] hover:bg-[#00CED1] hover:text-black"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-[#00CED1]/50 text-[#00CED1] hover:bg-[#00CED1] hover:text-black"
                      >
                        <Rocket className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#00E676]">
                        ${client.monthlySpend.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        MONTHLY SPEND
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#FFD700]">
                        {client.fulfillmentMetrics.avgProcessingTime}min
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        AVG PROCESSING
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#00CED1]">
                        {client.fulfillmentMetrics.ordersCompleted}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        ORDERS COMPLETED
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#FF6A00]">
                        {client.fulfillmentMetrics.efficiencyRate}%
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        EFFICIENCY
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#8A2BE2]">
                        {client.fulfillmentMetrics.throughputRate}/h
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        THROUGHPUT
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">
                        {client.employees}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        EMPLOYEES
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">FULFILLMENT VELOCITY</span>
                      <span className="text-sm font-bold text-[#00CED1]">
                        {client.fulfillmentMetrics.efficiencyRate}% EFFICIENCY
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#1E1E22]">
                      <div 
                        className="h-full bg-[#00CED1]"
                        style={{ width: `${client.fulfillmentMetrics.efficiencyRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">VELOCITY OVERVIEW</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1E1E22] border border-[#00CED1]/30 p-6">
                <h3 className="text-lg font-black text-[#00CED1] uppercase mb-6">PROCESSING VELOCITY</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">ULTRA-FAST (&lt;1min)</span>
                    <span className="text-lg font-black text-[#00E676]">45%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E1E22]">
                    <div className="w-[45%] h-full bg-[#00E676]"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">RAPID (1-3min)</span>
                    <span className="text-lg font-black text-[#00CED1]">38%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E1E22]">
                    <div className="w-[38%] h-full bg-[#00CED1]"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">STANDARD (3-5min)</span>
                    <span className="text-lg font-black text-[#FFD700]">17%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E1E22]">
                    <div className="w-[17%] h-full bg-[#FFD700]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6">
                <h3 className="text-lg font-black text-[#FF6A00] uppercase mb-6">SYSTEM EFFICIENCY</h3>
                <div className="text-center">
                  <div className="text-6xl font-black text-white mb-4">{systemMetrics.systemEfficiency}%</div>
                  <div className="text-sm text-gray-400 uppercase mb-4">OVERALL EFFICIENCY</div>
                  <div className="px-4 py-2 bg-[#FF6A00]/20 border border-[#FF6A00]/50 text-[#FF6A00] text-xs font-bold uppercase">
                    +3.2% THIS MONTH
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Fulfillment Ops Tab */}
          <TabsContent value="fulfillment" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">FULFILLMENT OPERATIONS</h2>
            <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6">
              <div className="text-center py-12">
                <Rocket className="w-12 h-12 mx-auto text-[#FF6A00] mb-4" />
                <p className="text-white">Advanced fulfillment operations dashboard deploying</p>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">VELOCITY ANALYTICS</h2>
            <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6">
              <div className="text-center py-12">
                <BarChart className="w-12 h-12 mx-auto text-[#FF6A00] mb-4" />
                <p className="text-white">Advanced velocity analytics coming online</p>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">SYSTEM CONFIGURATION</h2>
            
            <div className="grid gap-6">
              <div className="bg-[#1E1E22] border border-[#00CED1]/30 p-6">
                <h3 className="text-lg font-black text-[#00CED1] uppercase mb-4">VELOCITY OPTIMIZATION</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">AUTO-ACCELERATION</span>
                    <div className="px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] text-xs font-bold">
                      ENABLED
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">PRIORITY PROCESSING</span>
                    <div className="px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] text-xs font-bold">
                      ACTIVE
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">VELOCITY MONITORING</span>
                    <div className="px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] text-xs font-bold">
                      REAL-TIME
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

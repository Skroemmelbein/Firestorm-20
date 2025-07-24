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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import TestMessageInterface from "@/components/TestMessageInterface";
import CampaignWizard from "@/components/CampaignWizard";
import TwilioStudioBuilder from "@/components/TwilioStudioBuilder";
import {
  MessageSquare,
  Phone,
  Users,
  TrendingUp,
  Target,
  Zap,
  Bot,
  Calendar,
  Send,
  Eye,
  Clock,
  DollarSign,
  BarChart,
  Settings,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  Upload,
  Brain,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Inbox,
  Outbox,
  Activity,
  Database,
  Flame,
  Rocket,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  type: "sms" | "voice" | "email" | "multi-channel";
  status: "draft" | "active" | "paused" | "completed";
  audience: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  conversions: number;
  revenue: number;
  schedule: Date;
  createdAt: Date;
  aiEnabled: boolean;
  responseRate: number;
}

interface AutoResponse {
  id: string;
  trigger: string;
  response: string;
  aiGenerated: boolean;
  conversationGoal: "lead" | "sale" | "support" | "retention";
  effectiveness: number;
  timesUsed: number;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: "active" | "opted-out" | "bounced";
  tags: string[];
  lastContact: Date;
  engagementScore: number;
  lifetimeValue: number;
  conversationHistory: any[];
}

export default function MarketingAutomation() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "HOLIDAY SURGE PROTOCOL",
      type: "multi-channel",
      status: "active",
      audience: "VIP TIER",
      sent: 15420,
      delivered: 15280,
      opened: 8642,
      clicked: 3210,
      conversions: 842,
      revenue: 67300,
      schedule: new Date(),
      createdAt: new Date(),
      aiEnabled: true,
      responseRate: 18.5,
    },
    {
      id: "2",
      name: "CART RECOVERY STRIKE",
      type: "sms",
      status: "active",
      audience: "ABANDONED TARGETS",
      sent: 892,
      delivered: 889,
      opened: 534,
      clicked: 198,
      conversions: 67,
      revenue: 8420,
      schedule: new Date(),
      createdAt: new Date(),
      aiEnabled: true,
      responseRate: 33.8,
    },
  ]);

  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([
    {
      id: "1",
      trigger: "STOP",
      response:
        "DISENGAGED. Contact terminated. Reply RESTART to reestablish connection.",
      aiGenerated: false,
      conversationGoal: "support",
      effectiveness: 95,
      timesUsed: 234,
    },
    {
      id: "2",
      trigger: "PRICE",
      response:
        "PRICING DATA: Entry tier $49. Analyzing your requirements for optimal solution match. Budget parameters?",
      aiGenerated: true,
      conversationGoal: "sale",
      effectiveness: 72,
      timesUsed: 1847,
    },
  ]);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedTab, setSelectedTab] = useState("campaigns");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [aiTraining, setAiTraining] = useState(false);

  // Real-time metrics
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgResponseRate =
    campaigns.reduce((sum, c) => sum + c.responseRate, 0) / campaigns.length;

  const trainAIResponses = async () => {
    setAiTraining(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setAiTraining(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white">
      {/* Command Center Header */}
      <div className="border-b border-[#FF6A00]/20 bg-black/90 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF6A00] via-[#FF2D55] to-[#FF6A00] flex items-center justify-center border border-[#FF6A00]/30 shadow-2xl shadow-[#FF6A00]/20">
                  <Flame className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-[#FF6A00]/20 animate-pulse border border-[#FF6A00]/50"></div>
              </div>
              <div>
                <h1 className="text-6xl font-black tracking-wider text-white mb-1">
                  FIRESTORM
                </h1>
                <div className="flex items-center gap-3">
                  <div className="h-1 w-16 bg-gradient-to-r from-[#FF6A00] to-[#FF2D55]"></div>
                  <p className="text-sm font-bold text-[#FF6A00] uppercase tracking-widest">
                    TACTICAL MARKETING ENGINE
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#1E1E22] border border-[#FF6A00]/30 px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#00E676] animate-pulse"></div>
                  <span className="text-xs font-bold text-[#00E676]">OPERATIONAL</span>
                </div>
              </div>
              <div className="bg-[#1E1E22] border border-[#FF6A00]/30 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-[#FF6A00]" />
                  <span className="text-xs font-bold text-white">AI ACTIVE</span>
                </div>
              </div>
              <div className="bg-[#1E1E22] border border-[#FF6A00]/30 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Database className="w-3 h-3 text-[#FF6A00]" />
                  <span className="text-xs font-bold text-white">LIVE SYNC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Control Dashboard */}
      <div className="container mx-auto px-6 py-8">
        {/* Critical Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1E1E22] border border-[#00E676]/30 p-6 hover:border-[#00E676] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
                TOTAL REVENUE
              </h3>
              <TrendingUp className="w-4 h-4 text-[#00E676]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[78%] h-full bg-[#00E676]"></div>
              </div>
              <span className="text-xs text-[#00E676] font-bold">+23.4%</span>
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6 hover:border-[#FF6A00] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
                CONVERSIONS
              </h3>
              <Target className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {totalConversions.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[65%] h-full bg-[#FF6A00]"></div>
              </div>
              <span className="text-xs text-[#FF6A00] font-bold">+18.2%</span>
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#FF2D55]/30 p-6 hover:border-[#FF2D55] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#FF2D55] uppercase tracking-wider">
                RESPONSE RATE
              </h3>
              <MessageSquare className="w-4 h-4 text-[#FF2D55]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {avgResponseRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[72%] h-full bg-[#FF2D55]"></div>
              </div>
              <span className="text-xs text-[#FF2D55] font-bold">AI-DRIVEN</span>
            </div>
          </div>

          <div className="bg-[#1E1E22] border border-[#FFD700]/30 p-6 hover:border-[#FFD700] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                ACTIVE OPERATIONS
              </h3>
              <Command className="w-4 h-4 text-[#FFD700]" />
            </div>
            <div className="text-3xl font-black text-white mb-2">
              {campaigns.filter((c) => c.status === "active").length}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-1 bg-[#1E1E22]">
                <div className="w-[100%] h-full bg-[#FFD700]"></div>
              </div>
              <span className="text-xs text-[#FFD700] font-bold">LIVE</span>
            </div>
          </div>
        </div>

        {/* Command Center Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-[#1E1E22] border border-[#FF6A00]/30 p-1">
            <TabsTrigger
              value="campaigns"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Target className="w-4 h-4 mr-2" />
              TACTICAL OPS
            </TabsTrigger>
            <TabsTrigger
              value="studio-flows"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Zap className="w-4 h-4 mr-2" />
              AI STUDIO FLOWS
            </TabsTrigger>
            <TabsTrigger
              value="journeys"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Brain className="w-4 h-4 mr-2" />
              LEAD JOURNEYS
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              ANALYSIS
            </TabsTrigger>
            <TabsTrigger
              value="audience"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              TARGETS
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <BarChart className="w-4 h-4 mr-2" />
              INTELLIGENCE
            </TabsTrigger>
            <TabsTrigger
              value="test"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Rocket className="w-4 h-4 mr-2" />
              TEST LAUNCH
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              CONTROL
            </TabsTrigger>
          </TabsList>

          {/* AI Studio Flows Tab */}
          <TabsContent value="studio-flows" className="space-y-6">
            <TwilioStudioBuilder />
          </TabsContent>

          {/* Lead Journeys Tab */}
          <TabsContent value="journeys" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Brain className="w-8 h-8 text-[#FF6A00]" />
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">LEAD JOURNEY MAPPING</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-[#1E1E22] border border-[#00E676]/30 p-6">
                <h3 className="text-lg font-black text-[#00E676] uppercase mb-4">ACTIVE JOURNEYS</h3>
                <div className="text-4xl font-black text-white mb-2">12</div>
                <div className="text-xs text-gray-400 uppercase">CONVERSION PATHS</div>
              </div>

              <div className="bg-[#1E1E22] border border-[#FFD700]/30 p-6">
                <h3 className="text-lg font-black text-[#FFD700] uppercase mb-4">CONVERSION RATE</h3>
                <div className="text-4xl font-black text-white mb-2">34.7%</div>
                <div className="text-xs text-gray-400 uppercase">AVERAGE ACROSS JOURNEYS</div>
              </div>

              <div className="bg-[#1E1E22] border border-[#FF2D55]/30 p-6">
                <h3 className="text-lg font-black text-[#FF2D55] uppercase mb-4">JOURNEY TIME</h3>
                <div className="text-4xl font-black text-white mb-2">4.2d</div>
                <div className="text-xs text-gray-400 uppercase">AVERAGE TO CONVERSION</div>
              </div>
            </div>

            <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-8">
              <h3 className="text-xl font-black text-[#FF6A00] uppercase mb-6">CUSTOMER JOURNEY FLOW</h3>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#00E676] to-[#32CD32] flex items-center justify-center mb-3">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-bold text-white">AWARENESS</div>
                  <div className="text-xs text-gray-400">2,847 leads</div>
                </div>
                <ArrowRight className="w-6 h-6 text-[#FF6A00]" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center mb-3">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-bold text-white">INTEREST</div>
                  <div className="text-xs text-gray-400">1,234 engaged</div>
                </div>
                <ArrowRight className="w-6 h-6 text-[#FF6A00]" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FF6A00] to-[#FF2D55] flex items-center justify-center mb-3">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-bold text-white">CONSIDERATION</div>
                  <div className="text-xs text-gray-400">567 prospects</div>
                </div>
                <ArrowRight className="w-6 h-6 text-[#FF6A00]" />
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#8A2BE2] to-[#FF69B4] flex items-center justify-center mb-3">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-sm font-bold text-white">CONVERSION</div>
                  <div className="text-xs text-gray-400">198 customers</div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tactical Operations Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">ACTIVE CAMPAIGNS</h2>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="border-[#FF6A00]/50 text-[#FF6A00] hover:bg-[#FF6A00] hover:text-black transition-colors"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  FILTER
                </Button>
                <Button className="bg-gradient-to-r from-[#FF6A00] to-[#FF2D55] text-black font-bold hover:from-[#FF2D55] hover:to-[#FF6A00] transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  DEPLOY CAMPAIGN
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6 hover:border-[#FF6A00] transition-all hover:shadow-lg hover:shadow-[#FF6A00]/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-3 h-3",
                          campaign.status === "active"
                            ? "bg-[#00E676] shadow-lg shadow-[#00E676]/50"
                            : campaign.status === "paused"
                              ? "bg-[#FFD700] shadow-lg shadow-[#FFD700]/50"
                              : campaign.status === "completed"
                                ? "bg-[#FF6A00] shadow-lg shadow-[#FF6A00]/50"
                                : "bg-gray-500",
                        )}
                      />
                      <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-wide">
                          {campaign.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="px-3 py-1 bg-[#FF6A00]/20 border border-[#FF6A00]/50 text-[#FF6A00] text-xs font-bold uppercase">
                            {campaign.type}
                          </div>
                          <div className="text-white text-sm font-bold">
                            TARGET: {campaign.audience}
                          </div>
                          {campaign.aiEnabled && (
                            <div className="px-3 py-1 bg-[#FF2D55]/20 border border-[#FF2D55]/50 text-[#FF2D55] text-xs font-bold uppercase">
                              AI ENABLED
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-[#FF6A00]/50 text-[#FF6A00] hover:bg-[#FF6A00] hover:text-black"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-[#FF6A00]/50 text-[#FF6A00] hover:bg-[#FF6A00] hover:text-black"
                      >
                        {campaign.status === "active" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#00E676]">
                        {campaign.sent.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        DEPLOYED
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#FFD700]">
                        {campaign.delivered.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        DELIVERED
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#FF6A00]">
                        {campaign.opened.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        ENGAGED
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#FF2D55]">
                        {campaign.clicked.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        ACTIONS
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-[#00E676]">
                        {campaign.conversions.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        CONVERSIONS
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">
                        ${campaign.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 font-bold uppercase">
                        REVENUE
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">DELIVERY RATE</span>
                      <span className="text-sm font-bold text-[#00E676]">
                        {((campaign.delivered / campaign.sent) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#1E1E22]">
                      <div 
                        className="h-full bg-[#00E676]"
                        style={{ width: `${(campaign.delivered / campaign.sent) * 100}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">CONVERSION RATE</span>
                      <span className="text-sm font-bold text-[#FF6A00]">
                        {((campaign.conversions / campaign.sent) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#1E1E22]">
                      <div 
                        className="h-full bg-[#FF6A00]"
                        style={{ width: `${(campaign.conversions / campaign.sent) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">PERFORMANCE ANALYSIS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#1E1E22] border border-[#00E676]/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#00E676] uppercase tracking-wider">
                    REVENUE GENERATION
                  </h3>
                  <DollarSign className="w-4 h-4 text-[#00E676]" />
                </div>
                <div className="text-3xl font-black text-white">$75,720</div>
                <div className="text-xs text-[#00E676] font-bold mt-2">+12% MONTH</div>
              </div>

              <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#FF6A00] uppercase tracking-wider">
                    MESSAGES DEPLOYED
                  </h3>
                  <Send className="w-4 h-4 text-[#FF6A00]" />
                </div>
                <div className="text-3xl font-black text-white">16,312</div>
                <div className="text-xs text-[#FF6A00] font-bold mt-2">98.7% DELIVERY</div>
              </div>

              <div className="bg-[#1E1E22] border border-[#FF2D55]/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#FF2D55] uppercase tracking-wider">
                    ENGAGEMENT RATE
                  </h3>
                  <Eye className="w-4 h-4 text-[#FF2D55]" />
                </div>
                <div className="text-3xl font-black text-white">23.4%</div>
                <div className="text-xs text-[#FF2D55] font-bold mt-2">ABOVE INDUSTRY</div>
              </div>

              <div className="bg-[#1E1E22] border border-[#FFD700]/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                    CONVERSION TOTAL
                  </h3>
                  <Target className="w-4 h-4 text-[#FFD700]" />
                </div>
                <div className="text-3xl font-black text-white">909</div>
                <div className="text-xs text-[#FFD700] font-bold mt-2">5.6% RATE</div>
              </div>
            </div>
          </TabsContent>

          {/* Targets Tab */}
          <TabsContent value="audience" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">TARGET MANAGEMENT</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-[#1E1E22] border border-[#00E676]/30 p-6">
                <h3 className="text-lg font-black text-[#00E676] uppercase mb-4">VIP TIER</h3>
                <div className="text-4xl font-black text-white mb-2">2,847</div>
                <div className="text-xs text-gray-400 uppercase">HIGH-VALUE TARGETS</div>
              </div>
              
              <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6">
                <h3 className="text-lg font-black text-[#FF6A00] uppercase mb-4">ABANDONED CARTS</h3>
                <div className="text-4xl font-black text-white mb-2">1,234</div>
                <div className="text-xs text-gray-400 uppercase">RECOVERY READY</div>
              </div>
              
              <div className="bg-[#1E1E22] border border-[#FF2D55]/30 p-6">
                <h3 className="text-lg font-black text-[#FF2D55] uppercase mb-4">NEW ACQUISITIONS</h3>
                <div className="text-4xl font-black text-white mb-2">5,692</div>
                <div className="text-xs text-gray-400 uppercase">FRESH LEADS</div>
              </div>
            </div>
          </TabsContent>

          {/* Intelligence Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">TACTICAL INTELLIGENCE</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6">
                <h3 className="text-lg font-black text-[#FF6A00] uppercase mb-6">REVENUE BY CHANNEL</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">SMS OPERATIONS</span>
                    <span className="text-lg font-black text-[#00E676]">$45,200</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E1E22]">
                    <div className="w-[75%] h-full bg-[#00E676]"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">VOICE CAMPAIGNS</span>
                    <span className="text-lg font-black text-[#FF6A00]">$22,100</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E1E22]">
                    <div className="w-[45%] h-full bg-[#FF6A00]"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">MULTI-CHANNEL</span>
                    <span className="text-lg font-black text-[#FF2D55]">$8,420</span>
                  </div>
                  <div className="w-full h-2 bg-[#1E1E22]">
                    <div className="w-[20%] h-full bg-[#FF2D55]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E1E22] border border-[#FF2D55]/30 p-6">
                <h3 className="text-lg font-black text-[#FF2D55] uppercase mb-6">AI EFFECTIVENESS</h3>
                <div className="text-center">
                  <div className="text-6xl font-black text-white mb-4">87.3%</div>
                  <div className="text-sm text-gray-400 uppercase mb-4">AI RESPONSE SUCCESS RATE</div>
                  <div className="px-4 py-2 bg-[#FF2D55]/20 border border-[#FF2D55]/50 text-[#FF2D55] text-xs font-bold uppercase">
                    +12% THIS MONTH
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Test Launch Tab */}
          <TabsContent value="test" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Rocket className="w-8 h-8 text-[#FF6A00]" />
              <h2 className="text-2xl font-black text-white uppercase tracking-wide">TEST LAUNCH CENTER</h2>
            </div>
            <TestMessageInterface />
          </TabsContent>

          {/* Control Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wide">SYSTEM CONTROL</h2>
            
            <div className="grid gap-6">
              <div className="bg-[#1E1E22] border border-[#FF6A00]/30 p-6">
                <h3 className="text-lg font-black text-[#FF6A00] uppercase mb-4">INTEGRATION STATUS</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-[#00E676]/30">
                    <div>
                      <div className="font-bold text-white">TWILIO SMS</div>
                      <div className="text-sm text-[#FF6A00]">+1 (855) 960-0037</div>
                    </div>
                    <div className="px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] text-xs font-bold">
                      CONNECTED
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[#FF2D55]/30">
                    <div>
                      <div className="font-bold text-white">OPENAI INTEGRATION</div>
                      <div className="text-sm text-[#FF6A00]">GPT-3.5 TURBO</div>
                    </div>
                    <div className="px-3 py-1 bg-[#00E676]/20 border border-[#00E676]/50 text-[#00E676] text-xs font-bold">
                      ACTIVE
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1E1E22] border border-[#FF2D55]/30 p-6">
                <h3 className="text-lg font-black text-[#FF2D55] uppercase mb-4">AI CONFIGURATION</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">AUTO-RESPONSE SYSTEM</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#FF2D55]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">SENTIMENT ANALYSIS</span>
                    <Switch defaultChecked className="data-[state=checked]:bg-[#FF2D55]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">LEAD SCORING</span>
                    <Switch className="data-[state=checked]:bg-[#FF2D55]" />
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

export default MarketingAutomation;

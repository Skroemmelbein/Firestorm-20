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
  Flame,
  Target,
  Users,
  MessageSquare,
  Mail,
  Phone,
  BarChart,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Brain,
  Settings,
  Play,
  Pause,
  Square,
  Edit,
  Eye,
  Plus,
  ArrowRight,
  Command,
  Shield,
  Rocket,
  Network,
} from "lucide-react";
import TwilioSegmentAudience from "@/components/TwilioSegmentAudience";
import CampaignBuilder from "@/components/CampaignBuilder";
import EmailTemplateDesigner from "@/components/EmailTemplateDesigner";
import SMSTemplateLibrary from "@/components/SMSTemplateLibrary";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms" | "voice" | "multi";
  status: "active" | "paused" | "draft" | "completed";
  reach: number;
  engagement: number;
  conversion: number;
  lastRun: Date;
}

interface FlowStep {
  id: string;
  type: "trigger" | "condition" | "action" | "delay";
  label: string;
  config: any;
}

interface Flow {
  id: string;
  name: string;
  status: "active" | "draft" | "paused";
  steps: FlowStep[];
  subscribers: number;
  conversions: number;
}

export default function MarketingAutomation() {
  const [selectedTab, setSelectedTab] = useState("command");
  const [campaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Enterprise Onboarding Sequence",
      type: "multi",
      status: "active",
      reach: 2847,
      engagement: 89.4,
      conversion: 23.7,
      lastRun: new Date("2024-01-15"),
    },
    {
      id: "2", 
      name: "Weekly Performance Brief",
      type: "email",
      status: "active",
      reach: 1236,
      engagement: 94.2,
      conversion: 31.8,
      lastRun: new Date("2024-01-14"),
    },
    {
      id: "3",
      name: "Retention Campaign Alpha",
      type: "sms",
      status: "paused",
      reach: 892,
      engagement: 76.3,
      conversion: 18.9,
      lastRun: new Date("2024-01-13"),
    },
  ]);

  const [flows] = useState<Flow[]>([
    {
      id: "1",
      name: "Lead Qualification Protocol",
      status: "active",
      steps: [],
      subscribers: 1847,
      conversions: 394,
    },
    {
      id: "2",
      name: "Customer Retention Engine",
      status: "active", 
      steps: [],
      subscribers: 3291,
      conversions: 721,
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "paused":
        return "#F59E0B";
      case "draft":
        return "#6B7280";
      case "completed":
        return "#8B5CF6";
      default:
        return "#EF4444";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail;
      case "sms":
        return MessageSquare;
      case "voice":
        return Phone;
      case "multi":
        return Network;
      default:
        return Target;
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] firestorm-theme">
      {/* FIRESTORM Command Header */}
      <div className="f10-command-header" style={{ background: "linear-gradient(135deg, #1a0a00 0%, #2d1600 100%)" }}>
        <div className="f10-command-title">
          <Flame className="w-8 h-8 text-[#FF6A00]" />
          <div>
            <h1 className="f10-heading-lg text-white">FIRESTORM</h1>
            <p className="f10-command-subtitle">Marketing Automation Command Center</p>
          </div>
        </div>
        <div className="f10-command-status">
          <div className="f10-env-status">
            <div className="f10-status-dot"></div>
            <span>All Campaigns Operational</span>
          </div>
          <div className="f10-env-status">
            <Activity className="w-4 h-4" />
            <span>Real-Time Tracking: Active</span>
          </div>
        </div>
      </div>

      <div className="f10-ops-zone">
        {/* Command Metrics */}
        <div className="f10-grid-4 mb-8">
          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Active Campaigns</span>
              <Flame className="w-4 h-4 text-[#FF6A00]" />
            </div>
            <div className="f10-metric-value text-[#FF6A00]">
              {campaigns.filter(c => c.status === 'active').length}
            </div>
            <div className="f10-metric-trend positive">
              <TrendingUp className="w-3 h-3" />
              <span>+2 this week</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Total Reach</span>
              <Users className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">
              {campaigns.reduce((sum, c) => sum + c.reach, 0).toLocaleString()}
            </div>
            <div className="f10-metric-trend positive">
              <span>This month</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Avg Engagement</span>
              <Target className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">
              {(campaigns.reduce((sum, c) => sum + c.engagement, 0) / campaigns.length).toFixed(1)}%
            </div>
            <div className="f10-metric-trend positive">
              <span>Above target</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Conversion Rate</span>
              <Zap className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">
              {(campaigns.reduce((sum, c) => sum + c.conversion, 0) / campaigns.length).toFixed(1)}%
            </div>
            <div className="f10-metric-trend positive">
              <span>Optimized</span>
            </div>
          </div>
        </div>

        {/* Command Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8 bg-[#1a1a1a] border border-[#FF6A00]/30">
            <TabsTrigger
              value="builder"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Zap className="w-4 h-4 mr-2" />
              Campaign Builder
            </TabsTrigger>
            <TabsTrigger
              value="email-templates"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Templates
            </TabsTrigger>
            <TabsTrigger
              value="sms-templates"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS Templates
            </TabsTrigger>
            <TabsTrigger
              value="command"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Command className="w-4 h-4 mr-2" />
              Campaign Command
            </TabsTrigger>
            <TabsTrigger
              value="segments"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Segment & Audiences
            </TabsTrigger>
            <TabsTrigger
              value="studio"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Brain className="w-4 h-4 mr-2" />
              Studio Flows
            </TabsTrigger>
            <TabsTrigger
              value="journeys"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Lead Journeys
            </TabsTrigger>
            <TabsTrigger
              value="intel"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <BarChart className="w-4 h-4 mr-2" />
              Campaign Intel
            </TabsTrigger>
          </TabsList>

          {/* Campaign Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <CampaignBuilder />
          </TabsContent>

          {/* Email Templates Tab */}
          <TabsContent value="email-templates" className="space-y-6">
            <EmailTemplateDesigner />
          </TabsContent>

          {/* Campaign Command Tab */}
          <TabsContent value="command" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="f10-heading-md text-white">Campaign Command Center</h2>
                <p className="f10-text-sm text-[#b3b3b3] mt-1">Deploy, monitor, and control marketing operations</p>
              </div>
              <div className="flex gap-3">
                <Button className="f10-btn f10-btn-secondary">
                  <Eye className="w-4 h-4 mr-2" />
                  Monitor All
                </Button>
                <Button className="f10-btn accent-bg text-black font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Deploy Campaign
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {campaigns.map((campaign) => {
                const TypeIcon = getTypeIcon(campaign.type);
                return (
                  <div key={campaign.id} className="f10-card hover:accent-glow transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[#FF6A00]/20">
                          <TypeIcon className="w-5 h-5 text-[#FF6A00]" />
                        </div>
                        <div>
                          <h3 className="f10-text-lg font-semibold text-white">{campaign.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div
                              className="f10-status"
                              style={{
                                backgroundColor: `${getStatusColor(campaign.status)}20`,
                                color: getStatusColor(campaign.status),
                                borderColor: `${getStatusColor(campaign.status)}40`
                              }}
                            >
                              {campaign.status.toUpperCase()}
                            </div>
                            <span className="f10-text-xs text-[#737373]">
                              {campaign.type.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          {campaign.status === 'active' ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="f10-text-base font-semibold text-[#00E676]">
                          {campaign.reach.toLocaleString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">REACH</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-base font-semibold text-[#00BFFF]">
                          {campaign.engagement}%
                        </div>
                        <div className="f10-text-xs text-[#737373]">ENGAGEMENT</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-base font-semibold text-[#FF6A00]">
                          {campaign.conversion}%
                        </div>
                        <div className="f10-text-xs text-[#737373]">CONVERSION</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-base font-semibold text-white">
                          {campaign.lastRun.toLocaleDateString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">LAST RUN</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Segment & Audiences Tab */}
          <TabsContent value="segments" className="space-y-6">
            <TwilioSegmentAudience />
          </TabsContent>

          {/* Studio Flows Tab */}
          <TabsContent value="studio" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="f10-heading-md text-white">Studio Flow Builder</h2>
                <p className="f10-text-sm text-[#b3b3b3] mt-1">Create AI-powered conversation flows</p>
              </div>
              <Button className="f10-btn accent-bg text-black font-medium">
                <Plus className="w-4 h-4 mr-2" />
                Create Flow
              </Button>
            </div>

            <div className="space-y-4">
              {flows.map((flow) => (
                <div key={flow.id} className="f10-card hover:accent-glow transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-[#8A2BE2]/20">
                        <Brain className="w-5 h-5 text-[#8A2BE2]" />
                      </div>
                      <div>
                        <h3 className="f10-text-lg font-semibold text-white">{flow.name}</h3>
                        <div
                          className="f10-status mt-1"
                          style={{
                            backgroundColor: `${getStatusColor(flow.status)}20`,
                            color: getStatusColor(flow.status),
                            borderColor: `${getStatusColor(flow.status)}40`
                          }}
                        >
                          {flow.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#737373]" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="f10-text-base font-semibold text-[#00BFFF]">
                        {flow.subscribers.toLocaleString()}
                      </div>
                      <div className="f10-text-xs text-[#737373]">SUBSCRIBERS</div>
                    </div>
                    <div className="text-center">
                      <div className="f10-text-base font-semibold text-[#00E676]">
                        {flow.conversions}
                      </div>
                      <div className="f10-text-xs text-[#737373]">CONVERSIONS</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Lead Journeys Tab */}
          <TabsContent value="journeys" className="space-y-6">
            <div className="text-center py-12">
              <Rocket className="w-16 h-16 mx-auto text-[#FF6A00] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">Lead Journey Engine</h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                Advanced lead journey mapping and automation system coming online
              </p>
              <Button className="f10-btn accent-bg text-black font-medium mt-6">
                <Settings className="w-4 h-4 mr-2" />
                Configure Journeys
              </Button>
            </div>
          </TabsContent>

          {/* Campaign Intel Tab */}
          <TabsContent value="intel" className="space-y-6">
            <div className="text-center py-12">
              <BarChart className="w-16 h-16 mx-auto text-[#FF6A00] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">Campaign Intelligence</h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                Advanced analytics and AI-powered insights for campaign optimization
              </p>
              <Button className="f10-btn accent-bg text-black font-medium mt-6">
                <Brain className="w-4 h-4 mr-2" />
                Access Intel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

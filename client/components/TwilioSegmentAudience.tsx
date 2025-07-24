import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Target,
  Brain,
  Activity,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  BarChart,
  Zap,
  Filter,
  Search,
  Clock,
  TrendingUp,
  Layers,
  Network,
  Globe,
} from "lucide-react";

interface Segment {
  id: string;
  name: string;
  description: string;
  type: "behavioral" | "demographic" | "psychographic" | "geographic";
  status: "active" | "inactive" | "building";
  audienceSize: number;
  lastUpdated: Date;
  criteria: string[];
  conversionRate: number;
  engagementScore: number;
}

interface Audience {
  id: string;
  name: string;
  description: string;
  source: "segment" | "warehouse" | "generative_ai";
  status: "active" | "inactive" | "syncing";
  totalContacts: number;
  reachableContacts: number;
  lastSync: Date;
  destinations: string[];
  segments: string[];
}

interface SegmentMetrics {
  totalSegments: number;
  activeAudiences: number;
  totalContacts: number;
  avgEngagement: number;
  dataPointsProcessed: number;
  realTimeEvents: number;
}

export default function TwilioSegmentAudience() {
  const [selectedTab, setSelectedTab] = useState("segments");
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("checking");

  const [segments] = useState<Segment[]>([
    {
      id: "SEG001",
      name: "High-Value Enterprise Prospects",
      description: "Companies with 250+ employees showing premium product interest",
      type: "behavioral",
      status: "active",
      audienceSize: 2847,
      lastUpdated: new Date("2024-01-15T10:30:00"),
      criteria: ["company_size > 250", "viewed_enterprise_pricing", "demo_requested"],
      conversionRate: 23.4,
      engagementScore: 87.6,
    },
    {
      id: "SEG002",
      name: "Retention Risk - Premium Users",
      description: "Premium users with declining engagement patterns",
      type: "behavioral",
      status: "active",
      audienceSize: 1234,
      lastUpdated: new Date("2024-01-15T09:15:00"),
      criteria: ["subscription = premium", "login_frequency < 0.3", "support_tickets > 2"],
      conversionRate: 15.7,
      engagementScore: 34.2,
    },
    {
      id: "SEG003",
      name: "Mobile-First Generation Z",
      description: "Gen Z users primarily engaging via mobile channels",
      type: "demographic",
      status: "building",
      audienceSize: 5692,
      lastUpdated: new Date("2024-01-15T08:45:00"),
      criteria: ["age_range = 18-25", "mobile_sessions > 80%", "social_referrals > 0"],
      conversionRate: 31.8,
      engagementScore: 92.4,
    },
  ]);

  const [audiences] = useState<Audience[]>([
    {
      id: "AUD001",
      name: "Enterprise Onboarding Campaign",
      description: "Targeted onboarding sequence for enterprise prospects",
      source: "segment",
      status: "active",
      totalContacts: 2847,
      reachableContacts: 2691,
      lastSync: new Date("2024-01-15T10:35:00"),
      destinations: ["SendGrid", "Twilio SMS", "Slack"],
      segments: ["SEG001"],
    },
    {
      id: "AUD002",
      name: "Retention Recovery Initiative",
      description: "Win-back campaign for at-risk premium subscribers",
      source: "segment",
      status: "syncing",
      totalContacts: 1234,
      reachableContacts: 1156,
      lastSync: new Date("2024-01-15T10:20:00"),
      destinations: ["SendGrid", "Twilio Voice"],
      segments: ["SEG002"],
    },
    {
      id: "AUD003",
      name: "Gen Z Mobile Experience",
      description: "Mobile-optimized engagement for Gen Z users",
      source: "generative_ai",
      status: "active",
      totalContacts: 5692,
      reachableContacts: 5483,
      lastSync: new Date("2024-01-15T10:10:00"),
      destinations: ["Twilio SMS", "Push Notifications", "TikTok"],
      segments: ["SEG003"],
    },
  ]);

  const metrics: SegmentMetrics = {
    totalSegments: segments.length,
    activeAudiences: audiences.filter(a => a.status === 'active').length,
    totalContacts: audiences.reduce((sum, a) => sum + a.totalContacts, 0),
    avgEngagement: segments.reduce((sum, s) => sum + s.engagementScore, 0) / segments.length,
    dataPointsProcessed: 847293,
    realTimeEvents: 12456,
  };

  const checkConnection = async () => {
    // Simulate connection check
    setConnectionStatus("checking");
    setTimeout(() => {
      setIsConnected(false);
      setConnectionStatus("disconnected");
    }, 1000);
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "inactive":
        return "#6B7280";
      case "building":
      case "syncing":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return CheckCircle;
      case "inactive":
        return XCircle;
      case "building":
      case "syncing":
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "behavioral":
        return "#3B82F6";
      case "demographic":
        return "#8B5CF6";
      case "psychographic":
        return "#F59E0B";
      case "geographic":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case "segment":
        return Target;
      case "warehouse":
        return Database;
      case "generative_ai":
        return Brain;
      default:
        return Users;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="f10-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-[#FF6A00]" />
              Twilio Segment & Audiences
            </div>
            <Badge
              style={{
                backgroundColor: isConnected ? "#10B98120" : "#EF444420",
                color: isConnected ? "#10B981" : "#EF4444",
                borderColor: isConnected ? "#10B98140" : "#EF444440"
              }}
            >
              {isConnected ? "Connected" : "Setup Required"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <div className="text-center py-6">
              <Globe className="w-12 h-12 mx-auto text-[#737373] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Connect Twilio Segment</h3>
              <p className="text-sm text-[#b3b3b3] mb-4 max-w-md mx-auto">
                Connect your Twilio Segment workspace to unlock advanced customer segmentation and audience targeting
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#b3b3b3]">Segment Write Key</Label>
                    <Input 
                      placeholder="Your Segment write key"
                      className="bg-[#1a1a1a] border-[#333333] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#b3b3b3]">Workspace Token</Label>
                    <Input 
                      placeholder="Your workspace access token"
                      className="bg-[#1a1a1a] border-[#333333] text-white"
                    />
                  </div>
                </div>
                <Button className="f10-btn accent-bg text-black font-medium">
                  <Zap className="w-4 h-4 mr-2" />
                  Connect Segment
                </Button>
              </div>
            </div>
          ) : (
            <div className="f10-grid-4">
              <div className="f10-metric-card">
                <div className="f10-metric-header">
                  <span className="f10-metric-title">Total Segments</span>
                  <Target className="w-4 h-4 text-[#FF6A00]" />
                </div>
                <div className="f10-metric-value text-[#FF6A00]">
                  {metrics.totalSegments}
                </div>
                <div className="f10-metric-trend positive">
                  <span>Active & building</span>
                </div>
              </div>

              <div className="f10-metric-card">
                <div className="f10-metric-header">
                  <span className="f10-metric-title">Active Audiences</span>
                  <Users className="w-4 h-4 text-[#737373]" />
                </div>
                <div className="f10-metric-value">
                  {metrics.activeAudiences}
                </div>
                <div className="f10-metric-trend positive">
                  <span>Synchronized</span>
                </div>
              </div>

              <div className="f10-metric-card">
                <div className="f10-metric-header">
                  <span className="f10-metric-title">Total Contacts</span>
                  <Database className="w-4 h-4 text-[#737373]" />
                </div>
                <div className="f10-metric-value">
                  {metrics.totalContacts.toLocaleString()}
                </div>
                <div className="f10-metric-trend positive">
                  <span>Across all audiences</span>
                </div>
              </div>

              <div className="f10-metric-card">
                <div className="f10-metric-header">
                  <span className="f10-metric-title">Avg Engagement</span>
                  <Activity className="w-4 h-4 text-[#737373]" />
                </div>
                <div className="f10-metric-value">
                  {metrics.avgEngagement.toFixed(1)}%
                </div>
                <div className="f10-metric-trend positive">
                  <span>High performance</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isConnected && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a] border border-[#FF6A00]/30">
            <TabsTrigger
              value="segments"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Target className="w-4 h-4 mr-2" />
              Customer Segments
            </TabsTrigger>
            <TabsTrigger
              value="audiences"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Engage Audiences
            </TabsTrigger>
            <TabsTrigger
              value="builder"
              className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Audience Builder
            </TabsTrigger>
          </TabsList>

          {/* Customer Segments Tab */}
          <TabsContent value="segments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="f10-heading-sm text-white">Customer Segments</h3>
                <p className="f10-text-sm text-[#b3b3b3] mt-1">Real-time behavioral and demographic segments</p>
              </div>
              <div className="flex gap-3">
                <Button className="f10-btn f10-btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export Segments
                </Button>
                <Button className="f10-btn accent-bg text-black font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Segment
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {segments.map((segment) => {
                const StatusIcon = getStatusIcon(segment.status);
                return (
                  <div key={segment.id} className="f10-card hover:accent-glow transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[#FF6A00]/20">
                          <Target className="w-5 h-5 text-[#FF6A00]" />
                        </div>
                        <div>
                          <h4 className="f10-text-lg font-semibold text-white">{segment.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div
                              className="f10-status"
                              style={{
                                backgroundColor: `${getStatusColor(segment.status)}20`,
                                color: getStatusColor(segment.status),
                                borderColor: `${getStatusColor(segment.status)}40`
                              }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {segment.status.toUpperCase()}
                            </div>
                            <div
                              className="f10-status"
                              style={{
                                backgroundColor: `${getTypeColor(segment.type)}20`,
                                color: getTypeColor(segment.type),
                                borderColor: `${getTypeColor(segment.type)}40`
                              }}
                            >
                              {segment.type.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <BarChart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="f10-text-sm text-[#b3b3b3] mb-4">{segment.description}</p>

                    <div className="grid grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#00E676]">
                          {segment.audienceSize.toLocaleString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">AUDIENCE SIZE</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#00BFFF]">
                          {segment.conversionRate}%
                        </div>
                        <div className="f10-text-xs text-[#737373]">CONVERSION RATE</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#FF6A00]">
                          {segment.engagementScore}
                        </div>
                        <div className="f10-text-xs text-[#737373]">ENGAGEMENT SCORE</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-white">
                          {segment.lastUpdated.toLocaleTimeString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">LAST UPDATED</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Engage Audiences Tab */}
          <TabsContent value="audiences" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="f10-heading-sm text-white">Engage Audiences</h3>
                <p className="f10-text-sm text-[#b3b3b3] mt-1">Activated audiences for multi-channel campaigns</p>
              </div>
              <div className="flex gap-3">
                <Button className="f10-btn f10-btn-secondary">
                  <Upload className="w-4 h-4 mr-2" />
                  Sync All
                </Button>
                <Button className="f10-btn accent-bg text-black font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Audience
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {audiences.map((audience) => {
                const StatusIcon = getStatusIcon(audience.status);
                const SourceIcon = getSourceIcon(audience.source);
                return (
                  <div key={audience.id} className="f10-card hover:accent-glow transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[#8A2BE2]/20">
                          <SourceIcon className="w-5 h-5 text-[#8A2BE2]" />
                        </div>
                        <div>
                          <h4 className="f10-text-lg font-semibold text-white">{audience.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <div
                              className="f10-status"
                              style={{
                                backgroundColor: `${getStatusColor(audience.status)}20`,
                                color: getStatusColor(audience.status),
                                borderColor: `${getStatusColor(audience.status)}40`
                              }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {audience.status.toUpperCase()}
                            </div>
                            <span className="f10-text-xs text-[#737373]">
                              {audience.source.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="f10-text-sm text-[#b3b3b3] mb-4">{audience.description}</p>

                    <div className="grid grid-cols-4 gap-6 mb-4">
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#00E676]">
                          {audience.totalContacts.toLocaleString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">TOTAL CONTACTS</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#00BFFF]">
                          {audience.reachableContacts.toLocaleString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">REACHABLE</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#FF6A00]">
                          {audience.destinations.length}
                        </div>
                        <div className="f10-text-xs text-[#737373]">DESTINATIONS</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-white">
                          {audience.lastSync.toLocaleTimeString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">LAST SYNC</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {audience.destinations.map((dest, index) => (
                        <Badge
                          key={index}
                          className="bg-[#00CED1]/20 text-[#00CED1] border-[#00CED1]/40"
                        >
                          {dest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* AI Audience Builder Tab */}
          <TabsContent value="builder" className="space-y-6">
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto text-[#FF6A00] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">AI-Powered Audience Builder</h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto mb-6">
                Use natural language to describe your ideal audience and let AI build the perfect segment
              </p>
              <div className="max-w-md mx-auto space-y-4">
                <Input
                  placeholder="Describe your audience: 'Users who viewed pricing but didn't convert'"
                  className="bg-[#1a1a1a] border-[#333333] text-white"
                />
                <Button className="f10-btn accent-bg text-black font-medium w-full">
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Audience with AI
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

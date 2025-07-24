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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Network,
  Database,
  Cloud,
  Zap,
  Shield,
  Settings,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Command,
  Link,
  Server,
  Globe,
  Lock,
  Key,
  Clock,
  TrendingUp,
  BarChart,
  Cpu,
  HardDrive,
  Wifi,
} from "lucide-react";
import TwilioSIDVault from "@/components/TwilioSIDVault";

interface Integration {
  id: string;
  name: string;
  type: "api" | "database" | "service" | "webhook";
  status: "connected" | "disconnected" | "error" | "pending";
  provider: string;
  description: string;
  lastSync: Date;
  endpoint?: string;
  health: number;
  requests: number;
  errorRate: number;
}

interface SystemMetrics {
  totalIntegrations: number;
  activeConnections: number;
  totalRequests: number;
  avgResponseTime: number;
  uptime: number;
  errorRate: number;
}

export default function Integrations() {
  const [selectedTab, setSelectedTab] = useState("command");
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Xano Database",
      type: "database",
      status: "connected",
      provider: "Xano",
      description: "Primary database for client data and operations",
      lastSync: new Date("2024-01-15T10:30:00"),
      endpoint: "https://api.xano.io/workspace/v1",
      health: 98.7,
      requests: 12847,
      errorRate: 0.3,
    },
    {
      id: "2",
      name: "Twilio Communications",
      type: "api",
      status: "connected",
      provider: "Twilio",
      description: "SMS, voice, and communication services",
      lastSync: new Date("2024-01-15T10:28:00"),
      endpoint: "https://api.twilio.com/2010-04-01",
      health: 99.2,
      requests: 8493,
      errorRate: 0.1,
    },
    {
      id: "3",
      name: "SendGrid Email",
      type: "service",
      status: "connected",
      provider: "SendGrid",
      description: "Email delivery and marketing automation",
      lastSync: new Date("2024-01-15T10:25:00"),
      endpoint: "https://api.sendgrid.com/v3",
      health: 97.8,
      requests: 5692,
      errorRate: 0.5,
    },
    {
      id: "4",
      name: "NMI Payment Gateway",
      type: "api",
      status: "connected",
      provider: "NMI",
      description: "Payment processing and recurring billing",
      lastSync: new Date("2024-01-15T10:20:00"),
      endpoint: "https://secure.nmi.com/api",
      health: 99.5,
      requests: 3847,
      errorRate: 0.2,
    },
    {
      id: "5",
      name: "OpenAI Intelligence",
      type: "api",
      status: "connected",
      provider: "OpenAI",
      description: "AI-powered automation and processing",
      lastSync: new Date("2024-01-15T10:15:00"),
      endpoint: "https://api.openai.com/v1",
      health: 96.4,
      requests: 2194,
      errorRate: 0.8,
    },
  ]);

  const metrics: SystemMetrics = {
    totalIntegrations: integrations.length,
    activeConnections: integrations.filter((i) => i.status === "connected")
      .length,
    totalRequests: integrations.reduce((sum, i) => sum + i.requests, 0),
    avgResponseTime: 245,
    uptime: 99.7,
    errorRate: 0.3,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "#10B981";
      case "disconnected":
        return "#6B7280";
      case "error":
        return "#EF4444";
      case "pending":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return CheckCircle;
      case "disconnected":
        return XCircle;
      case "error":
        return AlertTriangle;
      case "pending":
        return Clock;
      default:
        return XCircle;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "api":
        return Network;
      case "database":
        return Database;
      case "service":
        return Cloud;
      case "webhook":
        return Zap;
      default:
        return Network;
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    // Simulate connection test
    console.log(`Testing connection for integration: ${integrationId}`);
  };

  const handleRefreshSync = async (integrationId: string) => {
    // Simulate sync refresh
    console.log(`Refreshing sync for integration: ${integrationId}`);
  };

  return (
    <div className="min-h-screen bg-[#111111] nexus-theme">
      {/* NEXUS SYNC Command Header */}
      <div
        className="f10-command-header"
        style={{
          background: "linear-gradient(135deg, #001a1a 0%, #002d2d 100%)",
        }}
      >
        <div className="f10-command-title">
          <Network className="w-8 h-8 text-[#00CED1]" />
          <div>
            <h1 className="f10-heading-lg text-white">NEXUS SYNC</h1>
            <p className="f10-command-subtitle">
              Integration Command & Data Flow Control
            </p>
          </div>
        </div>
        <div className="f10-command-status">
          <div className="f10-env-status">
            <div className="f10-status-dot"></div>
            <span>
              {metrics.activeConnections}/{metrics.totalIntegrations} Systems
              Online
            </span>
          </div>
          <div className="f10-env-status">
            <Activity className="w-4 h-4" />
            <span>Data Flow: Active</span>
          </div>
        </div>
      </div>

      <div className="f10-ops-zone">
        {/* System Metrics */}
        <div className="f10-grid-4 mb-8">
          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Active Connections</span>
              <Network className="w-4 h-4 text-[#00CED1]" />
            </div>
            <div className="f10-metric-value text-[#00CED1]">
              {metrics.activeConnections}
            </div>
            <div className="f10-metric-trend positive">
              <span>All systems operational</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Total Requests</span>
              <BarChart className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">
              {metrics.totalRequests.toLocaleString()}
            </div>
            <div className="f10-metric-trend positive">
              <span>Last 24 hours</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Response Time</span>
              <Zap className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">{metrics.avgResponseTime}ms</div>
            <div className="f10-metric-trend positive">
              <span>Lightning fast</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">System Uptime</span>
              <TrendingUp className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">{metrics.uptime}%</div>
            <div className="f10-metric-trend positive">
              <span>Mission critical</span>
            </div>
          </div>
        </div>

        {/* Command Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5 bg-[#1a1a1a] border border-[#00CED1]/30">
            <TabsTrigger
              value="command"
              className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black text-white hover:text-[#00CED1] transition-colors"
            >
              <Command className="w-4 h-4 mr-2" />
              Integration Command
            </TabsTrigger>
            <TabsTrigger
              value="monitoring"
              className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black text-white hover:text-[#00CED1] transition-colors"
            >
              <Activity className="w-4 h-4 mr-2" />
              System Monitoring
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black text-white hover:text-[#00CED1] transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              Security Control
            </TabsTrigger>
            <TabsTrigger
              value="sid-vault"
              className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black text-white hover:text-[#00CED1] transition-colors"
            >
              <Database className="w-4 h-4 mr-2" />
              SID Vault
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#00CED1] data-[state=active]:text-black text-white hover:text-[#00CED1] transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              System Config
            </TabsTrigger>
          </TabsList>

          {/* Integration Command Tab */}
          <TabsContent value="command" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="f10-heading-md text-white">
                  Integration Command Center
                </h2>
                <p className="f10-text-sm text-[#b3b3b3] mt-1">
                  Manage API connections, data flows, and system integrations
                </p>
              </div>
              <div className="flex gap-3">
                <Button className="f10-btn f10-btn-secondary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync All
                </Button>
                <Button className="f10-btn accent-bg text-black font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Integration
                </Button>
              </div>
            </div>

            {/* Integration List */}
            <div className="space-y-4">
              {integrations.map((integration) => {
                const StatusIcon = getStatusIcon(integration.status);
                const TypeIcon = getTypeIcon(integration.type);

                return (
                  <div
                    key={integration.id}
                    className="f10-card hover:accent-glow transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[#00CED1]/20">
                          <TypeIcon className="w-5 h-5 text-[#00CED1]" />
                        </div>
                        <div>
                          <h3 className="f10-text-lg font-semibold text-white">
                            {integration.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div
                              className="f10-status"
                              style={{
                                backgroundColor: `${getStatusColor(integration.status)}20`,
                                color: getStatusColor(integration.status),
                                borderColor: `${getStatusColor(integration.status)}40`,
                              }}
                            >
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {integration.status.toUpperCase()}
                            </div>
                            <span className="f10-text-xs text-[#737373]">
                              {integration.type.toUpperCase()}
                            </span>
                            <span className="f10-text-xs text-[#737373]">
                              {integration.provider}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="f10-btn f10-btn-ghost"
                          onClick={() => handleTestConnection(integration.id)}
                        >
                          <Zap className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="f10-btn f10-btn-ghost"
                          onClick={() => handleRefreshSync(integration.id)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="f10-text-sm text-[#b3b3b3] mb-4">
                      {integration.description}
                    </p>

                    <div className="grid grid-cols-5 gap-6">
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#00E676]">
                          {integration.health}%
                        </div>
                        <div className="f10-text-xs text-[#737373]">HEALTH</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#00BFFF]">
                          {integration.requests.toLocaleString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">
                          REQUESTS
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#FFD700]">
                          {integration.errorRate}%
                        </div>
                        <div className="f10-text-xs text-[#737373]">
                          ERROR RATE
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-white">
                          {integration.lastSync.toLocaleTimeString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">
                          LAST SYNC
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#737373] truncate">
                          {integration.endpoint?.replace("https://", "")}
                        </div>
                        <div className="f10-text-xs text-[#737373]">
                          ENDPOINT
                        </div>
                      </div>
                    </div>

                    {/* Health Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="f10-text-xs text-[#737373]">
                          System Health
                        </span>
                        <span className="f10-text-xs font-medium text-white">
                          {integration.health}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-[#333333] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00CED1] transition-all"
                          style={{ width: `${integration.health}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* System Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto text-[#00CED1] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">
                Real-Time System Monitoring
              </h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                Advanced monitoring dashboard for API performance, data flows,
                and system health
              </p>
              <Button className="f10-btn accent-bg text-black font-medium mt-6">
                <Activity className="w-4 h-4 mr-2" />
                View Monitoring
              </Button>
            </div>
          </TabsContent>

          {/* Security Control Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto text-[#00CED1] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">
                Security Control Center
              </h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                API security, access control, and threat monitoring for all
                integrations
              </p>
              <Button className="f10-btn accent-bg text-black font-medium mt-6">
                <Shield className="w-4 h-4 mr-2" />
                Security Settings
              </Button>
            </div>
          </TabsContent>

          {/* SID Vault Tab */}
          <TabsContent value="sid-vault" className="space-y-6">
            <TwilioSIDVault />
          </TabsContent>

          {/* System Config Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 mx-auto text-[#00CED1] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">
                System Configuration
              </h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                Configure global settings, API limits, and system preferences
              </p>
              <Button className="f10-btn accent-bg text-black font-medium mt-6">
                <Settings className="w-4 h-4 mr-2" />
                System Config
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

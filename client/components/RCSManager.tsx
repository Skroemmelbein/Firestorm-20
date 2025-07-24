import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Smartphone,
  Globe,
  Settings,
  Activity,
  Send,
  Webhook,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Copy,
  ExternalLink,
  Image,
  Play,
  Users,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RCSAgent {
  id: string;
  name: string;
  status: 'active' | 'pending' | 'suspended' | 'unconfigured';
  agentId: string;
  businessName: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  capabilities: string[];
  webhookUrl?: string;
  lastActivity?: string;
  messagesSent: number;
  messagesReceived: number;
}

interface RCSMessage {
  id: string;
  type: 'text' | 'image' | 'card' | 'carousel';
  content: string;
  recipient: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  richContent?: any;
}

export default function RCSManager() {
  const [currentAgent, setCurrentAgent] = useState<RCSAgent>({
    id: "nexus-dynamics-1",
    name: "NexusDynamics",
    status: "unconfigured",
    agentId: "rcs:nexusdynamics_3ohzywua_agent",
    businessName: "NexusDynamics",
    verificationStatus: "pending",
    capabilities: ["TEXT", "RICH_CARD", "SUGGESTED_ACTIONS", "FILE_TRANSFER"],
    messagesSent: 0,
    messagesReceived: 0
  });

  const [isLoading, setIsLoading] = useState({
    configuring: false,
    testing: false,
    verifying: false
  });

  const [webhookConfig, setWebhookConfig] = useState({
    url: "https://your-domain.com/api/rcs/webhook",
    secret: "",
    events: ["MESSAGE_RECEIVED", "DELIVERY_RECEIPT", "READ_RECEIPT"]
  });

  const [testMessage, setTestMessage] = useState({
    recipient: "+18144409068",
    type: "text" as const,
    content: "Test message from ECELONX RCS system",
    richContent: null
  });

  const [recentMessages, setRecentMessages] = useState<RCSMessage[]>([
    {
      id: "1",
      type: "text",
      content: "Welcome to NexusDynamics RCS messaging!",
      recipient: "+18144409068",
      status: "delivered",
      timestamp: new Date().toISOString()
    }
  ]);

  const configureAgent = async () => {
    setIsLoading(prev => ({ ...prev, configuring: true }));
    try {
      const response = await fetch('/api/rcs/configure-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent.agentId,
          businessName: currentAgent.businessName,
          webhookUrl: webhookConfig.url,
          capabilities: currentAgent.capabilities
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentAgent(prev => ({
          ...prev,
          status: 'pending',
          webhookUrl: webhookConfig.url
        }));
        console.log('✅ RCS Agent configuration initiated');
      }
    } catch (error) {
      console.error('RCS Agent configuration failed:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, configuring: false }));
    }
  };

  const sendTestMessage = async () => {
    setIsLoading(prev => ({ ...prev, testing: true }));
    try {
      const response = await fetch('/api/rcs/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent.agentId,
          recipient: testMessage.recipient,
          type: testMessage.type,
          content: testMessage.content,
          richContent: testMessage.richContent
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const newMessage: RCSMessage = {
          id: Date.now().toString(),
          type: testMessage.type,
          content: testMessage.content,
          recipient: testMessage.recipient,
          status: 'sent',
          timestamp: new Date().toISOString(),
          richContent: testMessage.richContent
        };
        
        setRecentMessages(prev => [newMessage, ...prev]);
        setCurrentAgent(prev => ({
          ...prev,
          messagesSent: prev.messagesSent + 1
        }));
        
        console.log('✅ RCS Test message sent');
      }
    } catch (error) {
      console.error('RCS Test message failed:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, testing: false }));
    }
  };

  const verifyAgent = async () => {
    setIsLoading(prev => ({ ...prev, verifying: true }));
    try {
      const response = await fetch('/api/rcs/verify-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent.agentId
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentAgent(prev => ({
          ...prev,
          verificationStatus: result.status,
          status: result.status === 'verified' ? 'active' : 'pending'
        }));
      }
    } catch (error) {
      console.error('RCS Agent verification failed:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, verifying: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'suspended': return '#EF4444';
      case 'unconfigured': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'pending': return RefreshCw;
      case 'suspended': return AlertTriangle;
      case 'unconfigured': return Settings;
      default: return Settings;
    }
  };

  return (
    <Card className="f10-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#00E676]" />
          RCS Management Center - NexusDynamics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent Status Overview */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">Agent Status</h3>
              <p className="text-sm text-[#b3b3b3]">ID: {currentAgent.agentId}</p>
            </div>
            <div className="flex items-center gap-2">
              {React.createElement(getStatusIcon(currentAgent.status), {
                className: "w-5 h-5",
                style: { color: getStatusColor(currentAgent.status) }
              })}
              <Badge 
                className="uppercase text-xs"
                style={{
                  backgroundColor: `${getStatusColor(currentAgent.status)}20`,
                  color: getStatusColor(currentAgent.status),
                  borderColor: `${getStatusColor(currentAgent.status)}40`
                }}
              >
                {currentAgent.status}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00E676]">{currentAgent.messagesSent}</div>
              <div className="text-xs text-[#737373]">SENT</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00BFFF]">{currentAgent.messagesReceived}</div>
              <div className="text-xs text-[#737373]">RECEIVED</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#FFD700]">{currentAgent.capabilities.length}</div>
              <div className="text-xs text-[#737373]">CAPABILITIES</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: getStatusColor(currentAgent.verificationStatus) }}>
                {currentAgent.verificationStatus === 'verified' ? '✓' : '⏳'}
              </div>
              <div className="text-xs text-[#737373]">VERIFIED</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="configuration" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 glass-card corp-shadow">
            <TabsTrigger value="configuration" className="gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="messaging" className="gap-2">
              <Send className="w-4 h-4" />
              Messaging
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold text-white mb-3">Agent Details</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#b3b3b3]">Business Name</Label>
                    <Input
                      value={currentAgent.businessName}
                      onChange={(e) => setCurrentAgent(prev => ({
                        ...prev,
                        businessName: e.target.value
                      }))}
                      className="bg-[#0a0a0a] border-[#333333] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#b3b3b3]">Agent ID</Label>
                    <div className="flex gap-2">
                      <Input
                        value={currentAgent.agentId}
                        readOnly
                        className="bg-[#0a0a0a] border-[#333333] text-white font-mono text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(currentAgent.agentId)}
                        className="f10-btn"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#b3b3b3]">Capabilities</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentAgent.capabilities.map((cap) => (
                        <Badge key={cap} className="bg-[#00E676]/20 text-[#00E676] border-[#00E676]/40 text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-white mb-3">Actions</h4>
                <div className="space-y-3">
                  <Button
                    onClick={configureAgent}
                    disabled={isLoading.configuring}
                    className="w-full f10-btn accent-bg text-black"
                  >
                    {isLoading.configuring ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4 mr-2" />
                    )}
                    Configure Agent
                  </Button>
                  
                  <Button
                    onClick={verifyAgent}
                    disabled={isLoading.verifying}
                    className="w-full f10-btn f10-btn-secondary"
                  >
                    {isLoading.verifying ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    Verify Agent
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full f10-btn"
                    onClick={() => window.open('https://business-communications.cloud.google.com/console', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Google RBM Console
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Messaging Tab */}
          <TabsContent value="messaging" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-semibold text-white mb-3">Send Test Message</h4>
                <div className="space-y-3">
                  <div>
                    <Label className="text-[#b3b3b3]">Recipient Phone</Label>
                    <Input
                      value={testMessage.recipient}
                      onChange={(e) => setTestMessage(prev => ({
                        ...prev,
                        recipient: e.target.value
                      }))}
                      placeholder="+1234567890"
                      className="bg-[#0a0a0a] border-[#333333] text-white"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-[#b3b3b3]">Message Type</Label>
                    <Select
                      value={testMessage.type}
                      onValueChange={(value: any) => setTestMessage(prev => ({
                        ...prev,
                        type: value
                      }))}
                    >
                      <SelectTrigger className="bg-[#0a0a0a] border-[#333333] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Message</SelectItem>
                        <SelectItem value="image">Image Message</SelectItem>
                        <SelectItem value="card">Rich Card</SelectItem>
                        <SelectItem value="carousel">Carousel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-[#b3b3b3]">Message Content</Label>
                    <Textarea
                      value={testMessage.content}
                      onChange={(e) => setTestMessage(prev => ({
                        ...prev,
                        content: e.target.value
                      }))}
                      placeholder="Enter your message content..."
                      className="bg-[#0a0a0a] border-[#333333] text-white"
                      rows={3}
                    />
                  </div>
                  
                  <Button
                    onClick={sendTestMessage}
                    disabled={isLoading.testing || currentAgent.status !== 'active'}
                    className="w-full f10-btn accent-bg text-black"
                  >
                    {isLoading.testing ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Test Message
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold text-white mb-3">Recent Messages</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="bg-[#0a0a0a] border border-[#333333] rounded p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#00E676]/20 text-[#00E676] border-[#00E676]/40 text-xs">
                            {message.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-[#b3b3b3]">{message.recipient}</span>
                        </div>
                        <Badge
                          className="text-xs"
                          style={{
                            backgroundColor: message.status === 'delivered' ? '#10B98120' : '#F59E0B20',
                            color: message.status === 'delivered' ? '#10B981' : '#F59E0B',
                            borderColor: message.status === 'delivered' ? '#10B98140' : '#F59E0B40'
                          }}
                        >
                          {message.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-white">{message.content}</p>
                      <p className="text-xs text-[#737373] mt-1">
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card className="p-4">
              <h4 className="font-semibold text-white mb-3">Webhook Configuration</h4>
              <div className="space-y-4">
                <div>
                  <Label className="text-[#b3b3b3]">Webhook URL</Label>
                  <div className="flex gap-2">
                    <Input
                      value={webhookConfig.url}
                      onChange={(e) => setWebhookConfig(prev => ({
                        ...prev,
                        url: e.target.value
                      }))}
                      placeholder="https://your-domain.com/api/rcs/webhook"
                      className="bg-[#0a0a0a] border-[#333333] text-white"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(webhookConfig.url)}
                      className="f10-btn"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-[#b3b3b3]">Webhook Secret</Label>
                  <Input
                    type="password"
                    value={webhookConfig.secret}
                    onChange={(e) => setWebhookConfig(prev => ({
                      ...prev,
                      secret: e.target.value
                    }))}
                    placeholder="Enter webhook secret for verification"
                    className="bg-[#0a0a0a] border-[#333333] text-white"
                  />
                </div>

                <div>
                  <Label className="text-[#b3b3b3]">Event Types</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {webhookConfig.events.map((event) => (
                      <Badge key={event} className="bg-[#00BFFF]/20 text-[#00BFFF] border-[#00BFFF]/40">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg p-3">
                  <h5 className="font-semibold text-[#FFD700] mb-2">Webhook Endpoint</h5>
                  <code className="text-sm text-white font-mono">
                    POST /api/rcs/webhook
                  </code>
                  <p className="text-xs text-[#b3b3b3] mt-1">
                    This endpoint will handle incoming RCS events and messages
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-[#00E676] mb-2">{currentAgent.messagesSent}</div>
                <div className="text-sm text-[#b3b3b3]">Messages Sent</div>
                <div className="text-xs text-[#737373] mt-1">Last 30 days</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-[#00BFFF] mb-2">{currentAgent.messagesReceived}</div>
                <div className="text-sm text-[#b3b3b3]">Messages Received</div>
                <div className="text-xs text-[#737373] mt-1">Last 30 days</div>
              </Card>
              
              <Card className="p-4 text-center">
                <div className="text-3xl font-bold text-[#FFD700] mb-2">
                  {currentAgent.messagesSent > 0 ? Math.round((currentAgent.messagesReceived / currentAgent.messagesSent) * 100) : 0}%
                </div>
                <div className="text-sm text-[#b3b3b3]">Response Rate</div>
                <div className="text-xs text-[#737373] mt-1">Engagement metric</div>
              </Card>
            </div>

            <Card className="p-4">
              <h4 className="font-semibold text-white mb-3">RCS Features & Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-[#00E676] mb-2">Rich Media Support</h5>
                  <ul className="text-sm text-[#b3b3b3] space-y-1">
                    <li>• High-resolution images and videos</li>
                    <li>• Interactive rich cards and carousels</li>
                    <li>• File attachments up to 100MB</li>
                    <li>• Location sharing</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-[#00BFFF] mb-2">Enhanced Features</h5>
                  <ul className="text-sm text-[#b3b3b3] space-y-1">
                    <li>• Read receipts and typing indicators</li>
                    <li>• Suggested actions and quick replies</li>
                    <li>• Branded messaging experience</li>
                    <li>• Group messaging support</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

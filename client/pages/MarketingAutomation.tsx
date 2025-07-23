import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import TestMessageInterface from "@/components/TestMessageInterface";
import CampaignWizard from "@/components/CampaignWizard";
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
  Outbox
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  type: 'sms' | 'voice' | 'email' | 'multi-channel';
  status: 'draft' | 'active' | 'paused' | 'completed';
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
  conversationGoal: 'lead' | 'sale' | 'support' | 'retention';
  effectiveness: number;
  timesUsed: number;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: 'active' | 'opted-out' | 'bounced';
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
      name: "Holiday Sale Blast",
      type: "multi-channel",
      status: "active",
      audience: "VIP Customers",
      sent: 15420,
      delivered: 15280,
      opened: 8642,
      clicked: 3210,
      conversions: 842,
      revenue: 67300,
      schedule: new Date(),
      createdAt: new Date(),
      aiEnabled: true,
      responseRate: 18.5
    },
    {
      id: "2", 
      name: "Cart Abandonment Recovery",
      type: "sms",
      status: "active",
      audience: "Abandoned Carts",
      sent: 892,
      delivered: 889,
      opened: 534,
      clicked: 198,
      conversions: 67,
      revenue: 8420,
      schedule: new Date(),
      createdAt: new Date(),
      aiEnabled: true,
      responseRate: 33.8
    }
  ]);

  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>([
    {
      id: "1",
      trigger: "STOP",
      response: "You've been unsubscribed. We respect your choice. Reply RESTART to opt back in.",
      aiGenerated: false,
      conversationGoal: "support",
      effectiveness: 95,
      timesUsed: 234
    },
    {
      id: "2",
      trigger: "PRICE",
      response: "Great question! Our current pricing starts at $49. I'd love to show you our exclusive deals. What's your budget range?",
      aiGenerated: true,
      conversationGoal: "sale",
      effectiveness: 72,
      timesUsed: 1847
    }
  ]);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedTab, setSelectedTab] = useState("campaigns");
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [aiTraining, setAiTraining] = useState(false);

  // Real-time metrics
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgResponseRate = campaigns.reduce((sum, c) => sum + c.responseRate, 0) / campaigns.length;

  const trainAIResponses = async () => {
    setAiTraining(true);
    // Simulate AI training
    await new Promise(resolve => setTimeout(resolve, 3000));
    setAiTraining(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Marketing Automation</h1>
                <p className="text-sm text-muted-foreground">Fortune 10 Twilio + ChatGPT Marketing Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <Bot className="w-3 h-3 mr-1" />
                AI Active
              </Badge>
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                <MessageSquare className="w-3 h-3 mr-1" />
                Twilio Connected
              </Badge>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                ${totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                <ArrowUp className="w-3 h-3 mr-1" />
                +23.4% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {totalConversions.toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                <ArrowUp className="w-3 h-3 mr-1" />
                +18.2% conversion rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {avgResponseRate.toFixed(1)}%
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center mt-1">
                <ArrowUp className="w-3 h-3 mr-1" />
                AI-powered responses
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {campaigns.filter(c => c.status === 'active').length}
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                <Clock className="w-3 h-3 mr-1" />
                Running automatically
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="campaigns" className="gap-2">
              <Send className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="ai-responses" className="gap-2">
              <Bot className="w-4 h-4" />
              AI Responses
            </TabsTrigger>
            <TabsTrigger value="audience" className="gap-2">
              <Users className="w-4 h-4" />
              Audience
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2">
              <Send className="w-4 h-4" />
              Test Messages
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Marketing Campaigns</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Campaign
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          campaign.status === 'active' ? "bg-green-500" :
                          campaign.status === 'paused' ? "bg-yellow-500" :
                          campaign.status === 'completed' ? "bg-blue-500" : "bg-gray-500"
                        )} />
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Badge variant="outline">{campaign.type}</Badge>
                            <span>•</span>
                            <span>{campaign.audience}</span>
                            {campaign.aiEnabled && (
                              <>
                                <span>•</span>
                                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                                  <Brain className="w-3 h-3 mr-1" />
                                  AI Enabled
                                </Badge>
                              </>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{campaign.sent.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{campaign.delivered.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Delivered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{campaign.opened.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Opened</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{campaign.clicked.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Clicked</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">{campaign.conversions.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Conversions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-700">${campaign.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Delivery Rate</span>
                        <span>{((campaign.delivered / campaign.sent) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(campaign.delivered / campaign.sent) * 100} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Conversion Rate</span>
                        <span>{((campaign.conversions / campaign.sent) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(campaign.conversions / campaign.sent) * 100} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Responses Tab */}
          <TabsContent value="ai-responses" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">AI Auto-Responses</h2>
                <p className="text-sm text-muted-foreground">ChatGPT-powered responses to engage and convert</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={trainAIResponses} disabled={aiTraining} className="gap-2">
                  {aiTraining ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  {aiTraining ? 'Training...' : 'Train AI'}
                </Button>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Response
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {autoResponses.map((response) => (
                <Card key={response.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          response.aiGenerated 
                            ? "bg-purple-100 text-purple-600" 
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {response.aiGenerated ? <Sparkles className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        </div>
                        <div>
                          <CardTitle className="text-base">Trigger: "{response.trigger}"</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant={response.aiGenerated ? "default" : "outline"}>
                              {response.aiGenerated ? "AI Generated" : "Manual"}
                            </Badge>
                            <Badge variant="outline">{response.conversationGoal}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{response.effectiveness}% effective</div>
                        <div className="text-xs text-muted-foreground">{response.timesUsed} uses</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm">{response.response}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <Progress value={response.effectiveness} className="flex-1 mr-4" />
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Test</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Audience Management</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Import
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Contact
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contact Segments</CardTitle>
                <CardDescription>Organize your audience for targeted campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">VIP Customers</h3>
                    <p className="text-2xl font-bold text-green-600 mt-1">2,847</p>
                    <p className="text-xs text-muted-foreground">High-value customers</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">Abandoned Carts</h3>
                    <p className="text-2xl font-bold text-orange-600 mt-1">1,234</p>
                    <p className="text-xs text-muted-foreground">Ready to convert</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium">New Subscribers</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-1">5,692</p>
                    <p className="text-xs text-muted-foreground">Fresh leads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold">Performance Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue by Channel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">SMS Marketing</span>
                    <span className="font-medium">$45,200</span>
                  </div>
                  <Progress value={75} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Voice Campaigns</span>
                    <span className="font-medium">$22,100</span>
                  </div>
                  <Progress value={45} />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Multi-Channel</span>
                    <span className="font-medium">$8,420</span>
                  </div>
                  <Progress value={20} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Response Effectiveness</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">87.3%</div>
                    <p className="text-sm text-muted-foreground">Average AI response effectiveness</p>
                    <Badge className="mt-2 bg-purple-100 text-purple-700">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% this month
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Test Messages Tab */}
          <TabsContent value="test" className="space-y-6">
            <TestMessageInterface />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">Marketing Settings</h2>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                  <CardDescription>Configure ChatGPT integration for auto-responses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai-enabled">Enable AI Auto-Responses</Label>
                    <Switch id="ai-enabled" defaultChecked />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>AI Response Tone</Label>
                    <Select defaultValue="professional">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="persuasive">Persuasive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Response Goal Priority</Label>
                    <Select defaultValue="sale">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale">Drive Sales</SelectItem>
                        <SelectItem value="lead">Generate Leads</SelectItem>
                        <SelectItem value="support">Provide Support</SelectItem>
                        <SelectItem value="retention">Customer Retention</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Twilio Configuration</CardTitle>
                  <CardDescription>Advanced Twilio settings for outbound/inbound marketing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>SMS Rate Limit</Label>
                      <Input placeholder="1000 per hour" />
                    </div>
                    <div className="space-y-2">
                      <Label>Voice Concurrent Calls</Label>
                      <Input placeholder="50" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-retry">Auto-retry Failed Messages</Label>
                    <Switch id="auto-retry" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="delivery-receipts">Request Delivery Receipts</Label>
                    <Switch id="delivery-receipts" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

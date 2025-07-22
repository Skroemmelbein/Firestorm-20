import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  Users,
  TrendingUp,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertTriangle,
  Database,
  Zap,
  Target,
  BarChart3,
  Calendar,
  FileText,
  Download,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

interface MessageTemplate {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'voice';
  category: 'marketing' | 'billing' | 'support' | 'onboarding';
  subject?: string;
  content: string;
  variables: string[];
  active: boolean;
  lastUsed?: Date;
  successRate?: number;
}

interface ClientJourney {
  id: string;
  name: string;
  trigger: string;
  steps: JourneyStep[];
  active: boolean;
  enrolledCount: number;
  completionRate: number;
}

interface JourneyStep {
  id: string;
  type: 'sms' | 'email' | 'voice' | 'wait' | 'condition';
  templateId?: string;
  delay?: number;
  condition?: string;
  order: number;
}

interface Campaign {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'voice';
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  audienceSize: number;
  sent: number;
  delivered: number;
  responded: number;
  scheduledAt?: Date;
}

export default function CommCenter() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([
    {
      id: '1',
      name: 'Payment Reminder',
      type: 'sms',
      category: 'billing',
      content: 'Hi {{customer_name}}, your payment of ${{amount}} is due on {{due_date}}. Pay now: {{payment_link}}',
      variables: ['customer_name', 'amount', 'due_date', 'payment_link'],
      active: true,
      successRate: 85.3,
      lastUsed: new Date()
    },
    {
      id: '2',
      name: 'Welcome Email',
      type: 'email',
      category: 'onboarding',
      subject: 'Welcome to {{company_name}}!',
      content: 'Welcome {{customer_name}}! Thank you for subscribing to our {{plan_name}} plan. Get started: {{onboarding_link}}',
      variables: ['customer_name', 'company_name', 'plan_name', 'onboarding_link'],
      active: true,
      successRate: 92.1
    },
    {
      id: '3',
      name: 'Failed Payment Recovery',
      type: 'voice',
      category: 'billing',
      content: 'Hello {{customer_name}}, this is a courtesy call regarding your {{company_name}} subscription. We were unable to process your payment. Please call us back at {{support_phone}} to update your payment information.',
      variables: ['customer_name', 'company_name', 'support_phone'],
      active: true,
      successRate: 67.8
    }
  ]);

  const [journeys, setJourneys] = useState<ClientJourney[]>([
    {
      id: '1',
      name: 'New Customer Onboarding',
      trigger: 'subscription_created',
      steps: [
        { id: '1', type: 'email', templateId: '2', order: 1 },
        { id: '2', type: 'wait', delay: 24, order: 2 },
        { id: '3', type: 'sms', templateId: '1', order: 3 }
      ],
      active: true,
      enrolledCount: 156,
      completionRate: 78.2
    },
    {
      id: '2',
      name: 'Payment Recovery Sequence',
      trigger: 'payment_failed',
      steps: [
        { id: '1', type: 'sms', templateId: '1', order: 1 },
        { id: '2', type: 'wait', delay: 72, order: 2 },
        { id: '3', type: 'voice', templateId: '3', order: 3 }
      ],
      active: true,
      enrolledCount: 43,
      completionRate: 45.6
    }
  ]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Monthly Newsletter',
      type: 'email',
      status: 'completed',
      audienceSize: 2847,
      sent: 2847,
      delivered: 2798,
      responded: 312,
      scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Payment Reminder Blast',
      type: 'sms',
      status: 'running',
      audienceSize: 156,
      sent: 89,
      delivered: 85,
      responded: 12
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'sms' as const,
    category: 'billing' as const,
    subject: '',
    content: '',
    variables: [] as string[]
  });

  const [nmiEvents, setNmiEvents] = useState([
    { id: '1', event: 'Payment Successful', customerId: 'CUST_001', amount: 29.99, timestamp: new Date() },
    { id: '2', event: 'Payment Failed', customerId: 'CUST_002', amount: 99.99, timestamp: new Date(Date.now() - 300000) },
    { id: '3', event: 'Subscription Cancelled', customerId: 'CUST_003', amount: 49.99, timestamp: new Date(Date.now() - 600000) }
  ]);

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      draft: 'bg-gray-500/10 text-gray-600',
      scheduled: 'bg-blue-500/10 text-blue-600',
      running: 'bg-green-500/10 text-green-600',
      completed: 'bg-purple-500/10 text-purple-600',
      paused: 'bg-yellow-500/10 text-yellow-600'
    };
    return colors[status];
  };

  const getTypeIcon = (type: 'sms' | 'email' | 'voice') => {
    const icons = {
      sms: MessageSquare,
      email: Mail,
      voice: Phone
    };
    return icons[type];
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Communication Center</h1>
            <p className="text-muted-foreground">Manage Twilio, SendGrid templates and customer journeys</p>
          </div>
          <div className="flex gap-2">
            <Link to="/twilio-vault">
              <Button variant="outline" className="gap-2">
                <Database className="w-4 h-4" />
                API Vault
              </Button>
            </Link>
            <Button className="gap-2">
              <Target className="w-4 h-4" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.filter(t => t.active).length}</div>
              <p className="text-xs text-muted-foreground">
                {templates.length} total templates
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running Journeys</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{journeys.filter(j => j.active).length}</div>
              <p className="text-xs text-muted-foreground">
                {journeys.reduce((sum, j) => sum + j.enrolledCount, 0)} customers enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent Today</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                +23% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                Delivery success rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="templates" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="journeys" className="gap-2">
              <Users className="w-4 h-4" />
              Client Journeys
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-2">
              <Target className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="nmi-loop" className="gap-2">
              <Zap className="w-4 h-4" />
              NMI Feedback
            </TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Message Templates
                    </CardTitle>
                    <Button size="sm" className="gap-2">
                      <FileText className="w-3 h-3" />
                      New Template
                    </Button>
                  </div>
                  <CardDescription>
                    Manage SMS, email, and voice message templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {templates.map((template) => {
                      const Icon = getTypeIcon(template.type);
                      return (
                        <Card 
                          key={template.id} 
                          className={cn(
                            "border-border/50 cursor-pointer transition-all hover:shadow-sm",
                            selectedTemplate?.id === template.id && "ring-2 ring-primary"
                          )}
                          onClick={() => setSelectedTemplate(template)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4 text-muted-foreground" />
                                <CardTitle className="text-sm">{template.name}</CardTitle>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {template.category}
                                </Badge>
                                <Badge variant={template.active ? "default" : "outline"} className="text-xs">
                                  {template.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {template.content}
                            </p>
                            {template.successRate && (
                              <div className="flex items-center justify-between mt-2 text-xs">
                                <span className="text-muted-foreground">Success Rate</span>
                                <span className="font-medium">{template.successRate}%</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit className="w-5 h-5" />
                    Template Editor
                  </CardTitle>
                  <CardDescription>
                    {selectedTemplate ? `Editing: ${selectedTemplate.name}` : 'Select a template to edit'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedTemplate ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Template Name</Label>
                        <Input value={selectedTemplate.name} readOnly />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={selectedTemplate.type} disabled>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="voice">Voice</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={selectedTemplate.category} disabled>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="billing">Billing</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                              <SelectItem value="onboarding">Onboarding</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {selectedTemplate.subject && (
                        <div className="space-y-2">
                          <Label>Subject Line</Label>
                          <Input value={selectedTemplate.subject} readOnly />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Message Content</Label>
                        <Textarea 
                          value={selectedTemplate.content} 
                          readOnly
                          className="min-h-[120px]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Variables</Label>
                        <div className="flex gap-1 flex-wrap">
                          {selectedTemplate.variables.map((variable, index) => (
                            <Badge key={index} variant="outline" className="font-mono text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="gap-2">
                          <Edit className="w-3 h-3" />
                          Edit Template
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-3 h-3" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Send className="w-3 h-3" />
                          Test Send
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a template from the list to edit</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Client Journeys Tab */}
          <TabsContent value="journeys" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Automated Client Journeys
                    </CardTitle>
                    <CardDescription>
                      Multi-step communication workflows triggered by customer actions
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Zap className="w-4 h-4" />
                    Create Journey
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {journeys.map((journey) => (
                    <Card key={journey.id} className="border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {journey.name}
                              <Badge variant={journey.active ? "default" : "outline"}>
                                {journey.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              Triggered by: <code className="bg-muted px-1 py-0.5 rounded text-xs">{journey.trigger}</code>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Completion Rate</div>
                            <div className="text-xl font-bold">{journey.completionRate}%</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Enrolled Customers</div>
                            <div className="font-medium">{journey.enrolledCount}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Journey Steps</div>
                            <div className="font-medium">{journey.steps.length}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Journey Flow</div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {journey.steps.map((step, index) => {
                              const Icon = step.type === 'wait' ? Clock :
                                          step.type === 'condition' ? AlertTriangle :
                                          getTypeIcon(step.type as 'sms' | 'email' | 'voice');
                              return (
                                <div key={step.id} className="flex items-center gap-1">
                                  <Badge variant="outline" className="gap-1">
                                    <Icon className="w-3 h-3" />
                                    {step.type === 'wait' ? `${step.delay}h` : step.type}
                                  </Badge>
                                  {index < journey.steps.length - 1 && (
                                    <div className="w-4 h-px bg-border" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit Journey
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            Analytics
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500">
                            {journey.active ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                            {journey.active ? 'Pause' : 'Resume'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Communication Campaigns
                    </CardTitle>
                    <CardDescription>
                      One-time and scheduled message campaigns
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Send className="w-4 h-4" />
                    New Campaign
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => {
                    const Icon = getTypeIcon(campaign.type);
                    const deliveryRate = campaign.sent > 0 ? (campaign.delivered / campaign.sent * 100).toFixed(1) : 0;
                    const responseRate = campaign.delivered > 0 ? (campaign.responded / campaign.delivered * 100).toFixed(1) : 0;
                    
                    return (
                      <Card key={campaign.id} className="border-border/50">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                <CardDescription>
                                  {campaign.scheduledAt && `Scheduled for ${campaign.scheduledAt.toLocaleDateString()}`}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Audience</div>
                              <div className="font-medium">{campaign.audienceSize.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Sent</div>
                              <div className="font-medium">{campaign.sent.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Delivery Rate</div>
                              <div className="font-medium">{deliveryRate}%</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Response Rate</div>
                              <div className="font-medium">{responseRate}%</div>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">
                              <BarChart3 className="w-3 h-3 mr-1" />
                              View Report
                            </Button>
                            {campaign.status === 'running' && (
                              <Button variant="outline" size="sm">
                                <Pause className="w-3 h-3 mr-1" />
                                Pause
                              </Button>
                            )}
                            {campaign.status === 'completed' && (
                              <Button variant="outline" size="sm">
                                <Download className="w-3 h-3 mr-1" />
                                Export Data
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NMI Feedback Loop Tab */}
          <TabsContent value="nmi-loop" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    NMI Event Stream
                  </CardTitle>
                  <CardDescription>
                    Real-time payment events triggering automated communications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {nmiEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          event.event === 'Payment Successful' && "bg-green-500",
                          event.event === 'Payment Failed' && "bg-red-500",
                          event.event === 'Subscription Cancelled' && "bg-yellow-500"
                        )} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{event.event}</div>
                          <div className="text-xs text-muted-foreground">
                            Customer {event.customerId} • ${event.amount} • {event.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Auto-triggered
                        </Badge>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4 gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh Events
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Automation Rules
                  </CardTitle>
                  <CardDescription>
                    Configure automatic communication triggers based on NMI events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Card className="border-border/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Payment Success → Thank You SMS</CardTitle>
                          <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          Send thank you message immediately after successful payment
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Payment Failed → Recovery Journey</CardTitle>
                          <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          Enroll customer in payment recovery journey after failed payment
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">Subscription Cancelled → Feedback Survey</CardTitle>
                          <Badge variant="outline">Inactive</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-muted-foreground">
                          Send feedback survey 24h after subscription cancellation
                        </p>
                      </CardContent>
                    </Card>

                    <Button className="w-full gap-2">
                      <Zap className="w-4 h-4" />
                      Create New Rule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

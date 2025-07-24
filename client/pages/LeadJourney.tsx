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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  TrendingUp,
  Target,
  Zap,
  Bot,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Star,
  Heart,
  Brain,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Settings,
  Plus,
  Eye,
  BarChart,
  Lightbulb,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
  Search,
  Download,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: "cold" | "warm" | "hot" | "qualified" | "customer" | "lost";
  score: number;
  engagementLevel: number;
  purchaseIntent: number;
  responseRate: number;
  lifetimeValue: number;
  lastContact: Date;
  nextAction: string;
  assignedTo: string;
  tags: string[];
  journeyStage: string;
  conversions: number;
  touchpoints: number;
}

interface JourneyStage {
  id: string;
  name: string;
  description: string;
  aiPrompt: string;
  actions: JourneyAction[];
  triggers: string[];
  successRate: number;
  avgTimeInStage: number;
  conversionRate: number;
}

interface JourneyAction {
  id: string;
  type: "sms" | "email" | "call" | "meeting" | "follow-up";
  template: string;
  delay: number; // hours
  conditions: string[];
  aiPersonalized: boolean;
  successRate: number;
}

interface AIScoring {
  purchaseIntent: number;
  engagementLevel: number;
  churnRisk: number;
  upsellPotential: number;
  lifetimeValuePrediction: number;
  nextBestAction: string;
  confidence: number;
}

export default function LeadJourney() {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@example.com",
      phone: "+18558600037",
      source: "Website",
      status: "hot",
      score: 87,
      engagementLevel: 92,
      purchaseIntent: 85,
      responseRate: 78,
      lifetimeValue: 15420,
      lastContact: new Date(),
      nextAction: "Send pricing proposal",
      assignedTo: "Sarah Johnson",
      tags: ["Enterprise", "Decision Maker"],
      journeyStage: "Proposal",
      conversions: 3,
      touchpoints: 12,
    },
    {
      id: "2",
      firstName: "Emily",
      lastName: "Chen",
      email: "emily.chen@company.com",
      phone: "+18558600037",
      source: "Referral",
      status: "warm",
      score: 65,
      engagementLevel: 71,
      purchaseIntent: 60,
      responseRate: 45,
      lifetimeValue: 8500,
      lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextAction: "Schedule demo call",
      assignedTo: "Mike Rodriguez",
      tags: ["SMB", "Tech Savvy"],
      journeyStage: "Discovery",
      conversions: 1,
      touchpoints: 8,
    },
  ]);

  const [journeyStages, setJourneyStages] = useState<JourneyStage[]>([
    {
      id: "awareness",
      name: "Awareness",
      description: "Initial contact and brand awareness",
      aiPrompt:
        "Create engaging content to introduce our solution and build trust",
      actions: [
        {
          id: "welcome_sms",
          type: "sms",
          template:
            "Welcome! Thanks for your interest. Here's what we can do for you: [PERSONALIZED_VALUE_PROP]",
          delay: 0,
          conditions: ["new_lead"],
          aiPersonalized: true,
          successRate: 65,
        },
        {
          id: "follow_up_email",
          type: "email",
          template:
            "Educational email with case studies relevant to their industry",
          delay: 24,
          conditions: ["sms_opened"],
          aiPersonalized: true,
          successRate: 45,
        },
      ],
      triggers: ["form_submission", "website_visit", "content_download"],
      successRate: 72,
      avgTimeInStage: 3.5,
      conversionRate: 28,
    },
    {
      id: "interest",
      name: "Interest",
      description: "Lead shows interest and engagement",
      aiPrompt:
        "Provide value and demonstrate expertise while qualifying needs",
      actions: [
        {
          id: "value_sms",
          type: "sms",
          template:
            "I noticed you checked out our [VIEWED_FEATURE]. Here's how it helped [SIMILAR_COMPANY] achieve [SPECIFIC_RESULT]",
          delay: 2,
          conditions: ["page_view", "email_click"],
          aiPersonalized: true,
          successRate: 78,
        },
        {
          id: "discovery_call",
          type: "call",
          template:
            "Discovery call script with AI-suggested questions based on lead profile",
          delay: 48,
          conditions: ["engagement_score > 50"],
          aiPersonalized: true,
          successRate: 82,
        },
      ],
      triggers: ["email_reply", "content_engagement", "pricing_page_visit"],
      successRate: 84,
      avgTimeInStage: 5.2,
      conversionRate: 42,
    },
    {
      id: "consideration",
      name: "Consideration",
      description: "Lead evaluating solution and comparing options",
      aiPrompt: "Address objections, provide social proof, and create urgency",
      actions: [
        {
          id: "objection_handler",
          type: "sms",
          template:
            "I understand [SPECIFIC_CONCERN]. Here's how we've helped others overcome this: [CASE_STUDY]",
          delay: 12,
          conditions: ["objection_detected"],
          aiPersonalized: true,
          successRate: 68,
        },
        {
          id: "demo_follow_up",
          type: "email",
          template:
            "Custom proposal with ROI calculations based on their specific use case",
          delay: 24,
          conditions: ["demo_completed"],
          aiPersonalized: true,
          successRate: 75,
        },
      ],
      triggers: ["demo_request", "competitor_mention", "pricing_inquiry"],
      successRate: 76,
      avgTimeInStage: 8.1,
      conversionRate: 38,
    },
    {
      id: "decision",
      name: "Decision",
      description: "Lead ready to make purchase decision",
      aiPrompt:
        "Remove final barriers and provide compelling reasons to choose us now",
      actions: [
        {
          id: "urgency_sms",
          type: "sms",
          template:
            "Hi [NAME], your custom proposal is ready! Plus, if you sign by [DATE], you'll get [INCENTIVE]. Ready to move forward?",
          delay: 0,
          conditions: ["proposal_sent"],
          aiPersonalized: true,
          successRate: 89,
        },
        {
          id: "decision_call",
          type: "call",
          template: "Decision maker call with AI-suggested closing techniques",
          delay: 48,
          conditions: ["no_response"],
          aiPersonalized: true,
          successRate: 85,
        },
      ],
      triggers: ["contract_review", "budget_approved", "decision_timeline"],
      successRate: 92,
      avgTimeInStage: 4.3,
      conversionRate: 67,
    },
  ]);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [aiScoring, setAiScoring] = useState<AIScoring | null>(null);

  // AI Scoring calculation
  const calculateAIScore = async (lead: Lead): Promise<AIScoring> => {
    // Simulate AI scoring calculation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      purchaseIntent: lead.purchaseIntent,
      engagementLevel: lead.engagementLevel,
      churnRisk: Math.max(0, 100 - lead.engagementLevel - lead.responseRate),
      upsellPotential: Math.min(100, lead.lifetimeValue / 100 + lead.score),
      lifetimeValuePrediction: lead.lifetimeValue * (1 + lead.score / 100),
      nextBestAction: getNextBestAction(lead),
      confidence: Math.min(100, lead.touchpoints * 5 + lead.responseRate),
    };
  };

  const getNextBestAction = (lead: Lead): string => {
    if (lead.score >= 80) return "Send pricing proposal immediately";
    if (lead.score >= 60) return "Schedule demo call";
    if (lead.score >= 40) return "Send value-driven content";
    return "Re-engage with personalized message";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      cold: "bg-blue-100 text-blue-800",
      warm: "bg-yellow-100 text-yellow-800",
      hot: "bg-red-100 text-red-800",
      qualified: "bg-purple-100 text-purple-800",
      customer: "bg-green-100 text-green-800",
      lost: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || colors.cold;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Lead Journey AI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Fortune 10 AI-Powered Lead Management & Conversion
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <Brain className="w-3 h-3 mr-1" />
                AI Scoring Active
              </Badge>
              <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                <Zap className="w-3 h-3 mr-1" />
                Auto-Journey
              </Badge>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Lead
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* AI Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Conversion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                43.8%
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12.3% with AI
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Avg Deal Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                $12,450
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                <DollarSign className="w-3 h-3 mr-1" />
                +28% from AI upsells
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Lead Score Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                94.2%
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center mt-1">
                <Brain className="w-3 h-3 mr-1" />
                AI prediction accuracy
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                &lt; 2min
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                <Clock className="w-3 h-3 mr-1" />
                AI-powered responses
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="leads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="leads" className="gap-2">
              <Users className="w-4 h-4" />
              Lead Management
            </TabsTrigger>
            <TabsTrigger value="journey" className="gap-2">
              <Target className="w-4 h-4" />
              Journey Stages
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Bot className="w-4 h-4" />
              Automation
            </TabsTrigger>
          </TabsList>

          {/* Lead Management Tab */}
          <TabsContent value="leads" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Lead Portfolio</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button variant="outline" className="gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Import Leads
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {leads.map((lead) => (
                <Card
                  key={lead.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedLead(lead)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {lead.firstName[0]}
                          {lead.lastName[0]}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {lead.firstName} {lead.lastName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-3">
                            <span>{lead.email}</span>
                            <span>•</span>
                            <span>{lead.phone}</span>
                            <span>•</span>
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status.toUpperCase()}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "text-3xl font-bold",
                            getScoreColor(lead.score),
                          )}
                        >
                          {lead.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          AI Score
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {lead.engagementLevel}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Engagement
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {lead.purchaseIntent}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Purchase Intent
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {lead.responseRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Response Rate
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-emerald-600">
                          ${lead.lifetimeValue.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Predicted LTV
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600">
                          {lead.touchpoints}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Touchpoints
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {lead.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Next: {lead.nextAction}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Journey Stages Tab */}
          <TabsContent value="journey" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Journey Stages</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Stage
              </Button>
            </div>

            <div className="grid gap-6">
              {journeyStages.map((stage, index) => (
                <Card key={stage.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {stage.name}
                          </CardTitle>
                          <CardDescription>{stage.description}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {stage.successRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Success Rate
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600">
                          {stage.avgTimeInStage} days
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg Time in Stage
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-lg font-semibold text-green-600">
                          {stage.conversionRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Conversion Rate
                        </div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-lg font-semibold text-purple-600">
                          {stage.actions.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          AI Actions
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        AI Actions
                      </h4>
                      {stage.actions.map((action) => (
                        <div
                          key={action.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{action.type}</Badge>
                            <span className="text-sm">
                              {action.template.substring(0, 60)}...
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-600 font-medium">
                              {action.successRate}%
                            </span>
                            <Badge className="bg-purple-100 text-purple-700">
                              {action.aiPersonalized
                                ? "AI Personalized"
                                : "Template"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <h2 className="text-xl font-semibold">AI Performance Insights</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Scoring Accuracy</CardTitle>
                  <CardDescription>
                    AI prediction vs actual outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      94.2%
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Prediction accuracy this month
                    </p>
                    <Progress value={94} className="mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Improved by 8.3% since implementing advanced AI models
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Optimization</CardTitle>
                  <CardDescription>
                    AI-generated vs manual responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AI Responses</span>
                      <span className="font-medium text-green-600">
                        78% response rate
                      </span>
                    </div>
                    <Progress value={78} />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Manual Responses</span>
                      <span className="font-medium text-blue-600">
                        45% response rate
                      </span>
                    </div>
                    <Progress value={45} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Journey Automation</h2>
              <Button className="gap-2">
                <Bot className="w-4 h-4" />
                Create Automation
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Automations</CardTitle>
                <CardDescription>
                  AI-powered lead nurturing sequences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">
                          New Lead Welcome Sequence
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Automated SMS + Email nurturing for new leads
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        82% completion rate
                      </div>
                      <div className="text-xs text-muted-foreground">
                        127 leads enrolled
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">Demo Follow-up Sequence</h4>
                        <p className="text-sm text-muted-foreground">
                          AI-powered post-demo nurturing and objection handling
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-600">
                        67% conversion rate
                      </div>
                      <div className="text-xs text-muted-foreground">
                        43 leads enrolled
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">Re-engagement Campaign</h4>
                        <p className="text-sm text-muted-foreground">
                          AI identifies and re-engages cold leads
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-600">
                        34% reactivation rate
                      </div>
                      <div className="text-xs text-muted-foreground">
                        89 leads enrolled
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

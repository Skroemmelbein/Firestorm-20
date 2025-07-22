import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Brain,
  Zap,
  Play,
  CheckCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  Activity,
  MessageSquare,
  RefreshCw,
  Target,
  Award,
  Clock,
  ArrowRight,
  Lightbulb,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

interface ChartData {
  month: string;
  revenue: number;
  subscriptions: number;
  churn: number;
  retention: number;
}

interface Prediction {
  id: string;
  type: 'revenue' | 'churn' | 'growth' | 'optimization';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
  estimatedValue: number;
  timeframe: string;
  approved?: boolean;
}

export default function BusinessOverview() {
  const [chartData] = useState<ChartData[]>([
    { month: 'Jan', revenue: 45000, subscriptions: 850, churn: 5.2, retention: 94.8 },
    { month: 'Feb', revenue: 52000, subscriptions: 920, churn: 4.8, retention: 95.2 },
    { month: 'Mar', revenue: 48000, subscriptions: 890, churn: 6.1, retention: 93.9 },
    { month: 'Apr', revenue: 58000, subscriptions: 980, churn: 4.2, retention: 95.8 },
    { month: 'May', revenue: 63000, subscriptions: 1050, churn: 3.9, retention: 96.1 },
    { month: 'Jun', revenue: 67000, subscriptions: 1120, churn: 3.5, retention: 96.5 }
  ]);

  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: '1',
      type: 'revenue',
      confidence: 87,
      impact: 'high',
      title: 'Revenue Optimization Opportunity',
      description: 'Implementing tiered pricing for enterprise clients could increase revenue by 23%',
      recommendation: 'Create a Premium tier at $199/month with advanced features for top 15% of clients',
      estimatedValue: 15400,
      timeframe: '3 months'
    },
    {
      id: '2',
      type: 'churn',
      confidence: 92,
      impact: 'high',
      title: 'Churn Prevention Strategy',
      description: 'High-risk accounts identified with 92% accuracy. Proactive engagement needed.',
      recommendation: 'Launch retention campaign for 23 at-risk accounts with personalized offers',
      estimatedValue: 8700,
      timeframe: '2 weeks'
    },
    {
      id: '3',
      type: 'growth',
      confidence: 76,
      impact: 'medium',
      title: 'Market Expansion Potential',
      description: 'SMB segment shows 3x growth potential with adjusted onboarding flow',
      recommendation: 'Simplify signup process and add SMB-specific templates',
      estimatedValue: 12300,
      timeframe: '6 weeks'
    }
  ]);

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [autoPredict, setAutoPredict] = useState(true);

  const askBusinessAI = async () => {
    if (!aiQuery.trim()) return;
    
    setIsAiThinking(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const responses = [
        `Based on your data trends for "${aiQuery}", I recommend focusing on the 94% customer satisfaction segment. These customers have 3x higher lifetime value and 40% lower churn. Consider implementing a VIP program for this segment.`,
        `Analyzing "${aiQuery}" patterns: Your Q2 revenue growth of 23% is driven primarily by enterprise upsells. I predict similar growth if you launch the Premium tier by end of month. Expected ROI: 340%.`,
        `Regarding "${aiQuery}": Market analysis shows your retention rate (96.5%) exceeds industry average (89%). This indicates strong product-market fit. Recommend increasing prices by 15% for new customers without affecting churn.`,
        `For "${aiQuery}": Predictive model shows 78% probability of hitting $80K monthly revenue by Q4 if you implement the recommended retention campaigns. Key lever: reduce churn from 3.5% to 2.8%.`
      ];
      
      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
    } catch (error) {
      setAiResponse('Analysis temporarily unavailable. Please try again.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const approvePrediction = (predictionId: string) => {
    setPredictions(prev => prev.map(p => 
      p.id === predictionId ? { ...p, approved: true } : p
    ));
  };

  const implementPrediction = (predictionId: string) => {
    console.log('Implementing prediction:', predictionId);
    // This would integrate with Xano to execute the recommendation
  };

  const generateAutoPredictions = async () => {
    // Simulate AI generating new predictions
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newPrediction: Prediction = {
      id: Date.now().toString(),
      type: 'optimization',
      confidence: 83,
      impact: 'medium',
      title: 'Billing Cycle Optimization',
      description: 'Switching 40% of monthly customers to annual billing could improve cash flow',
      recommendation: 'Offer 2-month discount for annual prepayment',
      estimatedValue: 23500,
      timeframe: '1 month'
    };
    
    setPredictions(prev => [newPrediction, ...prev]);
  };

  useEffect(() => {
    if (autoPredict) {
      const interval = setInterval(generateAutoPredictions, 30000); // Generate new prediction every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoPredict]);

  const getImpactColor = (impact: string) => {
    const colors = {
      high: 'text-red-600 bg-red-100 border-red-200',
      medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
      low: 'text-green-600 bg-green-100 border-green-200'
    };
    return colors[impact as keyof typeof colors];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      revenue: DollarSign,
      churn: TrendingDown,
      growth: TrendingUp,
      optimization: Target
    };
    return icons[type as keyof typeof icons] || Target;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Business Overview</h1>
            <p className="text-purple-600/70">Analytics, predictions & AI-powered insights</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={autoPredict ? "default" : "outline"} className="gap-1">
              <Brain className="w-3 h-3" />
              Auto-Predict {autoPredict ? 'ON' : 'OFF'}
            </Badge>
            <Button 
              variant="outline" 
              onClick={() => setAutoPredict(!autoPredict)}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              {autoPredict ? 'Disable' : 'Enable'} AI
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-scale-in">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">$67,000</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +23% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">1,120</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +130 this month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">96.5%</div>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +1.7% improvement
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Predictions</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{predictions.length}</div>
              <p className="text-xs text-purple-600 flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Live monitoring
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 glass-card">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="predictions" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Predictions
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Business AI Chat
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Revenue Trends
                  </CardTitle>
                  <CardDescription>Monthly revenue growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2 p-4">
                    {chartData.map((data, index) => (
                      <div key={data.month} className="flex flex-col items-center gap-2 flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-lg transition-all duration-1000 hover:from-purple-600 hover:to-purple-400"
                          style={{ 
                            height: `${(data.revenue / 70000) * 200}px`,
                            animationDelay: `${index * 100}ms`
                          }}
                        />
                        <div className="text-xs font-medium text-purple-700">{data.month}</div>
                        <div className="text-xs text-purple-600/70">${(data.revenue / 1000).toFixed(0)}k</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Subscription Growth
                  </CardTitle>
                  <CardDescription>New subscriptions vs churn rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2 p-4">
                    {chartData.map((data, index) => (
                      <div key={data.month} className="flex flex-col items-center gap-1 flex-1">
                        <div className="flex flex-col items-center gap-1 h-48">
                          <div 
                            className="w-4 bg-gradient-to-t from-green-500 to-green-300 rounded-t"
                            style={{ height: `${(data.subscriptions / 1200) * 180}px` }}
                          />
                          <div 
                            className="w-4 bg-gradient-to-t from-red-500 to-red-300 rounded-t"
                            style={{ height: `${(data.churn / 10) * 40}px` }}
                          />
                        </div>
                        <div className="text-xs font-medium text-purple-700">{data.month}</div>
                        <div className="text-xs text-green-600">+{data.subscriptions}</div>
                        <div className="text-xs text-red-600">-{data.churn}%</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Swimlane Performance
                  </CardTitle>
                  <CardDescription>Customer journey and conversion tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { stage: 'Lead Generation', count: 2847, conversion: 45, color: 'bg-blue-500' },
                      { stage: 'Trial Signup', count: 1281, conversion: 72, color: 'bg-purple-500' },
                      { stage: 'Onboarding', count: 922, conversion: 89, color: 'bg-indigo-500' },
                      { stage: 'Paid Conversion', count: 820, conversion: 94, color: 'bg-green-500' },
                      { stage: 'Retention', count: 771, conversion: 96, color: 'bg-emerald-500' }
                    ].map((stage, index) => (
                      <div key={stage.stage} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium text-purple-700">{stage.stage}</div>
                        <div className="flex-1 bg-purple-100 rounded-full h-8 relative overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-1000", stage.color)}
                            style={{ 
                              width: `${stage.conversion}%`,
                              animationDelay: `${index * 200}ms`
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-between px-3 text-xs">
                            <span className="font-medium text-white">{stage.count} users</span>
                            <span className="font-medium text-white">{stage.conversion}%</span>
                          </div>
                        </div>
                        {index < 4 && <ArrowRight className="w-4 h-4 text-purple-400" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Predictions & Recommendations
                    </CardTitle>
                    <CardDescription>
                      AI-powered insights with approve/implement workflow
                    </CardDescription>
                  </div>
                  <Button onClick={generateAutoPredictions} className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600">
                    <RefreshCw className="w-4 h-4" />
                    Generate New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {predictions.map((prediction) => {
                    const Icon = getTypeIcon(prediction.type);
                    return (
                      <Card key={prediction.id} className={cn(
                        "border-2 transition-all duration-300",
                        prediction.approved 
                          ? "border-green-300 bg-green-50/50" 
                          : "border-purple-200 hover:border-purple-400"
                      )}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {prediction.title}
                                  <Badge className={cn('border', getImpactColor(prediction.impact))}>
                                    {prediction.impact} impact
                                  </Badge>
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  Confidence: {prediction.confidence}% • {prediction.timeframe} timeline
                                </CardDescription>
                              </div>
                            </div>
                            {prediction.approved && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium text-purple-900 mb-1">Analysis</h4>
                              <p className="text-sm text-purple-700">{prediction.description}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-purple-900 mb-1">Recommendation</h4>
                              <p className="text-sm text-purple-700">{prediction.recommendation}</p>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 glass-card rounded-lg">
                              <div>
                                <div className="text-sm text-purple-600/70">Estimated Value</div>
                                <div className="text-xl font-bold gradient-text">
                                  +${prediction.estimatedValue.toLocaleString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-purple-600/70">Timeline</div>
                                <div className="font-medium text-purple-700">{prediction.timeframe}</div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2">
                              {!prediction.approved ? (
                                <>
                                  <Button 
                                    onClick={() => approvePrediction(prediction.id)}
                                    className="gap-2 bg-gradient-to-r from-green-500 to-green-600"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                    Approve
                                  </Button>
                                  <Button variant="outline" className="gap-2">
                                    <ThumbsDown className="w-4 h-4" />
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  onClick={() => implementPrediction(prediction.id)}
                                  className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600"
                                >
                                  <Play className="w-4 h-4" />
                                  Implement Now
                                </Button>
                              )}
                              <Button variant="outline" size="sm" className="gap-2">
                                <Lightbulb className="w-4 h-4" />
                                More Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business AI Chat Tab */}
          <TabsContent value="ai-chat" className="space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Business Intelligence AI
                </CardTitle>
                <CardDescription>
                  Ask questions about your business performance and get AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-purple-700 mb-2">Ask the AI:</div>
                    <Textarea
                      placeholder="e.g., 'What's driving our revenue growth?' or 'Which customers are at risk of churning?'"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button 
                    onClick={askBusinessAI}
                    disabled={isAiThinking || !aiQuery.trim()}
                    className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600"
                  >
                    <Brain className="w-4 h-4" />
                    {isAiThinking ? 'Analyzing...' : 'Get AI Insights'}
                  </Button>

                  {aiResponse && (
                    <Card className="border-purple-200 bg-purple-50/50 animate-slide-up">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-600" />
                          AI Business Insight
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed text-purple-800">{aiResponse}</p>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="gap-2">
                            <CheckCircle className="w-3 h-3" />
                            Helpful
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <MessageSquare className="w-3 h-3" />
                            Follow-up
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Target className="w-3 h-3" />
                            Create Action
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isAiThinking && (
                    <Card className="border-purple-200 animate-pulse">
                      <CardContent className="py-8">
                        <div className="flex items-center justify-center gap-3">
                          <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
                          <span className="text-purple-600">AI is analyzing your business data...</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-purple-700 mb-3">Quick Insights</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "What's my customer acquisition cost trend?",
                      "Which pricing plans perform best?",
                      "How can I reduce churn this quarter?",
                      "What's my revenue forecast for next month?"
                    ].map((question, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-left justify-start h-auto p-3 text-purple-700 hover:glass-card"
                        onClick={() => setAiQuery(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

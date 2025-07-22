import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Robot, Brain, Zap, TrendingUp, Target, Lightbulb, BarChart3, Settings, Play } from "lucide-react";

export default function IntelligentAI() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text tracking-tight">Intelligent AI Center</h1>
            <p className="text-blue-700/70 font-medium">AI-powered insights, automation, and predictive analytics</p>
          </div>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 corp-shadow">
            <Robot className="w-4 h-4" />
            Train Model
          </Button>
        </div>

        {/* AI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Active Models</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">12</div>
              <p className="text-xs text-purple-600 font-medium">Machine learning models</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Predictions</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">94.7%</div>
              <p className="text-xs text-blue-600 font-medium">Accuracy rate</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Automations</CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">47</div>
              <p className="text-xs text-green-600 font-medium">Active workflows</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Time Saved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">127</div>
              <p className="text-xs text-green-600 font-medium">Hours this month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 glass-card corp-shadow">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Predictive Analytics
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Smart Recommendations
            </TabsTrigger>
            <TabsTrigger value="workflows" className="gap-2">
              <Zap className="w-4 h-4" />
              Automated Workflows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card corp-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Revenue Predictions
                  </CardTitle>
                  <CardDescription>
                    AI-powered revenue forecasting for next 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Next Month</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">$52,340</span>
                        <Badge className="bg-green-100 text-green-700">+8.2%</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Next Quarter</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600">$164,890</span>
                        <Badge className="bg-blue-100 text-blue-700">+12.5%</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Confidence</span>
                      <Badge className="bg-purple-100 text-purple-700">94.7%</Badge>
                    </div>
                  </div>
                  <Button className="w-full gap-2">
                    <BarChart3 className="w-4 h-4" />
                    View Detailed Forecast
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card corp-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Churn Prediction
                  </CardTitle>
                  <CardDescription>
                    Identify customers at risk of cancellation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">High Risk</span>
                      <Badge className="bg-red-100 text-red-700">23 customers</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Medium Risk</span>
                      <Badge className="bg-yellow-100 text-yellow-700">47 customers</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Low Risk</span>
                      <Badge className="bg-green-100 text-green-700">1,177 customers</Badge>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Target className="w-4 h-4" />
                    Launch Retention Campaign
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>
                  Smart suggestions to optimize your business operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      title: "Optimize Billing Cycles",
                      description: "Switch 34% of monthly subscribers to annual billing for 23% revenue increase",
                      impact: "High",
                      confidence: "94%",
                      action: "Implement"
                    },
                    {
                      title: "Price Adjustment Opportunity",
                      description: "Premium tier can support 15% price increase based on usage patterns",
                      impact: "Medium",
                      confidence: "87%",
                      action: "Review"
                    },
                    {
                      title: "Customer Segmentation Update",
                      description: "Create new segment for power users to increase retention by 18%",
                      impact: "Medium",
                      confidence: "91%",
                      action: "Plan"
                    },
                    {
                      title: "Communication Optimization",
                      description: "Adjust email frequency to reduce churn by 12% in Q4",
                      impact: "Low",
                      confidence: "76%",
                      action: "Test"
                    }
                  ].map((rec, index) => (
                    <div key={index} className="p-4 glass-card rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-800 mb-1">{rec.title}</h4>
                          <p className="text-sm text-blue-600/70">{rec.description}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge className={`
                            ${rec.impact === 'High' ? 'bg-green-100 text-green-700' : ''}
                            ${rec.impact === 'Medium' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${rec.impact === 'Low' ? 'bg-blue-100 text-blue-700' : ''}
                          `}>
                            {rec.impact} Impact
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-600/70">Confidence: {rec.confidence}</span>
                        <Button size="sm" variant="outline">
                          {rec.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Automated Workflows
                </CardTitle>
                <CardDescription>
                  AI-powered automation rules and triggers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Failed Payment Recovery",
                      trigger: "Payment failure detected",
                      actions: "Send SMS → Email → Phone call",
                      status: "Active",
                      success: "78%"
                    },
                    {
                      name: "Subscription Upgrade Nudge",
                      trigger: "High usage detected",
                      actions: "In-app message → Email campaign",
                      status: "Active",
                      success: "34%"
                    },
                    {
                      name: "Churn Prevention",
                      trigger: "Low engagement score",
                      actions: "Personalized offer → Retention email",
                      status: "Active",
                      success: "67%"
                    },
                    {
                      name: "Onboarding Optimization",
                      trigger: "New subscriber detected",
                      actions: "Welcome series → Feature walkthrough",
                      status: "Testing",
                      success: "89%"
                    }
                  ].map((workflow, index) => (
                    <div key={index} className="p-4 glass-card rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-800 mb-1">{workflow.name}</h4>
                          <p className="text-sm text-blue-600/70 mb-2">
                            <strong>Trigger:</strong> {workflow.trigger}
                          </p>
                          <p className="text-sm text-blue-600/70">
                            <strong>Actions:</strong> {workflow.actions}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={`
                            ${workflow.status === 'Active' ? 'bg-green-100 text-green-700' : ''}
                            ${workflow.status === 'Testing' ? 'bg-yellow-100 text-yellow-700' : ''}
                          `}>
                            {workflow.status}
                          </Badge>
                          <span className="text-sm text-blue-600/70">Success: {workflow.success}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Settings className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Play className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

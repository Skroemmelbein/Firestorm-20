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
import {
  CreditCard,
  Brain,
  Settings,
  Play,
  Pause,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Zap,
  Download,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

interface BillingPlan {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "weekly" | "daily" | "yearly";
  trialDays: number;
  active: boolean;
  description: string;
}

interface BillingRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  conditions: string[];
  active: boolean;
}

export default function BillingLogic() {
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([
    {
      id: "1",
      name: "Basic Plan",
      amount: 29.99,
      frequency: "monthly",
      trialDays: 7,
      active: true,
      description: "Basic subscription with core features",
    },
    {
      id: "2",
      name: "Premium Plan",
      amount: 99.99,
      frequency: "monthly",
      trialDays: 14,
      active: true,
      description: "Premium subscription with advanced features",
    },
  ]);

  const [billingRules, setBillingRules] = useState<BillingRule[]>([
    {
      id: "1",
      name: "Failed Payment Retry",
      trigger: "payment_failed",
      action: "retry_payment_in_3_days",
      conditions: ["attempts < 3", "customer_active"],
      active: true,
    },
    {
      id: "2",
      name: "Dunning Email Sequence",
      trigger: "payment_failed",
      action: "send_dunning_email",
      conditions: ["attempts >= 1"],
      active: true,
    },
  ]);

  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isTestingPayment, setIsTestingPayment] = useState(false);
  const [testPaymentResult, setTestPaymentResult] = useState<any>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null);
  const [lastError, setLastError] = useState<string>("");

  // Transaction logs state
  const [transactionLogs, setTransactionLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logQuery, setLogQuery] = useState({
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    limit: 50,
  });

  const testNmiPayment = async () => {
    setIsTestingPayment(true);
    setTestPaymentResult(null);
    setLastError("");

    try {
      // Check rate limits first
      // const rateStatus = await checkRateLimitStatus();
      if (false && !false) { // Disabled rate limiting check
        const waitMinutes = Math.ceil(0 / 60000);
        setTestPaymentResult({
          success: false,
          message: "Rate Limit Active",
          suggestion: `Please wait ${waitMinutes} minute(s) before testing payments. This prevents NMI activity limit errors.`,
          waitTime: 0,
        });
        setIsTestingPayment(false);
        return;
      }

      const response = await fetch(`${window.location.origin}/api/nmi/test-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 1.0,
          customer: {
            firstName: "Test",
            lastName: "Customer",
            email: "test@ecelonx.com",
            phone: "+18144409068",
          },
          paymentMethod: {
            type: "credit_card",
            cardNumber: "4111111111111111", // Test card number
            expiryMonth: "12",
            expiryYear: "25",
            cvv: "123",
          },
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, try to get text
        const responseText = await response.text();
        result = {
          success: false,
          message: `Response parsing error: ${responseText}`,
        };
      }

      setTestPaymentResult(result);

      // Update rate limit status after request
      // setTimeout(() => checkRateLimitStatus(), 1000);
    } catch (error: any) {
      setTestPaymentResult({
        success: false,
        message: error.message || "Test payment failed",
      });
    } finally {
      setIsTestingPayment(false);
    }
  };

  const askBillingAssistant = async () => {
    if (!aiQuery.trim()) return;

    setIsAiThinking(true);

    try {
      // Simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const responses = [
        `For "${aiQuery}", I recommend implementing a 3-step dunning process: Day 1 - friendly reminder, Day 7 - urgent notice with grace period, Day 14 - final notice before suspension. This typically recovers 65% of failed payments.`,
        `Based on your query about "${aiQuery}", consider setting up automated retry logic with exponential backoff: immediate retry, then 24h, then 72h, then 7 days. This maximizes recovery while minimizing customer frustration.`,
        `For "${aiQuery}", implement segmented billing rules based on customer lifetime value. High-value customers get extended grace periods and personal outreach, while low-value accounts follow standard automation.`,
        `Your question about "${aiQuery}" suggests implementing a subscription health scoring system. Track payment success rate, engagement metrics, and support interactions to predict churn before it happens.`,
      ];

      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
    } catch (error) {
      setAiResponse(
        "Sorry, I encountered an error processing your request. Please try again.",
      );
    } finally {
      setIsAiThinking(false);
    }
  };

  const fetchTransactionLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch(`${window.location.origin}/api/nmi-logs/get-transaction-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logQuery),
      });

      const result = await response.json();

      if (result.success) {
        setTransactionLogs(result.transactions || []);
      } else {
        alert(`Failed to fetch logs: ${result.message}`);
      }
    } catch (error: any) {
      alert(`Error fetching logs: ${error.message}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  const generateCSV = (transactions: any[]) => {
    const headers = [
      "Transaction ID",
      "Order ID",
      "Amount",
      "Status",
      "Response Code",
      "Response Text",
      "Date",
      "Card Type",
      "Card Last 4",
    ];
    const rows = transactions.map((t) => [
      t.transaction_id,
      t.order_id,
      t.formatted_amount,
      t.response_category,
      t.gateway_response.response_code,
      t.gateway_response.response_text,
      t.formatted_date,
      t.card_type,
      t.card_last_four,
    ]);

    return [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Billing Logic
            </h1>
            <p className="text-muted-foreground">
              Manage billing rules, subscription plans, and automated billing
              logic
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Configure NMI
          </Button>
        </div>

        <Tabs defaultValue="billing-plans" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="billing-plans" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Billing Plans
            </TabsTrigger>
            <TabsTrigger value="billing-rules" className="gap-2">
              <Settings className="w-4 h-4" />
              Billing Rules
            </TabsTrigger>
            <TabsTrigger value="transaction-logs" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Transaction Logs
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          {/* Transaction Logs Tab */}
          <TabsContent value="transaction-logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  NMI Transaction Logs
                </CardTitle>
                <CardDescription>
                  Retrieve and analyze transaction logs directly from NMI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Query Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={logQuery.start_date}
                      onChange={(e) =>
                        setLogQuery((prev) => ({
                          ...prev,
                          start_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={logQuery.end_date}
                      onChange={(e) =>
                        setLogQuery((prev) => ({
                          ...prev,
                          end_date: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Limit</Label>
                    <Input
                      type="number"
                      value={logQuery.limit}
                      onChange={(e) =>
                        setLogQuery((prev) => ({
                          ...prev,
                          limit: parseInt(e.target.value),
                        }))
                      }
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={fetchTransactionLogs}
                      disabled={loadingLogs}
                      className="w-full"
                    >
                      {loadingLogs ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Get Logs
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Transaction Logs Display */}
                {transactionLogs.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        Found {transactionLogs.length} transactions
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const csv = generateCSV(transactionLogs);
                          downloadCSV(csv, "nmi-transactions.csv");
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export CSV
                      </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      {transactionLogs.map((transaction, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border-b last:border-b-0"
                        >
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                            <div>
                              <div className="font-medium">
                                {transaction.transaction_id}
                              </div>
                              <div className="text-gray-500">
                                {transaction.order_id}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">
                                {transaction.formatted_amount}
                              </div>
                              <div className="text-gray-500">
                                {transaction.card_type} ••••
                                {transaction.card_last_four}
                              </div>
                            </div>
                            <div>
                              <Badge
                                variant={
                                  transaction.is_approved
                                    ? "default"
                                    : "destructive"
                                }
                                className={
                                  transaction.is_approved
                                    ? "bg-green-100 text-green-800"
                                    : ""
                                }
                              >
                                {transaction.response_category}
                              </Badge>
                              <div className="text-gray-500 mt-1">
                                Code:{" "}
                                {transaction.gateway_response.response_code}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-500">
                                {transaction.formatted_date}
                              </div>
                              <div className="text-gray-500">
                                {transaction.type}
                              </div>
                            </div>
                            <div className="text-right">
                              <Button variant="ghost" size="sm">
                                <span className="w-3 h-3 mr-1">👁</span>
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {loadingLogs
                      ? "Loading transaction logs..."
                      : 'No transaction logs found. Click "Get Logs" to fetch from NMI.'}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Plans Tab */}
          <TabsContent value="billing-plans" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Subscription Plans
                    </CardTitle>
                    <CardDescription>
                      Manage your recurring billing plans and pricing
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Create Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingPlans.map((plan) => (
                    <Card key={plan.id} className="border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {plan.name}
                            </CardTitle>
                            <CardDescription>
                              {plan.description}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              ${plan.amount}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              per {plan.frequency.replace("ly", "")}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">
                              Trial Period
                            </div>
                            <div className="font-medium">
                              {plan.trialDays} days
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">
                              Frequency
                            </div>
                            <div className="font-medium capitalize">
                              {plan.frequency}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Status</div>
                            <Badge
                              variant={plan.active ? "default" : "outline"}
                            >
                              {plan.active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            Edit Plan
                          </Button>
                          <Button variant="outline" size="sm">
                            Push to NMI
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                          >
                            {plan.active ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Rules Tab */}
          <TabsContent value="billing-rules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Automated Billing Rules
                    </CardTitle>
                    <CardDescription>
                      Configure automated billing logic and customer workflows
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Zap className="w-4 h-4" />
                    Create Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {billingRules.map((rule) => (
                    <Card key={rule.id} className="border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {rule.name}
                              <Badge
                                variant={rule.active ? "default" : "outline"}
                              >
                                {rule.active ? "Active" : "Inactive"}
                              </Badge>
                            </CardTitle>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              {rule.active ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3" />
                              )}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">
                              Trigger
                            </div>
                            <div className="font-mono text-sm bg-muted/30 p-2 rounded">
                              {rule.trigger}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">
                              Action
                            </div>
                            <div className="font-mono text-sm bg-muted/30 p-2 rounded">
                              {rule.action}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">
                              Conditions
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {rule.conditions.map((condition, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  ChatGPT Billing Assistant
                </CardTitle>
                <CardDescription>
                  Get AI-powered recommendations for billing logic and customer
                  retention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ai-query">
                      Ask about billing logic, customer retention, or dunning
                      strategies
                    </Label>
                    <Textarea
                      id="ai-query"
                      placeholder="e.g., 'How should I handle customers with 3 failed payments?' or 'What's the best retry schedule for failed payments?'"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button
                    onClick={askBillingAssistant}
                    disabled={isAiThinking || !aiQuery.trim()}
                    className="gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {isAiThinking ? "AI is thinking..." : "Ask AI Assistant"}
                  </Button>

                  {aiResponse && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Brain className="w-4 h-4" />
                          AI Recommendation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{aiResponse}</p>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            Apply Suggestion
                          </Button>
                          <Button variant="ghost" size="sm">
                            Ask Follow-up
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isAiThinking && (
                    <Card className="border-border/50">
                      <CardContent className="py-8">
                        <div className="flex items-center justify-center gap-3">
                          <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-muted-foreground">
                            AI is analyzing your billing scenario...
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

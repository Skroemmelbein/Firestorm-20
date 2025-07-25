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
import {
  CreditCard,
  Database,
  Brain,
  Settings,
  Play,
  Pause,
  RotateCcw,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  Zap,
  Upload,
  Download,
  RefreshCw,
  Clock,
  Eye,
  EyeOff,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

interface NMIConfig {
  gatewayUrl: string;
  username: string;
  password: string;
  recurringVaultId: string;
}

interface BillingPlan {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'daily' | 'yearly';
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
  const [nmiConfig, setNmiConfig] = useState<NMIConfig>({
    gatewayUrl: 'https://secure.networkmerchants.com/api/transact.php',
    username: 'wwwdpcyeahcom',
    password: '!SNR96rQ9qsHdd4',
    recurringVaultId: 'vault_001'
  });

  const [showNmiPassword, setShowNmiPassword] = useState(false);
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([
    {
      id: '1',
      name: 'Basic Plan',
      amount: 29.99,
      frequency: 'monthly',
      trialDays: 7,
      active: true,
      description: 'Basic subscription with core features'
    },
    {
      id: '2',
      name: 'Premium Plan', 
      amount: 99.99,
      frequency: 'monthly',
      trialDays: 14,
      active: true,
      description: 'Premium subscription with advanced features'
    }
  ]);

  const [billingRules, setBillingRules] = useState<BillingRule[]>([
    {
      id: '1',
      name: 'Failed Payment Retry',
      trigger: 'payment_failed',
      action: 'retry_payment_in_3_days',
      conditions: ['attempts < 3', 'customer_active'],
      active: true
    },
    {
      id: '2',
      name: 'Dunning Email Sequence',
      trigger: 'payment_failed',
      action: 'send_dunning_email',
      conditions: ['attempts >= 1'],
      active: true
    }
  ]);

  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isTestingPayment, setIsTestingPayment] = useState(false);
  const [testPaymentResult, setTestPaymentResult] = useState<any>(null);

  const [nmiConnectionStatus, setNmiConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [xanoSyncStatus, setXanoSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');

  // Transaction logs state
  const [transactionLogs, setTransactionLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logQuery, setLogQuery] = useState({
    start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    limit: 50
  });

  const testNmiConnection = async () => {
    setNmiConnectionStatus('connecting');

    try {
      const response = await fetch('/api/nmi/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: nmiConfig.username,
          password: nmiConfig.password,
          gatewayUrl: nmiConfig.gatewayUrl
        })
      });

      const result = await response.json();
      setNmiConnectionStatus(result.success ? 'connected' : 'error');

      if (!result.success) {
        console.error('NMI connection failed:', result.message);
      }
    } catch (error) {
      console.error('NMI connection error:', error);
      setNmiConnectionStatus('error');
    }
  };

  const syncToXano = async () => {
    setXanoSyncStatus('syncing');
    
    try {
      // Simulate Xano sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      setXanoSyncStatus('completed');
      
      // Reset after a delay
      setTimeout(() => setXanoSyncStatus('idle'), 3000);
    } catch (error) {
      setXanoSyncStatus('error');
    }
  };

  const testNmiPayment = async () => {
    setIsTestingPayment(true);
    setTestPaymentResult(null);

    try {
      const response = await fetch('/api/nmi/test-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1.00,
          customer: {
            firstName: 'Test',
            lastName: 'Customer',
            email: 'test@ecelonx.com',
            phone: '+18144409068'
          },
          paymentMethod: {
            type: 'credit_card',
            cardNumber: '4111111111111111', // Test card number
            expiryMonth: '12',
            expiryYear: '25',
            cvv: '123'
          }
        })
      });

      const result = await response.json();
      setTestPaymentResult(result);

    } catch (error: any) {
      setTestPaymentResult({
        success: false,
        message: error.message || 'Test payment failed'
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
      await new Promise(resolve => setTimeout(resolve, 2000));

      const responses = [
        `For "${aiQuery}", I recommend implementing a 3-step dunning process: Day 1 - friendly reminder, Day 7 - urgent notice with grace period, Day 14 - final notice before suspension. This typically recovers 65% of failed payments.`,
        `Based on your query about "${aiQuery}", consider setting up automated retry logic with exponential backoff: immediate retry, then 24h, then 72h, then 7 days. This maximizes recovery while minimizing customer frustration.`,
        `For "${aiQuery}", implement segmented billing rules based on customer lifetime value. High-value customers get extended grace periods and personal outreach, while low-value accounts follow standard automation.`,
        `Your question about "${aiQuery}" suggests implementing a subscription health scoring system. Track payment success rate, engagement metrics, and support interactions to predict churn before it happens.`
      ];

      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
    } catch (error) {
      setAiResponse('Sorry, I encountered an error processing your request. Please try again.');
    } finally {
      setIsAiThinking(false);
    }
  };

  const fetchTransactionLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch('/api/nmi-logs/get-transaction-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logQuery)
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

  const StatusIndicator = ({ status }: { status: string }) => {
    const config = {
      connected: { color: 'text-green-500', icon: CheckCircle },
      connecting: { color: 'text-yellow-500', icon: RefreshCw },
      syncing: { color: 'text-blue-500', icon: RefreshCw },
      completed: { color: 'text-green-500', icon: CheckCircle },
      error: { color: 'text-red-500', icon: AlertTriangle },
      disconnected: { color: 'text-gray-500', icon: AlertTriangle },
      idle: { color: 'text-gray-500', icon: Clock }
    };
    
    const { color, icon: Icon } = config[status as keyof typeof config] || config.idle;
    const isSpinning = status === 'connecting' || status === 'syncing';
    
    return (
      <Icon className={cn('w-4 h-4', color, isSpinning && 'animate-spin')} />
    );
  };

  const generateCSV = (transactions: any[]) => {
    const headers = ['Transaction ID', 'Order ID', 'Amount', 'Status', 'Response Code', 'Response Text', 'Date', 'Card Type', 'Card Last 4'];
    const rows = transactions.map(t => [
      t.transaction_id,
      t.order_id,
      t.formatted_amount,
      t.response_category,
      t.gateway_response.response_code,
      t.gateway_response.response_text,
      t.formatted_date,
      t.card_type,
      t.card_last_four
    ]);

    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
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
            <h1 className="text-3xl font-bold text-foreground">Billing Logic</h1>
            <p className="text-muted-foreground">Manage NMI integration, billing rules, and subscription plans</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status={nmiConnectionStatus} />
            <span className="text-sm text-muted-foreground">NMI: {nmiConnectionStatus}</span>
            <StatusIndicator status={xanoSyncStatus} />
            <span className="text-sm text-muted-foreground">Xano: {xanoSyncStatus}</span>
          </div>
        </div>

        <Tabs defaultValue="nmi-setup" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="nmi-setup" className="gap-2">
              <CreditCard className="w-4 h-4" />
              NMI Setup
            </TabsTrigger>
            <TabsTrigger value="test-payment" className="gap-2">
              <Play className="w-4 h-4" />
              Test $1
            </TabsTrigger>
            <TabsTrigger value="transaction-logs" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              NMI Logs
            </TabsTrigger>
            <TabsTrigger value="billing-plans" className="gap-2">
              <DollarSign className="w-4 h-4" />
              Billing Plans
            </TabsTrigger>
            <TabsTrigger value="billing-rules" className="gap-2">
              <Settings className="w-4 h-4" />
              Billing Rules
            </TabsTrigger>
            <TabsTrigger value="ai-assistant" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Assistant
            </TabsTrigger>
          </TabsList>

          {/* NMI Setup Tab */}
          <TabsContent value="nmi-setup" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    NMI Recurring Vault Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your NMI gateway for recurring subscription billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nmi-gateway-url">Gateway URL</Label>
                    <Input
                      id="nmi-gateway-url"
                      placeholder="https://secure.nmi.com/api/transact.php"
                      value={nmiConfig.gatewayUrl}
                      onChange={(e) => setNmiConfig(prev => ({ ...prev, gatewayUrl: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nmi-username">Username</Label>
                    <Input
                      id="nmi-username"
                      placeholder="Your NMI username"
                      value={nmiConfig.username}
                      onChange={(e) => setNmiConfig(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nmi-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="nmi-password"
                        type={showNmiPassword ? "text" : "password"}
                        placeholder="Your NMI password"
                        value={nmiConfig.password}
                        onChange={(e) => setNmiConfig(prev => ({ ...prev, password: e.target.value }))}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 w-6 p-0"
                        onClick={() => setShowNmiPassword(!showNmiPassword)}
                      >
                        {showNmiPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurring-vault-id">Recurring Vault ID</Label>
                    <Input
                      id="recurring-vault-id"
                      placeholder="vault_12345"
                      value={nmiConfig.recurringVaultId}
                      onChange={(e) => setNmiConfig(prev => ({ ...prev, recurringVaultId: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use recurring vault, not customer vault for subscription billing
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={testNmiConnection} 
                      disabled={nmiConnectionStatus === 'connecting'}
                      variant="outline"
                    >
                      {nmiConnectionStatus === 'connecting' ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button 
                      onClick={syncToXano}
                      disabled={xanoSyncStatus === 'syncing' || nmiConnectionStatus !== 'connected'}
                    >
                      Sync to Xano
                    </Button>
                  </div>

                  {nmiConnectionStatus === 'error' && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Connection Failed</AlertTitle>
                      <AlertDescription>
                        Unable to connect to NMI. Please check your credentials and gateway URL.
                      </AlertDescription>
                    </Alert>
                  )}

                  {nmiConnectionStatus === 'connected' && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Connected Successfully</AlertTitle>
                      <AlertDescription>
                        NMI Recurring Vault is connected and ready for billing operations.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Data Sync Status
                  </CardTitle>
                  <CardDescription>
                    Monitor data synchronization between systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">Warchest Table</div>
                        <div className="text-sm text-muted-foreground">Primary subscription data</div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600">Synced</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">71 Cards Updated</div>
                        <div className="text-sm text-muted-foreground">Payment method updates</div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600">Synced</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">Last Billing Transaction</div>
                        <div className="text-sm text-muted-foreground">Recent billing records</div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600">Synced</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">NMI Vault Data</div>
                        <div className="text-sm text-muted-foreground">Payment vault records</div>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh Sync Status
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Test Payment Tab */}
          <TabsContent value="test-payment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  NMI $1 Test Transaction
                </CardTitle>
                <CardDescription>
                  Test your NMI integration with a $1 transaction using test credit card
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                  <h4 className="font-medium mb-2">Test Transaction Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="ml-2 font-medium">$1.00 USD</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Card:</span>
                      <span className="ml-2 font-medium">4111****1111 (Test)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Customer:</span>
                      <span className="ml-2 font-medium">Test Customer</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2 font-medium">test@ecelonx.com</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={testNmiPayment}
                    disabled={isTestingPayment || nmiConnectionStatus !== 'connected'}
                    size="lg"
                    className="gap-2 px-8"
                  >
                    {isTestingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing $1 Test...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Run $1 Test Transaction
                      </>
                    )}
                  </Button>
                </div>

                {nmiConnectionStatus !== 'connected' && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Connection Required</AlertTitle>
                    <AlertDescription>
                      Please test your NMI connection in the "NMI Setup" tab before running payment tests.
                    </AlertDescription>
                  </Alert>
                )}

                {testPaymentResult && (
                  <Card className={testPaymentResult.success ? "border-green-500/50 bg-green-50/30" : "border-red-500/50 bg-red-50/30"}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {testPaymentResult.success ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Payment Test Successful
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            Payment Test Failed
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="font-mono text-sm bg-muted/50 p-3 rounded">
                          <pre>{JSON.stringify(testPaymentResult, null, 2)}</pre>
                        </div>

                        {testPaymentResult.success && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Transaction ID:</span>
                              <span className="font-medium">{testPaymentResult.transactionId || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Status:</span>
                              <span className="font-medium text-green-600">Approved</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-medium">$1.00</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => setTestPaymentResult(null)}>
                            Clear Results
                          </Button>
                          {testPaymentResult.success && (
                            <Button variant="outline" size="sm">
                              View in Dashboard
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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
                      onChange={(e) => setLogQuery(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={logQuery.end_date}
                      onChange={(e) => setLogQuery(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Limit</Label>
                    <Input
                      type="number"
                      value={logQuery.limit}
                      onChange={(e) => setLogQuery(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
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
                      <h4 className="font-medium">Found {transactionLogs.length} transactions</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const csv = generateCSV(transactionLogs);
                          downloadCSV(csv, 'nmi-transactions.csv');
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export CSV
                      </Button>
                    </div>

                    <div className="max-h-96 overflow-y-auto border rounded-lg">
                      {transactionLogs.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
                            <div>
                              <div className="font-medium">{transaction.transaction_id}</div>
                              <div className="text-gray-500">{transaction.order_id}</div>
                            </div>
                            <div>
                              <div className="font-medium">{transaction.formatted_amount}</div>
                              <div className="text-gray-500">{transaction.card_type} ••••{transaction.card_last_four}</div>
                            </div>
                            <div>
                              <Badge
                                variant={transaction.is_approved ? "default" : "destructive"}
                                className={transaction.is_approved ? "bg-green-100 text-green-800" : ""}
                              >
                                {transaction.response_category}
                              </Badge>
                              <div className="text-gray-500 mt-1">Code: {transaction.gateway_response.response_code}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">{transaction.formatted_date}</div>
                              <div className="text-gray-500">{transaction.type}</div>
                            </div>
                            <div className="text-right">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-3 h-3 mr-1" />
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
                    {loadingLogs ? 'Loading transaction logs...' : 'No transaction logs found. Click "Get Logs" to fetch from NMI.'}
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
                            <CardTitle className="text-lg">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">${plan.amount}</div>
                            <div className="text-sm text-muted-foreground">per {plan.frequency.replace('ly', '')}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Trial Period</div>
                            <div className="font-medium">{plan.trialDays} days</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Frequency</div>
                            <div className="font-medium capitalize">{plan.frequency}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Status</div>
                            <Badge variant={plan.active ? "default" : "outline"}>
                              {plan.active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">Edit Plan</Button>
                          <Button variant="outline" size="sm">Push to NMI</Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                            {plan.active ? 'Deactivate' : 'Activate'}
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
                              <Badge variant={rule.active ? "default" : "outline"}>
                                {rule.active ? 'Active' : 'Inactive'}
                              </Badge>
                            </CardTitle>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              {rule.active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
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
                            <div className="text-sm font-medium text-muted-foreground">Trigger</div>
                            <div className="font-mono text-sm bg-muted/30 p-2 rounded">
                              {rule.trigger}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Action</div>
                            <div className="font-mono text-sm bg-muted/30 p-2 rounded">
                              {rule.action}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Conditions</div>
                            <div className="flex gap-1 flex-wrap">
                              {rule.conditions.map((condition, index) => (
                                <Badge key={index} variant="outline" className="font-mono text-xs">
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
                  Get AI-powered recommendations for billing logic and customer retention
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ai-query">Ask about billing logic, customer retention, or dunning strategies</Label>
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
                    {isAiThinking ? 'AI is thinking...' : 'Ask AI Assistant'}
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
                          <span className="text-muted-foreground">AI is analyzing your billing scenario...</span>
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

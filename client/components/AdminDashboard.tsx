import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Play,
  BarChart3,
  Filter,
  Download,
  Search,
  Calendar,
  Zap,
  Shield,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillingKPI {
  approvalRate: number;
  mrr: number;
  activeSubscriptions: number;
  churnRate: number;
  retrySuccessRate: number;
  totalRevenue: number;
}

interface DeclineInsight {
  response_code: string;
  response_text: string;
  decline_count: number;
  card_brand: string;
  retry_stage: string;
  percentage: number;
}

interface Subscription {
  id: number;
  user_email: string;
  plan_name: string;
  status: string;
  amount_cents: number;
  next_bill_at: string;
  retries: number;
  last_attempt_at: string;
}

export default function AdminDashboard() {
  const [kpis, setKpis] = useState<BillingKPI>({
    approvalRate: 94.2,
    mrr: 125690,
    activeSubscriptions: 2847,
    churnRate: 2.1,
    retrySuccessRate: 68.5,
    totalRevenue: 1256900
  });

  const [declineInsights, setDeclineInsights] = useState<DeclineInsight[]>([
    { response_code: '05', response_text: 'Do not honor', decline_count: 156, card_brand: 'visa', retry_stage: 'initial', percentage: 34.2 },
    { response_code: '51', response_text: 'Insufficient funds', decline_count: 98, card_brand: 'mastercard', retry_stage: 'initial', percentage: 21.5 },
    { response_code: '14', response_text: 'Invalid card number', decline_count: 67, card_brand: 'visa', retry_stage: 'retry_1', percentage: 14.7 },
    { response_code: '54', response_text: 'Expired card', decline_count: 45, card_brand: 'amex', retry_stage: 'initial', percentage: 9.9 },
    { response_code: '61', response_text: 'Exceeds withdrawal limit', decline_count: 32, card_brand: 'discover', retry_stage: 'retry_2', percentage: 7.0 }
  ]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: 1, user_email: 'user1@example.com', plan_name: 'Premium Monthly', status: 'active', amount_cents: 4999, next_bill_at: '2024-02-15', retries: 0, last_attempt_at: '2024-01-15' },
    { id: 2, user_email: 'user2@example.com', plan_name: 'Basic Monthly', status: 'past_due', amount_cents: 2999, next_bill_at: '2024-02-10', retries: 2, last_attempt_at: '2024-02-12' },
    { id: 3, user_email: 'user3@example.com', plan_name: 'Premium Yearly', status: 'active', amount_cents: 49999, next_bill_at: '2024-12-01', retries: 0, last_attempt_at: '2024-01-01' }
  ]);

  const [loading, setLoading] = useState(false);
  const [testingEnabled, setTestingEnabled] = useState(true);
  const [descriptorBase, setDescriptorBase] = useState('ECELONX Subscription');
  const [networkTokensEnabled, setNetworkTokensEnabled] = useState(false);
  const [autoUpdaterEnabled, setAutoUpdaterEnabled] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState('7d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const formatAmount = (cents: number) => `$${(cents / 100).toLocaleString()}`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDeclineColor = (responseCode: string) => {
    switch (responseCode) {
      case '05': return 'text-red-600';
      case '51': return 'text-orange-600';
      case '14': return 'text-purple-600';
      case '54': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleForceRebill = async (subscriptionId: number) => {
    if (!confirm('Force rebill this subscription now?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/billing/charge-recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_id: subscriptionId })
      });

      const result = await response.json();
      
      if (result.success) {
        // Refresh subscription data
        loadDashboardData();
      } else {
        alert(`Rebill failed: ${result.message}`);
      }
    } catch (error) {
      alert('Error processing rebill');
    } finally {
      setLoading(false);
    }
  };

  const handleRunBillingCycle = async () => {
    if (!confirm('Run billing cycle for all due subscriptions?')) return;

    setLoading(true);
    try {
      const response = await fetch('/api/billing/run-recurring-billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Billing cycle complete: ${result.summary.successful} successful, ${result.summary.failed} failed`);
        loadDashboardData();
      } else {
        alert(`Billing cycle failed: ${result.message}`);
      }
    } catch (error) {
      alert('Error running billing cycle');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateCycle = () => {
    // For testing - simulate various scenarios
    const scenarios = [
      'Successful payment',
      'Insufficient funds (retry scheduled)',
      'Expired card (requires update)',
      'Do not honor (retry with descriptor variation)'
    ];
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    alert(`Simulated: ${randomScenario}`);
  };

  const loadDashboardData = async () => {
    // In real implementation, fetch from API
    // For now, using mock data
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
    if (searchTerm && !sub.user_email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing Dashboard</h1>
          <p className="text-gray-600">High-approval recurring billing management</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleRunBillingCycle} disabled={loading}>
            <Play className="w-4 h-4 mr-2" />
            Run Billing Cycle
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-bold text-green-600">{kpis.approvalRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">MRR</p>
                <p className="text-2xl font-bold">{formatAmount(kpis.mrr)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Subs</p>
                <p className="text-2xl font-bold">{kpis.activeSubscriptions.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold text-orange-600">{kpis.churnRate}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Retry Success</p>
                <p className="text-2xl font-bold text-cyan-600">{kpis.retrySuccessRate}%</p>
              </div>
              <RefreshCw className="w-8 h-8 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{formatAmount(kpis.totalRevenue)}</p>
              </div>
              <Target className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="declines">Decline Insights</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly recurring revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center text-gray-500">
                  📊 Revenue chart would render here
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={handleRunBillingCycle}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Billing Cycle
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleSimulateCycle}>
                  <Zap className="w-4 h-4 mr-2" />
                  Simulate Cycle (QA)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  System Health Check
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest billing events and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '2 min ago', event: 'Successful MIT charge: user@example.com', type: 'success' },
                  { time: '5 min ago', event: 'Retry scheduled: Insufficient funds', type: 'warning' },
                  { time: '12 min ago', event: 'New subscription created: Premium Monthly', type: 'info' },
                  { time: '18 min ago', event: 'Card updated via CIT: user2@example.com', type: 'info' },
                  { time: '1 hour ago', event: 'Billing cycle completed: 95.2% success rate', type: 'success' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                    )} />
                    <div className="flex-1">
                      <span className="text-sm">{activity.event}</span>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
              <CardDescription>Manage customer subscriptions and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSubscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="font-medium">{subscription.user_email}</p>
                        <p className="text-sm text-gray-500">{subscription.plan_name}</p>
                      </div>
                      <div>
                        {getStatusBadge(subscription.status)}
                        {subscription.retries > 0 && (
                          <p className="text-xs text-orange-600 mt-1">
                            {subscription.retries} failed attempts
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{formatAmount(subscription.amount_cents)}</p>
                        <p className="text-sm text-gray-500">Next: {subscription.next_bill_at}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleForceRebill(subscription.id)}
                          disabled={loading}
                        >
                          Force Rebill
                        </Button>
                        <Button size="sm" variant="ghost">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decline Insights Tab */}
        <TabsContent value="declines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Decline Reason Analysis
              </CardTitle>
              <CardDescription>
                Understand payment failures to optimize approval rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {declineInsights.map((insight, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className={cn("font-mono text-sm px-2 py-1 rounded", getDeclineColor(insight.response_code))}>
                          {insight.response_code}
                        </div>
                        <span className="font-medium">{insight.response_text}</span>
                        <Badge variant="outline" className="capitalize">
                          {insight.card_brand}
                        </Badge>
                        <Badge variant="secondary">
                          {insight.retry_stage.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {insight.decline_count} occurrences
                        </span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${insight.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {insight.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Decline Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to improve approval rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertTitle>High "Do Not Honor" Rates</AlertTitle>
                  <AlertDescription>
                    Consider implementing descriptor variation for retry attempts to reduce issuer soft blocks.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertTitle>Expired Card Pattern</AlertTitle>
                  <AlertDescription>
                    9.9% of declines are expired cards. Enable Automatic Card Updater to reduce these failures.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertTitle>Visa Performance</AlertTitle>
                  <AlertDescription>
                    Visa cards show higher decline rates on retries. Consider Network Tokenization for improved routing.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure payment processing behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="descriptor">Descriptor Base</Label>
                  <Input
                    id="descriptor"
                    value={descriptorBase}
                    onChange={(e) => setDescriptorBase(e.target.value)}
                    placeholder="ECELONX Subscription"
                  />
                  <p className="text-xs text-gray-500">
                    What appears on customer credit card statements
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Network Tokens</Label>
                    <p className="text-sm text-gray-500">Enhanced security and approval rates</p>
                  </div>
                  <Button 
                    variant={networkTokensEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNetworkTokensEnabled(!networkTokensEnabled)}
                  >
                    {networkTokensEnabled ? "ON" : "OFF"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Automatic Card Updater</Label>
                    <p className="text-sm text-gray-500">Auto-update expired card information</p>
                  </div>
                  <Button 
                    variant={autoUpdaterEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoUpdaterEnabled(!autoUpdaterEnabled)}
                  >
                    {autoUpdaterEnabled ? "ON" : "OFF"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  System Status
                </CardTitle>
                <CardDescription>Monitor integration health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>NMI Gateway</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Xano Database</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Webhook Endpoints</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cron Jobs</span>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Running
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Testing Controls
              </CardTitle>
              <CardDescription>
                QA tools for testing billing scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleSimulateCycle} className="h-20 flex-col gap-2">
                  <Play className="w-5 h-5" />
                  <span>Simulate Billing Cycle</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col gap-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Test CIT Transaction</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>Test MIT Transaction</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Test Decline Scenarios</span>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Testing Matrix</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>✅ CIT Success + Token Created</span>
                    <Badge variant="outline">Passed</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>✅ MIT Success</span>
                    <Badge variant="outline">Passed</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>🔄 Decline (05) → Retries</span>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>⏳ Expired Card → Update Flow</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>⏳ Descriptor Variation</span>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

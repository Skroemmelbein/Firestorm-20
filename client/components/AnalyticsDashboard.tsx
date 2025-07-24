import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Mail, 
  MessageCircle, 
  DollarSign,
  Activity,
  Target,
  Eye,
  MousePointer,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  format?: 'number' | 'currency' | 'percentage';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, format = 'number' }) => {
  const formatValue = (val: string | number) => {
    if (format === 'currency') return `$${val}`;
    if (format === 'percentage') return `${val}%`;
    return val;
  };

  return (
    <Card className="border-[#0066FF]/20 bg-gradient-to-br from-white to-[#0066FF]/5">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-[#0066FF]">{icon}</div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {change > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // Sample data for charts
  const performanceData = [
    { date: '2024-01-01', opens: 1240, clicks: 320, conversions: 45, revenue: 2250 },
    { date: '2024-01-02', opens: 1380, clicks: 380, conversions: 52, revenue: 2600 },
    { date: '2024-01-03', opens: 1560, clicks: 420, conversions: 61, revenue: 3050 },
    { date: '2024-01-04', opens: 1320, clicks: 340, conversions: 48, revenue: 2400 },
    { date: '2024-01-05', opens: 1680, clicks: 480, conversions: 68, revenue: 3400 },
    { date: '2024-01-06', opens: 1890, clicks: 520, conversions: 74, revenue: 3700 },
    { date: '2024-01-07', opens: 2100, clicks: 580, conversions: 82, revenue: 4100 }
  ];

  const channelData = [
    { name: 'Email', value: 45, color: '#0066FF' },
    { name: 'SMS', value: 25, color: '#00D4FF' },
    { name: 'Social', value: 20, color: '#FF6B6B' },
    { name: 'Push', value: 10, color: '#4ECDC4' }
  ];

  const campaignPerformance = [
    { name: 'Black Friday Sale', sent: 15000, opened: 7200, clicked: 1800, converted: 270, roi: 485, status: 'active' },
    { name: 'Product Launch', sent: 8500, opened: 4250, clicked: 1062, converted: 148, roi: 312, status: 'completed' },
    { name: 'Welcome Series', sent: 12000, opened: 6600, clicked: 1320, converted: 198, roi: 267, status: 'active' },
    { name: 'Re-engagement', sent: 5000, opened: 1500, clicked: 300, converted: 30, roi: 120, status: 'paused' },
    { name: 'Holiday Special', sent: 20000, opened: 11000, clicked: 2200, converted: 440, roi: 620, status: 'active' }
  ];

  const realtimeMetrics = {
    activeVisitors: 1247,
    emailsSent: 3420,
    smsDelivered: 1280,
    conversions: 89,
    revenue: 12450,
    openRate: 28.5,
    clickRate: 6.8,
    conversionRate: 2.1
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0066FF] to-[#00D4FF] bg-clip-text text-transparent">
            FIRESTORM Analytics
          </h1>
          <p className="text-gray-600">Real-time campaign performance and insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-xs">
            Last updated: {lastUpdated}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-[#0066FF]/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="bg-[#0066FF] hover:bg-[#0066FF]/90">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Visitors"
          value={realtimeMetrics.activeVisitors.toLocaleString()}
          change={12.5}
          icon={<Activity className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Revenue"
          value={realtimeMetrics.revenue.toLocaleString()}
          change={8.2}
          icon={<DollarSign className="h-5 w-5" />}
          format="currency"
        />
        <MetricCard
          title="Open Rate"
          value={realtimeMetrics.openRate}
          change={2.3}
          icon={<Eye className="h-5 w-5" />}
          format="percentage"
        />
        <MetricCard
          title="Conversion Rate"
          value={realtimeMetrics.conversionRate}
          change={-1.2}
          icon={<Target className="h-5 w-5" />}
          format="percentage"
        />
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend */}
            <Card className="border-[#0066FF]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-[#0066FF]" />
                  <span>Performance Trend</span>
                </CardTitle>
                <CardDescription>Campaign performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip />
                    <Area type="monotone" dataKey="opens" stackId="1" stroke="#0066FF" fill="#0066FF" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="clicks" stackId="1" stroke="#00D4FF" fill="#00D4FF" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="conversions" stackId="1" stroke="#FF6B6B" fill="#FF6B6B" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Channel Distribution */}
            <Card className="border-[#0066FF]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-[#0066FF]" />
                  <span>Channel Distribution</span>
                </CardTitle>
                <CardDescription>Performance by channel</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Tracking */}
          <Card className="border-[#0066FF]/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-[#0066FF]" />
                <span>Revenue Tracking</span>
              </CardTitle>
              <CardDescription>Revenue and ROI performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card className="border-[#0066FF]/20">
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Detailed performance metrics for all campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#0066FF]/20">
                      <th className="text-left p-3 font-medium">Campaign</th>
                      <th className="text-left p-3 font-medium">Sent</th>
                      <th className="text-left p-3 font-medium">Opened</th>
                      <th className="text-left p-3 font-medium">Clicked</th>
                      <th className="text-left p-3 font-medium">Converted</th>
                      <th className="text-left p-3 font-medium">ROI</th>
                      <th className="text-left p-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaignPerformance.map((campaign, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="p-3 font-medium">{campaign.name}</td>
                        <td className="p-3">{campaign.sent.toLocaleString()}</td>
                        <td className="p-3">{campaign.opened.toLocaleString()}</td>
                        <td className="p-3">{campaign.clicked.toLocaleString()}</td>
                        <td className="p-3">{campaign.converted.toLocaleString()}</td>
                        <td className="p-3 font-medium text-green-600">{campaign.roi}%</td>
                        <td className="p-3">
                          <Badge 
                            variant={campaign.status === 'active' ? 'default' : campaign.status === 'completed' ? 'secondary' : 'outline'}
                            className={campaign.status === 'active' ? 'bg-[#0066FF]' : ''}
                          >
                            {campaign.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Email Sent"
              value={realtimeMetrics.emailsSent.toLocaleString()}
              change={15.2}
              icon={<Mail className="h-5 w-5" />}
            />
            <MetricCard
              title="SMS Delivered"
              value={realtimeMetrics.smsDelivered.toLocaleString()}
              change={23.5}
              icon={<MessageCircle className="h-5 w-5" />}
            />
            <MetricCard
              title="Click Rate"
              value={realtimeMetrics.clickRate}
              change={4.1}
              icon={<MousePointer className="h-5 w-5" />}
              format="percentage"
            />
            <MetricCard
              title="Total Conversions"
              value={realtimeMetrics.conversions}
              change={18.7}
              icon={<Target className="h-5 w-5" />}
            />
          </div>

          <Card className="border-[#0066FF]/20">
            <CardHeader>
              <CardTitle>Channel Performance Comparison</CardTitle>
              <CardDescription>Compare performance across all marketing channels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0066FF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-[#0066FF]/20">
              <CardHeader>
                <CardTitle>Audience Engagement</CardTitle>
                <CardDescription>Engagement levels by audience segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">High Value Customers</span>
                    <span className="text-sm text-green-600">92% engaged</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">New Subscribers</span>
                    <span className="text-sm text-blue-600">78% engaged</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Inactive Users</span>
                    <span className="text-sm text-orange-600">34% re-engaged</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '34%'}}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#0066FF]/20">
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
                <CardDescription>Audience breakdown by key demographics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Age Groups</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs">18-24</span>
                        <span className="text-xs">15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">25-34</span>
                        <span className="text-xs">35%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">35-44</span>
                        <span className="text-xs">28%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs">45+</span>
                        <span className="text-xs">22%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-[#0066FF]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-[#0066FF]" />
                  <span>Live Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active campaigns</span>
                    <Badge className="bg-green-500">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Emails in queue</span>
                    <Badge variant="outline">247</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS pending</span>
                    <Badge variant="outline">89</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#0066FF]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-[#0066FF]" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Email opened - Black Friday Sale</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>SMS delivered - Product Launch</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Conversion - Welcome Series</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#0066FF]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-[#0066FF]" />
                  <span>Performance Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Monthly Revenue</span>
                      <span className="text-sm">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#0066FF] h-2 rounded-full" style={{width: '78%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Open Rate Target</span>
                      <span className="text-sm">95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '95%'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

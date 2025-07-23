import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Send,
  Eye,
  Edit,
  Trash2,
  FileText,
  Gavel,
  Target,
  Zap,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  CreditCard,
  UserCheck,
  Database,
  Mail,
  Phone,
  Calendar,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

interface Chargeback {
  id: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  amount: number;
  disputeCode: string;
  disputeReason: string;
  dateDisputed: Date;
  dueDate: Date;
  status: 'new' | 'investigating' | 'responded' | 'won' | 'lost' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'critical';
  evidenceStatus: 'none' | 'partial' | 'complete';
  autoResponse: boolean;
  winProbability: number;
}

interface ChargebackStats {
  thisMonth: number;
  thisQuarter: number;
  ytd: number;
  winRate: number;
  avgResponseTime: number;
  totalDisputed: number;
}

export default function ChargebackTracker() {
  const [chargebacks, setChargebacks] = useState<Chargeback[]>([
    {
      id: 'CB001',
      transactionId: '80595924715',
      customerId: 'CUST_001',
      customerName: 'Jeffrey Lesmeister',
      amount: 84.99,
      disputeCode: '53',
      disputeReason: 'Not as Described',
      dateDisputed: new Date('2024-08-15'),
      dueDate: new Date('2024-08-29'),
      status: 'investigating',
      priority: 'high',
      evidenceStatus: 'complete',
      autoResponse: true,
      winProbability: 94
    },
    {
      id: 'CB002',
      transactionId: '80595924716',
      customerId: 'CUST_002', 
      customerName: 'Sarah Johnson',
      amount: 59.99,
      disputeCode: '75',
      disputeReason: 'Transaction Not Recognized',
      dateDisputed: new Date('2024-08-14'),
      dueDate: new Date('2024-08-28'),
      status: 'new',
      priority: 'medium',
      evidenceStatus: 'partial',
      autoResponse: false,
      winProbability: 78
    },
    {
      id: 'CB003',
      transactionId: '80595924717',
      customerId: 'CUST_003',
      customerName: 'Mike Chen', 
      amount: 129.99,
      disputeCode: '41',
      disputeReason: 'Cancelled Recurring Transaction',
      dateDisputed: new Date('2024-08-13'),
      dueDate: new Date('2024-08-27'),
      status: 'responded',
      priority: 'low',
      evidenceStatus: 'complete',
      autoResponse: true,
      winProbability: 85
    }
  ]);

  const [stats] = useState<ChargebackStats>({
    thisMonth: 0.58,
    thisQuarter: 0.61,
    ytd: 0.54,
    winRate: 87.3,
    avgResponseTime: 2.4,
    totalDisputed: 12450.87
  });

  const [selectedChargeback, setSelectedChargeback] = useState<Chargeback | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChargebacks = chargebacks.filter(cb => {
    const matchesStatus = filterStatus === 'all' || cb.status === filterStatus;
    const matchesSearch = cb.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cb.transactionId.includes(searchTerm) ||
                         cb.disputeReason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: Chargeback['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700 border-blue-200',
      investigating: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      responded: 'bg-purple-100 text-purple-700 border-purple-200',
      won: 'bg-green-100 text-green-700 border-green-200',
      lost: 'bg-red-100 text-red-700 border-red-200',
      expired: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Chargeback['priority']) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[priority];
  };

  const generateAutoRebuttal = (chargeback: Chargeback) => {
    // This would integrate with your rebuttal template system
    console.log(`Generating auto-rebuttal for ${chargeback.id}`);
  };

  const daysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text tracking-tight">Chargeback Defense Center</h1>
            <p className="text-blue-700/70 font-medium">Automated chargeback response and dispute management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 border-blue-200 text-blue-700">
              <Upload className="w-4 h-4" />
              Import Disputes
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 corp-shadow">
              <Zap className="w-4 h-4" />
              Auto-Respond All
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">This Month</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{stats.thisMonth}%</div>
              <p className="text-xs text-green-600 font-medium">Chargeback ratio</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Win Rate</CardTitle>
              <Target className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{stats.winRate}%</div>
              <p className="text-xs text-green-600 font-medium">Disputes won</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Response Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{stats.avgResponseTime}</div>
              <p className="text-xs text-blue-600 font-medium">Avg days</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Active Cases</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{chargebacks.filter(cb => ['new', 'investigating'].includes(cb.status)).length}</div>
              <p className="text-xs text-yellow-600 font-medium">Need attention</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Auto-Response</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{chargebacks.filter(cb => cb.autoResponse).length}</div>
              <p className="text-xs text-purple-600 font-medium">Automated</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Total Disputed</CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">${stats.totalDisputed.toLocaleString()}</div>
              <p className="text-xs text-red-600 font-medium">This month</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 glass-card corp-shadow">
            <TabsTrigger value="dashboard" className="gap-2">
              <Shield className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="cases" className="gap-2">
              <FileText className="w-4 h-4" />
              Active Cases
            </TabsTrigger>
            <TabsTrigger value="evidence" className="gap-2">
              <Database className="w-4 h-4" />
              Evidence Vault
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Zap className="w-4 h-4" />
              Automation
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 glass-card corp-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Chargeback Trends
                  </CardTitle>
                  <CardDescription>Monthly chargeback ratios and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-blue-600/70">This Month</div>
                        <div className="text-xl font-bold text-blue-800">{stats.thisMonth}%</div>
                        <div className="w-full bg-blue-100 rounded-full h-2 mt-2">
                          <div className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full" style={{width: `${stats.thisMonth * 10}%`}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-blue-600/70">This Quarter</div>
                        <div className="text-xl font-bold text-blue-800">{stats.thisQuarter}%</div>
                        <div className="w-full bg-blue-100 rounded-full h-2 mt-2">
                          <div className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full" style={{width: `${stats.thisQuarter * 10}%`}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-blue-600/70">YTD</div>
                        <div className="text-xl font-bold text-blue-800">{stats.ytd}%</div>
                        <div className="w-full bg-blue-100 rounded-full h-2 mt-2">
                          <div className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full" style={{width: `${stats.ytd * 10}%`}}></div>
                        </div>
                      </div>
                    </div>

                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Excellent Performance</AlertTitle>
                      <AlertDescription className="text-green-700">
                        All ratios are well below 1% threshold. Automated defense system is performing optimally.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card corp-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Urgent Actions
                  </CardTitle>
                  <CardDescription>Cases requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chargebacks.filter(cb => daysUntilDue(cb.dueDate) <= 3).map((chargeback) => (
                      <div key={chargeback.id} className="p-3 glass-card rounded-lg border-l-4 border-l-red-500">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-blue-800">{chargeback.customerName}</span>
                          <Badge className="bg-red-100 text-red-700">
                            {daysUntilDue(chargeback.dueDate)}d left
                          </Badge>
                        </div>
                        <div className="text-sm text-blue-600/70">
                          ${chargeback.amount} • {chargeback.disputeReason}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="text-xs">
                            <Zap className="w-3 h-3 mr-1" />
                            Auto-Respond
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Active Cases Tab */}
          <TabsContent value="cases" className="space-y-4">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Chargeback Cases
                    </CardTitle>
                    <CardDescription>Manage all active and historical disputes</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-4 h-4" />
                      <Input
                        placeholder="Search cases..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="won">Won</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredChargebacks.map((chargeback) => (
                    <Card 
                      key={chargeback.id} 
                      className={cn(
                        "border-border/50 cursor-pointer transition-all hover:shadow-sm corp-shadow",
                        selectedChargeback?.id === chargeback.id && "ring-2 ring-blue-500"
                      )}
                      onClick={() => setSelectedChargeback(chargeback)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-blue-800">{chargeback.customerName}</span>
                              <Badge className={getStatusColor(chargeback.status)}>
                                {chargeback.status}
                              </Badge>
                              <Badge className={getPriorityColor(chargeback.priority)}>
                                {chargeback.priority}
                              </Badge>
                              {chargeback.autoResponse && (
                                <Badge className="bg-purple-100 text-purple-700">
                                  <Zap className="w-3 h-3 mr-1" />
                                  Auto
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-blue-600/70">Amount:</span>
                                <div className="font-medium text-blue-800">${chargeback.amount}</div>
                              </div>
                              <div>
                                <span className="text-blue-600/70">Dispute Code:</span>
                                <div className="font-medium text-blue-800">{chargeback.disputeCode}</div>
                              </div>
                              <div>
                                <span className="text-blue-600/70">Win Probability:</span>
                                <div className="font-medium text-green-600">{chargeback.winProbability}%</div>
                              </div>
                              <div>
                                <span className="text-blue-600/70">Due Date:</span>
                                <div className="font-medium text-blue-800">
                                  {daysUntilDue(chargeback.dueDate)} days
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2 text-sm text-blue-600/70">
                              <strong>Reason:</strong> {chargeback.disputeReason} • 
                              <strong> Transaction:</strong> {chargeback.transactionId}
                            </div>
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button size="sm" className="gap-1">
                              <Gavel className="w-3 h-3" />
                              Respond
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evidence Vault Tab */}
          <TabsContent value="evidence" className="space-y-4">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Evidence Management System
                </CardTitle>
                <CardDescription>
                  Automated evidence collection and rebuttal packet generation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4 border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-3 mb-2">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Identity & Auth</span>
                    </div>
                    <ul className="text-sm space-y-1 text-blue-700">
                      <li>✅ Signed agreements</li>
                      <li>✅ IP address logs</li>
                      <li>✅ Device fingerprints</li>
                      <li>✅ Plaid verification</li>
                      <li>✅ 3DS authentication</li>
                    </ul>
                  </Card>

                  <Card className="p-4 border-green-200 bg-green-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Fulfillment</span>
                    </div>
                    <ul className="text-sm space-y-1 text-green-700">
                      <li>✅ Welcome emails</li>
                      <li>✅ Service delivery</li>
                      <li>✅ Usage logs</li>
                      <li>✅ Access records</li>
                      <li>✅ Terms acceptance</li>
                    </ul>
                  </Card>

                  <Card className="p-4 border-purple-200 bg-purple-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Phone className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-purple-800">Communication</span>
                    </div>
                    <ul className="text-sm space-y-1 text-purple-700">
                      <li>✅ SMS notifications</li>
                      <li>✅ Email threads</li>
                      <li>✅ Support tickets</li>
                      <li>✅ Call recordings</li>
                      <li>✅ Chat transcripts</li>
                    </ul>
                  </Card>

                  <Card className="p-4 border-orange-200 bg-orange-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Gavel className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Legal Framework</span>
                    </div>
                    <ul className="text-sm space-y-1 text-orange-700">
                      <li>✅ Visa regulations</li>
                      <li>✅ Mastercard rules</li>
                      <li>✅ E-SIGN compliance</li>
                      <li>✅ NACHA standards</li>
                      <li>✅ State laws</li>
                    </ul>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card corp-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Auto-Response Rules
                  </CardTitle>
                  <CardDescription>Configure automated chargeback responses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Card className="border-green-200 bg-green-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-green-800">High-Evidence Cases</span>
                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Auto-respond to disputes with 90%+ evidence completeness
                      </p>
                      <div className="text-xs text-green-600">
                        Last 30 days: 47 cases • 94% win rate
                      </div>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-blue-800">Friendly Fraud Detection</span>
                        <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                      </div>
                      <p className="text-sm text-blue-700 mb-3">
                        Auto-escalate suspected friendly fraud cases
                      </p>
                      <div className="text-xs text-blue-600">
                        Detection accuracy: 87% • False positives: 3%
                      </div>
                    </Card>

                    <Card className="border-purple-200 bg-purple-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-purple-800">Template Selection</span>
                        <Badge className="bg-purple-100 text-purple-700">Active</Badge>
                      </div>
                      <p className="text-sm text-purple-700 mb-3">
                        AI selects optimal rebuttal template based on dispute code
                      </p>
                      <div className="text-xs text-purple-600">
                        Template accuracy: 96% • Manual overrides: 8%
                      </div>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card corp-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Success Metrics
                  </CardTitle>
                  <CardDescription>Automated defense system performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">Overall Win Rate</span>
                        <span className="text-lg font-bold text-green-600">87.3%</span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full" style={{width: '87.3%'}}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">Auto-Response Rate</span>
                        <span className="text-lg font-bold text-blue-600">76%</span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-3">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full" style={{width: '76%'}}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-800">Evidence Collection</span>
                        <span className="text-lg font-bold text-purple-600">94%</span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-3">
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full" style={{width: '94%'}}></div>
                      </div>
                    </div>

                    <Alert className="border-blue-200 bg-blue-50">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">AI Enhancement Ready</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        System has learned from 500+ cases. Ready for advanced ML deployment.
                      </AlertDescription>
                    </Alert>
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

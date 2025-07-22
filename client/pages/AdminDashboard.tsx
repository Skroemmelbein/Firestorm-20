import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Database, 
  Upload, 
  Download,
  Settings,
  Activity,
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Zap,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

interface TableUpload {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'uploaded' | 'processed';
  recordCount?: number;
  uploadedAt?: Date;
}

export default function AdminDashboard() {
  const [uploads, setUploads] = useState<TableUpload[]>([
    {
      id: 'warchest',
      name: 'Warchest',
      description: 'Primary subscription data table',
      status: 'pending'
    },
    {
      id: 'cards-updated',
      name: '71 Cards Updated',
      description: 'Customer payment card information',
      status: 'pending'
    },
    {
      id: 'billing-transaction',
      name: 'Last Billing Transaction',
      description: 'Recent billing transaction records',
      status: 'pending'
    },
    {
      id: 'nmi-vault',
      name: 'NMI Vault',
      description: 'NMI customer vault data',
      status: 'pending'
    }
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalSubscriptions: 847,
    activeSubscriptions: 743,
    monthlyRevenue: 45670,
    successRate: 94.2
  });

  const handleFileUpload = async (uploadId: string, file: File) => {
    setUploads(prev => prev.map(upload => 
      upload.id === uploadId 
        ? { ...upload, status: 'uploaded', uploadedAt: new Date() }
        : upload
    ));

    // Simulate processing
    setTimeout(() => {
      setUploads(prev => prev.map(upload => 
        upload.id === uploadId 
          ? { ...upload, status: 'processed', recordCount: Math.floor(Math.random() * 1000) + 100 }
          : upload
      ));
    }, 2000);
  };

  const processToXano = async () => {
    setIsProcessing(true);
    // Simulate Xano processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsProcessing(false);
  };

  const StatusBadge = ({ status }: { status: TableUpload['status'] }) => {
    const config = {
      pending: { color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: Clock },
      uploaded: { color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Upload },
      processed: { color: 'bg-green-500/10 text-green-600 border-green-500/20', icon: CheckCircle }
    };
    
    const { color, icon: Icon } = config[status];
    return (
      <Badge className={color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your recurring billing infrastructure</p>
          </div>
          <div className="flex gap-2">
            <Link to="/twilio-vault">
              <Button variant="outline" className="gap-2">
                <Database className="w-4 h-4" />
                API Vault
              </Button>
            </Link>
            <Link to="/settings">
              <Button className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalSubscriptions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeSubscriptions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                87.7% retention rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${systemStats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                Payment processing
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="uploads" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="uploads" className="gap-2">
              <Upload className="w-4 h-4" />
              Data Uploads
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Zap className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              System Activity
            </TabsTrigger>
          </TabsList>

          {/* Data Uploads Tab */}
          <TabsContent value="uploads" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Table Upload Manager
                </CardTitle>
                <CardDescription>
                  Upload your tables to structure and sync with Xano and NMI systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {uploads.map((upload) => (
                    <Card key={upload.id} className="border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              {upload.name}
                            </CardTitle>
                            <CardDescription>{upload.description}</CardDescription>
                          </div>
                          <StatusBadge status={upload.status} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {upload.recordCount && `${upload.recordCount} records`}
                            {upload.uploadedAt && ` • Uploaded ${upload.uploadedAt.toLocaleString()}`}
                          </div>
                          {upload.status === 'pending' && (
                            <div>
                              <input
                                type="file"
                                accept=".csv,.json,.xlsx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(upload.id, file);
                                }}
                                className="hidden"
                                id={`upload-${upload.id}`}
                              />
                              <label htmlFor={`upload-${upload.id}`}>
                                <Button variant="outline" size="sm" className="cursor-pointer gap-2">
                                  <Upload className="w-3 h-3" />
                                  Upload File
                                </Button>
                              </label>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {uploads.every(u => u.status === 'processed') && (
                  <div className="border-t pt-4">
                    <Button 
                      onClick={processToXano} 
                      disabled={isProcessing}
                      className="w-full gap-2"
                      size="lg"
                    >
                      <Database className="w-4 h-4" />
                      {isProcessing ? 'Processing to Xano...' : 'Process All Tables to Xano'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    Xano Backend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className="bg-green-500/10 text-green-600">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <span className="text-sm text-muted-foreground">RecurBilling</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Tables
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-500" />
                    NMI Gateway
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge variant="outline">Setup Required</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recurring Vault</span>
                      <span className="text-sm text-muted-foreground">Pending</span>
                    </div>
                    <Link to="/billing">
                      <Button variant="outline" size="sm" className="w-full">
                        Configure NMI
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    Communications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Twilio</span>
                      <Badge className="bg-green-500/10 text-green-600">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SendGrid</span>
                      <Badge variant="outline">Setup Required</Badge>
                    </div>
                    <Link to="/comm-center">
                      <Button variant="outline" size="sm" className="w-full">
                        Comm Center
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
                <CardDescription>
                  Latest events and system operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '2 minutes ago', event: 'Billing cycle completed for 150 subscriptions', type: 'success' },
                    { time: '5 minutes ago', event: 'NMI vault sync initiated', type: 'info' },
                    { time: '10 minutes ago', event: '3 failed payment retries processed', type: 'warning' },
                    { time: '15 minutes ago', event: 'Twilio SMS campaign sent to 45 customers', type: 'success' },
                    { time: '30 minutes ago', event: 'New subscription created via API', type: 'success' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        activity.type === 'success' && "bg-green-500",
                        activity.type === 'warning' && "bg-yellow-500",
                        activity.type === 'info' && "bg-blue-500"
                      )} />
                      <div className="flex-1">
                        <p className="text-sm">{activity.event}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
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

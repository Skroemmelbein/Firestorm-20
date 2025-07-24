import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  ExternalLink,
  Eye,
  RefreshCw,
  AlertTriangle,
  Layout,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";
import SendGridTest from "@/components/SendGridTest";
import XanoTableManager from "@/components/XanoTableManager";

interface TableUpload {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'uploaded' | 'processed';
  recordCount?: number;
  uploadedAt?: Date;
}

export default function AdminDashboard() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [systemStats, setSystemStats] = useState({
    totalSubscriptions: 847,
    activeSubscriptions: 743,
    monthlyRevenue: 45670,
    successRate: 94.2
  });

  // Upload workflow state
  const [uploadStep, setUploadStep] = useState<'upload' | 'scan' | 'preview' | 'joiner' | 'destination'>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    preview?: any[];
  }>>([]);
  const [scanResults, setScanResults] = useState<{
    commonIdentifiers: string[];
    suggestedJoins: Array<{ column: string; confidence: number }>;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [joinerTable, setJoinerTable] = useState<{
    name: string;
    columns: string[];
  } | null>(null);
  const [createNewTable, setCreateNewTable] = useState(false);
  const [selectedXanoTable, setSelectedXanoTable] = useState('');
  const [newTableName, setNewTableName] = useState('');

  // Upload workflow functions
  const handleMultiFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files).slice(0, 5); // Limit to 5 files
    const processedFiles = fileArray.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: null
    }));

    setUploadedFiles(processedFiles);
    setUploadStep('scan');
  };

  const scanForUniqueIdentifiers = async () => {
    setIsScanning(true);
    setUploadStep('preview');

    // Simulate scanning process
    setTimeout(() => {
      setScanResults({
        commonIdentifiers: ['customer_id', 'email', 'subscription_id'],
        suggestedJoins: [
          { column: 'customer_id', confidence: 95 },
          { column: 'email', confidence: 87 },
          { column: 'subscription_id', confidence: 78 }
        ]
      });
      setIsScanning(false);
    }, 2000);
  };

  const createJoinerTable = () => {
    setJoinerTable({
      name: 'joined_data_table',
      columns: scanResults?.commonIdentifiers || []
    });
    setUploadStep('joiner');
  };

  const finalizeUpload = async () => {
    setIsProcessing(true);

    // Simulate upload process
    setTimeout(() => {
      setIsProcessing(false);
      setUploadStep('upload');
      setUploadedFiles([]);
      setScanResults(null);
      setJoinerTable(null);
      alert('Files uploaded successfully!');
    }, 3000);
  };



  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text tracking-tight">Administration Center</h1>
            <p className="text-blue-700/70 font-medium">Enterprise billing infrastructure management</p>
          </div>
          <div className="flex gap-2">
            <Link to="/twilio-vault">
              <Button variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 corp-shadow">
                <Database className="w-4 h-4" />
                API Vault
              </Button>
            </Link>
            <Link to="/integrations">
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 corp-shadow">
                <Settings className="w-4 h-4" />
                System Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Total Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{systemStats.totalSubscriptions.toLocaleString()}</div>
              <p className="text-xs text-green-600 font-medium">
                ↗ +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Active Subscriptions</CardTitle>
              <Activity className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{systemStats.activeSubscriptions.toLocaleString()}</div>
              <p className="text-xs text-blue-600 font-medium">
                87.7% retention rate
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">${systemStats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-green-600 font-medium">
                ↗ +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{systemStats.successRate}%</div>
              <p className="text-xs text-blue-600 font-medium">
                Payment processing
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="uploads" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 glass-card corp-shadow">
            <TabsTrigger value="uploads" className="gap-2">
              <Upload className="w-4 h-4" />
              Data Uploads
            </TabsTrigger>
            <TabsTrigger value="xano" className="gap-2">
              <Database className="w-4 h-4" />
              Xano Tables
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Zap className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="sendgrid" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              SendGrid Email
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              System Activity
            </TabsTrigger>
          </TabsList>

          {/* Data Uploads Tab */}
          <TabsContent value="uploads" className="space-y-4">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Intelligent Table Upload Manager
                </CardTitle>
                <CardDescription>
                  Upload multiple spreadsheets with smart scanning and table joining capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Upload Files */}
                {uploadStep === 'upload' && (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept=".csv,.xlsx,.xls,.json"
                        onChange={(e) => e.target.files && handleMultiFileUpload(e.target.files)}
                        className="hidden"
                        id="multi-file-upload"
                      />
                      <label htmlFor="multi-file-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">Upload Spreadsheets</h3>
                        <p className="text-blue-600/70 mb-4">Drag and drop or click to select up to 5 files</p>
                        <p className="text-sm text-blue-600/60">Supports CSV, Excel (.xlsx, .xls), and JSON files</p>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-blue-800">Uploaded Files ({uploadedFiles.length}/5)</h4>
                        {uploadedFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 glass-card rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="font-medium text-blue-800">{file.name}</div>
                                <div className="text-sm text-blue-600/70">
                                  {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Ready
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Scan Question */}
                {uploadStep === 'scan' && (
                  <div className="text-center space-y-6">
                    <div className="space-y-3">
                      <AlertTriangle className="w-16 h-16 text-blue-500 mx-auto" />
                      <h3 className="text-xl font-bold text-blue-800">Scan for Unique Identifiers?</h3>
                      <p className="text-blue-600/70 max-w-md mx-auto">
                        Would you like me to scan all uploaded files and find common unique identifiers for data joining?
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={scanForUniqueIdentifiers}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 corp-shadow"
                      >
                        <Eye className="w-4 h-4" />
                        Yes, Scan Files
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setUploadStep('destination')}
                        className="gap-2 border-blue-200 text-blue-700"
                      >
                        Skip Scanning
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Scan Results & Preview */}
                {uploadStep === 'preview' && (
                  <div className="space-y-6">
                    {isScanning ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-blue-800">Scanning Files...</h3>
                        <p className="text-blue-600/70">Analyzing data structure and identifying common fields</p>
                      </div>
                    ) : scanResults && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-bold text-blue-800 mb-3">Scan Results</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4">
                              <h4 className="font-semibold text-blue-700 mb-2">Common Identifiers Found</h4>
                              <div className="space-y-1">
                                {scanResults.commonIdentifiers.map((id, index) => (
                                  <Badge key={index} variant="outline" className="mr-2">
                                    {id}
                                  </Badge>
                                ))}
                              </div>
                            </Card>

                            <Card className="p-4">
                              <h4 className="font-semibold text-blue-700 mb-2">Suggested Joins</h4>
                              <div className="space-y-2">
                                {scanResults.suggestedJoins.map((join, index) => (
                                  <div key={index} className="text-sm">
                                    <span className="font-medium">{join.column}</span>
                                    <span className="text-green-600 ml-2">{join.confidence}% confidence</span>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          </div>
                        </div>

                        <div className="text-center space-y-4">
                          <h3 className="text-lg font-bold text-blue-800">Create Joiner Table?</h3>
                          <p className="text-blue-600/70">Would you like to create a new joined table with selected columns and rows?</p>

                          <div className="flex gap-4 justify-center">
                            <Button
                              onClick={createJoinerTable}
                              className="gap-2 bg-gradient-to-r from-blue-600 to-green-600"
                            >
                              <Layout className="w-4 h-4" />
                              Yes, Create Joiner Table
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setUploadStep('destination')}
                              className="gap-2"
                            >
                              Skip to Upload
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Joiner Table Creation */}
                {uploadStep === 'joiner' && joinerTable && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-blue-800 mb-4">Visual Joiner Table Builder</h3>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-4">
                          <h4 className="font-semibold mb-3">Table Configuration</h4>
                          <div className="space-y-4">
                            <div>
                              <Label>Table Name</Label>
                              <Input
                                value={joinerTable.name}
                                onChange={(e) => setJoinerTable(prev => prev ? {...prev, name: e.target.value} : null)}
                                placeholder="Enter table name"
                              />
                            </div>

                            <div>
                              <Label>Select Columns to Include</Label>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {uploadedFiles.map(file => (
                                  <div key={file.id}>
                                    <div className="font-medium text-sm text-blue-700">{file.name}</div>
                                    {file.preview?.[0]?.map((column: string, index: number) => (
                                      <label key={index} className="flex items-center gap-2 text-sm ml-4">
                                        <input type="checkbox" className="rounded" />
                                        <span>{column}</span>
                                      </label>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <h4 className="font-semibold mb-3">Preview</h4>
                          <div className="text-sm text-blue-600/70">
                            <p>Preview of joined table will appear here</p>
                            <div className="mt-4 p-3 bg-blue-50 rounded border">
                              <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                                <div>Column A</div>
                                <div>Column B</div>
                                <div>Column C</div>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                                <div>Sample 1</div>
                                <div>Data 1</div>
                                <div>Value 1</div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={() => setUploadStep('destination')}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-green-600"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Continue to Destination
                      </Button>
                      <Button variant="outline" onClick={() => setUploadStep('preview')}>
                        Back
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 5: Destination Selection */}
                {uploadStep === 'destination' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-blue-800 mb-4">Select Destination</h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card
                            className={cn(
                              "p-4 cursor-pointer transition-all border-2",
                              !createNewTable ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"
                            )}
                            onClick={() => setCreateNewTable(false)}
                          >
                            <div className="flex items-center gap-3">
                              <Database className="w-6 h-6 text-blue-600" />
                              <div>
                                <h4 className="font-semibold">Existing Xano Table</h4>
                                <p className="text-sm text-blue-600/70">Upload to an existing table</p>
                              </div>
                            </div>
                          </Card>

                          <Card
                            className={cn(
                              "p-4 cursor-pointer transition-all border-2",
                              createNewTable ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
                            )}
                            onClick={() => setCreateNewTable(true)}
                          >
                            <div className="flex items-center gap-3">
                              <Zap className="w-6 h-6 text-green-600" />
                              <div>
                                <h4 className="font-semibold">Create New Table</h4>
                                <p className="text-sm text-green-600/70">Create new Xano table with API</p>
                              </div>
                            </div>
                          </Card>
                        </div>

                        {!createNewTable ? (
                          <div>
                            <Label>Select Xano Table</Label>
                            <Select value={selectedXanoTable} onValueChange={setSelectedXanoTable}>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose existing table" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customers">Customers</SelectItem>
                                <SelectItem value="subscriptions">Subscriptions</SelectItem>
                                <SelectItem value="payments">Payments</SelectItem>
                                <SelectItem value="billing_history">Billing History</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <Label>New Table Name</Label>
                              <Input
                                value={newTableName}
                                onChange={(e) => setNewTableName(e.target.value)}
                                placeholder="Enter new table name"
                              />
                            </div>
                            <div className="p-3 bg-green-50 rounded border border-green-200">
                              <p className="text-sm text-green-700">
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                API endpoint will be automatically created: <code>/api/{newTableName}</code>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={finalizeUpload}
                        disabled={isProcessing || (!createNewTable && !selectedXanoTable) || (createNewTable && !newTableName)}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 corp-shadow"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {isProcessing ? 'Processing...' : 'Upload to Xano'}
                      </Button>
                      <Button variant="outline" onClick={() => setUploadStep('upload')}>
                        Start Over
                      </Button>
                    </div>
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

          {/* Xano Tables Tab */}
          <TabsContent value="xano" className="space-y-4">
            <XanoTableManager />
          </TabsContent>

          {/* SendGrid Email Tab */}
          <TabsContent value="sendgrid" className="space-y-4">
            <SendGridTest />
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

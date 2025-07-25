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
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Upload,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  FileText,
  TrendingUp,
  Zap,
  Shield,
  RefreshCw,
  Download,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportProgress {
  batch_id: string;
  total_records: number;
  processed_records: number;
  success_count: number;
  error_count: number;
  status: "STARTED" | "PROCESSING" | "COMPLETED" | "FAILED";
  completion_percentage: number;
  estimated_time_remaining: string;
  started_at: string;
  completed_at?: string;
}

interface ImportError {
  record_index: number;
  client_id: string;
  error_message: string;
  error_code: string;
}

export default function WarChestImportManager() {
  const [activeImports, setActiveImports] = useState<ImportProgress[]>([]);
  const [completedImports, setCompletedImports] = useState<ImportProgress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImport, setSelectedImport] = useState<string | null>(null);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  // Mock data for demonstration (replace with actual API calls)
  useEffect(() => {
    const mockActiveImport: ImportProgress = {
      batch_id: "war-chest-2024-001",
      total_records: 65000,
      processed_records: 23456,
      success_count: 23200,
      error_count: 256,
      status: "PROCESSING",
      completion_percentage: 36,
      estimated_time_remaining: "2h 45m",
      started_at: new Date().toISOString(),
    };

    const mockCompletedImport: ImportProgress = {
      batch_id: "war-chest-2024-test",
      total_records: 1000,
      processed_records: 1000,
      success_count: 987,
      error_count: 13,
      status: "COMPLETED",
      completion_percentage: 100,
      estimated_time_remaining: "0m",
      started_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date(Date.now() - 1800000).toISOString(),
    };

    setActiveImports([mockActiveImport]);
    setCompletedImports([mockCompletedImport]);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600 bg-green-50 border-green-200";
      case "PROCESSING":
      case "STARTED":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "FAILED":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return CheckCircle;
      case "PROCESSING":
      case "STARTED":
        return Activity;
      case "FAILED":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const startNewImport = async () => {
    setIsLoading(true);
    // Here you would trigger the actual import API
    setTimeout(() => {
      setIsLoading(false);
      // Add new import to active list
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">War Chest Import Engine</h2>
          <p className="text-muted-foreground">
            65,000 client migration from legacy War Chest vertical
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download Template
          </Button>
          <Button 
            onClick={startNewImport} 
            disabled={isLoading || activeImports.length > 0}
            className="gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Start Import
          </Button>
        </div>
      </div>

      {/* Active Imports */}
      {activeImports.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Active Import in Progress
            </CardTitle>
            <CardDescription>
              Massive data migration currently processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeImports.map((importItem) => {
              const StatusIcon = getStatusIcon(importItem.status);
              
              return (
                <div key={importItem.batch_id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold">{importItem.batch_id}</div>
                        <div className="text-sm text-muted-foreground">
                          {importItem.processed_records.toLocaleString()} / {importItem.total_records.toLocaleString()} records
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(importItem.status)}>
                      {importItem.status}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {importItem.completion_percentage}%</span>
                      <span>ETA: {importItem.estimated_time_remaining}</span>
                    </div>
                    <Progress value={importItem.completion_percentage} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="font-semibold text-green-600">
                        {importItem.success_count.toLocaleString()}
                      </div>
                      <div className="text-green-600/70">Success</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="font-semibold text-red-600">
                        {importItem.error_count.toLocaleString()}
                      </div>
                      <div className="text-red-600/70">Errors</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-blue-600">
                        {(importItem.total_records - importItem.processed_records).toLocaleString()}
                      </div>
                      <div className="text-blue-600/70">Remaining</div>
                    </div>
                  </div>

                  {importItem.error_count > 0 && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Import Errors Detected</AlertTitle>
                      <AlertDescription>
                        {importItem.error_count} records failed to import. 
                        <Button variant="link" className="p-0 h-auto text-red-600 underline ml-1">
                          View Error Details
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="status-breakdown">Status Breakdown</TabsTrigger>
          <TabsTrigger value="completed">Completed Imports</TabsTrigger>
          <TabsTrigger value="validation">Validation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                    <p className="text-2xl font-bold">65,000</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expected BILL</p>
                    <p className="text-2xl font-bold text-green-600">38,500</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Need Rewrite</p>
                    <p className="text-2xl font-bold text-orange-600">15,200</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Do Not Bill</p>
                    <p className="text-2xl font-bold text-red-600">8,300</p>
                  </div>
                  <Shield className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Import Requirements</CardTitle>
              <CardDescription>
                Critical data points for successful 65K client migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Required Data Fields</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Legal names, emails, phones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Historical plan mapping</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>TOS acceptance timestamps</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>NMI vault tokens</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Status Classifications</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span><strong>BILL:</strong> Active billing clients</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span><strong>REWRITE:</strong> Migrate/replace plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span><strong>FLIP:</strong> Move processor</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span><strong>DORMANT:</strong> Keep token</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span><strong>DO_NOT_BILL:</strong> Compliance risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status-breakdown" className="space-y-4">
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Status Classification Analysis</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Detailed breakdown of client status distribution and migration requirements
            </p>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedImports.length > 0 ? (
            <div className="space-y-4">
              {completedImports.map((importItem) => {
                const StatusIcon = getStatusIcon(importItem.status);
                
                return (
                  <Card key={importItem.batch_id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <StatusIcon className="w-5 h-5" />
                          <div>
                            <div className="font-semibold">{importItem.batch_id}</div>
                            <div className="text-sm text-muted-foreground">
                              Completed {new Date(importItem.completed_at!).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(importItem.status)}>
                          {importItem.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{importItem.total_records.toLocaleString()}</div>
                          <div className="text-muted-foreground">Total Records</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-600">{importItem.success_count.toLocaleString()}</div>
                          <div className="text-muted-foreground">Success</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-red-600">{importItem.error_count.toLocaleString()}</div>
                          <div className="text-muted-foreground">Errors</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">{importItem.completion_percentage}%</div>
                          <div className="text-muted-foreground">Success Rate</div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="w-3 h-3" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-3 h-3" />
                          Export Report
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Completed Imports</h3>
              <p className="text-muted-foreground">
                Completed import history will appear here
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Data Validation Rules</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Validation rules and data integrity checks for import process
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

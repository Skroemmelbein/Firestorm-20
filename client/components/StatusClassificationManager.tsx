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
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  Users,
  Shield,
  Zap,
  RotateCcw,
  PauseCircle,
  PlayCircle,
  Eye,
  Download,
  Settings,
  BarChart3,
  Target,
  Filter,
  RefreshCw,
  Activity,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClassificationStats {
  total_clients_classified: number;
  status_breakdown: {
    BILL: number;
    REWRITE: number;
    FLIP: number;
    DORMANT: number;
    DO_NOT_BILL: number;
  };
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
  estimated_recovery: {
    total_monthly_value: number;
    high_confidence: number;
    medium_confidence: number;
    low_confidence: number;
  };
  compliance_reviews_required: number;
  processing_priorities: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

interface ClassificationResult {
  client_id: string;
  recommended_status: "BILL" | "REWRITE" | "FLIP" | "DORMANT" | "DO_NOT_BILL";
  confidence_score: number;
  reasoning: string[];
  risk_factors: string[];
  required_actions: string[];
  estimated_recovery_value?: number;
  processing_priority: "HIGH" | "MEDIUM" | "LOW";
  compliance_review_required: boolean;
}

export default function StatusClassificationManager() {
  const [stats, setStats] = useState<ClassificationStats | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classificationProgress, setClassificationProgress] = useState(0);
  const [recentClassifications, setRecentClassifications] = useState<ClassificationResult[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Load classification stats
  useEffect(() => {
    const mockStats: ClassificationStats = {
      total_clients_classified: 65000,
      status_breakdown: {
        BILL: 38500,
        REWRITE: 15200,
        FLIP: 3000,
        DORMANT: 4000,
        DO_NOT_BILL: 4300
      },
      risk_distribution: {
        low: 45000,
        medium: 15000,
        high: 5000
      },
      estimated_recovery: {
        total_monthly_value: 2850000,
        high_confidence: 2100000,
        medium_confidence: 550000,
        low_confidence: 200000
      },
      compliance_reviews_required: 8300,
      processing_priorities: {
        HIGH: 42000,
        MEDIUM: 18000,
        LOW: 5000
      }
    };

    setStats(mockStats);

    // Mock recent classifications
    const mockClassifications: ClassificationResult[] = [
      {
        client_id: "WC-001847",
        recommended_status: "BILL",
        confidence_score: 92,
        reasoning: ["Recent successful payments", "Valid payment method", "Low risk profile"],
        risk_factors: [],
        required_actions: ["Continue billing cycle", "Monitor success rate"],
        estimated_recovery_value: 89.99,
        processing_priority: "HIGH",
        compliance_review_required: false
      },
      {
        client_id: "WC-002156",
        recommended_status: "REWRITE",
        confidence_score: 87,
        reasoning: ["Legacy plan discontinuation", "Better plan available"],
        risk_factors: ["Plan migration risk"],
        required_actions: ["Map to new plan", "Customer notification"],
        estimated_recovery_value: 156.50,
        processing_priority: "HIGH",
        compliance_review_required: false
      },
      {
        client_id: "WC-003421",
        recommended_status: "DO_NOT_BILL",
        confidence_score: 98,
        reasoning: ["Multiple compliance flags", "Legal hold status"],
        risk_factors: ["LEGAL_HOLD", "HIGH_RISK_PROFILE"],
        required_actions: ["Legal review required", "Preserve data only"],
        processing_priority: "HIGH",
        compliance_review_required: true
      }
    ];

    setRecentClassifications(mockClassifications);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "BILL":
        return "text-green-600 bg-green-50 border-green-200";
      case "REWRITE":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "FLIP":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "DORMANT":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "DO_NOT_BILL":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "BILL":
        return CheckCircle;
      case "REWRITE":
        return RotateCcw;
      case "FLIP":
        return Zap;
      case "DORMANT":
        return PauseCircle;
      case "DO_NOT_BILL":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "text-red-600 bg-red-50";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50";
      case "LOW":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const startClassification = async () => {
    setIsClassifying(true);
    setClassificationProgress(0);

    // Simulate classification progress
    const interval = setInterval(() => {
      setClassificationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsClassifying(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            Status Classification Engine
          </h2>
          <p className="text-muted-foreground">
            AI-powered client categorization: BILL • REWRITE • FLIP • DORMANT • DO NOT BILL
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Rules Engine
          </Button>
          <Button 
            onClick={startClassification} 
            disabled={isClassifying}
            className="gap-2"
          >
            {isClassifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            {isClassifying ? "Classifying..." : "Start Classification"}
          </Button>
        </div>
      </div>

      {/* Active Classification Progress */}
      {isClassifying && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Classification in Progress
            </CardTitle>
            <CardDescription>
              Processing 65,000 clients through AI classification engine
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {classificationProgress}%</span>
                <span>ETA: {Math.round((100 - classificationProgress) * 0.5)}s</span>
              </div>
              <Progress value={classificationProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedStatus("BILL")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">BILL Status</p>
                <p className="text-2xl font-bold text-green-600">{stats.status_breakdown.BILL.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Active billing clients</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedStatus("REWRITE")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">REWRITE Status</p>
                <p className="text-2xl font-bold text-orange-600">{stats.status_breakdown.REWRITE.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Plan migration needed</p>
              </div>
              <RotateCcw className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedStatus("FLIP")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">FLIP Status</p>
                <p className="text-2xl font-bold text-blue-600">{stats.status_breakdown.FLIP.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Processor change</p>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedStatus("DORMANT")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">DORMANT Status</p>
                <p className="text-2xl font-bold text-gray-600">{stats.status_breakdown.DORMANT.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Inactive accounts</p>
              </div>
              <PauseCircle className="w-8 h-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedStatus("DO_NOT_BILL")}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">DO NOT BILL</p>
                <p className="text-2xl font-bold text-red-600">{stats.status_breakdown.DO_NOT_BILL.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Compliance protection</p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
          <TabsTrigger value="recovery-projections">Recovery</TabsTrigger>
          <TabsTrigger value="recent-classifications">Recent Results</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Classification Summary</CardTitle>
                <CardDescription>
                  65K client analysis breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.status_breakdown).map(([status, count]) => {
                    const StatusIcon = getStatusIcon(status);
                    const percentage = Math.round((count / stats.total_clients_classified) * 100);
                    
                    return (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon className="w-5 h-5" />
                          <div>
                            <div className="font-medium">{status}</div>
                            <div className="text-sm text-muted-foreground">{percentage}% of total</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{count.toLocaleString()}</div>
                          <Progress value={percentage} className="w-20 h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Priorities</CardTitle>
                <CardDescription>
                  Workload distribution by urgency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.processing_priorities).map(([priority, count]) => {
                    const percentage = Math.round((count / stats.total_clients_classified) * 100);
                    
                    return (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge className={getPriorityColor(priority)}>{priority}</Badge>
                          <span className="font-medium">{count.toLocaleString()} clients</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">{percentage}%</div>
                          <Progress value={percentage} className="w-16 h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
                    <p className="text-2xl font-bold text-green-600">{stats.risk_distribution.low.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Risk score 0-30</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.risk_distribution.medium.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Risk score 31-60</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                    <p className="text-2xl font-bold text-red-600">{stats.risk_distribution.high.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Risk score 61+</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recovery-projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Revenue Recovery Projections
              </CardTitle>
              <CardDescription>
                Monthly recurring revenue potential from classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${(stats.estimated_recovery.total_monthly_value / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Total Monthly</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${(stats.estimated_recovery.high_confidence / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">High Confidence</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    ${(stats.estimated_recovery.medium_confidence / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Medium Confidence</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    ${(stats.estimated_recovery.low_confidence / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-muted-foreground">Low Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent-classifications" className="space-y-4">
          <div className="space-y-4">
            {recentClassifications.map((result) => {
              const StatusIcon = getStatusIcon(result.recommended_status);
              
              return (
                <Card key={result.client_id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <StatusIcon className="w-5 h-5" />
                        <div>
                          <div className="font-semibold">{result.client_id}</div>
                          <Badge className={getStatusColor(result.recommended_status)}>
                            {result.recommended_status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Confidence</div>
                        <div className="font-semibold">{result.confidence_score}%</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium mb-2">Reasoning</div>
                        <ul className="space-y-1">
                          {result.reasoning.slice(0, 2).map((reason, i) => (
                            <li key={i} className="text-muted-foreground">• {reason}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="font-medium mb-2">Required Actions</div>
                        <ul className="space-y-1">
                          {result.required_actions.slice(0, 2).map((action, i) => (
                            <li key={i} className="text-muted-foreground">• {action}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="font-medium mb-2">Details</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Priority:</span>
                            <Badge className={getPriorityColor(result.processing_priority)}>
                              {result.processing_priority}
                            </Badge>
                          </div>
                          {result.estimated_recovery_value && (
                            <div className="flex justify-between">
                              <span>Recovery:</span>
                              <span className="font-medium">${result.estimated_recovery_value}</span>
                            </div>
                          )}
                          {result.compliance_review_required && (
                            <div className="flex justify-between">
                              <span>Compliance:</span>
                              <Badge variant="destructive">Review Required</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Eye className="w-3 h-3" />
                        Details
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Target className="w-3 h-3" />
                        Process
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertTitle>Compliance Reviews Required</AlertTitle>
            <AlertDescription>
              {stats.compliance_reviews_required.toLocaleString()} clients require manual compliance review before processing.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Protection Status</CardTitle>
              <CardDescription>
                Legal and regulatory safeguards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Protection Rules Active</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Legal hold detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Fraud pattern recognition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Chargeback threshold monitoring</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>TOS compliance validation</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Risk Mitigation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Auto-protection triggered:</span>
                      <span className="font-medium">4,300 clients</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Manual review queue:</span>
                      <span className="font-medium">8,300 clients</span>
                    </div>
                    <div className="flex justify-between">
                      <span>False positive rate:</span>
                      <span className="font-medium text-green-600">&lt; 2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protection accuracy:</span>
                      <span className="font-medium text-green-600">98.7%</span>
                    </div>
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

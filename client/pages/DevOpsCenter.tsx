import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Terminal,
  Database,
  Zap,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Code,
  FileText,
  Shield,
  Building,
  MessageSquare,
  Brain,
  Workflow,
  GitBranch,
  Server,
  Globe,
  Key,
  Activity,
  Target,
  Layers,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

interface AutomationScript {
  id: string;
  name: string;
  script: string;
  purpose: string;
  status: 'idle' | 'running' | 'success' | 'error';
  lastRun: Date | null;
  duration: number | null;
  dependencies: string[];
  category: 'xano' | 'builder' | 'twilio' | 'compliance' | 'ai' | 'automation';
}

interface SystemLayer {
  id: string;
  name: string;
  tool: string;
  status: 'connected' | 'disconnected' | 'configuring' | 'error';
  description: string;
  icon: any;
  color: string;
}

export default function DevOpsCenter() {
  const [scripts, setScripts] = useState<AutomationScript[]>([
    {
      id: 'xano-login',
      name: 'Xano Login',
      script: 'xano-login.sh',
      purpose: 'Logs in and stores token securely',
      status: 'success',
      lastRun: new Date(Date.now() - 300000),
      duration: 2.3,
      dependencies: [],
      category: 'xano'
    },
    {
      id: 'xano-list',
      name: 'Xano List',
      script: 'xano-list.sh',
      purpose: 'Lists all Xano endpoints',
      status: 'success',
      lastRun: new Date(Date.now() - 600000),
      duration: 1.8,
      dependencies: ['xano-login'],
      category: 'xano'
    },
    {
      id: 'xano-schema',
      name: 'Xano Schema',
      script: 'xano-schema.sh',
      purpose: 'Pulls full DB schema',
      status: 'success',
      lastRun: new Date(Date.now() - 900000),
      duration: 4.2,
      dependencies: ['xano-login'],
      category: 'xano'
    },
    {
      id: 'xano-pull',
      name: 'Xano Pull',
      script: 'xano-pull.sh',
      purpose: 'Pulls specific tables (for Builder schema mapping)',
      status: 'running',
      lastRun: new Date(),
      duration: null,
      dependencies: ['xano-schema'],
      category: 'xano'
    },
    {
      id: 'xano-build',
      name: 'Xano Build',
      script: 'xano-build.sh',
      purpose: 'Pushes GPT-designed table + endpoint schema into Xano',
      status: 'idle',
      lastRun: null,
      duration: null,
      dependencies: ['xano-schema', 'gpt-prompt-sync'],
      category: 'xano'
    },
    {
      id: 'builder-wire',
      name: 'Builder Wire',
      script: 'builder-wire.sh',
      purpose: 'Wires all schema into Builder.io with prebuilt components',
      status: 'idle',
      lastRun: null,
      duration: null,
      dependencies: ['xano-pull'],
      category: 'builder'
    },
    {
      id: 'twilio-sync',
      name: 'Twilio Sync',
      script: 'twilio-sync.sh',
      purpose: 'Syncs relevant Twilio APIs and logs',
      status: 'success',
      lastRun: new Date(Date.now() - 1800000),
      duration: 8.7,
      dependencies: [],
      category: 'twilio'
    },
    {
      id: 'compliance-check',
      name: 'Compliance Check',
      script: 'compliance-check.sh',
      purpose: 'Validates setup against HIPAA/GDPR/PCI flags',
      status: 'success',
      lastRun: new Date(Date.now() - 3600000),
      duration: 12.4,
      dependencies: ['xano-schema', 'twilio-sync'],
      category: 'compliance'
    },
    {
      id: 'gpt-prompt-sync',
      name: 'GPT Prompt Sync',
      script: 'gpt-prompt-sync.sh',
      purpose: 'Feeds GPT the schema for automated endpoint generation',
      status: 'success',
      lastRun: new Date(Date.now() - 1200000),
      duration: 5.6,
      dependencies: ['xano-schema'],
      category: 'ai'
    },
    {
      id: 'auto-wire',
      name: 'Auto Wire',
      script: 'auto-wire.sh',
      purpose: 'Full flow: DB ➜ APIs ➜ GPT ➜ Builder ➜ Live sync',
      status: 'idle',
      lastRun: null,
      duration: null,
      dependencies: ['xano-login', 'xano-schema', 'gpt-prompt-sync', 'builder-wire', 'twilio-sync'],
      category: 'automation'
    }
  ]);

  const [systemLayers] = useState<SystemLayer[]>([
    {
      id: 'backend',
      name: 'Backend',
      tool: 'Xano',
      status: 'connected',
      description: '🔗 Auto-connected via terminal',
      icon: Database,
      color: 'text-blue-600'
    },
    {
      id: 'frontend',
      name: 'Frontend',
      tool: 'Builder.io',
      status: 'configuring',
      description: '⚙️ Auto-built from schema',
      icon: Building,
      color: 'text-purple-600'
    },
    {
      id: 'comms',
      name: 'Comms',
      tool: 'Twilio (API verified)',
      status: 'connected',
      description: '📞 SMS/Voice/Email/Verify wired',
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      id: 'logic',
      name: 'Logic',
      tool: 'GPT-driven',
      status: 'connected',
      description: '🤖 Auto generates endpoints + UI',
      icon: Brain,
      color: 'text-orange-600'
    },
    {
      id: 'auth',
      name: 'Auth',
      tool: 'Xano + Verify',
      status: 'connected',
      description: '🔐 2FA + email/phone logic built-in',
      icon: Shield,
      color: 'text-indigo-600'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      tool: 'CLI validation',
      status: 'connected',
      description: '✅ Checks HIPAA/GDPR/NMI/PCI flags',
      icon: CheckCircle,
      color: 'text-emerald-600'
    }
  ]);

  const [isAutoWireRunning, setIsAutoWireRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const getStatusColor = (status: AutomationScript['status']) => {
    const colors = {
      idle: 'bg-gray-100 text-gray-700 border-gray-200',
      running: 'bg-blue-100 text-blue-700 border-blue-200',
      success: 'bg-green-100 text-green-700 border-green-200',
      error: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status];
  };

  const getLayerStatusColor = (status: SystemLayer['status']) => {
    const colors = {
      connected: 'bg-green-100 text-green-700 border-green-200',
      disconnected: 'bg-red-100 text-red-700 border-red-200',
      configuring: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      error: 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[status];
  };

  const getCategoryIcon = (category: AutomationScript['category']) => {
    const icons = {
      xano: Database,
      builder: Building,
      twilio: MessageSquare,
      compliance: Shield,
      ai: Brain,
      automation: Workflow
    };
    return icons[category];
  };

  const runScript = async (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    // Update status to running
    setScripts(prev => prev.map(s => 
      s.id === scriptId ? { ...s, status: 'running', lastRun: new Date() } : s
    ));

    setExecutionLog(prev => [...prev, `[${new Date().toISOString()}] Starting ${script.script}...`]);

    // Simulate script execution
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      const duration = Math.random() * 10 + 1; // 1-11 seconds

      setScripts(prev => prev.map(s => 
        s.id === scriptId ? { 
          ...s, 
          status: success ? 'success' : 'error',
          duration: duration
        } : s
      ));

      setExecutionLog(prev => [...prev, 
        `[${new Date().toISOString()}] ${script.script} ${success ? 'completed' : 'failed'} in ${duration.toFixed(1)}s`
      ]);
    }, 2000 + Math.random() * 3000);
  };

  const runAutoWire = async () => {
    setIsAutoWireRunning(true);
    setExecutionLog([]);
    
    const autoWireScript = scripts.find(s => s.id === 'auto-wire');
    if (!autoWireScript) return;

    setExecutionLog(prev => [...prev, '[AUTO-WIRE] Starting full automation pipeline...']);
    
    // Run dependencies in sequence
    const dependencies = ['xano-login', 'xano-schema', 'gpt-prompt-sync', 'builder-wire', 'twilio-sync'];
    
    for (const depId of dependencies) {
      await new Promise(resolve => {
        runScript(depId);
        setTimeout(resolve, 3000);
      });
    }

    setExecutionLog(prev => [...prev, '[AUTO-WIRE] All systems synchronized successfully!']);
    setIsAutoWireRunning(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text tracking-tight">DevOps Automation Center</h1>
            <p className="text-blue-700/70 font-medium">Full-stack automation pipeline: DB ➜ APIs ➜ GPT ➜ Builder ➜ Live sync</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2 border-blue-200 text-blue-700"
              onClick={() => window.open('https://cdn.builder.io/api/v1/image/assets%2F95d0350cdfe84eb4a176cb0cbfe48451%2Ff5914ebf80d94f428051634c5b2ed6ca?format=webp&width=800', '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              View Architecture
            </Button>
            <Button 
              className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 corp-shadow"
              onClick={runAutoWire}
              disabled={isAutoWireRunning}
            >
              <Zap className="w-4 h-4" />
              {isAutoWireRunning ? 'Running Auto-Wire...' : 'Run Auto-Wire'}
            </Button>
          </div>
        </div>

        {/* System Architecture Overview */}
        <Card className="glass-card corp-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              System Architecture Status
            </CardTitle>
            <CardDescription>
              Real-time status of all integrated platforms and services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemLayers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <Card key={layer.id} className="border-border/50 corp-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${layer.color}`} />
                          <span className="font-semibold text-blue-800">{layer.name}</span>
                        </div>
                        <Badge className={getLayerStatusColor(layer.status)}>
                          {layer.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-blue-600/70 mb-2">
                        <strong>{layer.tool}</strong>
                      </div>
                      <div className="text-xs text-blue-600/60">
                        {layer.description}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="scripts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 glass-card corp-shadow">
            <TabsTrigger value="scripts" className="gap-2">
              <Terminal className="w-4 h-4" />
              Automation Scripts
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Pipeline Flow
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="gap-2">
              <Activity className="w-4 h-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <FileText className="w-4 h-4" />
              Execution Logs
            </TabsTrigger>
          </TabsList>

          {/* Scripts Tab */}
          <TabsContent value="scripts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {['xano', 'builder', 'twilio', 'compliance', 'ai', 'automation'].map(category => {
                const categoryScripts = scripts.filter(s => s.category === category);
                const CategoryIcon = getCategoryIcon(category as AutomationScript['category']);
                
                return (
                  <Card key={category} className="glass-card corp-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 capitalize">
                        <CategoryIcon className="w-5 h-5" />
                        {category} Scripts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {categoryScripts.map((script) => (
                          <Card key={script.id} className="border-border/50">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Terminal className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-blue-800">{script.script}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={getStatusColor(script.status)}>
                                    {script.status}
                                  </Badge>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => runScript(script.id)}
                                    disabled={script.status === 'running'}
                                  >
                                    {script.status === 'running' ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Play className="w-3 h-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              
                              <p className="text-sm text-blue-600/70 mb-2">{script.purpose}</p>
                              
                              <div className="text-xs text-blue-600/60">
                                {script.lastRun ? (
                                  <div className="flex items-center justify-between">
                                    <span>Last run: {script.lastRun.toLocaleTimeString()}</span>
                                    {script.duration && <span>{script.duration.toFixed(1)}s</span>}
                                  </div>
                                ) : (
                                  <span>Never run</span>
                                )}
                              </div>
                              
                              {script.dependencies.length > 0 && (
                                <div className="mt-2 text-xs">
                                  <span className="text-blue-600/70">Dependencies: </span>
                                  <span className="text-blue-600/60">{script.dependencies.join(', ')}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Pipeline Flow Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Automation Pipeline Flow
                </CardTitle>
                <CardDescription>
                  Visual representation of the complete DB ➜ APIs ➜ GPT ➜ Builder ➜ Live sync flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 glass-card rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold text-blue-800">1. Xano Backend</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600/50" />
                    <div className="text-sm text-blue-600/70">
                      Login → Schema → Pull → Build
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 glass-card rounded-lg">
                    <div className="flex items-center gap-2">
                      <Brain className="w-6 h-6 text-orange-600" />
                      <span className="font-semibold text-blue-800">2. GPT Processing</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600/50" />
                    <div className="text-sm text-blue-600/70">
                      Schema analysis → Endpoint generation → UI optimization
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 glass-card rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building className="w-6 h-6 text-purple-600" />
                      <span className="font-semibold text-blue-800">3. Builder.io Frontend</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600/50" />
                    <div className="text-sm text-blue-600/70">
                      Component wiring → Schema mapping → Live deployment
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 glass-card rounded-lg">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                      <span className="font-semibold text-blue-800">4. Twilio Integration</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600/50" />
                    <div className="text-sm text-blue-600/70">
                      API sync → Communication logs → Verification setup
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 glass-card rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-indigo-600" />
                      <span className="font-semibold text-blue-800">5. Compliance Validation</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600/50" />
                    <div className="text-sm text-blue-600/70">
                      HIPAA/GDPR/PCI checks → Security validation → Go-live approval
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card corp-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-blue-800">Active Scripts</CardTitle>
                  <Activity className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold gradient-text">
                    {scripts.filter(s => s.status === 'running').length}
                  </div>
                  <p className="text-xs text-green-600 font-medium">Currently executing</p>
                </CardContent>
              </Card>

              <Card className="glass-card corp-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-blue-800">Success Rate</CardTitle>
                  <Target className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold gradient-text">94.7%</div>
                  <p className="text-xs text-blue-600 font-medium">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card className="glass-card corp-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-blue-800">Avg Runtime</CardTitle>
                  <Clock className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold gradient-text">4.8s</div>
                  <p className="text-xs text-purple-600 font-medium">Per script execution</p>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">System Health: Optimal</AlertTitle>
              <AlertDescription className="text-green-700">
                All automation scripts are functioning normally. Last full auto-wire completed successfully 2 hours ago.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Real-time Execution Logs
                </CardTitle>
                <CardDescription>
                  Live output from automation script executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black/90 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
                  {executionLog.length > 0 ? (
                    executionLog.map((log, index) => (
                      <div key={index} className="mb-1">{log}</div>
                    ))
                  ) : (
                    <div className="text-green-400/50">No recent executions. Run a script to see live logs...</div>
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

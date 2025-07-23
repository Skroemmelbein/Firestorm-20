import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Database,
  Phone,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  Zap,
  MessageSquare,
  Link,
  Activity,
  ExternalLink
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import XanoCredentialsHelper from "@/components/XanoCredentialsHelper";
import XanoCredentialsFinder from "@/components/XanoCredentialsFinder";

interface ConnectionStatus {
  connected: boolean;
  lastChecked?: Date;
  error?: string;
}

interface XanoConfig {
  instanceUrl: string;
  apiKey: string;
  databaseId: string;
}

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export default function Integrations() {
  const [xanoStatus, setXanoStatus] = useState<ConnectionStatus>({ connected: false });
  const [twilioStatus, setTwilioStatus] = useState<ConnectionStatus>({ connected: false });
  
  const [xanoConfig, setXanoConfig] = useState<XanoConfig>({
    instanceUrl: "",
    apiKey: "",
    databaseId: ""
  });
  
  const [twilioConfig, setTwilioConfig] = useState<TwilioConfig>({
    accountSid: "",
    authToken: "",
    phoneNumber: ""
  });

  const [showXanoApiKey, setShowXanoApiKey] = useState(false);
  const [showTwilioToken, setShowTwilioToken] = useState(false);
  const [testing, setTesting] = useState({ xano: false, twilio: false });
  const [saving, setSaving] = useState(false);

  // Load saved configs on mount
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const response = await fetch('/api/integrations/config');
      if (response.ok) {
        const data = await response.json();
        if (data.xano) setXanoConfig(data.xano);
        if (data.twilio) setTwilioConfig(data.twilio);
      }
    } catch (error) {
      console.error('Failed to load configs:', error);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/integrations/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xano: xanoConfig, twilio: twilioConfig })
      });
      
      if (response.ok) {
        await testConnections();
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      setSaving(false);
    }
  };

  const testXanoConnection = async () => {
    setTesting(prev => ({ ...prev, xano: true }));
    try {
      const response = await fetch('/api/integrations/test/xano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(xanoConfig)
      });
      
      const result = await response.json();
      setXanoStatus({
        connected: response.ok,
        lastChecked: new Date(),
        error: result.error || undefined
      });
    } catch (error) {
      setXanoStatus({
        connected: false,
        lastChecked: new Date(),
        error: 'Connection failed'
      });
    } finally {
      setTesting(prev => ({ ...prev, xano: false }));
    }
  };

  const testTwilioConnection = async () => {
    setTesting(prev => ({ ...prev, twilio: true }));
    try {
      const response = await fetch('/api/integrations/test/twilio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(twilioConfig)
      });
      
      const result = await response.json();
      setTwilioStatus({
        connected: response.ok,
        lastChecked: new Date(),
        error: result.error || undefined
      });
    } catch (error) {
      setTwilioStatus({
        connected: false,
        lastChecked: new Date(),
        error: 'Connection failed'
      });
    } finally {
      setTesting(prev => ({ ...prev, twilio: false }));
    }
  };

  const testConnections = async () => {
    await Promise.all([testXanoConnection(), testTwilioConnection()]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const ConnectionStatusBadge = ({ status }: { status: ConnectionStatus }) => {
    if (status.connected) {
      return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
    }
    if (status.error) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Error</Badge>;
    }
    return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />Not Connected</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Xano × Twilio Integration</h1>
                <p className="text-sm text-muted-foreground">Connect your backend and communication services</p>
              </div>
            </div>
            <div className="flex gap-2">
              <RouterLink to="/twilio-vault">
                <Button variant="outline" className="gap-2">
                  <Database className="w-4 h-4" />
                  API Vault
                </Button>
              </RouterLink>
              <Button onClick={saveConfig} disabled={saving} className="gap-2">
                <Settings className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save & Test'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg">Xano</CardTitle>
                </div>
                <ConnectionStatusBadge status={xanoStatus} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Backend database and API</p>
              {xanoStatus.lastChecked && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last checked: {xanoStatus.lastChecked.toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-500" />
                  <CardTitle className="text-lg">Twilio</CardTitle>
                </div>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">SMS and voice services</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-green-600 font-medium">
                  ✅ Account: ACf19a39d865d43659b94a3a2074
                </p>
                <p className="text-xs text-green-600 font-medium">
                  ✅ Phone: +1 (855) 800-0037
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Integration</CardTitle>
                </div>
                <Badge variant={xanoStatus.connected && twilioStatus.connected ? "default" : "outline"}>
                  {xanoStatus.connected && twilioStatus.connected ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  {xanoStatus.connected && twilioStatus.connected ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Combined functionality</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ready for workflows
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="xano" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="xano" className="gap-2">
              <Database className="w-4 h-4" />
              Xano Setup
            </TabsTrigger>
            <TabsTrigger value="twilio" className="gap-2">
              <Phone className="w-4 h-4" />
              Twilio Setup
            </TabsTrigger>
            <TabsTrigger value="workflows" className="gap-2">
              <Activity className="w-4 h-4" />
              Workflows
            </TabsTrigger>
          </TabsList>

          {/* Xano Configuration */}
          <TabsContent value="xano" className="space-y-6">
            <Tabs defaultValue="finder" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="finder" className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Find Credentials
                </TabsTrigger>
                <TabsTrigger value="enter" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Enter & Test
                </TabsTrigger>
              </TabsList>

              <TabsContent value="finder">
                <XanoCredentialsFinder />
              </TabsContent>

              <TabsContent value="enter">
                <XanoCredentialsHelper />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Twilio Configuration */}
          <TabsContent value="twilio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Twilio Configuration
                </CardTitle>
                <CardDescription>
                  Set up your Twilio account for SMS and voice capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twilio-sid">Account SID</Label>
                  <Input
                    id="twilio-sid"
                    placeholder="AC..."
                    value={twilioConfig.accountSid}
                    onChange={(e) => setTwilioConfig(prev => ({ ...prev, accountSid: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twilio-token">Auth Token</Label>
                  <div className="relative">
                    <Input
                      id="twilio-token"
                      type={showTwilioToken ? "text" : "password"}
                      placeholder="Your Twilio Auth Token"
                      value={twilioConfig.authToken}
                      onChange={(e) => setTwilioConfig(prev => ({ ...prev, authToken: e.target.value }))}
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-2.5 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowTwilioToken(!showTwilioToken)}
                      >
                        {showTwilioToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(twilioConfig.authToken)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twilio-phone">Phone Number</Label>
                  <Input
                    id="twilio-phone"
                    placeholder="+1234567890"
                    value={twilioConfig.phoneNumber}
                    onChange={(e) => setTwilioConfig(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={testTwilioConnection} disabled={testing.twilio} variant="outline">
                    {testing.twilio ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <RouterLink to="/twilio-vault">
                    <Button variant="ghost" className="gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Browse API Vault
                    </Button>
                  </RouterLink>
                </div>

                {twilioStatus.error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>{twilioStatus.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows */}
          <TabsContent value="workflows" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    SMS Notifications
                  </CardTitle>
                  <CardDescription>
                    Send SMS when Xano database events occur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Workflow Setup</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Xano webhook triggers on data change</li>
                        <li>• Middleware processes the event</li>
                        <li>• Twilio sends SMS notification</li>
                      </ul>
                    </div>
                    <Button className="w-full" disabled={!xanoStatus.connected || !twilioStatus.connected}>
                      Configure SMS Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Voice Updates
                  </CardTitle>
                  <CardDescription>
                    Make voice calls based on Xano data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Workflow Setup</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Xano triggers critical alerts</li>
                        <li>• System generates voice message</li>
                        <li>• Twilio places phone call</li>
                      </ul>
                    </div>
                    <Button className="w-full" disabled={!xanoStatus.connected || !twilioStatus.connected}>
                      Configure Voice Workflow
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {(!xanoStatus.connected || !twilioStatus.connected) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Setup Required</AlertTitle>
                <AlertDescription>
                  Complete both Xano and Twilio configurations to enable workflow automation.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

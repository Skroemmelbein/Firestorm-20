import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

interface XanoConfig {
  instanceUrl: string;
  apiKey: string;
  databaseId: string;
}

export default function XanoCredentialsHelper() {
  const [config, setConfig] = useState<XanoConfig>({
    instanceUrl: "",
    apiKey: "",
    databaseId: ""
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);
    
    try {
      const response = await fetch('/api/real/test/xano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const result = await response.json();
      
      setConnectionStatus({
        connected: response.ok,
        message: result.message,
        error: result.error
      });
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: 'Connection failed. Check your network and try again.'
      });
    } finally {
      setTesting(false);
    }
  };

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/integrations/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xano: config })
      });
      
      if (response.ok) {
        await testConnection();
      }
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card className="glass-card corp-shadow border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <ExternalLink className="w-5 h-5" />
            Get Your Xano Credentials
          </CardTitle>
          <CardDescription>
            Follow these steps to find your Xano instance details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Step 1: Login to Xano</h4>
              <div className="text-sm space-y-1">
                <p>• Go to <a href="https://app.xano.com" target="_blank" className="text-blue-600 hover:underline">app.xano.com</a></p>
                <p>• Login with: shannonkroemmelbein@gmail.com</p>
                <p>• Use your password: ga8Q@H4hm@MDT69</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Step 2: Find Instance URL</h4>
              <div className="text-sm space-y-1">
                <p>• After login, look at the URL bar</p>
                <p>• Copy the workspace URL (like: https://x8ki-letl-twmt.xano.io)</p>
                <p>• This is your Instance URL</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Step 3: Get API Key</h4>
              <div className="text-sm space-y-1">
                <p>• Go to Settings → API Keys</p>
                <p>• Create new API key or copy existing</p>
                <p>• Make sure it has full permissions</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Step 4: Database ID</h4>
              <div className="text-sm space-y-1">
                <p>• In your workspace, find Database section</p>
                <p>• Look for Database ID (usually numeric)</p>
                <p>• Sometimes visible in URL: /database/[ID]</p>
              </div>
            </div>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Need help?</strong> If you can't find these details, create a new Xano workspace and I'll help you set it up with the exact tables we need.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Configuration Form */}
      <Card className="glass-card corp-shadow">
        <CardHeader>
          <CardTitle>Enter Your Xano Credentials</CardTitle>
          <CardDescription>
            Paste the details from your Xano workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instance-url">Instance URL</Label>
            <Input
              id="instance-url"
              placeholder="https://x8ki-letl-twmt.xano.io (or similar)"
              value={config.instanceUrl}
              onChange={(e) => setConfig(prev => ({ ...prev, instanceUrl: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Found in your browser URL after logging into Xano
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="Your Xano API key from Settings → API Keys"
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                className="pr-20"
              />
              <div className="absolute right-2 top-2.5 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => copyToClipboard(config.apiKey)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="database-id">Database ID</Label>
            <Input
              id="database-id"
              placeholder="123456 (numeric ID from your Xano database)"
              value={config.databaseId}
              onChange={(e) => setConfig(prev => ({ ...prev, databaseId: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Usually a number, found in your Xano database settings
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={testConnection} 
              disabled={testing || !config.instanceUrl || !config.apiKey || !config.databaseId}
              className="gap-2"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={saveConfig}
              disabled={!config.instanceUrl || !config.apiKey || !config.databaseId}
            >
              Save Configuration
            </Button>
          </div>

          {connectionStatus && (
            <Alert variant={connectionStatus.connected ? "default" : "destructive"}>
              {connectionStatus.connected ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>
                {connectionStatus.connected 
                  ? `✅ ${connectionStatus.message}` 
                  : `❌ ${connectionStatus.error}`
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {connectionStatus?.connected && (
        <Card className="glass-card corp-shadow border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">🎉 Connection Successful!</CardTitle>
            <CardDescription>
              Your Xano integration is working. Next steps:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">1</Badge>
                <span className="text-sm">Create the required database tables in Xano</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">2</Badge>
                <span className="text-sm">Go to Member Portal to see your benefits system</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-50 text-purple-700">3</Badge>
                <span className="text-sm">Set up Twilio for SMS capabilities</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button asChild>
                <a href="/members">View Member Portal</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://app.xano.com" target="_blank">
                  Open Xano Workspace
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

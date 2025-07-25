import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CreditCard,
  Settings as SettingsIcon,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Zap,
  Database,
  Shield,
  Building,
  Users,
  Mail,
  Phone,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

interface NMIConfig {
  gatewayUrl: string;
  username: string;
  password: string;
  recurringVaultId: string;
}

export default function Settings() {
  const [nmiConfig, setNmiConfig] = useState<NMIConfig>({
    gatewayUrl: "https://secure.networkmerchants.com/api/transact.php",
    username: "wwwdpcyeahcom",
    password: "!SNR96rQ9qsHdd4",
    recurringVaultId: "vault_001",
  });

  const [showNmiPassword, setShowNmiPassword] = useState(false);
  const [nmiConnectionStatus, setNmiConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [lastError, setLastError] = useState<string>("");
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null);

  const checkRateLimitStatus = async () => {
    try {
      const response = await fetch("/api/nmi/rate-limit-status");
      const result = await response.json();
      setRateLimitStatus(result);
      return result;
    } catch (error) {
      console.error("Rate limit check failed:", error);
      return null;
    }
  };

  const testNmiConnection = async () => {
    setNmiConnectionStatus("connecting");
    setLastError("");

    try {
      // Check rate limits first
      const rateStatus = await checkRateLimitStatus();
      if (rateStatus && !rateStatus.canMakeRequest) {
        const waitMinutes = Math.ceil(rateStatus.waitTime / 60000);
        setLastError(`Rate limit active. Please wait ${waitMinutes} minute(s) before testing.`);
        setNmiConnectionStatus("error");
        return;
      }

      const response = await fetch("/api/nmi/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: nmiConfig.username,
          password: nmiConfig.password,
          gatewayUrl: nmiConfig.gatewayUrl,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNmiConnectionStatus("connected");
        setLastError("");
      } else {
        setNmiConnectionStatus("error");
        setLastError(result.message || "Connection failed");

        if (result.suggestion) {
          setLastError(`${result.message}. ${result.suggestion}`);
        }
      }
    } catch (error: any) {
      console.error("NMI connection error:", error);
      setNmiConnectionStatus("error");
      setLastError(error.message || "Connection test failed");
    }
  };

  const StatusIndicator = ({ status }: { status: string }) => {
    const config = {
      connected: { color: "text-green-500", icon: CheckCircle },
      connecting: { color: "text-yellow-500", icon: RefreshCw },
      error: { color: "text-red-500", icon: AlertTriangle },
      disconnected: { color: "text-gray-500", icon: AlertTriangle },
    };

    const { color, icon: Icon } =
      config[status as keyof typeof config] || config.disconnected;
    const isSpinning = status === "connecting";

    return (
      <Icon className={cn("w-4 h-4", color, isSpinning && "animate-spin")} />
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              System Settings
            </h1>
            <p className="text-muted-foreground">
              Configure integrations, system settings, and administrative options
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusIndicator status={nmiConnectionStatus} />
            <span className="text-sm text-muted-foreground">
              NMI: {nmiConnectionStatus}
            </span>
          </div>
        </div>

        <Tabs defaultValue="nmi-integration" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="nmi-integration" className="gap-2">
              <CreditCard className="w-4 h-4" />
              NMI Integration
            </TabsTrigger>
            <TabsTrigger value="system-config" className="gap-2">
              <SettingsIcon className="w-4 h-4" />
              System Config
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="gap-2">
              <Shield className="w-4 h-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Mail className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="advanced" className="gap-2">
              <Database className="w-4 h-4" />
              Advanced
            </TabsTrigger>
          </TabsList>

          {/* NMI Integration Tab */}
          <TabsContent value="nmi-integration" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    NMI Recurring Vault Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your NMI gateway for recurring subscription billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nmi-gateway-url">Gateway URL</Label>
                    <Input
                      id="nmi-gateway-url"
                      placeholder="https://secure.nmi.com/api/transact.php"
                      value={nmiConfig.gatewayUrl}
                      onChange={(e) =>
                        setNmiConfig((prev) => ({
                          ...prev,
                          gatewayUrl: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nmi-username">Username</Label>
                    <Input
                      id="nmi-username"
                      placeholder="Your NMI username"
                      value={nmiConfig.username}
                      onChange={(e) =>
                        setNmiConfig((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nmi-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="nmi-password"
                        type={showNmiPassword ? "text" : "password"}
                        placeholder="Your NMI password"
                        value={nmiConfig.password}
                        onChange={(e) =>
                          setNmiConfig((prev) => ({
                            ...prev,
                            password: e.target.value,
                          }))
                        }
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-6 w-6 p-0"
                        onClick={() => setShowNmiPassword(!showNmiPassword)}
                      >
                        {showNmiPassword ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurring-vault-id">Recurring Vault ID</Label>
                    <Input
                      id="recurring-vault-id"
                      placeholder="vault_12345"
                      value={nmiConfig.recurringVaultId}
                      onChange={(e) =>
                        setNmiConfig((prev) => ({
                          ...prev,
                          recurringVaultId: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Use recurring vault, not customer vault for subscription billing
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={testNmiConnection}
                      disabled={nmiConnectionStatus === "connecting"}
                      variant="outline"
                    >
                      {nmiConnectionStatus === "connecting"
                        ? "Testing..."
                        : "Test Connection"}
                    </Button>
                    <Button
                      disabled={nmiConnectionStatus !== "connected"}
                    >
                      Save Configuration
                    </Button>
                  </div>

                  {/* Rate Limit Status */}
                  {rateLimitStatus && !rateLimitStatus.canMakeRequest && (
                    <Alert variant="destructive">
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Rate Limit Active</AlertTitle>
                      <AlertDescription>
                        Next request available in {Math.ceil(rateLimitStatus.waitTime / 60000)} minute(s) to prevent NMI activity limits.
                      </AlertDescription>
                    </Alert>
                  )}

                  {nmiConnectionStatus === "error" && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Connection Failed</AlertTitle>
                      <AlertDescription>
                        {lastError || "Unable to connect to NMI. Please check your credentials and gateway URL."}
                      </AlertDescription>
                    </Alert>
                  )}

                  {nmiConnectionStatus === "connected" && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Connected Successfully</AlertTitle>
                      <AlertDescription>
                        NMI Recurring Vault is connected and ready for billing operations.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Integration Status
                  </CardTitle>
                  <CardDescription>
                    Monitor the status of all system integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-medium">NMI Gateway</div>
                          <div className="text-sm text-muted-foreground">
                            Payment processing
                          </div>
                        </div>
                      </div>
                      <Badge className={
                        nmiConnectionStatus === "connected" 
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }>
                        {nmiConnectionStatus === "connected" ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="font-medium">Xano Database</div>
                          <div className="text-sm text-muted-foreground">
                            Backend data storage
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600">
                        Connected
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="font-medium">Twilio API</div>
                          <div className="text-sm text-muted-foreground">
                            SMS & voice services
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600">
                        Active
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-orange-500" />
                        <div>
                          <div className="font-medium">SendGrid</div>
                          <div className="text-sm text-muted-foreground">
                            Email delivery
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/10 text-green-600">
                        Active
                      </Badge>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Refresh Status
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Config Tab */}
          <TabsContent value="system-config" className="space-y-4">
            <div className="text-center py-12">
              <SettingsIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">System Configuration</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                General system settings, themes, and operational parameters
              </p>
              <Button className="mt-6">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Configure System
              </Button>
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api-keys" className="space-y-4">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">API Key Management</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Manage API keys, authentication tokens, and security credentials
              </p>
              <Button className="mt-6">
                <Shield className="w-4 h-4 mr-2" />
                Manage Keys
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <div className="text-center py-12">
              <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Notification Settings</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Configure email alerts, SMS notifications, and system messaging
              </p>
              <Button className="mt-6">
                <Mail className="w-4 h-4 mr-2" />
                Setup Notifications
              </Button>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <div className="text-center py-12">
              <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Advanced Settings</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Database connections, environment variables, and system diagnostics
              </p>
              <Button className="mt-6">
                <Database className="w-4 h-4 mr-2" />
                Advanced Config
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

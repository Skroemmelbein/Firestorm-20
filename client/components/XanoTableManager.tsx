import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Database,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Server,
  Globe,
  Zap,
  Activity,
  Download,
  Eye,
  RefreshCw,
} from "lucide-react";
import { httpRequest } from "@/utils/http-client";

interface TableResult {
  table: string;
  success: boolean;
  message: string;
  fields?: number;
  error?: string;
}

interface TableSetupResult {
  success: boolean;
  totalTables: number;
  successful: number;
  failed: number;
  xanoInstance: string;
  results: TableResult[];
  errors?: Array<{ table: string; error: string }>;
}

export default function XanoTableManager() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState({
    connecting: false,
    creating: false,
    schemas: false,
  });
  const [setupResult, setSetupResult] = useState<TableSetupResult | null>(null);
  const [schemas, setSchemas] = useState<any>(null);

  const testConnection = async () => {
    setIsLoading((prev) => ({ ...prev, connecting: true }));
    try {
      const response = await httpRequest(`${window.location.origin}/api/xano/test-connection`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      setIsConnected(result.connected);
      setConnectionDetails(result);

      if (!result.connected) {
        console.error("Xano connection failed:", result);
      }
    } catch (error) {
      console.error("Connection test failed:", error);
      setIsConnected(false);
      setConnectionDetails({
        error: "Connection test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, connecting: false }));
    }
  };

  const createAllTables = async () => {
    setIsLoading((prev) => ({ ...prev, creating: true }));
    setSetupResult(null);

    try {
      const response = await httpRequest(`${window.location.origin}/api/xano/create-all-tables`, {
        method: "POST",
      });

      const result = await response.json();
      setSetupResult(result);

      if (result.success) {
        console.log("✅ All tables created successfully!");
      } else {
        console.error("❌ Table creation had issues:", result);
      }
    } catch (error) {
      console.error("Table creation failed:", error);
      setSetupResult({
        success: false,
        totalTables: 0,
        successful: 0,
        failed: 1,
        xanoInstance: "Unknown",
        results: [],
        errors: [{ table: "system", error: "Request failed" }],
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, creating: false }));
    }
  };

  const loadSchemas = async () => {
    setIsLoading((prev) => ({ ...prev, schemas: true }));
    try {
      const response = await httpRequest(`${window.location.origin}/api/xano/table-schemas`);
      const result = await response.json();
      setSchemas(result);
    } catch (error) {
      console.error("Failed to load schemas:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, schemas: false }));
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? CheckCircle : XCircle;
  };

  const getStatusColor = (success: boolean) => {
    return success ? "#10B981" : "#EF4444";
  };

  return (
    <Card className="f10-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#FFD700]" />
          Xano Table Manager - Upgraded Instance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Upgraded Xano Instance</h3>
            <Button
              onClick={testConnection}
              disabled={isLoading.connecting}
              size="sm"
              className="f10-btn f10-btn-secondary"
            >
              {isLoading.connecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-[#b3b3b3] text-sm">Instance URL</Label>
              <div className="bg-[#0a0a0a] border border-[#333333] rounded p-2 font-mono text-sm text-[#00E676]">
                x2yu-6rq8-bxkk.n7e.xano.io
              </div>
            </div>
            <div>
              <Label className="text-[#b3b3b3] text-sm">
                Connection Status
              </Label>
              <div className="flex items-center gap-2 mt-1">
                {isConnected === null ? (
                  <Badge className="bg-[#6B7280]/20 text-[#6B7280] border-[#6B7280]/40">
                    UNTESTED
                  </Badge>
                ) : isConnected ? (
                  <Badge className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40">
                    CONNECTED
                  </Badge>
                ) : (
                  <Badge className="bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40">
                    DISCONNECTED
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {connectionDetails && (
            <div className="mt-4 text-xs text-[#b3b3b3]">
              {isConnected ? (
                <div>
                  <strong>✅ Upgraded Xano instance ready!</strong>
                  {connectionDetails.existingTables && (
                    <div className="mt-1">
                      Existing tables:{" "}
                      {Array.isArray(connectionDetails.existingTables)
                        ? connectionDetails.existingTables.length
                        : "Unknown"}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[#EF4444]">
                  <strong>❌ Connection failed:</strong>{" "}
                  {connectionDetails.message || connectionDetails.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table Creation */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-white">ECELONX Table Setup</h3>
              <p className="text-sm text-[#b3b3b3]">
                Create all required tables for the ECELONX system
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadSchemas}
                disabled={isLoading.schemas}
                size="sm"
                className="f10-btn f10-btn-ghost"
              >
                {isLoading.schemas ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={createAllTables}
                disabled={isLoading.creating || !isConnected}
                className="f10-btn accent-bg text-black font-medium"
              >
                {isLoading.creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Tables...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Push All Tables to Xano
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Table List Preview */}
          {schemas && (
            <div className="mb-4">
              <h4 className="font-medium text-white mb-2">
                Tables to Create ({schemas.totalTables})
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(schemas.schemas).map((tableName) => (
                  <Badge
                    key={tableName}
                    className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/40 text-xs"
                  >
                    {tableName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Creation Progress */}
          {isLoading.creating && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#FFD700]" />
                <span className="text-sm font-medium text-white">
                  Creating ECELONX tables...
                </span>
              </div>
              <Progress value={33} className="w-full" />
            </div>
          )}

          {/* Results */}
          {setupResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#10B981]">
                    {setupResult.successful}
                  </div>
                  <div className="text-xs text-[#737373]">SUCCESSFUL</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#EF4444]">
                    {setupResult.failed}
                  </div>
                  <div className="text-xs text-[#737373]">FAILED</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {setupResult.totalTables}
                  </div>
                  <div className="text-xs text-[#737373]">TOTAL</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {setupResult.results.map((result, index) => {
                  const StatusIcon = getStatusIcon(result.success);
                  const statusColor = getStatusColor(result.success);

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-[#0a0a0a] rounded border border-[#333333]"
                    >
                      <div className="flex items-center gap-3">
                        <StatusIcon
                          className="w-4 h-4"
                          style={{ color: statusColor }}
                        />
                        <div>
                          <div className="font-medium text-white text-sm">
                            {result.table}
                          </div>
                          <div className="text-xs text-[#737373]">
                            {result.fields && `${result.fields} fields`}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-[#b3b3b3]">
                        {result.success ? "Created" : result.error}
                      </div>
                    </div>
                  );
                })}

                {/* Show errors if any */}
                {setupResult.errors &&
                  setupResult.errors.map((error, index) => (
                    <div
                      key={`error-${index}`}
                      className="flex items-center justify-between p-2 bg-[#EF4444]/10 rounded border border-[#EF4444]/30"
                    >
                      <div className="flex items-center gap-3">
                        <XCircle className="w-4 h-4 text-[#EF4444]" />
                        <div>
                          <div className="font-medium text-white text-sm">
                            {error.table}
                          </div>
                          <div className="text-xs text-[#EF4444]">
                            {error.error}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="text-xs text-[#737373] text-center">
                Setup completed at{" "}
                {new Date((setupResult as any).timestamp || Date.now()).toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg p-4">
          <h4 className="font-semibold text-[#FFD700] mb-2">
            🚀 Upgraded Xano Instance
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-white">What gets created:</strong>
              <ul className="text-[#b3b3b3] mt-1 space-y-1">
                <li>• Users & Authentication</li>
                <li>• Client Management</li>
                <li>• Member Portal Data</li>
                <li>• Communications Log</li>
                <li>• Twilio Conversations</li>
                <li>• Campaign Management</li>
              </ul>
            </div>
            <div>
              <strong className="text-white">Additional Tables:</strong>
              <ul className="text-[#b3b3b3] mt-1 space-y-1">
                <li>• Studio Flows</li>
                <li>• Integrations</li>
                <li>• Chargebacks</li>
                <li>• Billing & Subscriptions</li>
                <li>• System Logs</li>
                <li>• Customer Segments</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

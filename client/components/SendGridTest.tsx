import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface SendGridStatus {
  configured: boolean;
  connected: boolean;
  status: string;
  message: string;
  fromEmail?: string;
}

export default function SendGridTest() {
  const [status, setStatus] = useState<SendGridStatus | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/sendgrid-status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to check SendGrid status:", error);
      setStatus({
        configured: false,
        connected: false,
        status: "error",
        message: "Failed to check status",
      });
    }
  };

  const testSendGrid = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/test-sendgrid", { method: "POST" });
      const data = await response.json();
      setTestResult(data);

      if (data.success) {
        // Refresh status after successful test
        await checkStatus();
      }
    } catch (error) {
      console.error("SendGrid test failed:", error);
      setTestResult({
        success: false,
        error: "Test request failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setTesting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "#10B981";
      case "missing_api_key":
      case "placeholder_key":
        return "#F59E0B";
      case "connection_failed":
      case "error":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return CheckCircle;
      case "missing_api_key":
      case "placeholder_key":
        return AlertTriangle;
      case "connection_failed":
      case "error":
        return XCircle;
      default:
        return AlertTriangle;
    }
  };

  // Auto-check status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <Card className="f10-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#00CED1]" />
          SendGrid Email System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        {status && (
          <div className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#333333]">
            <div className="flex items-center gap-3">
              {(() => {
                const StatusIcon = getStatusIcon(status.status);
                return (
                  <StatusIcon
                    className="w-5 h-5"
                    style={{ color: getStatusColor(status.status) }}
                  />
                );
              })()}
              <div>
                <div className="font-medium text-white">
                  {status.status === "operational"
                    ? "Operational"
                    : "Not Ready"}
                </div>
                <div className="text-sm text-[#b3b3b3]">{status.message}</div>
              </div>
            </div>
            <Badge
              style={{
                backgroundColor: `${getStatusColor(status.status)}20`,
                color: getStatusColor(status.status),
                borderColor: `${getStatusColor(status.status)}40`,
              }}
            >
              {status.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        )}

        {/* From Email Display */}
        {status?.fromEmail && (
          <div className="text-sm text-[#b3b3b3]">
            <strong>From Email:</strong> {status.fromEmail}
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div
            className="p-3 rounded-lg border"
            style={{
              backgroundColor: testResult.success ? "#10B98120" : "#EF444420",
              borderColor: testResult.success ? "#10B98140" : "#EF444440",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
              ) : (
                <XCircle className="w-4 h-4 text-[#EF4444]" />
              )}
              <span className="font-medium text-white">
                {testResult.success ? "Test Email Sent!" : "Test Failed"}
              </span>
            </div>
            <div className="text-sm text-[#b3b3b3]">
              {testResult.message || testResult.error}
            </div>
            {testResult.success && testResult.to && (
              <div className="text-xs text-[#737373] mt-1">
                Sent to: {testResult.to}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={checkStatus}
            className="f10-btn f10-btn-secondary flex-1"
          >
            Check Status
          </Button>
          <Button
            onClick={testSendGrid}
            disabled={testing || status?.status !== "operational"}
            className="f10-btn accent-bg text-black font-medium flex-1"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>
        </div>

        {/* Configuration Help */}
        {status && status.status !== "operational" && (
          <div className="text-xs text-[#737373] p-3 bg-[#1a1a1a] rounded border border-[#333333]">
            <strong>To fix SendGrid:</strong>
            <ol className="list-decimal list-inside mt-1 space-y-1">
              <li>Get a SendGrid API key from sendgrid.com</li>
              <li>Replace the placeholder in your .env file</li>
              <li>Restart the server</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

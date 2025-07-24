import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Phone,
  Clock,
  AlertTriangle,
} from "lucide-react";

interface SMSResult {
  success: boolean;
  sid?: string;
  to?: string;
  from?: string;
  body?: string;
  error?: string;
  timestamp?: string;
}

export default function SMSInterface() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SMSResult[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    error?: string;
    phone?: string;
  } | null>(null);

  // Test Twilio connection
  const testConnection = async () => {
    setSending(true);
    try {
      const response = await fetch("/api/real/test/twilio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      setConnectionStatus({
        connected: response.ok,
        error: result.error,
        phone: "+18559600037",
      });
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: "Connection failed",
      });
    } finally {
      setSending(false);
    }
  };

  // Send SMS
  const sendSMS = async () => {
    if (!phoneNumber || !message) return;

    setSending(true);
    try {
      const response = await fetch("/api/real/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phoneNumber,
          body: message,
        }),
      });

      const result = await response.json();

      const smsResult: SMSResult = {
        success: result.success || response.ok,
        sid: result.sid,
        to: phoneNumber,
        from: result.from || "+18559600037",
        body: message,
        error: result.error,
        timestamp: new Date().toISOString(),
      };

      setResults((prev) => [smsResult, ...prev]);

      if (smsResult.success) {
        setMessage(""); // Clear message on success
      }
    } catch (error) {
      const smsResult: SMSResult = {
        success: false,
        to: phoneNumber,
        body: message,
        error: error instanceof Error ? error.message : "Failed to send SMS",
        timestamp: new Date().toISOString(),
      };
      setResults((prev) => [smsResult, ...prev]);
    } finally {
      setSending(false);
    }
  };

  // Quick test message
  const sendTestMessage = async () => {
    setPhoneNumber("+18144409968"); // Default test number
    setMessage(
      "🚀 Hello from RecurFlow! Your SMS system is working perfectly. Sent at " +
        new Date().toLocaleTimeString(),
    );

    // Wait a moment for state to update, then send
    setTimeout(() => {
      sendSMS();
    }, 100);
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple phone number formatting
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `+${cleaned}`;
    } else if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    return phone;
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="glass-card corp-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Twilio SMS Connection
          </CardTitle>
          <CardDescription>
            Test your SMS integration with real Twilio credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Account SID</div>
              <div className="font-mono text-xs text-muted-foreground">
                ACf19a39d865d43659b94a3a2074
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Phone Number</div>
              <div className="font-mono text-xs text-muted-foreground">
                +1 (855) 960-0037
              </div>
            </div>
            <Button
              onClick={testConnection}
              disabled={sending}
              variant="outline"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Test Connection
            </Button>
          </div>

          {connectionStatus && (
            <Alert
              variant={connectionStatus.connected ? "default" : "destructive"}
            >
              {connectionStatus.connected ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {connectionStatus.connected
                  ? `✅ Connected! Ready to send SMS from ${connectionStatus.phone}`
                  : `❌ ${connectionStatus.error}`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Send SMS */}
      <Card className="glass-card corp-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send SMS Message
          </CardTitle>
          <CardDescription>
            Send messages to any phone number using your Twilio integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(formatPhoneNumber(e.target.value))
                }
              />
              <p className="text-xs text-muted-foreground">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground">
                {message.length}/160 characters
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={sendSMS}
              disabled={sending || !phoneNumber || !message}
              className="gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send SMS
            </Button>

            <Button
              onClick={sendTestMessage}
              variant="outline"
              disabled={sending}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Quick Test
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SMS Results */}
      {results.length > 0 && (
        <Card className="glass-card corp-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              SMS History
            </CardTitle>
            <CardDescription>
              Recent SMS messages sent through your system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.slice(0, 10).map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.success ? "Sent" : "Failed"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {result.to}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp!).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-sm mb-2">
                    <strong>Message:</strong> "{result.body}"
                  </div>

                  {result.success && result.sid && (
                    <div className="text-xs text-muted-foreground">
                      SID: {result.sid}
                    </div>
                  )}

                  {result.error && (
                    <div className="text-xs text-red-600 mt-1">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

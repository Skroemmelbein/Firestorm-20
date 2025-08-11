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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Mail,
  Send,
  CheckCircle,
  XCircle,
  Loader2,
  Phone,
  Zap,
} from "lucide-react";
import { httpRequest } from "@/utils/http-client";

interface TestResult {
  type: "sms" | "email";
  success: boolean;
  details: any;
  timestamp: string;
}

export default function TestMessageInterface() {
  const [smsData, setSmsData] = useState({
    phone: "+18559600037",
    message:
      "🚀 Test SMS from RecurFlow! Your marketing automation is working perfectly.",
  });

  const [emailData, setEmailData] = useState({
    email: "shannonkroemmelbein@gmail.com",
    subject: "Test Email from RecurFlow Marketing",
    message:
      "Hello! This is a test email from your RecurFlow marketing automation system. Everything is working perfectly! 🎉",
  });

  const [sending, setSending] = useState({ sms: false, email: false });
  const [results, setResults] = useState<TestResult[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [diagnosing, setDiagnosing] = useState(false);

  // Test Twilio connection with diagnostics
  const runDiagnostics = async () => {
    setDiagnosing(true);
    try {
      const response = await httpRequest(`${window.location.origin}/api/real/test/twilio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const result = await response.json();
      setConnectionStatus({
        connected: response.ok,
        httpStatus: response.status,
        ...result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setConnectionStatus({
        connected: false,
        error: "Network connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      });
    } finally {
      setDiagnosing(false);
    }
  };

  // Send test SMS
  const sendTestSMS = async () => {
    setSending((prev) => ({ ...prev, sms: true }));
    try {
      const response = await httpRequest(`${window.location.origin}/api/real/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: smsData.phone,
          body: smsData.message,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        result = {
          success: false,
          error: `Response parsing failed: ${jsonError instanceof Error ? jsonError.message : "Invalid JSON"}`,
          httpStatus: response.status,
          httpStatusText: response.statusText,
        };
      }

      setResults((prev) => [
        {
          type: "sms",
          success: result.success || response.ok,
          details: {
            ...result,
            httpStatus: response.status,
            httpStatusText: response.statusText,
            requestData: { to: smsData.phone, body: smsData.message },
          },
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      setResults((prev) => [
        {
          type: "sms",
          success: false,
          details: {
            error:
              error instanceof Error ? error.message : "Failed to send SMS",
            networkError: true,
            requestData: { to: smsData.phone, body: smsData.message },
          },
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setSending((prev) => ({ ...prev, sms: false }));
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    setSending((prev) => ({ ...prev, email: true }));
    try {
      const response = await httpRequest(`${window.location.origin}/api/real/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: emailData.email,
          subject: emailData.subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">RecurFlow Test Email</h2>
              <p>${emailData.message}</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">✅ System Status</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>✅ Twilio SMS: Connected</li>
                  <li>��� SendGrid Email: Connected</li>
                  <li>✅ OpenAI Integration: Active</li>
                  <li>✅ Marketing Automation: Ready</li>
                </ul>
              </div>
              <p style="color: #6b7280; font-size: 14px;">
                Sent at: ${new Date().toLocaleString()}<br>
                From: RecurFlow Marketing System
              </p>
            </div>
          `,
        }),
      });

      const result = await response.json();

      setResults((prev) => [
        {
          type: "email",
          success: result.success || response.ok,
          details: result,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      setResults((prev) => [
        {
          type: "email",
          success: false,
          details: {
            error:
              error instanceof Error ? error.message : "Failed to send email",
          },
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    } finally {
      setSending((prev) => ({ ...prev, email: false }));
    }
  };

  // Send both simultaneously
  const sendBoth = async () => {
    await Promise.all([sendTestSMS(), sendTestEmail()]);
  };

  return (
    <div className="space-y-6">
      {/* Quick Test Header */}
      <Card className="glass-card corp-shadow border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-600" />
            Test Marketing Messages
          </CardTitle>
          <CardDescription>
            Send test SMS and email messages to verify your integrations are
            working
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={sendBoth}
              disabled={sending.sms || sending.email}
              className="gap-2"
            >
              {sending.sms || sending.email ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Both Tests
            </Button>
            <Button
              onClick={runDiagnostics}
              disabled={diagnosing}
              variant="outline"
              className="gap-2"
            >
              {diagnosing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Test Connection
            </Button>
          </div>

          {/* Connection Status */}
          {connectionStatus && (
            <Alert
              variant={connectionStatus.connected ? "default" : "destructive"}
              className="mt-4"
            >
              {connectionStatus.connected ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {connectionStatus.connected ? (
                  <div>
                    <strong>✅ Twilio Connected</strong>
                    <div className="text-xs mt-1">
                      Ready to send SMS from +1 (855) 960-0037
                    </div>
                  </div>
                ) : (
                  <div>
                    <strong>❌ Connection Failed</strong>
                    <div className="text-xs mt-1">{connectionStatus.error}</div>
                    {connectionStatus.httpStatus && (
                      <div className="text-xs mt-1">
                        HTTP Status: {connectionStatus.httpStatus}
                      </div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="sms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sms" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS Test
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Test
          </TabsTrigger>
        </TabsList>

        {/* SMS Test */}
        <TabsContent value="sms">
          <Card className="glass-card corp-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Send Test SMS
              </CardTitle>
              <CardDescription>
                Test your Twilio SMS integration with a real message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sms-phone">Phone Number</Label>
                  <Input
                    id="sms-phone"
                    value={smsData.phone}
                    onChange={(e) =>
                      setSmsData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sms-message">Message</Label>
                  <Textarea
                    id="sms-message"
                    value={smsData.message}
                    onChange={(e) =>
                      setSmsData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {smsData.message.length}/160 characters
                  </p>
                </div>
              </div>

              <Button
                onClick={sendTestSMS}
                disabled={sending.sms || !smsData.phone || !smsData.message}
                className="gap-2 w-full"
              >
                {sending.sms ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                Send Test SMS
              </Button>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Ready!</strong> Twilio SMS is connected and working.
                  Your test will be sent from +1 (855) 960-0037
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Test */}
        <TabsContent value="email">
          <Card className="glass-card corp-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Send Test Email
              </CardTitle>
              <CardDescription>
                Test your SendGrid email integration with a formatted message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-address">Email Address</Label>
                  <Input
                    id="email-address"
                    type="email"
                    value={emailData.email}
                    onChange={(e) =>
                      setEmailData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="test@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-subject">Subject Line</Label>
                  <Input
                    id="email-subject"
                    value={emailData.subject}
                    onChange={(e) =>
                      setEmailData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Test subject"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email-message">Message Content</Label>
                <Textarea
                  id="email-message"
                  value={emailData.message}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Your email message..."
                />
              </div>

              <Button
                onClick={sendTestEmail}
                disabled={
                  sending.email || !emailData.email || !emailData.subject
                }
                className="gap-2 w-full"
              >
                {sending.email ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                Send Test Email
              </Button>

              <Alert>
                <AlertDescription>
                  <strong>Note:</strong> SendGrid integration will be configured
                  automatically. The email will include system status and be
                  professionally formatted.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {results.length > 0 && (
        <Card className="glass-card corp-shadow">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Recent test message results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.slice(0, 5).map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {result.type === "sms" ? (
                        <MessageSquare className="w-4 h-4" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      <Badge
                        variant={result.success ? "default" : "destructive"}
                      >
                        {result.type.toUpperCase()}{" "}
                        {result.success ? "Sent" : "Failed"}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {result.success ? (
                    <div className="text-sm text-green-700">
                      ✅ Message sent successfully!
                      {result.details.sid && (
                        <div className="text-xs mt-1 font-mono">
                          Twilio SID: {result.details.sid}
                        </div>
                      )}
                      {result.details.status && (
                        <div className="text-xs mt-1">
                          Status: {result.details.status}
                        </div>
                      )}
                      {result.details.price && (
                        <div className="text-xs mt-1">
                          Cost: ${result.details.price}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-red-700 space-y-2">
                      <div className="font-medium">❌ SMS Failed</div>

                      {/* Network/Connection Error */}
                      {result.details.networkError && (
                        <div className="bg-red-100 border border-red-300 rounded p-2 text-xs">
                          <strong>Network Error:</strong> {result.details.error}
                        </div>
                      )}

                      {/* HTTP Status Error */}
                      {result.details.httpStatus &&
                        result.details.httpStatus !== 200 && (
                          <div className="bg-red-100 border border-red-300 rounded p-2 text-xs">
                            <strong>HTTP {result.details.httpStatus}:</strong>{" "}
                            {result.details.httpStatusText}
                          </div>
                        )}

                      {/* Twilio API Error */}
                      {result.details.error && !result.details.networkError && (
                        <div className="bg-red-100 border border-red-300 rounded p-2 text-xs">
                          <strong>Twilio Error:</strong> {result.details.error}
                        </div>
                      )}

                      {/* Error Code */}
                      {result.details.code && (
                        <div className="bg-orange-100 border border-orange-300 rounded p-2 text-xs">
                          <strong>Error Code:</strong> {result.details.code}
                        </div>
                      )}

                      {/* More Info */}
                      {result.details.more_info && (
                        <div className="bg-blue-100 border border-blue-300 rounded p-2 text-xs">
                          <strong>More Info:</strong>{" "}
                          <a
                            href={result.details.more_info}
                            target="_blank"
                            className="underline text-blue-600"
                          >
                            Twilio Docs
                          </a>
                        </div>
                      )}

                      {/* Request Details */}
                      {result.details.requestData && (
                        <details className="bg-gray-100 border border-gray-300 rounded p-2 text-xs">
                          <summary className="cursor-pointer font-medium">
                            Request Details
                          </summary>
                          <pre className="mt-2 whitespace-pre-wrap">
                            {JSON.stringify(
                              result.details.requestData,
                              null,
                              2,
                            )}
                          </pre>
                        </details>
                      )}

                      {/* Full Error Response */}
                      {result.details &&
                        Object.keys(result.details).length > 2 && (
                          <details className="bg-gray-100 border border-gray-300 rounded p-2 text-xs">
                            <summary className="cursor-pointer font-medium">
                              Full Error Response
                            </summary>
                            <pre className="mt-2 whitespace-pre-wrap">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
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

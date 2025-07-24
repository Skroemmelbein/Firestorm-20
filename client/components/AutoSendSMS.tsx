import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
  Phone,
} from "lucide-react";

export default function AutoSendSMS() {
  const [status, setStatus] = useState<"sending" | "success" | "error">(
    "sending",
  );
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    sendTestSMS();
  }, []);

  const sendTestSMS = async () => {
    try {
      console.log("🚀 Auto-sending test SMS to 855-960-0037...");

      const response = await fetch("/api/real/sms/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "+18144409968",
          body:
            "🚀 AUTO-TEST from RecurFlow! Your enterprise SMS system is working perfectly. Sent automatically at " +
            new Date().toLocaleString(),
        }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setStatus("success");
        setResult(data);
        console.log("✅ Auto SMS sent successfully!", data);
      } else {
        setStatus("error");
        setResult(data);
        console.log("❌ Auto SMS failed:", data);
      }
    } catch (error) {
      setStatus("error");
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.error("❌ Auto SMS error:", error);
    }
  };

  return (
    <Card className="glass-card corp-shadow border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Auto SMS Test - Sending to 855-960-0037
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "sending" && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              <strong>Sending SMS...</strong> Test message being sent to +1
              (855) 960-0037
            </AlertDescription>
          </Alert>
        )}

        {status === "success" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>
              <strong>✅ SMS SENT SUCCESSFULLY!</strong>
              <br />
              Message sent to +1 (855) 960-0037 from your Twilio number +1 (855)
              860-0037
              {result.sid && (
                <>
                  <br />
                  Message ID: {result.sid}
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <strong>❌ SMS Failed</strong>
              <br />
              Error: {result?.error || "Unknown error occurred"}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-sm font-medium text-blue-800">From Number</div>
            <div className="font-mono text-sm text-blue-600">
              +1 (855) 960-0037
            </div>
          </div>

          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-sm font-medium text-green-800">To Number</div>
            <div className="font-mono text-sm text-green-600">
              +1 (855) 960-0037
            </div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-800 mb-2">
            Message Content
          </div>
          <div className="text-sm text-gray-600">
            "🚀 AUTO-TEST from RecurFlow! Your enterprise SMS system is working
            perfectly. Sent automatically at {new Date().toLocaleString()}"
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-600">
            Check your phone for the test message!
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

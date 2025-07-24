import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TestTube,
  MessageSquare,
  Mail,
  Phone,
  Send,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Play,
  Settings,
  Brain,
  Network,
  Database,
  Zap,
  Target,
  Activity,
  Globe,
  Command,
} from "lucide-react";
import SendGridTest from "@/components/SendGridTest";
import StudioFlowBuilder from "@/components/StudioFlowBuilder";

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: Date;
}

export default function TestModule() {
  const [smsTest, setSmsTest] = useState({
    phone: "+18559600037",
    message: "Test message from ECELONX system"
  });
  const [isTesting, setIsTesting] = useState({
    sms: false,
    voice: false,
    api: false
  });
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const [voiceTest, setVoiceTest] = useState({
    phone: "+18559600037",
    message: "Hello, this is a test call from your ECELONX system. All systems are operational."
  });

  const [apiTest, setApiTest] = useState({
    endpoint: "https://api.example.com/test",
    method: "GET",
    headers: "{}",
    body: "{}"
  });

  const runSMSTest = async () => {
    setIsTesting(prev => ({ ...prev, sms: true }));
    
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: smsTest.phone,
          body: smsTest.message
        })
      });

      const result = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        sms: {
          success: response.ok,
          message: result.message || (response.ok ? "SMS sent successfully!" : "SMS failed to send"),
          details: result,
          timestamp: new Date()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        sms: {
          success: false,
          message: "Failed to send SMS",
          details: error,
          timestamp: new Date()
        }
      }));
    } finally {
      setIsTesting(prev => ({ ...prev, sms: false }));
    }
  };

  const runVoiceTest = async () => {
    setIsTesting(prev => ({ ...prev, voice: true }));
    
    try {
      const response = await fetch('/api/voice/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: voiceTest.phone,
          message: voiceTest.message
        })
      });

      const result = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        voice: {
          success: response.ok,
          message: result.message || (response.ok ? "Voice call initiated!" : "Voice call failed"),
          details: result,
          timestamp: new Date()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        voice: {
          success: false,
          message: "Failed to initiate voice call",
          details: error,
          timestamp: new Date()
        }
      }));
    } finally {
      setIsTesting(prev => ({ ...prev, voice: false }));
    }
  };

  const runAPITest = async () => {
    setIsTesting(prev => ({ ...prev, api: true }));
    
    try {
      const headers = JSON.parse(apiTest.headers || '{}');
      const body = apiTest.method !== 'GET' ? apiTest.body : undefined;

      const response = await fetch(apiTest.endpoint, {
        method: apiTest.method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: body ? JSON.stringify(JSON.parse(body)) : undefined
      });

      const result = await response.text();
      
      setTestResults(prev => ({
        ...prev,
        api: {
          success: response.ok,
          message: `API ${apiTest.method} request completed`,
          details: { status: response.status, response: result },
          timestamp: new Date()
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        api: {
          success: false,
          message: "API request failed",
          details: error,
          timestamp: new Date()
        }
      }));
    } finally {
      setIsTesting(prev => ({ ...prev, api: false }));
    }
  };

  const TestResultDisplay = ({ result }: { result: TestResult }) => (
    <div 
      className={`p-4 rounded-lg border ${
        result.success 
          ? 'bg-green-500/10 border-green-500/30' 
          : 'bg-red-500/10 border-red-500/30'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        {result.success ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
        <span className="font-medium text-white">
          {result.success ? 'Success' : 'Failed'}
        </span>
        <span className="text-xs text-gray-400">
          {result.timestamp.toLocaleTimeString()}
        </span>
      </div>
      <p className="text-sm text-gray-300 mb-2">{result.message}</p>
      {result.details && (
        <details className="text-xs text-gray-400">
          <summary className="cursor-pointer">View Details</summary>
          <pre className="mt-2 p-2 bg-black/30 rounded text-xs overflow-auto">
            {JSON.stringify(result.details, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Test Module Header */}
      <div className="f10-command-header" style={{ background: "linear-gradient(135deg, #1a1a0a 0%, #2d2d1a 100%)" }}>
        <div className="f10-command-title">
          <TestTube className="w-8 h-8 text-[#00E676]" />
          <div>
            <h1 className="f10-heading-lg text-white">TEST MODULE</h1>
            <p className="f10-command-subtitle">System Testing & Validation Center</p>
          </div>
        </div>
        <div className="f10-command-status">
          <div className="f10-env-status">
            <div className="f10-status-dot"></div>
            <span>All Test Systems Ready</span>
          </div>
          <div className="f10-env-status">
            <Activity className="w-4 h-4" />
            <span>Real-Time Testing: Active</span>
          </div>
        </div>
      </div>

      <div className="f10-ops-zone">
        {/* Quick Test Actions */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="f10-card cursor-pointer hover:accent-glow transition-all" onClick={runSMSTest}>
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-[#00BFFF] mb-2" />
              <h3 className="font-semibold text-white">Quick SMS Test</h3>
              <p className="text-xs text-[#737373]">Test SMS to +18559600037</p>
            </CardContent>
          </Card>

          <Card className="f10-card cursor-pointer hover:accent-glow transition-all">
            <CardContent className="p-4 text-center">
              <Mail className="w-8 h-8 mx-auto text-[#FF6A00] mb-2" />
              <h3 className="font-semibold text-white">Quick Email Test</h3>
              <p className="text-xs text-[#737373]">Test SendGrid email</p>
            </CardContent>
          </Card>

          <Card className="f10-card cursor-pointer hover:accent-glow transition-all" onClick={runVoiceTest}>
            <CardContent className="p-4 text-center">
              <Phone className="w-8 h-8 mx-auto text-[#8A2BE2] mb-2" />
              <h3 className="font-semibold text-white">Quick Voice Test</h3>
              <p className="text-xs text-[#737373]">Test voice call</p>
            </CardContent>
          </Card>

          <Card className="f10-card cursor-pointer hover:accent-glow transition-all" onClick={runAPITest}>
            <CardContent className="p-4 text-center">
              <Network className="w-8 h-8 mx-auto text-[#32CD32] mb-2" />
              <h3 className="font-semibold text-white">Quick API Test</h3>
              <p className="text-xs text-[#737373]">Test API connectivity</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Testing Tabs */}
        <Tabs defaultValue="sms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-[#1a1a1a] border border-[#00E676]/30">
            <TabsTrigger
              value="sms"
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white hover:text-[#00E676] transition-colors"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS Testing
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white hover:text-[#00E676] transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Testing
            </TabsTrigger>
            <TabsTrigger
              value="voice"
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white hover:text-[#00E676] transition-colors"
            >
              <Phone className="w-4 h-4 mr-2" />
              Voice Testing
            </TabsTrigger>
            <TabsTrigger
              value="studio"
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white hover:text-[#00E676] transition-colors"
            >
              <Brain className="w-4 h-4 mr-2" />
              Studio Flows
            </TabsTrigger>
            <TabsTrigger
              value="api"
              className="data-[state=active]:bg-[#00E676] data-[state=active]:text-black text-white hover:text-[#00E676] transition-colors"
            >
              <Network className="w-4 h-4 mr-2" />
              API Testing
            </TabsTrigger>
          </TabsList>

          {/* SMS Testing Tab */}
          <TabsContent value="sms" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="f10-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#00BFFF]" />
                    SMS Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[#b3b3b3]">Phone Number</Label>
                    <Input
                      value={smsTest.phone}
                      onChange={(e) => setSmsTest(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+18559600037"
                      className="bg-[#1a1a1a] border-[#333333] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#b3b3b3]">Message</Label>
                    <Textarea
                      value={smsTest.message}
                      onChange={(e) => setSmsTest(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Test message"
                      className="bg-[#1a1a1a] border-[#333333] text-white"
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={runSMSTest}
                    disabled={isTesting.sms}
                    className="w-full f10-btn accent-bg text-black font-medium"
                  >
                    {isTesting.sms ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending SMS...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Test SMS
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="f10-card">
                <CardHeader>
                  <CardTitle>SMS Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.sms ? (
                    <TestResultDisplay result={testResults.sms} />
                  ) : (
                    <div className="text-center py-8 text-[#737373]">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No SMS tests run yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Email Testing Tab */}
          <TabsContent value="email" className="space-y-6">
            <SendGridTest />
          </TabsContent>

          {/* Voice Testing Tab */}
          <TabsContent value="voice" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="f10-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#8A2BE2]" />
                    Voice Call Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[#b3b3b3]">Phone Number</Label>
                    <Input
                      value={voiceTest.phone}
                      onChange={(e) => setVoiceTest(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+18559600037"
                      className="bg-[#1a1a1a] border-[#333333] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#b3b3b3]">Voice Message</Label>
                    <Textarea
                      value={voiceTest.message}
                      onChange={(e) => setVoiceTest(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Test voice message"
                      className="bg-[#1a1a1a] border-[#333333] text-white"
                      rows={3}
                    />
                  </div>
                  <Button 
                    onClick={runVoiceTest}
                    disabled={isTesting.voice}
                    className="w-full f10-btn accent-bg text-black font-medium"
                  >
                    {isTesting.voice ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Initiating Call...
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" />
                        Start Test Call
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="f10-card">
                <CardHeader>
                  <CardTitle>Voice Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.voice ? (
                    <TestResultDisplay result={testResults.voice} />
                  ) : (
                    <div className="text-center py-8 text-[#737373]">
                      <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No voice tests run yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Studio Flows Tab */}
          <TabsContent value="studio" className="space-y-6">
            <StudioFlowBuilder />
          </TabsContent>

          {/* API Testing Tab */}
          <TabsContent value="api" className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="f10-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5 text-[#32CD32]" />
                    API Testing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-[#b3b3b3]">Endpoint URL</Label>
                    <Input
                      value={apiTest.endpoint}
                      onChange={(e) => setApiTest(prev => ({ ...prev, endpoint: e.target.value }))}
                      placeholder="https://api.example.com/test"
                      className="bg-[#1a1a1a] border-[#333333] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#b3b3b3]">Method</Label>
                    <select
                      value={apiTest.method}
                      onChange={(e) => setApiTest(prev => ({ ...prev, method: e.target.value }))}
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[#b3b3b3]">Headers (JSON)</Label>
                    <Textarea
                      value={apiTest.headers}
                      onChange={(e) => setApiTest(prev => ({ ...prev, headers: e.target.value }))}
                      placeholder='{"Authorization": "Bearer token"}'
                      className="bg-[#1a1a1a] border-[#333333] text-white font-mono text-sm"
                      rows={2}
                    />
                  </div>
                  {apiTest.method !== 'GET' && (
                    <div>
                      <Label className="text-[#b3b3b3]">Body (JSON)</Label>
                      <Textarea
                        value={apiTest.body}
                        onChange={(e) => setApiTest(prev => ({ ...prev, body: e.target.value }))}
                        placeholder='{"key": "value"}'
                        className="bg-[#1a1a1a] border-[#333333] text-white font-mono text-sm"
                        rows={3}
                      />
                    </div>
                  )}
                  <Button 
                    onClick={runAPITest}
                    disabled={isTesting.api}
                    className="w-full f10-btn accent-bg text-black font-medium"
                  >
                    {isTesting.api ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing API...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Test API
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="f10-card">
                <CardHeader>
                  <CardTitle>API Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.api ? (
                    <TestResultDisplay result={testResults.api} />
                  ) : (
                    <div className="text-center py-8 text-[#737373]">
                      <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No API tests run yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

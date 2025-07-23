import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Send, 
  Bot, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Volume2,
  VolumeX,
  Zap
} from "lucide-react";
import { getOpenAIService } from "../../shared/openai-service";

interface AIResponse {
  content: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

export default function AICommandInterface() {
  const [command, setCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error' | null>(null);
  const recognitionRef = useRef<any>(null);

  // Test OpenAI connection
  const testConnection = async () => {
    setConnectionStatus('checking');
    try {
      const openai = getOpenAIService();
      const response = await openai.chat([
        { role: 'user', content: 'Say "Connection successful" if you can respond.' }
      ]);
      
      if (response.includes('Connection successful') || response.length > 0) {
        setConnectionStatus('connected');
        setResponses(prev => [{
          content: `✅ OpenAI Connected! Model: gpt-3.5-turbo\nResponse: ${response}`,
          timestamp: new Date().toISOString(),
          success: true
        }, ...prev]);
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
      setResponses(prev => [{
        content: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, ...prev]);
    }
  };

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCommand(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  // Start voice recording
  const startListening = () => {
    if (!recognitionRef.current) {
      initSpeechRecognition();
    }
    
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Stop voice recording
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Execute AI command
  const executeCommand = async () => {
    if (!command.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const openai = getOpenAIService();
      
      // System prompt for executing commands
      const systemPrompt = `You are an AI assistant that executes commands. When the user asks you to do something:

1. ACKNOWLEDGE what they want
2. Explain what you would do to accomplish it
3. If it's a technical task, provide the specific steps or code
4. Be direct and actionable

Examples:
- "Send a text to John" → "I would send an SMS to John using the Twilio integration. Here's how..."
- "Create a user dashboard" → "I'll create a React dashboard component with these features..."
- "Fix the login bug" → "I'll analyze the login system and provide debugging steps..."

Be helpful and specific about HOW you would accomplish their request.`;

      const response = await openai.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: command }
      ]);

      setResponses(prev => [{
        content: response,
        timestamp: new Date().toISOString(),
        success: true
      }, ...prev]);

      // Speak the response if available
      if ('speechSynthesis' in window && response) {
        const utterance = new SpeechSynthesisUtterance(response.substring(0, 200) + "...");
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      }

      setCommand(""); // Clear input after successful command
      
    } catch (error) {
      setResponses(prev => [{
        content: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, ...prev]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeCommand();
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card className="glass-card corp-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            AI Command Center
          </CardTitle>
          <CardDescription>
            Direct AI assistant - type or speak commands and I'll execute them
          </CardDescription>
          <div className="flex items-center gap-2">
            <Button onClick={testConnection} disabled={connectionStatus === 'checking'} variant="outline" size="sm">
              {connectionStatus === 'checking' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              Test OpenAI
            </Button>
            
            {connectionStatus === 'connected' && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
            
            {connectionStatus === 'error' && (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                Error
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Command Input */}
      <Card className="glass-card corp-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Give me a command</CardTitle>
          <CardDescription>
            Type or speak what you want me to do. Examples: "Send test SMS", "Create a user form", "Fix the login"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me what to do... (e.g., 'Send a test SMS to 814-440-9968')"
              className="flex-1"
            />
            
            <Button
              onClick={isListening ? stopListening : startListening}
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <VolumeX className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={executeCommand}
              disabled={!command.trim() || isProcessing}
              className="gap-2"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Execute
            </Button>
          </div>
          
          {isListening && (
            <Alert>
              <Volume2 className="h-4 w-4" />
              <AlertDescription>
                🎤 Listening... Speak your command now
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* AI Responses */}
      {responses.length > 0 && (
        <Card className="glass-card corp-shadow">
          <CardHeader>
            <CardTitle>AI Responses</CardTitle>
            <CardDescription>Recent AI command executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {responses.slice(0, 10).map((response, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    response.success 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={response.success ? "default" : "destructive"}>
                      {response.success ? "✅ Success" : "❌ Error"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(response.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="text-sm whitespace-pre-wrap">
                    {response.content}
                  </div>
                  
                  {response.error && (
                    <div className="text-xs text-red-600 mt-2 bg-red-100 p-2 rounded">
                      <strong>Error Details:</strong> {response.error}
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

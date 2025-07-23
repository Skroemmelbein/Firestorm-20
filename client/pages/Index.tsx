import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, MicOff, Volume2, VolumeX, Send, Sparkles, Settings, Code, FileText, Wrench, Lightbulb, Zap, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { getOpenAIService } from "@shared/openai-service";
import type { DevelopmentTask } from "@shared/openai-service";
import { fileManager } from "@shared/code-executor";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  task?: DevelopmentTask;
  code?: string;
  actionType?: 'chat' | 'code' | 'explanation' | 'debug';
  canExecute?: boolean;
  executed?: boolean;
}

interface DevelopmentTask {
  action: 'create' | 'modify' | 'delete' | 'explain' | 'debug';
  target: 'component' | 'page' | 'api' | 'database' | 'style' | 'function';
  details: string;
  code?: string;
  fileName?: string;
  framework?: string;
}

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hi! I'm your AI development assistant powered by OpenAI. I can help you:\n\n• Create components and pages\n• Generate and modify code\n• Debug issues\n• Explain complex concepts\n• Build APIs and databases\n\nJust speak naturally or type what you'd like to build!",
      timestamp: new Date(),
      actionType: 'chat'
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [executingCode, setExecutingCode] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for speech recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript, "voice");
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Check for speech synthesis support
    if ('speechSynthesis' in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if (synthesisRef.current && !isSpeaking) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      synthesisRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<{ content: string; task?: DevelopmentTask; actionType: 'chat' | 'code' | 'explanation' | 'debug'; code?: string }> => {
    try {
      const openaiService = getOpenAIService();

      // Try to parse as development task first
      const task = await openaiService.parseVoiceCommand(userMessage);

      if (task) {
        // This is a development command
        let response = '';
        let code = '';
        let actionType: 'chat' | 'code' | 'explanation' | 'debug' = 'code';

        switch (task.action) {
          case 'create':
          case 'modify':
            code = await openaiService.generateCode(task, 'React TypeScript project with Tailwind CSS');
            response = `I'll ${task.action} a ${task.target} for you. Here's the code:`;
            actionType = 'code';
            break;

          case 'explain':
            response = await openaiService.explainCode(task.code || '', task.details);
            actionType = 'explanation';
            break;

          case 'debug':
            response = await openaiService.debugCode(task.code || '', task.details);
            actionType = 'debug';
            break;

          default:
            response = await openaiService.chatWithContext(userMessage, conversationHistory);
            actionType = 'chat';
        }

        return { content: response, task, actionType, code, canExecute: !!code };
      } else {
        // Regular conversation
        const response = await openaiService.chatWithContext(userMessage, conversationHistory);
        return { content: response, actionType: 'chat' };
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        content: 'I apologize, but I encountered an error processing your request. Please try again or check your OpenAI connection.',
        actionType: 'chat'
      };
    }
  };

  const handleUserMessage = async (content: string, source: "voice" | "text") => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
      actionType: 'chat'
    };

    setMessages(prev => [...prev, userMessage]);
    setTextInput("");
    setIsProcessing(true);

    // Update conversation history
    setConversationHistory(prev => [...prev, { role: 'user', content: content.trim() }]);

    try {
      const aiResponse = await generateAIResponse(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: aiResponse.content,
        timestamp: new Date(),
        task: aiResponse.task,
        code: aiResponse.code,
        actionType: aiResponse.actionType,
        canExecute: aiResponse.canExecute,
        executed: false
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update conversation history
      setConversationHistory(prev => [...prev, { role: 'assistant', content: aiResponse.content }]);

      // Auto-speak AI responses if they came from voice input
      if (source === "voice" && speechSupported) {
        setTimeout(() => speakText(aiResponse.content), 500);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        actionType: 'chat'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeCode = async (messageId: string, task: DevelopmentTask, code: string) => {
    setExecutingCode(messageId);

    try {
      let result;
      const fileName = task.fileName || generateFileName(task);

      switch (task.target) {
        case 'component':
          result = await fileManager.createComponent(fileName.replace('.tsx', ''), code);
          break;
        case 'page':
          result = await fileManager.createPage(fileName.replace('.tsx', ''), code);
          break;
        case 'api':
          result = await fileManager.createAPI(fileName.replace('.ts', ''), code);
          break;
        default:
          result = { success: false, message: 'Unsupported file type' };
      }

      // Update the message to show execution status
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, executed: true }
          : msg
      ));

      // Add result message
      const resultMessage: Message = {
        id: Date.now().toString(),
        type: "system",
        content: result.success
          ? `✅ ${result.message}`
          : `❌ ${result.message}`,
        timestamp: new Date(),
        actionType: 'chat'
      };

      setMessages(prev => [...prev, resultMessage]);

    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: "system",
        content: `❌ Failed to execute: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        actionType: 'chat'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setExecutingCode(null);
    }
  };

  const generateFileName = (task: DevelopmentTask): string => {
    if (task.fileName) return task.fileName;

    const name = task.details.split(' ').find(word =>
      !['create', 'add', 'make', 'build', 'component', 'page', 'api'].includes(word.toLowerCase())
    ) || 'NewFile';

    const cleanName = name.charAt(0).toUpperCase() + name.slice(1).replace(/[^a-zA-Z0-9]/g, '');

    switch (task.target) {
      case 'component':
        return `${cleanName}Component.tsx`;
      case 'page':
        return `${cleanName}Page.tsx`;
      case 'api':
        return `${cleanName}API.ts`;
      default:
        return `${cleanName}.tsx`;
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUserMessage(textInput, "text");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserMessage(textInput, "text");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Development Assistant</h1>
                <p className="text-sm text-muted-foreground">Voice-powered coding with OpenAI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                <Zap className="w-3 h-3 mr-1" />
                OpenAI Connected
              </Badge>
              {speechSupported ? (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  Voice Enabled
                </Badge>
              ) : (
                <Badge variant="outline">Text Only</Badge>
              )}
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-4 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              {(message.type === "assistant" || message.type === "system") && (
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                  message.type === "system"
                    ? "bg-yellow-500/20 border border-yellow-500/30"
                    : "bg-gradient-to-br from-primary via-primary to-primary/80"
                )}>
                  {message.actionType === 'code' ? (
                    <Code className="w-4 h-4 text-primary-foreground" />
                  ) : message.actionType === 'explanation' ? (
                    <Lightbulb className="w-4 h-4 text-primary-foreground" />
                  ) : message.actionType === 'debug' ? (
                    <Wrench className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
              )}
              <div className={cn(
                "max-w-[85%] space-y-2",
                message.type === "user" && "flex flex-col items-end"
              )}>
                <Card className={cn(
                  "shadow-sm",
                  message.type === "user"
                    ? "bg-primary text-primary-foreground border-primary/20"
                    : message.type === "system"
                    ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700/30"
                    : "bg-card border-border/50"
                )}>
                  {message.task && (
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        {message.actionType === 'code' && <Code className="w-4 h-4" />}
                        {message.actionType === 'explanation' && <Lightbulb className="w-4 h-4" />}
                        {message.actionType === 'debug' && <Wrench className="w-4 h-4" />}
                        {message.task.action} {message.task.target}: {message.task.fileName || message.task.details}
                      </CardTitle>
                    </CardHeader>
                  )}
                  <CardContent className={cn("p-4", message.task && "pt-0")}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    {message.code && (
                      <div className="mt-3 rounded-lg bg-slate-900 p-4 overflow-x-auto">
                        <pre className="text-sm text-slate-100">
                          <code>{message.code}</code>
                        </pre>
                      </div>
                    )}
                    <p className={cn(
                      "text-xs mt-2 opacity-70",
                      message.type === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-4 h-4 rounded-full bg-foreground/70" />
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center flex-shrink-0 mt-1">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <Card className="bg-card border-border/50 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex flex-col gap-4">
            {/* Voice Controls */}
            {speechSupported && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  size="lg"
                  variant={isListening ? "destructive" : "default"}
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing}
                  className={cn(
                    "w-16 h-16 rounded-full transition-all duration-200",
                    isListening && "animate-pulse scale-110"
                  )}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </Button>
                <Button
                  size="lg"
                  variant={isSpeaking ? "destructive" : "outline"}
                  onClick={isSpeaking ? stopSpeaking : undefined}
                  disabled={!isSpeaking}
                  className="w-16 h-16 rounded-full"
                >
                  {isSpeaking ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </Button>
              </div>
            )}

            {/* Text Input */}
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={speechSupported ? "Type a message or use voice..." : "Type your message..."}
                className="flex-1 min-h-[60px] max-h-32 resize-none bg-background/50 border-border/50 focus:border-primary/50"
                disabled={isProcessing}
              />
              <Button 
                type="submit" 
                size="lg"
                disabled={!textInput.trim() || isProcessing}
                className="px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>

            <div className="space-y-2">
              <p className="text-xs text-center text-muted-foreground">
                {speechSupported
                  ? "Click the microphone to speak or type your message above. Press Enter to send."
                  : "Speech recognition not supported in this browser. You can still type messages."
                }
              </p>
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                <FileText className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Try saying:</strong> "Create a login component", "Fix the header styling", "Add an API for users", "Explain this code", "Debug this function"
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

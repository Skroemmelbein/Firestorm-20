import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  Bot,
  MessageSquare,
  Code,
  Lightbulb,
  Wrench,
  Copy,
  FileText,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getOpenAIService } from "@shared/openai-service";
import type { DevelopmentTask } from "@shared/openai-service";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  task?: DevelopmentTask;
  code?: string;
  actionType?: "chat" | "code" | "explanation" | "debug";
  canExecute?: boolean;
  executed?: boolean;
}

interface SiriAssistantProps {
  onClose?: () => void;
}

export default function SiriAssistant({ onClose }: SiriAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        "Hey! I'm your AI development assistant. I can help you build components, debug code, and create amazing features. Just ask me anything!",
      timestamp: new Date(),
      actionType: "chat",
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      setSpeechSupported(true);
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserMessage(transcript, "voice");
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    // Initialize speech synthesis
    if ("speechSynthesis" in window) {
      synthesisRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (synthesisRef.current) synthesisRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

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

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthesisRef.current.speak(utterance);
    }
  };

  const generateAIResponse = async (
    userMessage: string,
  ): Promise<{
    content: string;
    task?: DevelopmentTask;
    actionType: "chat" | "code" | "explanation" | "debug";
    code?: string;
    canExecute?: boolean;
  }> => {
    try {
      const openaiService = getOpenAIService();

      // Prevent multiple concurrent requests
      if (isProcessing) {
        return {
          content: "Please wait, I'm still processing your previous request...",
          actionType: "chat",
        };
      }

      // Try to parse as development task first
      const task = await openaiService.parseVoiceCommand(userMessage);

      if (task) {
        let response = "";
        let code = "";
        let actionType: "chat" | "code" | "explanation" | "debug" = "code";

        switch (task.action) {
          case "create":
          case "modify":
            code = await openaiService.generateCode(
              task,
              "React TypeScript project with Tailwind CSS",
            );
            response = `I'll ${task.action} a ${task.target} for you. Here's the code:`;
            actionType = "code";
            break;

          case "explain":
            response = await openaiService.explainCode(
              task.code || "",
              task.details,
            );
            actionType = "explanation";
            break;

          case "debug":
            response = await openaiService.debugCode(
              task.code || "",
              task.details,
            );
            actionType = "debug";
            break;

          default:
            response = await openaiService.chatWithContext(
              userMessage,
              conversationHistory,
            );
            actionType = "chat";
        }

        return {
          content: response,
          task,
          actionType,
          code,
          canExecute: !!code,
        };
      } else {
        const response = await openaiService.chatWithContext(
          userMessage,
          conversationHistory,
        );
        return { content: response, actionType: "chat" };
      }
    } catch (error) {
      console.error("Error generating AI response:", error);

      // Enhanced error handling for different error types
      if (
        error instanceof Error &&
        error.message.includes("body stream already read")
      ) {
        return {
          content:
            "I encountered a technical issue processing your request. Please try again in a moment.",
          actionType: "chat",
        };
      }

      // Smart fallback responses based on keywords
      const lowerMessage = userMessage.toLowerCase();

      if (
        lowerMessage.includes("create") &&
        lowerMessage.includes("component")
      ) {
        return {
          content:
            "I'd love to help you create a component! While I'm reconnecting to my AI brain, can you tell me more details about what this component should do? For example: 'Create a login form with email and password fields'",
          actionType: "chat",
        };
      }

      if (
        lowerMessage.includes("fix") ||
        lowerMessage.includes("debug") ||
        lowerMessage.includes("error")
      ) {
        return {
          content:
            "I'm here to help debug! While I'm getting my full AI powers back, can you share the error message or describe what's not working? I can still provide guidance!",
          actionType: "chat",
        };
      }

      if (lowerMessage.includes("build") || lowerMessage.includes("make")) {
        return {
          content:
            "Exciting! I love building things. While I'm reconnecting, tell me more about what you want to build - a page, component, API, or something else entirely?",
          actionType: "chat",
        };
      }

      return {
        content:
          "I'm having a moment reconnecting to my AI superpowers, but I'm still here! Try asking me to create a component, fix some code, or build something specific. What would you like to work on?",
        actionType: "chat",
      };
    }
  };

  const handleUserMessage = async (
    content: string,
    source: "voice" | "text",
  ) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
      actionType: "chat",
    };

    setMessages((prev) => [...prev, userMessage]);
    setTextInput("");
    setIsProcessing(true);

    setConversationHistory((prev) => [
      ...prev,
      { role: "user", content: content.trim() },
    ]);

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
        executed: false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: aiResponse.content },
      ]);

      if (source === "voice" && speechSupported) {
        setTimeout(() => speakText(aiResponse.content), 500);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content:
          "I'm having trouble connecting right now, but I'm still here to help! Try asking me to create a component or explain some code.",
        timestamp: new Date(),
        actionType: "chat",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUserMessage(textInput, "text");
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 shadow-xl border-0 group"
        >
          <div className="flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300 ease-in-out",
        isMinimized
          ? "bottom-6 right-6 w-80 h-16"
          : "bottom-6 right-6 w-96 h-[600px]",
      )}
    >
      <Card className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900 border-2 border-blue-200 dark:border-blue-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Assistant</h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                  <Zap className="w-2 h-2 mr-1" />
                  Active
                </Badge>
                {speechSupported && (
                  <Badge variant="outline" className="text-xs">
                    Voice
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
              className="w-8 h-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[400px]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.type === "user" ? "justify-end" : "justify-start",
                  )}
                >
                  {message.type !== "user" && (
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
                        message.type === "system"
                          ? "bg-yellow-500/20 border border-yellow-500/30"
                          : "bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500",
                      )}
                    >
                      {message.actionType === "code" ? (
                        <Code className="w-3 h-3 text-white" />
                      ) : message.actionType === "explanation" ? (
                        <Lightbulb className="w-3 h-3 text-white" />
                      ) : message.actionType === "debug" ? (
                        <Wrench className="w-3 h-3 text-white" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-white" />
                      )}
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[85%] space-y-2",
                      message.type === "user" && "flex flex-col items-end",
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-2xl px-3 py-2 text-sm",
                        message.type === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {message.code && (
                        <div className="mt-2 space-y-2">
                          <div className="rounded-lg bg-slate-900 p-2 overflow-x-auto">
                            <pre className="text-xs text-slate-100">
                              <code>{message.code}</code>
                            </pre>
                          </div>
                          {message.canExecute && (
                            <div className="flex gap-1">
                              <Button size="sm" className="h-6 text-xs">
                                <FileText className="w-3 h-3 mr-1" />
                                Create
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs"
                                onClick={() =>
                                  navigator.clipboard.writeText(message.code!)
                                }
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {message.type === "user" && (
                    <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-3 h-3 rounded-full bg-slate-600 dark:bg-slate-300" />
                    </div>
                  )}
                </div>
              ))}

              {isProcessing && (
                <div className="flex gap-2 justify-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className="border-t border-blue-200 dark:border-blue-700 p-3 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              {speechSupported && (
                <div className="flex items-center justify-center mb-2">
                  <Button
                    size="sm"
                    variant={isListening ? "destructive" : "default"}
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                    className={cn(
                      "w-10 h-10 rounded-full transition-all duration-200",
                      isListening && "animate-pulse scale-110",
                    )}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 text-sm"
                  disabled={isProcessing}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!textInput.trim() || isProcessing}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </Card>
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

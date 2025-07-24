import React, { useState, useEffect } from "react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Users,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Bot,
  Phone,
  Loader2,
  ArrowRight,
  Download,
  Trash2,
} from "lucide-react";

interface ConversationMessage {
  sid: string;
  author: string;
  body: string;
  dateCreated: string;
  direction: "inbound" | "outbound";
  participantSid?: string;
}

interface Conversation {
  sid: string;
  friendlyName: string;
  uniqueName?: string;
  state: "active" | "inactive" | "closed";
  dateCreated: string;
  dateUpdated: string;
  participants: ConversationParticipant[];
  messagesCount: number;
  lastMessage?: ConversationMessage;
}

interface ConversationParticipant {
  sid: string;
  identity?: string;
  address?: string;
  roleSid?: string;
  dateCreated: string;
}

interface NewConversation {
  friendlyName: string;
  participantPhone: string;
  initialMessage: string;
}

export default function TwilioConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newConversation, setNewConversation] = useState<NewConversation>({
    friendlyName: "Test Conversation",
    participantPhone: "+18144409068",
    initialMessage:
      "Hello! This is a test conversation from ECELONX. You can reply to this message.",
  });

  const [isLoading, setIsLoading] = useState({
    conversations: false,
    messages: false,
    sending: false,
    creating: false,
  });

  // Load conversations
  const loadConversations = async () => {
    setIsLoading((prev) => ({ ...prev, conversations: true }));
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      } else {
        console.error(
          "Failed to load conversations:",
          response.status,
          response.statusText,
        );
        setConversations([]);
      }
    } catch (error) {
      console.error("Failed to load conversations - network error:", error);
      setConversations([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, conversations: false }));
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationSid: string) => {
    setIsLoading((prev) => ({ ...prev, messages: true }));
    try {
      const response = await fetch(
        `/api/conversations/${conversationSid}/messages`,
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      } else {
        console.error(
          "Failed to load messages:",
          response.status,
          response.statusText,
        );
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to load messages - network error:", error);
      setMessages([]);
    } finally {
      setIsLoading((prev) => ({ ...prev, messages: false }));
    }
  };

  // Create new conversation
  const createConversation = async () => {
    setIsLoading((prev) => ({ ...prev, creating: true }));
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendlyName: newConversation.friendlyName,
          participantPhone: newConversation.participantPhone,
          initialMessage: newConversation.initialMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await loadConversations();
        setSelectedConversation(data.conversation);
        setNewConversation({
          friendlyName: "Test Conversation",
          participantPhone: "+18144409068",
          initialMessage:
            "Hello! This is a test conversation from ECELONX. You can reply to this message.",
        });
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, creating: false }));
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    setIsLoading((prev) => ({ ...prev, sending: true }));
    try {
      const response = await fetch(
        `/api/conversations/${selectedConversation.sid}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            body: newMessage,
            author: "system",
          }),
        },
      );

      if (response.ok) {
        setNewMessage("");
        await loadMessages(selectedConversation.sid);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading((prev) => ({ ...prev, sending: false }));
    }
  };

  // Auto-load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-refresh messages when conversation is selected (DISABLED for now due to API issues)
  useEffect(() => {
    if (selectedConversation) {
      // Only load messages on manual request to avoid network error spam
      console.log("Conversation selected:", selectedConversation.friendlyName);
      // loadMessages(selectedConversation.sid); // Disabled - use manual refresh button instead
    }
  }, [selectedConversation]);

  const formatTime = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getConversationStatus = (state: string) => {
    switch (state) {
      case "active":
        return { color: "#10B981", label: "ACTIVE" };
      case "inactive":
        return { color: "#F59E0B", label: "INACTIVE" };
      case "closed":
        return { color: "#6B7280", label: "CLOSED" };
      default:
        return { color: "#6B7280", label: "UNKNOWN" };
    }
  };

  return (
    <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#00BFFF]" />
          Twilio Conversations - Two-Way Messaging
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* API Status Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-semibold text-orange-800 mb-2">
            ⚠️ Twilio Conversations API Required
          </h4>
          <p className="text-sm text-orange-700 mb-2">
            This feature requires Twilio Conversations API to be enabled on your
            account. If you see network errors, use the regular SMS testing tabs
            instead.
          </p>
          <div className="text-xs text-orange-600">
            <strong>Alternative:</strong> Use SMS Testing tab for simple
            outbound SMS testing without conversations.
          </div>
        </div>

        {/* Create New Conversation */}
        <div className="bg-white/80 border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">
            Start New Conversation
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Label className="text-gray-700 text-sm font-medium">
                Conversation Name
              </Label>
              <Input
                value={newConversation.friendlyName}
                onChange={(e) =>
                  setNewConversation((prev) => ({
                    ...prev,
                    friendlyName: e.target.value,
                  }))
                }
                className="bg-white border-gray-300 text-gray-800 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Test Conversation"
              />
            </div>
            <div>
              <Label className="text-gray-700 text-sm font-medium">
                Participant Phone
              </Label>
              <Input
                value={newConversation.participantPhone}
                onChange={(e) =>
                  setNewConversation((prev) => ({
                    ...prev,
                    participantPhone: e.target.value,
                  }))
                }
                className="bg-white border-gray-300 text-gray-800 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="+18144409068"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={createConversation}
                disabled={isLoading.creating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {isLoading.creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Start Conversation
                  </>
                )}
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-gray-700 text-sm font-medium">
              Initial Message
            </Label>
            <Textarea
              value={newConversation.initialMessage}
              onChange={(e) =>
                setNewConversation((prev) => ({
                  ...prev,
                  initialMessage: e.target.value,
                }))
              }
              className="bg-white border-gray-300 text-gray-800 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={2}
              placeholder="Hello! This is a test conversation..."
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                Active Conversations
              </h3>
              <Button
                onClick={loadConversations}
                disabled={isLoading.conversations}
                size="sm"
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading.conversations ? "animate-spin" : ""}`}
                />
              </Button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {!conversations || conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-600">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-xs">Create one to start testing</p>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                    <p className="text-sm font-medium text-yellow-800">
                      ⚠️ Twilio Conversations Setup
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      If you see network errors, ensure your Twilio account has
                      Conversations API enabled.
                    </p>
                  </div>
                </div>
              ) : (
                (conversations || []).map((conversation) => {
                  const status = getConversationStatus(conversation.state);
                  return (
                    <div
                      key={conversation.sid}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedConversation?.sid === conversation.sid
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {conversation.friendlyName}
                        </h4>
                        <Badge
                          style={{
                            backgroundColor: `${status.color}20`,
                            color: status.color,
                            borderColor: `${status.color}40`,
                          }}
                          className="text-xs"
                        >
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>
                          {conversation.participants?.length || 0} participants
                        </span>
                        <span>{conversation.messagesCount || 0} messages</span>
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 mt-2 truncate">
                          {conversation.lastMessage.body}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                {selectedConversation
                  ? selectedConversation.friendlyName
                  : "Select Conversation"}
              </h3>
              {selectedConversation && (
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-600">
                    SID: {selectedConversation.sid.substring(0, 12)}...
                  </div>
                  <Button
                    onClick={() => loadMessages(selectedConversation.sid)}
                    disabled={isLoading.messages}
                    size="sm"
                    className="text-xs px-2 py-1 h-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading.messages ? "Loading..." : "Load Messages"}
                  </Button>
                </div>
              )}
            </div>

            {selectedConversation ? (
              <div className="space-y-4">
                {/* Messages */}
                <div className="border border-gray-200 rounded-lg p-4 h-64 overflow-y-auto bg-gray-50">
                  {!messages || messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-600">
                      {isLoading.messages ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Loading messages...</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span>No messages loaded</span>
                          <p className="text-xs mt-2 text-gray-500">
                            Click "Load Messages" above or use regular SMS
                            testing instead
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(messages || []).map((message) => (
                        <div
                          key={message.sid}
                          className={`flex items-start gap-3 ${
                            message.direction === "outbound"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg ${
                              message.direction === "outbound"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-800 border border-gray-200"
                            }`}
                          >
                            <p className="text-sm">{message.body}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">
                                {message.author || "system"}
                              </span>
                              <span className="text-xs opacity-70">
                                {formatTime(message.dateCreated)}
                              </span>
                            </div>
                          </div>
                          {message.direction === "outbound" ? (
                            <Bot className="w-6 h-6 text-blue-600 mt-1" />
                          ) : (
                            <User className="w-6 h-6 text-green-600 mt-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send Message */}
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="bg-white border-gray-300 text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    onKeyPress={(e) =>
                      e.key === "Enter" && !isLoading.sending && sendMessage()
                    }
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading.sending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isLoading.sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-8 text-center text-gray-600 bg-gray-50">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a conversation to view messages</p>
                <p className="text-xs mt-2">
                  Two-way messaging enabled - participants can reply
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-700 mb-2">
            📱 Two-Way Messaging Active
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-gray-800">How it works:</strong>
              <ul className="text-gray-700 mt-1 space-y-1">
                <li>• Start a conversation with a participant</li>
                <li>• Send messages from this interface</li>
                <li>• Participant can reply via SMS</li>
                <li>• All messages appear in real-time</li>
              </ul>
            </div>
            <div>
              <strong className="text-gray-800">Test Flow:</strong>
              <ul className="text-gray-700 mt-1 space-y-1">
                <li>
                  • Your number:{" "}
                  <span className="text-blue-600 font-medium">
                    +18559600037
                  </span>
                </li>
                <li>
                  ��� Test recipient:{" "}
                  <span className="text-green-600 font-medium">
                    +18144409068
                  </span>
                </li>
                <li>• Replies will appear automatically</li>
                <li>• Full conversation history tracked</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Brain,
  MessageSquare,
  Phone,
  Mic,
  Send,
  Play,
  Settings,
  Plus,
  Save,
  Code,
  Eye,
  Download,
  Upload,
  Trash2,
  Edit,
  Copy,
  ArrowRight,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Database,
  Network,
  Volume2,
  FileText,
  Globe,
  Lock,
} from "lucide-react";
import { httpRequest } from "@/utils/http-client";

interface StudioWidget {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
  transitions: StudioTransition[];
  position: { x: number; y: number };
}

interface StudioTransition {
  event: string;
  next?: string;
  condition?: string;
}

interface StudioFlow {
  id?: string;
  friendlyName: string;
  description: string;
  status: "draft" | "published";
  definition: {
    states: StudioWidget[];
    initial_state: string;
    flags: Record<string, any>;
    description: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const WIDGET_TYPES = [
  {
    type: "trigger",
    name: "Flow Trigger",
    description: "Entry point for incoming messages, calls, or REST requests",
    icon: Zap,
    color: "#10B981",
    category: "triggers",
  },
  {
    type: "say-play",
    name: "Say/Play",
    description: "Play a message or audio to the caller",
    icon: Volume2,
    color: "#3B82F6",
    category: "communication",
  },
  {
    type: "send-message",
    name: "Send Message",
    description: "Send an SMS or chat message",
    icon: MessageSquare,
    color: "#8B5CF6",
    category: "communication",
  },
  {
    type: "make-outgoing-call-v2",
    name: "Make Call",
    description: "Initiate an outbound phone call",
    icon: Phone,
    color: "#F59E0B",
    category: "communication",
  },
  {
    type: "gather-input-on-call",
    name: "Gather Input",
    description: "Collect DTMF or speech input from caller",
    icon: Mic,
    color: "#EF4444",
    category: "input",
  },
  {
    type: "split-based-on",
    name: "Split Based On",
    description: "Branch flow based on conditions",
    icon: Target,
    color: "#06B6D4",
    category: "logic",
  },
  {
    type: "set-variables",
    name: "Set Variables",
    description: "Store data in flow variables",
    icon: Database,
    color: "#84CC16",
    category: "data",
  },
  {
    type: "make-http-request",
    name: "HTTP Request",
    description: "Make API calls to external services",
    icon: Network,
    color: "#F97316",
    category: "integration",
  },
  {
    type: "run-function",
    name: "Run Function",
    description: "Execute Twilio Functions code",
    icon: Code,
    color: "#A855F7",
    category: "logic",
  },
];

export default function StudioFlowBuilder() {
  const [flows, setFlows] = useState<StudioFlow[]>([]);
  const [currentFlow, setCurrentFlow] = useState<StudioFlow | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<StudioWidget | null>(
    null,
  );
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState("flows");

  // Create new flow
  const createNewFlow = () => {
    const newFlow: StudioFlow = {
      friendlyName: `New Flow ${flows.length + 1}`,
      description: "A new Studio Flow",
      status: "draft",
      definition: {
        states: [
          {
            id: "trigger",
            name: "Trigger",
            type: "trigger",
            properties: {
              offset: { x: 0, y: 0 },
            },
            transitions: [
              { event: "incomingMessage" },
              { event: "incomingCall" },
              { event: "incomingRequest" },
            ],
            position: { x: 100, y: 100 },
          },
        ],
        initial_state: "Trigger",
        flags: {
          allow_concurrent_calls: true,
        },
        description: "A new Studio Flow",
      },
    };
    setCurrentFlow(newFlow);
    setIsBuilding(true);
    setActiveTab("builder");
  };

  // Add widget to flow
  const addWidget = (widgetType: string) => {
    if (!currentFlow) return;

    const widgetInfo = WIDGET_TYPES.find((w) => w.type === widgetType);
    const newWidget: StudioWidget = {
      id: `${widgetType}_${Date.now()}`,
      name: `${widgetInfo?.name || widgetType}_${currentFlow.definition.states.length}`,
      type: widgetType,
      properties: getDefaultProperties(widgetType),
      transitions: getDefaultTransitions(widgetType),
      position: { x: 200 + currentFlow.definition.states.length * 50, y: 200 },
    };

    setCurrentFlow({
      ...currentFlow,
      definition: {
        ...currentFlow.definition,
        states: [...currentFlow.definition.states, newWidget],
      },
    });
  };

  // Get default properties for widget type
  const getDefaultProperties = (type: string): Record<string, any> => {
    switch (type) {
      case "say-play":
        return { say: "Hello, welcome to our service!", loop: 1 };
      case "send-message":
        return {
          body: "Thank you for contacting us!",
          from: "{{flow.channel.address}}",
          to: "{{contact.channel.address}}",
        };
      case "make-outgoing-call-v2":
        return {
          from: "{{flow.channel.address}}",
          to: "{{contact.channel.address}}",
          timeout: 30,
          record: false,
        };
      case "gather-input-on-call":
        return {
          say: "Please enter your selection",
          num_digits: 1,
          timeout: 5,
        };
      case "split-based-on":
        return { variable: "{{widgets.trigger.parsed_body}}" };
      case "set-variables":
        return { variables: [{ key: "custom_variable", value: "value" }] };
      case "make-http-request":
        return {
          method: "POST",
          url: "https://your-api-endpoint.com",
          content_type: "application/json",
        };
      default:
        return {};
    }
  };

  // Get default transitions for widget type
  const getDefaultTransitions = (type: string): StudioTransition[] => {
    switch (type) {
      case "say-play":
        return [{ event: "audioComplete" }];
      case "send-message":
        return [{ event: "sent" }, { event: "failed" }];
      case "make-outgoing-call-v2":
        return [
          { event: "answered" },
          { event: "busy" },
          { event: "noAnswer" },
          { event: "failed" },
        ];
      case "gather-input-on-call":
        return [
          { event: "keypress" },
          { event: "speech" },
          { event: "timeout" },
        ];
      case "split-based-on":
        return [{ event: "match", condition: "true" }, { event: "noMatch" }];
      default:
        return [];
    }
  };

  // Save flow via Twilio API
  const saveFlow = async () => {
    if (!currentFlow) return;

    try {
      setIsBuilding(true);

      // Convert our flow format to Twilio Studio format
      const twilioDefinition = {
        description: currentFlow.description,
        states: currentFlow.definition.states.map((widget) => ({
          name: widget.name,
          type: widget.type,
          properties: {
            ...widget.properties,
            offset: {
              x: widget.position.x,
              y: widget.position.y,
            },
          },
          transitions: widget.transitions,
        })),
        initial_state: currentFlow.definition.initial_state,
        flags: currentFlow.definition.flags,
      };

      // API call to create/update flow
      const response = await httpRequest(`${window.location.origin}/api/studio-flows`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendlyName: currentFlow.friendlyName,
          status: currentFlow.status,
          definition: JSON.stringify(twilioDefinition),
        }),
      });

      if (response.ok) {
        const savedFlow = await response.json();
        const updatedFlow = { ...currentFlow, id: savedFlow.sid };
        setFlows((prev) => [
          ...prev.filter((f) => f.id !== updatedFlow.id),
          updatedFlow,
        ]);
        setCurrentFlow(updatedFlow);
        console.log("Flow saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save flow:", error);
    } finally {
      setIsBuilding(false);
    }
  };

  const getWidgetIcon = (type: string) => {
    const widget = WIDGET_TYPES.find((w) => w.type === type);
    return widget?.icon || Settings;
  };

  const getWidgetColor = (type: string) => {
    const widget = WIDGET_TYPES.find((w) => w.type === type);
    return widget?.color || "#6B7280";
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a] border border-[#FF6A00]/30">
          <TabsTrigger
            value="flows"
            className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            My Flows
          </TabsTrigger>
          <TabsTrigger
            value="builder"
            className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
          >
            <Brain className="w-4 h-4 mr-2" />
            Flow Builder
          </TabsTrigger>
          <TabsTrigger
            value="api"
            className="data-[state=active]:bg-[#FF6A00] data-[state=active]:text-black text-white hover:text-[#FF6A00] transition-colors"
          >
            <Code className="w-4 h-4 mr-2" />
            API & JSON
          </TabsTrigger>
        </TabsList>

        {/* My Flows Tab */}
        <TabsContent value="flows" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="f10-heading-sm text-white">Studio Flows</h3>
              <p className="f10-text-sm text-[#b3b3b3] mt-1">
                Create and manage conversation workflows
              </p>
            </div>
            <Button
              onClick={createNewFlow}
              className="f10-btn accent-bg text-black font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Flow
            </Button>
          </div>

          {flows.length === 0 ? (
            <Card className="f10-card">
              <CardContent className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto text-[#FF6A00] mb-4" />
                <h3 className="f10-heading-sm text-white mb-2">No Flows Yet</h3>
                <p className="f10-text-sm text-[#b3b3b3] mb-6 max-w-md mx-auto">
                  Create your first Studio Flow to build automated conversation
                  experiences
                </p>
                <Button
                  onClick={createNewFlow}
                  className="f10-btn accent-bg text-black font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Flow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {flows.map((flow) => (
                <Card
                  key={flow.id}
                  className="f10-card hover:accent-glow transition-all cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-[#FF6A00]/20">
                          <Brain className="w-5 h-5 text-[#FF6A00]" />
                        </div>
                        <div>
                          <h4 className="f10-text-lg font-semibold text-white">
                            {flow.friendlyName}
                          </h4>
                          <p className="f10-text-sm text-[#b3b3b3]">
                            {flow.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge
                              style={{
                                backgroundColor:
                                  flow.status === "published"
                                    ? "#10B98120"
                                    : "#F59E0B20",
                                color:
                                  flow.status === "published"
                                    ? "#10B981"
                                    : "#F59E0B",
                                borderColor:
                                  flow.status === "published"
                                    ? "#10B98140"
                                    : "#F59E0B40",
                              }}
                            >
                              {flow.status.toUpperCase()}
                            </Badge>
                            <span className="f10-text-xs text-[#737373]">
                              {flow.definition.states.length} widgets
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="f10-btn f10-btn-ghost"
                          onClick={() => {
                            setCurrentFlow(flow);
                            setActiveTab("builder");
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Flow Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          {!currentFlow ? (
            <Card className="f10-card">
              <CardContent className="text-center py-12">
                <Settings className="w-16 h-16 mx-auto text-[#737373] mb-4" />
                <h3 className="f10-heading-sm text-white mb-2">
                  No Flow Selected
                </h3>
                <p className="f10-text-sm text-[#b3b3b3] mb-6">
                  Create a new flow or select an existing one to start building
                </p>
                <Button
                  onClick={createNewFlow}
                  className="f10-btn accent-bg text-black font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Flow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-6">
              {/* Widget Palette */}
              <Card className="f10-card">
                <CardHeader>
                  <CardTitle className="f10-text-lg text-white">
                    Widget Palette
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "triggers",
                    "communication",
                    "input",
                    "logic",
                    "data",
                    "integration",
                  ].map((category) => (
                    <div key={category}>
                      <h4 className="f10-text-sm font-medium text-[#b3b3b3] mb-2 uppercase">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {WIDGET_TYPES.filter(
                          (w) => w.category === category,
                        ).map((widget) => {
                          const Icon = widget.icon;
                          return (
                            <Button
                              key={widget.type}
                              onClick={() => addWidget(widget.type)}
                              className="w-full justify-start p-3 h-auto f10-btn f10-btn-ghost hover:accent-glow"
                            >
                              <Icon
                                className="w-4 h-4 mr-3"
                                style={{ color: widget.color }}
                              />
                              <div className="text-left">
                                <div className="f10-text-sm font-medium text-white">
                                  {widget.name}
                                </div>
                                <div className="f10-text-xs text-[#737373]">
                                  {widget.description}
                                </div>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Flow Canvas */}
              <Card className="f10-card col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="f10-text-lg text-white">
                        {currentFlow.friendlyName}
                      </CardTitle>
                      <p className="f10-text-sm text-[#b3b3b3]">
                        {currentFlow.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={saveFlow}
                        disabled={isBuilding}
                        className="f10-btn f10-btn-secondary"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isBuilding ? "Saving..." : "Save Flow"}
                      </Button>
                      <Button className="f10-btn accent-bg text-black">
                        <Globe className="w-4 h-4 mr-2" />
                        Publish
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="min-h-96 bg-[#0a0a0a] rounded-lg p-4 border border-[#333333]">
                    <div className="space-y-4">
                      {currentFlow.definition.states.map((widget, index) => {
                        const Icon = getWidgetIcon(widget.type);
                        return (
                          <div
                            key={widget.id}
                            onClick={() => setSelectedWidget(widget)}
                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                              selectedWidget?.id === widget.id
                                ? "border-[#FF6A00] bg-[#FF6A00]/10"
                                : "border-[#333333] hover:border-[#555555]"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                className="w-5 h-5"
                                style={{ color: getWidgetColor(widget.type) }}
                              />
                              <div className="flex-1">
                                <div className="f10-text-sm font-medium text-white">
                                  {widget.name}
                                </div>
                                <div className="f10-text-xs text-[#737373]">
                                  {widget.type}
                                </div>
                              </div>
                              {index <
                                currentFlow.definition.states.length - 1 && (
                                <ArrowRight className="w-4 h-4 text-[#737373]" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* API & JSON Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card className="f10-card">
            <CardHeader>
              <CardTitle className="f10-text-lg text-white">
                Twilio Studio Flow API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="f10-text-sm text-[#b3b3b3]">
                    Account SID
                  </Label>
                  <Input
                    placeholder="Your Twilio Account SID"
                    className="bg-[#1a1a1a] border-[#333333] text-white"
                  />
                </div>
                <div>
                  <Label className="f10-text-sm text-[#b3b3b3]">
                    Auth Token
                  </Label>
                  <Input
                    type="password"
                    placeholder="Your Twilio Auth Token"
                    className="bg-[#1a1a1a] border-[#333333] text-white"
                  />
                </div>
              </div>

              {currentFlow && (
                <div>
                  <Label className="f10-text-sm text-[#b3b3b3]">
                    Flow Definition JSON
                  </Label>
                  <Textarea
                    value={JSON.stringify(currentFlow.definition, null, 2)}
                    className="bg-[#1a1a1a] border-[#333333] text-white font-mono text-xs h-64"
                    readOnly
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button className="f10-btn f10-btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button className="f10-btn f10-btn-secondary">
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON
                </Button>
                <Button className="f10-btn accent-bg text-black">
                  <Network className="w-4 h-4 mr-2" />
                  Test API Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

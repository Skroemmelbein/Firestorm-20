import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Mail,
  MessageSquare,
  Clock,
  Users,
  Target,
  Filter,
  BarChart3,
  Settings,
  Save,
  Share2,
  Copy,
  Trash2,
  Plus,
  ArrowDown,
  ArrowRight,
  Zap,
  Send,
  Calendar,
  Eye,
  CheckCircle,
  AlertCircle,
  Timer,
  Repeat,
  Split,
  Merge,
} from "lucide-react";

interface CampaignNode {
  id: string;
  type: "trigger" | "action" | "condition" | "delay" | "split" | "merge";
  title: string;
  description: string;
  config: any;
  position: { x: number; y: number };
  connections: string[];
}

interface Campaign {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  nodes: CampaignNode[];
  stats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
  createdAt: string;
  lastModified: string;
}

const NODE_TYPES = {
  trigger: {
    icon: Play,
    color: "#10B981",
    bgColor: "#10B98110",
    options: [
      "Form Submission",
      "Email Signup",
      "Purchase",
      "Page Visit",
      "Custom Event",
    ],
  },
  action: {
    icon: Send,
    color: "#FF6A00",
    bgColor: "#FF6A0010",
    options: [
      "Send Email",
      "Send SMS",
      "Add to List",
      "Update Contact",
      "Send Webhook",
    ],
  },
  condition: {
    icon: Split,
    color: "#8B5CF6",
    bgColor: "#8B5CF610",
    options: [
      "Contact Property",
      "Engagement Score",
      "Purchase History",
      "Location",
      "Device Type",
    ],
  },
  delay: {
    icon: Timer,
    color: "#F59E0B",
    bgColor: "#F59E0B10",
    options: [
      "Wait Duration (5min, 1hr, 1day)",
      "Wait Until Date",
      "Wait for Event",
      "Business Hours Only",
      "Rate Limit Control"
    ],
  },
  split: {
    icon: Target,
    color: "#EF4444",
    bgColor: "#EF444410",
    options: ["A/B Test", "Random Split", "Weighted Split", "Audience Split"],
  },
  merge: {
    icon: Merge,
    color: "#06B6D4",
    bgColor: "#06B6D410",
    options: ["Join Paths", "Continue All", "Wait for All", "Priority Merge"],
  },
};

export default function CampaignBuilder() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Welcome Series",
      status: "active",
      nodes: [],
      stats: {
        sent: 1250,
        delivered: 1200,
        opened: 720,
        clicked: 180,
        converted: 45,
      },
      createdAt: "2024-01-15",
      lastModified: "2024-01-20",
    },
    {
      id: "2",
      name: "Abandoned Cart Recovery",
      status: "active",
      nodes: [],
      stats: {
        sent: 850,
        delivered: 820,
        opened: 410,
        clicked: 82,
        converted: 28,
      },
      createdAt: "2024-01-10",
      lastModified: "2024-01-18",
    },
  ]);

  const [selectedNode, setSelectedNode] = useState<CampaignNode | null>(null);
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const [newCampaignForm, setNewCampaignForm] = useState({
    name: "",
    description: "",
    trigger: "",
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  const createNewCampaign = () => {
    if (!newCampaignForm.name) return;

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaignForm.name,
      status: "draft",
      nodes: [
        {
          id: "trigger-1",
          type: "trigger",
          title: newCampaignForm.trigger || "Form Submission",
          description: "Campaign starting point",
          config: {},
          position: { x: 100, y: 100 },
          connections: [],
        },
      ],
      stats: { sent: 0, delivered: 0, opened: 0, clicked: 0, converted: 0 },
      createdAt: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
    };

    setCampaigns((prev) => [...prev, newCampaign]);
    setSelectedCampaign(newCampaign);
    setIsBuilderMode(true);
    setNewCampaignForm({ name: "", description: "", trigger: "" });
  };

  const handleNodeDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!draggedNodeType || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newNode: CampaignNode = {
        id: `${draggedNodeType}-${Date.now()}`,
        type: draggedNodeType as any,
        title:
          NODE_TYPES[draggedNodeType as keyof typeof NODE_TYPES].options[0],
        description: `${draggedNodeType.charAt(0).toUpperCase() + draggedNodeType.slice(1)} node`,
        config: {},
        position: { x, y },
        connections: [],
      };

      if (selectedCampaign) {
        const updatedCampaign = {
          ...selectedCampaign,
          nodes: [...selectedCampaign.nodes, newNode],
          lastModified: new Date().toISOString().split("T")[0],
        };
        setSelectedCampaign(updatedCampaign);
        setCampaigns((prev) =>
          prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c)),
        );
      }

      setDraggedNodeType(null);
    },
    [draggedNodeType, selectedCampaign],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "paused":
        return "#F59E0B";
      case "completed":
        return "#6B7280";
      case "draft":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return Play;
      case "paused":
        return Pause;
      case "completed":
        return CheckCircle;
      case "draft":
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const renderCampaignsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Campaign Builder</h3>
        <Button
          onClick={() => setIsBuilderMode(true)}
          className="f10-btn accent-bg text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {campaigns.map((campaign) => {
          const StatusIcon = getStatusIcon(campaign.status);
          const conversionRate =
            campaign.stats.sent > 0
              ? (
                  (campaign.stats.converted / campaign.stats.sent) *
                  100
                ).toFixed(1)
              : "0.0";

          return (
            <Card
              key={campaign.id}
              className="f10-card hover:border-[#FF6A00]/50 transition-all cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{campaign.name}</CardTitle>
                  <Badge
                    style={{
                      backgroundColor: `${getStatusColor(campaign.status)}20`,
                      color: getStatusColor(campaign.status),
                      borderColor: `${getStatusColor(campaign.status)}40`,
                    }}
                    className="uppercase text-xs"
                  >
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#FF6A00]">
                      {campaign.stats.sent.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#737373]">SENT</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#10B981]">
                      {campaign.stats.opened.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#737373]">OPENED</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#FFD700]">
                      {conversionRate}%
                    </div>
                    <div className="text-xs text-[#737373]">CVR</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setIsBuilderMode(true);
                    }}
                    className="flex-1 f10-btn"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="f10-btn">
                    <Eye className="w-3 h-3 mr-1" />
                    Analytics
                  </Button>
                  <Button size="sm" variant="outline" className="f10-btn">
                    <Copy className="w-3 h-3 mr-1" />
                    Clone
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderNodePalette = () => (
    <div className="w-64 bg-[#1a1a1a] border-r border-[#333333] p-4 space-y-4">
      <h4 className="font-semibold text-white mb-3">Campaign Elements</h4>

      {Object.entries(NODE_TYPES).map(([type, config]) => {
        const Icon = config.icon;
        return (
          <div
            key={type}
            draggable
            onDragStart={() => setDraggedNodeType(type)}
            className="p-3 bg-[#0a0a0a] border border-[#333333] rounded cursor-grab hover:border-[#FF6A00]/50 transition-all"
            style={{ backgroundColor: config.bgColor }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color: config.color }} />
              <span className="font-medium text-white capitalize">{type}</span>
            </div>
            <div className="text-xs text-[#b3b3b3]">
              {config.options.slice(0, 2).join(", ")}
              {config.options.length > 2 && "..."}
            </div>
          </div>
        );
      })}

      <div className="pt-4 border-t border-[#333333]">
        <h5 className="font-medium text-white mb-2">Quick Actions</h5>
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full f10-btn text-xs"
          >
            <Save className="w-3 h-3 mr-1" />
            Save Campaign
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full f10-btn text-xs"
          >
            <Play className="w-3 h-3 mr-1" />
            Test Campaign
          </Button>
        </div>
      </div>
    </div>
  );

  const renderCanvas = () => (
    <div
      ref={canvasRef}
      className="flex-1 bg-[#0a0a0a] relative overflow-auto"
      onDrop={handleNodeDrop}
      onDragOver={(e) => e.preventDefault()}
      style={{
        backgroundImage:
          "radial-gradient(circle, #333333 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {selectedCampaign?.nodes.map((node) => {
        const nodeConfig = NODE_TYPES[node.type as keyof typeof NODE_TYPES];
        const Icon = nodeConfig.icon;

        return (
          <div
            key={node.id}
            className="absolute p-3 bg-[#1a1a1a] border-2 border-[#333333] rounded-lg cursor-pointer hover:border-[#FF6A00] transition-all"
            style={{
              left: node.position.x,
              top: node.position.y,
              minWidth: "160px",
              backgroundColor: nodeConfig.bgColor,
            }}
            onClick={() => setSelectedNode(node)}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="w-4 h-4" style={{ color: nodeConfig.color }} />
              <span className="font-medium text-white text-sm">
                {node.title}
              </span>
            </div>
            <div className="text-xs text-[#b3b3b3]">{node.description}</div>

            {/* Connection points */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#FF6A00] rounded-full border-2 border-[#1a1a1a]"></div>
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[#00E676] rounded-full border-2 border-[#1a1a1a]"></div>
          </div>
        );
      })}

      {/* Empty canvas message */}
      {selectedCampaign && selectedCampaign.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-[#737373]">
            <Zap className="w-12 h-12 mx-auto mb-4 text-[#FF6A00]" />
            <h3 className="text-lg font-semibold mb-2">
              Start Building Your Campaign
            </h3>
            <p className="text-sm">
              Drag elements from the palette to create your automation flow
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderNewCampaignForm = () => (
    <div className="max-w-md mx-auto space-y-4">
      <h3 className="text-xl font-bold text-white text-center">
        Create New Campaign
      </h3>

      <div className="space-y-4">
        <div>
          <Label className="text-[#b3b3b3]">Campaign Name</Label>
          <Input
            value={newCampaignForm.name}
            onChange={(e) =>
              setNewCampaignForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter campaign name..."
            className="bg-[#0a0a0a] border-[#333333] text-white"
          />
        </div>

        <div>
          <Label className="text-[#b3b3b3]">Description</Label>
          <Textarea
            value={newCampaignForm.description}
            onChange={(e) =>
              setNewCampaignForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Describe your campaign..."
            className="bg-[#0a0a0a] border-[#333333] text-white"
            rows={3}
          />
        </div>

        <div>
          <Label className="text-[#b3b3b3]">Starting Trigger</Label>
          <Select
            value={newCampaignForm.trigger}
            onValueChange={(value) =>
              setNewCampaignForm((prev) => ({ ...prev, trigger: value }))
            }
          >
            <SelectTrigger className="bg-[#0a0a0a] border-[#333333] text-white">
              <SelectValue placeholder="Select trigger..." />
            </SelectTrigger>
            <SelectContent>
              {NODE_TYPES.trigger.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={createNewCampaign}
            disabled={!newCampaignForm.name}
            className="flex-1 f10-btn accent-bg text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsBuilderMode(false)}
            className="f10-btn"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  if (isBuilderMode && selectedCampaign) {
    return (
      <div className="h-[calc(100vh-200px)] flex">
        {renderNodePalette()}
        {renderCanvas()}

        {/* Properties Panel */}
        {selectedNode && (
          <div className="w-80 bg-[#1a1a1a] border-l border-[#333333] p-4">
            <h4 className="font-semibold text-white mb-3">Node Properties</h4>
            <div className="space-y-3">
              <div>
                <Label className="text-[#b3b3b3]">Title</Label>
                <Input
                  value={selectedNode.title}
                  className="bg-[#0a0a0a] border-[#333333] text-white"
                />
              </div>
              <div>
                <Label className="text-[#b3b3b3]">Description</Label>
                <Textarea
                  value={selectedNode.description}
                  className="bg-[#0a0a0a] border-[#333333] text-white"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isBuilderMode && !selectedCampaign) {
    return <div className="p-8">{renderNewCampaignForm()}</div>;
  }

  return <div className="p-6">{renderCampaignsList()}</div>;
}

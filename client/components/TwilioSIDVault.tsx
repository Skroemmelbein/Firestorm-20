import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Database,
  Key,
  Plus,
  Trash2,
  Edit,
  Copy,
  Check,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  Search,
  Settings,
  Phone,
  MessageSquare,
  Brain,
  Network,
  Users,
} from "lucide-react";

interface TwilioSID {
  id: string;
  name: string;
  sid: string;
  type:
    | "phone"
    | "service"
    | "flow"
    | "agent"
    | "conversation"
    | "workspace"
    | "activity"
    | "other";
  description?: string;
  dateAdded: string;
  lastUsed?: string;
  status: "active" | "inactive" | "unknown";
}

const SID_TYPES = [
  { value: "phone", label: "Phone Number", icon: Phone, color: "bg-blue-500" },
  {
    value: "service",
    label: "Messaging Service",
    icon: MessageSquare,
    color: "bg-green-500",
  },
  { value: "flow", label: "Studio Flow", icon: Brain, color: "bg-purple-500" },
  { value: "agent", label: "RCS Agent", icon: Network, color: "bg-orange-500" },
  {
    value: "conversation",
    label: "Conversation",
    icon: Users,
    color: "bg-pink-500",
  },
  {
    value: "workspace",
    label: "TaskRouter Workspace",
    icon: Settings,
    color: "bg-indigo-500",
  },
  {
    value: "activity",
    label: "TaskRouter Activity",
    icon: Settings,
    color: "bg-cyan-500",
  },
  { value: "other", label: "Other", icon: Database, color: "bg-gray-500" },
];

export default function TwilioSIDVault() {
  const [sids, setSids] = useState<TwilioSID[]>([]);
  const [newSid, setNewSid] = useState<Partial<TwilioSID>>({
    name: "",
    sid: "",
    type: "phone",
    description: "",
  });
  const [editingSid, setEditingSid] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [copiedSid, setCopiedSid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSIDs();
  }, []);

  const loadSIDs = () => {
    try {
      const saved = localStorage.getItem("twilio-sids");
      if (saved) {
        setSids(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load SIDs:", error);
    }
  };

  const saveSIDs = (newSids: TwilioSID[]) => {
    try {
      localStorage.setItem("twilio-sids", JSON.stringify(newSids));
      setSids(newSids);
    } catch (error) {
      console.error("Failed to save SIDs:", error);
    }
  };

  const addSID = () => {
    if (!newSid.name || !newSid.sid) return;

    const sid: TwilioSID = {
      id: Date.now().toString(),
      name: newSid.name,
      sid: newSid.sid,
      type: newSid.type as TwilioSID["type"],
      description: newSid.description,
      dateAdded: new Date().toISOString(),
      status: "unknown",
    };

    const updatedSids = [...sids, sid];
    saveSIDs(updatedSids);

    setNewSid({
      name: "",
      sid: "",
      type: "phone",
      description: "",
    });
  };

  const deleteSID = (id: string) => {
    const updatedSids = sids.filter((sid) => sid.id !== id);
    saveSIDs(updatedSids);
  };

  const copySID = async (sid: string) => {
    try {
      await navigator.clipboard.writeText(sid);
      setCopiedSid(sid);
      setTimeout(() => setCopiedSid(null), 2000);
    } catch (error) {
      console.error("Failed to copy SID:", error);
    }
  };

  const exportSIDs = () => {
    const dataStr = JSON.stringify(sids, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "twilio-sids-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSIDs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          saveSIDs(imported);
        }
      } catch (error) {
        console.error("Failed to import SIDs:", error);
      }
    };
    reader.readAsText(file);
  };

  const discoverSIDs = async () => {
    setIsLoading(true);
    try {
      // This would call your Twilio API to discover SIDs
      const response = await fetch("/api/twilio/discover-sids", {
        method: "POST",
      });

      if (response.ok) {
        const discovered = await response.json();
        // Merge discovered SIDs with existing ones
        const existingSids = sids.map((s) => s.sid);
        const newSids = discovered.filter(
          (d: any) => !existingSids.includes(d.sid),
        );

        if (newSids.length > 0) {
          const updatedSids = [...sids, ...newSids];
          saveSIDs(updatedSids);
        }
      }
    } catch (error) {
      console.error("Failed to discover SIDs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSids = sids.filter((sid) => {
    const matchesSearch =
      sid.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sid.sid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sid.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || sid.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeInfo = (type: string) => {
    return (
      SID_TYPES.find((t) => t.value === type) || SID_TYPES[SID_TYPES.length - 1]
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Twilio SID Vault
          </h1>
          <p className="text-gray-600">
            Manage and organize your Twilio Service Identifiers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {sids.length} SIDs stored
          </Badge>
          <Button
            onClick={discoverSIDs}
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Auto-Discover
          </Button>
        </div>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage SIDs</TabsTrigger>
          <TabsTrigger value="add">Add New SID</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        {/* Manage SIDs Tab */}
        <TabsContent value="manage" className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search SIDs by name, SID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Types</option>
              {SID_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSids.map((sid) => {
              const typeInfo = getTypeInfo(sid.type);
              const Icon = typeInfo.icon;

              return (
                <Card
                  key={sid.id}
                  className="border-2 border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {sid.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {typeInfo.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => copySID(sid.sid)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          {copiedSid === sid.sid ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteSID(sid.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded border">
                        {sid.sid}
                      </div>
                      {sid.description && (
                        <p className="text-sm text-gray-600">
                          {sid.description}
                        </p>
                      )}
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          Added: {new Date(sid.dateAdded).toLocaleDateString()}
                        </span>
                        <Badge
                          variant={
                            sid.status === "active" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {sid.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredSids.length === 0 && (
            <div className="text-center py-12">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No SIDs found
              </h3>
              <p className="text-gray-500">
                {searchTerm || selectedType !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Add your first Twilio SID to get started"}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Add New SID Tab */}
        <TabsContent value="add" className="space-y-6">
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Add New Twilio SID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-medium">Name</Label>
                  <Input
                    value={newSid.name || ""}
                    onChange={(e) =>
                      setNewSid((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Main Phone Number"
                    className="bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Type</Label>
                  <select
                    value={newSid.type}
                    onChange={(e) =>
                      setNewSid((prev) => ({
                        ...prev,
                        type: e.target.value as TwilioSID["type"],
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {SID_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-gray-700 font-medium">SID</Label>
                <Input
                  value={newSid.sid || ""}
                  onChange={(e) =>
                    setNewSid((prev) => ({ ...prev, sid: e.target.value }))
                  }
                  placeholder="e.g., PN1234567890abcdef1234567890abcdef"
                  className="bg-white border-gray-300 font-mono"
                />
              </div>

              <div>
                <Label className="text-gray-700 font-medium">
                  Description (Optional)
                </Label>
                <Input
                  value={newSid.description || ""}
                  onChange={(e) =>
                    setNewSid((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Additional notes about this SID..."
                  className="bg-white border-gray-300"
                />
              </div>

              <Button
                onClick={addSID}
                disabled={!newSid.name || !newSid.sid}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add SID to Vault
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">
                    Finding Your Twilio SIDs
                  </h4>
                  <p className="text-sm text-orange-700 mt-1">
                    You can find your SIDs in the Twilio Console under each
                    service section:
                  </p>
                  <ul className="text-sm text-orange-700 mt-2 space-y-1">
                    <li>• Phone Numbers: Console → Phone Numbers → Manage</li>
                    <li>
                      • Messaging Services: Console → Messaging → Services
                    </li>
                    <li>• Studio Flows: Console → Studio → Flows</li>
                    <li>
                      • RCS Agents: Console → Messaging → Rich Communication
                      Services
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  Export SIDs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Export all your stored SIDs to a JSON file for backup or
                  sharing.
                </p>
                <Button
                  onClick={exportSIDs}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={sids.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to JSON
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-purple-600" />
                  Import SIDs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Import SIDs from a previously exported JSON file.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={importSIDs}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  onClick={() =>
                    document.getElementById("import-file")?.click()
                  }
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import from JSON
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

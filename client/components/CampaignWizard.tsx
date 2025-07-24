import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MessageSquare,
  Image,
  MessageCircle,
  Mail,
  Phone,
  ArrowRight,
  ArrowLeft,
  Users,
  Clock,
  Zap,
  CheckCircle,
  Calendar,
  Target,
  TrendingUp,
  Settings,
} from "lucide-react";

interface CampaignConfig {
  tools: string[];
  campaignType: string;
  audience: string;
  throughputRate: number;
  startTime: string;
  endTime: string;
  message: string;
  fromNumber: string;
  estimatedReach: number;
  estimatedCost: number;
}

export default function CampaignWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [config, setConfig] = useState<CampaignConfig>({
    tools: [],
    campaignType: "",
    audience: "",
    throughputRate: 10,
    startTime: "",
    endTime: "",
    message: "",
    fromNumber: "+18559600037",
    estimatedReach: 0,
    estimatedCost: 0,
  });

  const steps = [
    { id: 1, title: "Choose Tools", desc: "Select communication channels" },
    { id: 2, title: "Campaign Type", desc: "Define your campaign purpose" },
    { id: 3, title: "Audience", desc: "Select target audience" },
    { id: 4, title: "Throughput", desc: "Set sending rate and numbers" },
    { id: 5, title: "Timing", desc: "Schedule your campaign" },
    { id: 6, title: "Review", desc: "Confirm and launch" },
  ];

  const tools = [
    {
      id: "sms",
      name: "SMS",
      icon: MessageSquare,
      desc: "Text messaging",
      active: true,
    },
    {
      id: "mms",
      name: "MMS",
      icon: Image,
      desc: "Multimedia messaging",
      active: true,
    },
    {
      id: "rcs",
      name: "RCS",
      icon: MessageCircle,
      desc: "Rich messaging",
      active: false,
    },
    {
      id: "email",
      name: "SendGrid Email",
      icon: Mail,
      desc: "Email campaigns",
      active: true,
    },
    {
      id: "vmail",
      name: "Voicemail Drop",
      icon: Phone,
      desc: "Voice messages",
      active: false,
    },
  ];

  const campaignTypes = [
    {
      id: "current",
      name: "Current Clients",
      desc: "Active customers",
      count: 1247,
    },
    {
      id: "cancelled",
      name: "Cancelled Clients",
      desc: "Former customers",
      count: 892,
    },
    {
      id: "billing",
      name: "Billing Reminders",
      desc: "Payment notifications",
      count: 156,
    },
    {
      id: "new_list",
      name: "New Lead List",
      desc: "Fresh prospects",
      count: 0,
    },
    {
      id: "ppc",
      name: "PPC Leads",
      desc: "Paid advertising leads",
      count: 523,
    },
    {
      id: "referral",
      name: "Referral Program",
      desc: "Referred prospects",
      count: 78,
    },
    {
      id: "reactivation",
      name: "Re-activation",
      desc: "Win-back campaign",
      count: 445,
    },
    {
      id: "upsell",
      name: "Upsell Campaign",
      desc: "Upgrade offers",
      count: 234,
    },
  ];

  const audiences = [
    { id: "all", name: "All Selected", desc: "Everyone in campaign type" },
    { id: "high_value", name: "High Value", desc: "Top 20% by revenue" },
    { id: "recent", name: "Recent Activity", desc: "Active in last 30 days" },
    { id: "geographic", name: "Geographic", desc: "Specific locations" },
    { id: "behavioral", name: "Behavioral", desc: "Based on actions" },
    { id: "custom", name: "Custom Filter", desc: "Advanced criteria" },
  ];

  const phoneNumbers = [
    { number: "+18559600037", name: "Primary Marketing", active: true },
    { number: "+18557212778", name: "Support Line", active: true },
  ];

  // Calculate estimates based on selections
  const calculateEstimates = () => {
    const selectedCampaign = campaignTypes.find(
      (c) => c.id === config.campaignType,
    );
    let reach = selectedCampaign?.count || 0;

    // Adjust for audience filtering
    if (config.audience === "high_value") reach = Math.floor(reach * 0.2);
    if (config.audience === "recent") reach = Math.floor(reach * 0.6);

    const costPerMessage = 0.0075; // SMS cost
    const cost = reach * config.tools.length * costPerMessage;

    setConfig((prev) => ({
      ...prev,
      estimatedReach: reach,
      estimatedCost: cost,
    }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      calculateEstimates();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const toggleTool = (toolId: string) => {
    setConfig((prev) => ({
      ...prev,
      tools: prev.tools.includes(toolId)
        ? prev.tools.filter((t) => t !== toolId)
        : [...prev.tools, toolId],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="glass-card corp-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Campaign Setup Wizard
          </CardTitle>
          <CardDescription>
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].desc}
          </CardDescription>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div
                  className={`h-2 rounded-full ${
                    index + 1 <= currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
                <div className="text-xs mt-1 text-center">{step.title}</div>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <Card className="glass-card corp-shadow min-h-96">
        <CardContent className="p-6">
          {/* Step 1: Choose Tools */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">
                  Choose Communication Tools
                </h2>
                <p className="text-muted-foreground">
                  Select the channels for your campaign
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isSelected = config.tools.includes(tool.id);

                  return (
                    <div
                      key={tool.id}
                      onClick={() => tool.active && toggleTool(tool.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        !tool.active
                          ? "opacity-50 cursor-not-allowed border-gray-200"
                          : isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-8 h-8 ${isSelected ? "text-blue-600" : "text-gray-600"}`}
                        />
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {tool.name}
                            {!tool.active && (
                              <Badge variant="secondary">Coming Soon</Badge>
                            )}
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tool.desc}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {config.tools.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Selected {config.tools.length} tool
                    {config.tools.length > 1 ? "s" : ""}:{" "}
                    {config.tools
                      .map((t) => tools.find((tool) => tool.id === t)?.name)
                      .join(", ")}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Step 2: Campaign Type */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Campaign Type</h2>
                <p className="text-muted-foreground">Who are you targeting?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaignTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, campaignType: type.id }))
                    }
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      config.campaignType === type.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{type.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {type.desc}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {type.count.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          contacts
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Audience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Target Audience</h2>
                <p className="text-muted-foreground">
                  Refine your audience selection
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {audiences.map((audience) => (
                  <div
                    key={audience.id}
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, audience: audience.id }))
                    }
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      config.audience === audience.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="font-semibold">{audience.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {audience.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Throughput */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Throughput & Numbers</h2>
                <p className="text-muted-foreground">
                  Configure sending rate and phone numbers
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Throughput Rate */}
                <div className="space-y-4">
                  <Label>Messages per minute: {config.throughputRate}</Label>
                  <Slider
                    value={[config.throughputRate]}
                    onValueChange={(value) =>
                      setConfig((prev) => ({
                        ...prev,
                        throughputRate: value[0],
                      }))
                    }
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-muted-foreground">
                    Higher rates may trigger carrier filtering. Recommended:
                    10-20/min
                  </div>
                </div>

                {/* Phone Number Selection */}
                <div className="space-y-4">
                  <Label>From Number</Label>
                  <Select
                    value={config.fromNumber}
                    onValueChange={(value) =>
                      setConfig((prev) => ({ ...prev, fromNumber: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {phoneNumbers.map((phone) => (
                        <SelectItem key={phone.number} value={phone.number}>
                          {phone.number} - {phone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message Content */}
              <div className="space-y-4">
                <Label>Message Content</Label>
                <Textarea
                  value={config.message}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Enter your campaign message..."
                  rows={4}
                  maxLength={160}
                />
                <div className="text-sm text-muted-foreground">
                  {config.message.length}/160 characters
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Timing */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Campaign Timing</h2>
                <p className="text-muted-foreground">
                  Schedule your campaign execution
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={config.startTime}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Time (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={config.endTime}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Campaign Review</h2>
                <p className="text-muted-foreground">
                  Confirm your campaign settings
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campaign Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Campaign Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Tools:</span>
                      <span>{config.tools.length} selected</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span>
                        {
                          campaignTypes.find(
                            (c) => c.id === config.campaignType,
                          )?.name
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Audience:</span>
                      <span>
                        {audiences.find((a) => a.id === config.audience)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate:</span>
                      <span>{config.throughputRate}/min</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Estimate */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Cost Estimate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Estimated Reach:</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {config.estimatedReach.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Cost:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${config.estimatedCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Based on SMS rates. Email costs minimal.
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Message Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Message Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      From: {config.fromNumber}
                    </div>
                    <div>{config.message || "No message content"}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep === 6 ? (
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-green-600">
              <Zap className="w-4 h-4" />
              Launch Campaign
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && config.tools.length === 0) ||
                (currentStep === 2 && !config.campaignType) ||
                (currentStep === 3 && !config.audience) ||
                (currentStep === 4 && !config.message.trim())
              }
              className="gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

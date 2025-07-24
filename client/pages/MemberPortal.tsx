import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Brain,
  Users,
  Crown,
  Shield,
  Star,
  Activity,
  Clock,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Command,
  Zap,
  Target,
  Award,
  CheckCircle,
  AlertTriangle,
  UserPlus,
  UserMinus,
} from "lucide-react";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tier: "basic" | "premium" | "elite" | "executive";
  status: "active" | "inactive" | "pending" | "suspended";
  joinDate: Date;
  lastActive: Date;
  totalSpend: number;
  engagement: number;
  avatar?: string;
  location: string;
  permissions: string[];
}

interface MemberMetrics {
  totalMembers: number;
  activeMembers: number;
  newThisMonth: number;
  avgEngagement: number;
  retentionRate: number;
  premiumMembers: number;
}

export default function MemberPortal() {
  const [selectedTab, setSelectedTab] = useState("command");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState("all");
  
  const [members] = useState<Member[]>([
    {
      id: "M001",
      firstName: "Marcus",
      lastName: "Chen",
      email: "marcus.chen@example.com", 
      phone: "+1 (555) 123-4567",
      tier: "executive",
      status: "active",
      joinDate: new Date("2023-01-15"),
      lastActive: new Date("2024-01-15"),
      totalSpend: 125000,
      engagement: 94.8,
      location: "San Francisco, CA",
      permissions: ["full_access", "admin", "billing"]
    },
    {
      id: "M002", 
      firstName: "Sarah",
      lastName: "Rodriguez",
      email: "sarah.rodriguez@example.com",
      phone: "+1 (555) 987-6543", 
      tier: "premium",
      status: "active",
      joinDate: new Date("2023-02-20"),
      lastActive: new Date("2024-01-14"),
      totalSpend: 47500,
      engagement: 87.3,
      location: "Austin, TX",
      permissions: ["member_access", "reports"]
    },
    {
      id: "M003",
      firstName: "David",
      lastName: "Thompson", 
      email: "david.thompson@example.com",
      phone: "+1 (555) 456-7890",
      tier: "elite",
      status: "active", 
      joinDate: new Date("2023-03-10"),
      lastActive: new Date("2024-01-15"),
      totalSpend: 89200,
      engagement: 91.7,
      location: "New York, NY",
      permissions: ["member_access", "advanced_features"]
    }
  ]);

  const metrics: MemberMetrics = {
    totalMembers: 2847,
    activeMembers: 2691,
    newThisMonth: 147,
    avgEngagement: 89.4,
    retentionRate: 94.6,
    premiumMembers: 1829
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "executive":
        return "#FFD700";
      case "elite":
        return "#8A2BE2";
      case "premium":
        return "#00CED1";
      case "basic":
        return "#32CD32";
      default:
        return "#6B7280";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10B981";
      case "inactive":
        return "#6B7280";
      case "pending":
        return "#F59E0B";
      case "suspended":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "executive":
        return Crown;
      case "elite":
        return Star;
      case "premium":
        return Shield;
      case "basic":
        return Users;
      default:
        return Users;
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTier = filterTier === "all" || member.tier === filterTier;
    
    return matchesSearch && matchesTier;
  });

  return (
    <div className="min-h-screen bg-[#111111] dream-portal-theme">
      {/* DREAM PORTAL Command Header */}
      <div className="f10-command-header" style={{ background: "linear-gradient(135deg, #1a0f1a 0%, #2d1b2d 100%)" }}>
        <div className="f10-command-title">
          <Brain className="w-8 h-8 text-[#8A2BE2]" />
          <div>
            <h1 className="f10-heading-lg text-white">DREAM PORTAL COMMAND</h1>
            <p className="f10-command-subtitle">Member Management & Access Control</p>
          </div>
        </div>
        <div className="f10-command-status">
          <div className="f10-env-status">
            <div className="f10-status-dot"></div>
            <span>{metrics.activeMembers} Members Online</span>
          </div>
          <div className="f10-env-status">
            <Activity className="w-4 h-4" />
            <span>Portal Status: Operational</span>
          </div>
        </div>
      </div>

      <div className="f10-ops-zone">
        {/* Command Metrics */}
        <div className="f10-grid-4 mb-8">
          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Total Members</span>
              <Users className="w-4 h-4 text-[#8A2BE2]" />
            </div>
            <div className="f10-metric-value text-[#8A2BE2]">
              {metrics.totalMembers.toLocaleString()}
            </div>
            <div className="f10-metric-trend positive">
              <TrendingUp className="w-3 h-3" />
              <span>+{metrics.newThisMonth} this month</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Active Members</span>
              <Activity className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">
              {metrics.activeMembers.toLocaleString()}
            </div>
            <div className="f10-metric-trend positive">
              <span>{((metrics.activeMembers/metrics.totalMembers)*100).toFixed(1)}% active</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Engagement Rate</span>
              <Target className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">
              {metrics.avgEngagement}%
            </div>
            <div className="f10-metric-trend positive">
              <span>Above target</span>
            </div>
          </div>

          <div className="f10-metric-card">
            <div className="f10-metric-header">
              <span className="f10-metric-title">Retention Rate</span>
              <Award className="w-4 h-4 text-[#737373]" />
            </div>
            <div className="f10-metric-value">
              {metrics.retentionRate}%
            </div>
            <div className="f10-metric-trend positive">
              <span>Excellent retention</span>
            </div>
          </div>
        </div>

        {/* Command Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-[#1a1a1a] border border-[#8A2BE2]/30">
            <TabsTrigger
              value="command"
              className="data-[state=active]:bg-[#8A2BE2] data-[state=active]:text-white text-white hover:text-[#8A2BE2] transition-colors"
            >
              <Command className="w-4 h-4 mr-2" />
              Member Command
            </TabsTrigger>
            <TabsTrigger
              value="access"
              className="data-[state=active]:bg-[#8A2BE2] data-[state=active]:text-white text-white hover:text-[#8A2BE2] transition-colors"
            >
              <Shield className="w-4 h-4 mr-2" />
              Access Control
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#8A2BE2] data-[state=active]:text-white text-white hover:text-[#8A2BE2] transition-colors"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Member Analytics
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#8A2BE2] data-[state=active]:text-white text-white hover:text-[#8A2BE2] transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Portal Settings
            </TabsTrigger>
          </TabsList>

          {/* Member Command Tab */}
          <TabsContent value="command" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="f10-heading-md text-white">Member Command Center</h2>
                <p className="f10-text-sm text-[#b3b3b3] mt-1">Manage member access, permissions, and engagement</p>
              </div>
              <div className="flex gap-3">
                <Button className="f10-btn f10-btn-secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button className="f10-btn accent-bg text-white font-medium">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-[#737373]" />
                <Input
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1a1a1a] border-[#333333] text-white"
                />
              </div>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="px-4 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white"
              >
                <option value="all">All Tiers</option>
                <option value="executive">Executive</option>
                <option value="elite">Elite</option>
                <option value="premium">Premium</option>
                <option value="basic">Basic</option>
              </select>
            </div>

            {/* Member List */}
            <div className="space-y-4">
              {filteredMembers.map((member) => {
                const TierIcon = getTierIcon(member.tier);
                return (
                  <div key={member.id} className="f10-card hover:accent-glow transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-[#8A2BE2]/20 text-[#8A2BE2]">
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="f10-text-lg font-semibold text-white">
                            {member.firstName} {member.lastName}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <div
                              className="f10-status"
                              style={{
                                backgroundColor: `${getTierColor(member.tier)}20`,
                                color: getTierColor(member.tier),
                                borderColor: `${getTierColor(member.tier)}40`
                              }}
                            >
                              <TierIcon className="w-3 h-3 mr-1" />
                              {member.tier.toUpperCase()}
                            </div>
                            <div
                              className="f10-status"
                              style={{
                                backgroundColor: `${getStatusColor(member.status)}20`,
                                color: getStatusColor(member.status),
                                borderColor: `${getStatusColor(member.status)}40`
                              }}
                            >
                              {member.status.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" className="f10-btn f10-btn-ghost">
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-6">
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#00E676]">
                          ${member.totalSpend.toLocaleString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">TOTAL SPEND</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#8A2BE2]">
                          {member.engagement}%
                        </div>
                        <div className="f10-text-xs text-[#737373]">ENGAGEMENT</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-white">
                          {member.joinDate.toLocaleDateString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">JOINED</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#00BFFF]">
                          {member.lastActive.toLocaleDateString()}
                        </div>
                        <div className="f10-text-xs text-[#737373]">LAST ACTIVE</div>
                      </div>
                      <div className="text-center">
                        <div className="f10-text-sm font-semibold text-[#737373]">
                          {member.location}
                        </div>
                        <div className="f10-text-xs text-[#737373]">LOCATION</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access" className="space-y-6">
            <div className="text-center py-12">
              <Shield className="w-16 h-16 mx-auto text-[#8A2BE2] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">Access Control System</h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                Advanced permission management and security controls for member access
              </p>
              <Button className="f10-btn accent-bg text-white font-medium mt-6">
                <Settings className="w-4 h-4 mr-2" />
                Configure Access
              </Button>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 mx-auto text-[#8A2BE2] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">Member Analytics Engine</h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                Advanced analytics for member behavior, engagement, and retention insights
              </p>
              <Button className="f10-btn accent-bg text-white font-medium mt-6">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="text-center py-12">
              <Settings className="w-16 h-16 mx-auto text-[#8A2BE2] mb-4" />
              <h3 className="f10-heading-sm text-white mb-2">Portal Configuration</h3>
              <p className="f10-text-sm text-[#b3b3b3] max-w-md mx-auto">
                Configure portal settings, member tiers, and system preferences
              </p>
              <Button className="f10-btn accent-bg text-white font-medium mt-6">
                <Settings className="w-4 h-4 mr-2" />
                Portal Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

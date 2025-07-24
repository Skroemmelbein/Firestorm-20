import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Shield,
  Flame,
  Brain,
  Rocket,
  Network,
  CreditCard,
  Command,
  Activity,
  ChevronRight,
  Building,
  Zap,
} from "lucide-react";

interface Module {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  bgGradient: string;
  status: "operational" | "maintenance" | "offline";
  metrics?: {
    primary: string;
    secondary: string;
  };
}

const modules: Module[] = [
  {
    id: "admin",
    name: "ADMIN COMMAND CENTER",
    description: "Data Management • CSV Upload • System Control",
    path: "/admin",
    icon: Shield,
    color: "#FFD700",
    bgGradient: "from-yellow-500/10 to-amber-600/10",
    status: "operational",
    metrics: {
      primary: "Database Active",
      secondary: "Upload Ready"
    }
  },
  {
    id: "firestorm",
    name: "FIRESTORM",
    description: "Marketing Automation • Campaign Control • Lead Processing",
    path: "/marketing-automation",
    icon: Flame,
    color: "#FF6A00",
    bgGradient: "from-orange-500/10 to-red-600/10",
    status: "operational",
    metrics: {
      primary: "12 Active Campaigns",
      secondary: "98.7% Delivery Rate"
    }
  },
  {
    id: "dream-portal",
    name: "DREAM PORTAL COMMAND",
    description: "Member Management • Portal Access • User Control",
    path: "/member-portal",
    icon: Brain,
    color: "#8A2BE2",
    bgGradient: "from-purple-500/10 to-violet-600/10",
    status: "operational",
    metrics: {
      primary: "2,847 Active Members",
      secondary: "99.2% Uptime"
    }
  },
  {
    id: "velocify",
    name: "VELOCIFY OPS COMMAND",
    description: "Client Operations • Fulfillment • Performance Tracking",
    path: "/client-portal",
    icon: Rocket,
    color: "#00BFFF",
    bgGradient: "from-blue-500/10 to-cyan-600/10",
    status: "operational",
    metrics: {
      primary: "1.9min Avg Fulfillment",
      secondary: "97.8% Efficiency"
    }
  },
  {
    id: "nexus",
    name: "NEXUS SYNC",
    description: "API Integration • Data Flow • System Connectivity",
    path: "/integrations",
    icon: Network,
    color: "#00CED1",
    bgGradient: "from-cyan-500/10 to-teal-600/10",
    status: "operational",
    metrics: {
      primary: "16 Active APIs",
      secondary: "All Systems Sync"
    }
  },
  {
    id: "fortress",
    name: "ZERO-CB FORTRESS",
    description: "Chargeback Protection • Revenue Defense • Risk Management",
    path: "/chargeback-tracker",
    icon: CreditCard,
    color: "#32CD32",
    bgGradient: "from-green-500/10 to-emerald-600/10",
    status: "operational",
    metrics: {
      primary: "0.3% Chargeback Rate",
      secondary: "$2.1M Protected"
    }
  },
  {
    id: "billing",
    name: "BILLING LOGIC",
    description: "Payment Processing • Revenue Management • Financial Control",
    path: "/billing",
    icon: Building,
    color: "#FF69B4",
    bgGradient: "from-pink-500/10 to-rose-600/10",
    status: "operational",
    metrics: {
      primary: "$847K Monthly",
      secondary: "99.6% Success Rate"
    }
  },
  {
    id: "devops",
    name: "DEVOPS COMMAND",
    description: "System Operations • Monitoring • Infrastructure Control",
    path: "/devops",
    icon: Activity,
    color: "#FF4500",
    bgGradient: "from-red-500/10 to-orange-600/10",
    status: "operational",
    metrics: {
      primary: "99.9% Uptime",
      secondary: "All Systems Green"
    }
  }
];

export default function Overview() {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "#10B981";
      case "maintenance":
        return "#F59E0B";
      case "offline":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "operational":
        return "OPERATIONAL";
      case "maintenance":
        return "MAINTENANCE";
      case "offline":
        return "OFFLINE";
      default:
        return "UNKNOWN";
    }
  };

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Command Header */}
      <div className="f10-command-header">
        <div className="f10-command-title">
          <Command className="w-8 h-8 text-[#00BFFF]" />
          <div>
            <h1 className="f10-heading-lg text-white">ECELONX COMMAND CENTER</h1>
            <p className="f10-command-subtitle">Unified Operations Dashboard</p>
          </div>
        </div>
        <div className="f10-command-status">
          <div className="f10-env-status">
            <div className="f10-status-dot"></div>
            <span>All Systems Operational</span>
          </div>
          <div className="f10-env-status">
            <Zap className="w-4 h-4" />
            <span>Live Sync: Active</span>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="f10-ops-zone">
        <div className="f10-zone-header">
          <h2 className="f10-zone-title">Command Modules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                onClick={() => navigate(module.path)}
                className={cn(
                  "f10-card cursor-pointer group",
                  `bg-gradient-to-br ${module.bgGradient}`,
                  "hover:border-opacity-100 transition-all duration-200"
                )}
                style={{
                  borderColor: `${module.color}40`
                }}
              >
                {/* Module Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${module.color}20` }}
                    >
                      <Icon 
                        className="w-6 h-6" 
                        style={{ color: module.color }}
                      />
                    </div>
                    <div className="f10-status" style={{ 
                      backgroundColor: `${getStatusColor(module.status)}20`,
                      color: getStatusColor(module.status),
                      borderColor: `${getStatusColor(module.status)}40`
                    }}>
                      {getStatusLabel(module.status)}
                    </div>
                  </div>
                  <ChevronRight 
                    className="w-5 h-5 text-[#737373] group-hover:text-white group-hover:translate-x-1 transition-all"
                  />
                </div>

                {/* Module Title */}
                <h3 className="f10-text-lg font-semibold text-white mb-2">
                  {module.name}
                </h3>

                {/* Module Description */}
                <p className="f10-text-sm text-[#b3b3b3] mb-4 leading-relaxed">
                  {module.description}
                </p>

                {/* Module Metrics */}
                {module.metrics && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="f10-text-xs text-[#737373]">Primary</span>
                      <span 
                        className="f10-text-xs font-medium"
                        style={{ color: module.color }}
                      >
                        {module.metrics.primary}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="f10-text-xs text-[#737373]">Status</span>
                      <span className="f10-text-xs font-medium text-[#b3b3b3]">
                        {module.metrics.secondary}
                      </span>
                    </div>
                  </div>
                )}

                {/* Hover Effect Border */}
                <div 
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    border: `1px solid ${module.color}`,
                    boxShadow: `0 0 20px ${module.color}20`
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* System Overview */}
        <div className="mt-12">
          <div className="f10-zone-header">
            <h2 className="f10-zone-title">System Overview</h2>
          </div>

          <div className="f10-grid-4">
            <div className="f10-metric-card">
              <div className="f10-metric-header">
                <span className="f10-metric-title">Total Modules</span>
                <Activity className="w-4 h-4 text-[#737373]" />
              </div>
              <div className="f10-metric-value">{modules.length}</div>
              <div className="f10-metric-trend positive">
                <span>All operational</span>
              </div>
            </div>

            <div className="f10-metric-card">
              <div className="f10-metric-header">
                <span className="f10-metric-title">System Health</span>
                <div className="f10-status-dot"></div>
              </div>
              <div className="f10-metric-value">100%</div>
              <div className="f10-metric-trend positive">
                <span>Optimal performance</span>
              </div>
            </div>

            <div className="f10-metric-card">
              <div className="f10-metric-header">
                <span className="f10-metric-title">Active Sessions</span>
                <Network className="w-4 h-4 text-[#737373]" />
              </div>
              <div className="f10-metric-value">247</div>
              <div className="f10-metric-trend positive">
                <span>+12% from last hour</span>
              </div>
            </div>

            <div className="f10-metric-card">
              <div className="f10-metric-header">
                <span className="f10-metric-title">Response Time</span>
                <Zap className="w-4 h-4 text-[#737373]" />
              </div>
              <div className="f10-metric-value">45ms</div>
              <div className="f10-metric-trend positive">
                <span>Lightning fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

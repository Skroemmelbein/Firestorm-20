import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Shield,
  Flame,
  Brain,
  Rocket,
  Network,
  CreditCard,
  Settings,
  Menu,
  X,
  Upload,
  Database,
  Users,
  Building,
  Target,
  Activity,
  BarChart,
  Mail,
  MessageSquare,
  ChevronRight,
  Command,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const navigationItems: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    path: "/",
    icon: Home,
    color: "#ffffff",
    description: "Main dashboard",
  },
  {
    id: "admin",
    label: "Admin Center",
    path: "/admin",
    icon: Shield,
    color: "#FFD700",
    description: "Upload CSV, manage data",
  },
  {
    id: "firestorm",
    label: "FIRESTORM",
    path: "/marketing-automation",
    icon: Flame,
    color: "#FF6A00",
    description: "Marketing automation",
  },
  {
    id: "dream-portal",
    label: "Dream Portal",
    path: "/member-portal",
    icon: Brain,
    color: "#8A2BE2",
    description: "Member management",
  },
  {
    id: "velocify",
    label: "Velocify Hub",
    path: "/client-portal",
    icon: Rocket,
    color: "#00BFFF",
    description: "Client operations",
  },
  {
    id: "nexus",
    label: "Nexus Sync",
    path: "/integrations",
    icon: Network,
    color: "#00CED1",
    description: "API integrations",
  },
  {
    id: "fortress",
    label: "Zero-CB Fortress",
    path: "/chargeback-tracker",
    icon: CreditCard,
    color: "#32CD32",
    description: "Chargeback protection",
  },
  {
    id: "billing",
    label: "Billing Logic",
    path: "/billing",
    icon: Building,
    color: "#FF69B4",
    description: "Payment processing",
  },
  {
    id: "test",
    label: "Test Module",
    path: "/test",
    icon: Target,
    color: "#00E676",
    description: "System testing center",
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full backdrop-blur-md border-r border-white/40 shadow-2xl z-50 transition-all duration-300",
          isCollapsed ? "w-16" : "w-72",
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(196, 181, 253, 0.85) 0%, rgba(252, 165, 165, 0.75) 50%, rgba(167, 243, 208, 0.85) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20" style={{backdropFilter: 'blur(10px)'}}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Command className="w-6 h-6 text-[#00BFFF]" />
              <span className="text-gray-800 font-bold text-lg drop-shadow-sm">ECELONX</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/20 text-gray-800 transition-colors backdrop-blur-sm"
          >
            {isCollapsed ? (
              <Menu className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all backdrop-blur-sm",
                  "hover:bg-white/20 group",
                  active && "bg-white/30 border border-white/30 shadow-lg",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    active ? "text-gray-800" : "text-gray-600",
                  )}
                  style={{ color: active ? item.color : undefined }}
                />

                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div
                      className={cn(
                        "font-medium text-sm",
                        active ? "text-gray-800 font-semibold" : "text-gray-700",
                      )}
                    >
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.description}
                    </div>
                  </div>
                )}

                {!isCollapsed && active && (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/20 border border-white/30 rounded-lg p-4 backdrop-blur-sm shadow-lg">
              <div className="text-xs text-gray-700 uppercase font-medium mb-2">
                Quick Actions
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/admin")}
                  className="w-full flex items-center gap-2 p-2 rounded text-sm text-gray-700 hover:text-gray-900 hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </button>
                <button
                  onClick={() => navigate("/integrations")}
                  className="w-full flex items-center gap-2 p-2 rounded text-sm text-gray-700 hover:text-gray-900 hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content spacer */}
      <div
        className={cn(
          "transition-all duration-300",
          isCollapsed ? "ml-16" : "ml-72",
        )}
      />
    </>
  );
}

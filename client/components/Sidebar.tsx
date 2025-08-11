import { useState } from "react";
import * as React from "react";
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
    id: "payment-processing",
    label: "Payment Processing",
    path: "/billing",
    icon: CreditCard,
    color: "#4F46E5",
    description: "Complete payment & billing system",
  },
  {
    id: "test",
    label: "Test Module",
    path: "/test",
    icon: Target,
    color: "#00E676",
    description: "System testing center",
  },
  {
    id: "campaign-scheduler",
    label: "Campaign Scheduler",
    path: "/campaign-scheduler",
    icon: Activity,
    color: "#F59E0B",
    description: "Automated campaign execution",
  },
];

const getNavigationVisibility = () => {
  try {
    const saved = localStorage.getItem("ecelonx-navigation-settings");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [visibilitySettings, setVisibilitySettings] = useState(() => getNavigationVisibility());
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const visibleNavigationItems = navigationItems.filter(item => {
    if (item.id === "dream-portal" || item.id === "velocify") {
      return visibilitySettings[item.id] === true;
    }
    return true;
  });

  React.useEffect(() => {
    const handleNavigationSettingsChange = () => {
      setVisibilitySettings(getNavigationVisibility());
    };

    window.addEventListener('navigation-settings-changed', handleNavigationSettingsChange);
    return () => {
      window.removeEventListener('navigation-settings-changed', handleNavigationSettingsChange);
    };
  }, []);

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full backdrop-blur-md border-r border-white/40 shadow-2xl z-50 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-16" : "w-72",
        )}
        style={{
          background:
            "linear-gradient(180deg, rgba(196, 181, 253, 0.85) 0%, rgba(252, 165, 165, 0.75) 50%, rgba(167, 243, 208, 0.85) 100%)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.6)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b border-white/20"
          style={{ backdropFilter: "blur(10px)" }}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Command className="w-6 h-6 text-[#00BFFF]" />
              <span className="text-gray-900 font-bold text-lg drop-shadow-lg">
                ECELONX
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/30 text-gray-900 transition-colors backdrop-blur-sm border border-white/20"
          >
            {isCollapsed ? (
              <Menu className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2 flex-1 overflow-y-auto pb-24">
          {visibleNavigationItems.map((item) => {
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
                    active ? "text-gray-900" : "text-gray-700",
                  )}
                  style={{ color: active ? item.color : undefined }}
                />

                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div
                      className={cn(
                        "font-medium text-sm",
                        active ? "text-gray-900 font-bold" : "text-gray-800",
                      )}
                    >
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-700">
                      {item.description}
                    </div>
                  </div>
                )}

                {!isCollapsed && active && (
                  <ChevronRight className="w-4 h-4 text-gray-800" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="p-4 mt-auto">
            <div className="bg-white/40 border border-white/50 rounded-lg p-3 backdrop-blur-sm shadow-lg">
              <div className="text-xs text-gray-900 uppercase font-semibold mb-2">
                Quick Actions
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/admin")}
                  className="w-full flex items-center gap-2 p-2 rounded text-sm text-gray-800 hover:text-gray-900 hover:bg-white/30 transition-colors backdrop-blur-sm border border-transparent hover:border-white/30"
                >
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </button>
                <button
                  onClick={() => navigate("/integrations")}
                  className="w-full flex items-center gap-2 p-2 rounded text-sm text-gray-800 hover:text-gray-900 hover:bg-white/30 transition-colors backdrop-blur-sm border border-transparent hover:border-white/30"
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

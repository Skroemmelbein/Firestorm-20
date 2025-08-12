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
    color: "#dc2626",
    description: "Main dashboard",
  },
  {
    id: "admin",
    label: "Admin Center",
    path: "/admin",
    icon: Shield,
    color: "#dc2626",
    description: "Upload CSV, manage data",
  },
  {
    id: "campaigns",
    label: "Campaigns",
    path: "/marketing-automation",
    icon: Flame,
    color: "#dc2626",
    description: "Campaigns & automation",
  },
  {
    id: "members",
    label: "Members",
    path: "/member-portal",
    icon: Brain,
    color: "#dc2626",
    description: "Member management",
  },
  {
    id: "clients",
    label: "Clients",
    path: "/client-portal",
    icon: Rocket,
    color: "#dc2626",
    description: "Client operations",
  },
  {
    id: "integrations",
    label: "Integrations",
    path: "/integrations",
    icon: Network,
    color: "#dc2626",
    description: "API integrations",
  },
  {
    id: "billing",
    label: "Billing",
    path: "/billing",
    icon: CreditCard,
    color: "#dc2626",
    description: "Payments & gateway",
  },
  {
    id: "test",
    label: "Test Module",
    path: "/test",
    icon: Target,
    color: "#dc2626",
    description: "System testing center",
  },
  {
    id: "campaign-scheduler",
    label: "Campaign Scheduler",
    path: "/marketing-automation/scheduler",
    icon: Activity,
    color: "#dc2626",
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
          "fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-lg z-50 transition-all duration-300 flex flex-col",
          isCollapsed ? "w-16" : "w-72",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Command className="w-6 h-6 text-red-600" />
              <span className="text-gray-900 font-bold text-lg">ECHELONX</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-700 transition-colors border border-gray-200"
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
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                  "hover:bg-gray-50",
                  active && "bg-gray-100 border border-gray-200 shadow-sm",
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    active ? "text-red-600" : "text-gray-600",
                  )}
                />

                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className={cn("font-medium text-sm", active ? "text-gray-900" : "text-gray-800")}>{item.label}</div>
                    <div className="text-xs text-gray-600">{item.description}</div>
                  </div>
                )}

                {!isCollapsed && active && <ChevronRight className="w-4 h-4 text-gray-600" />}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="p-4 mt-auto">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-700 uppercase font-semibold mb-2">Quick Actions</div>
              <div className="space-y-2">
                <button onClick={() => navigate("/admin")} className="w-full flex items-center gap-2 p-2 rounded text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200">
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </button>
                <button onClick={() => navigate("/integrations")} className="w-full flex items-center gap-2 p-2 rounded text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content spacer */}
      <div className={cn("transition-all duration-300", isCollapsed ? "ml-16" : "ml-72")} />
    </>
  );
}

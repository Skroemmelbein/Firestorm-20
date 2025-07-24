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
  Command
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
    description: "Main dashboard"
  },
  {
    id: "admin",
    label: "Admin Center",
    path: "/admin",
    icon: Shield,
    color: "#FFD700",
    description: "Upload CSV, manage data"
  },
  {
    id: "firestorm",
    label: "FIRESTORM",
    path: "/marketing-automation",
    icon: Flame,
    color: "#FF6A00",
    description: "Marketing automation"
  },
  {
    id: "dream-portal",
    label: "Dream Portal",
    path: "/member-portal",
    icon: Brain,
    color: "#8A2BE2",
    description: "Member management"
  },
  {
    id: "velocify",
    label: "Velocify Hub",
    path: "/client-portal",
    icon: Rocket,
    color: "#00BFFF",
    description: "Client operations"
  },
  {
    id: "nexus",
    label: "Nexus Sync",
    path: "/integrations",
    icon: Network,
    color: "#00CED1",
    description: "API integrations"
  },
  {
    id: "fortress",
    label: "Zero-CB Fortress",
    path: "/chargeback-tracker",
    icon: CreditCard,
    color: "#32CD32",
    description: "Chargeback protection"
  },
  {
    id: "billing",
    label: "Billing Logic",
    path: "/billing",
    icon: Building,
    color: "#FF69B4",
    description: "Payment processing"
  }
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
          "fixed left-0 top-0 h-full bg-[#111111] border-r border-[#333333] z-50 transition-all duration-300",
          isCollapsed ? "w-16" : "w-72"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Command className="w-6 h-6 text-[#00BFFF]" />
              <span className="text-white font-bold text-lg">ECELONX</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-[#222222] text-white transition-colors"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
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
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                  "hover:bg-[#222222] group",
                  active && "bg-[#222222] border border-[#333333]"
                )}
              >
                <Icon 
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    active ? "text-white" : "text-[#737373]"
                  )}
                  style={{ color: active ? item.color : undefined }}
                />
                
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className={cn(
                      "font-medium text-sm",
                      active ? "text-white" : "text-[#b3b3b3]"
                    )}>
                      {item.label}
                    </div>
                    <div className="text-xs text-[#737373]">
                      {item.description}
                    </div>
                  </div>
                )}

                {!isCollapsed && active && (
                  <ChevronRight className="w-4 h-4 text-[#737373]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-[#222222] border border-[#333333] rounded-lg p-4">
              <div className="text-xs text-[#737373] uppercase font-medium mb-2">
                Quick Actions
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => navigate("/admin")}
                  className="w-full flex items-center gap-2 p-2 rounded text-sm text-[#b3b3b3] hover:text-white hover:bg-[#333333] transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </button>
                <button
                  onClick={() => navigate("/integrations")}
                  className="w-full flex items-center gap-2 p-2 rounded text-sm text-[#b3b3b3] hover:text-white hover:bg-[#333333] transition-colors"
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
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "ml-16" : "ml-72"
      )} />
    </>
  );
}

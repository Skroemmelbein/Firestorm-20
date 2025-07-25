import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Database,
  MessageSquare,
  CreditCard,
  BarChart3,
  Users,
  Phone,
  Mail,
  Zap,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Building,
  Package,
  Bot,
  Shield,
  Wallet,
  Send,
  TrendingUp,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  description: string;
  color?: string;
  personality?: string;
  subItems?: SubNavigationItem[];
}

interface SubNavigationItem {
  id: string;
  label: string;
  path: string;
  icon: any;
}

const navigationItems = [
  {
    id: "overview",
    label: "OVERVIEW",
    icon: TrendingUp,
    path: "/",
    description: "ECELONX system overview & status",
    color: "bg-gradient-to-r from-slate-900 via-gray-900 to-zinc-900",
    personality: "command-center",
    subItems: [],
  },
  {
    id: "firestorm",
    label: "FIRESTORM",
    icon: Zap,
    path: "/marketing-automation",
    description: "High-energy, full-throttle marketing system",
    color: "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400",
    personality: "explosive-energy",
    subItems: [
      {
        id: "marketing-automation",
        label: "Marketing Engine",
        path: "/marketing-automation",
        icon: Zap,
      },
      {
        id: "intelligent-ai",
        label: "AI Command",
        path: "/comm-center",
        icon: Bot,
      },
      {
        id: "campaigns",
        label: "Campaign Blaster",
        path: "/comm-center/campaigns",
        icon: Send,
      },
      {
        id: "audience",
        label: "Target Matrix",
        path: "/comm-center/audience",
        icon: Users,
      },
    ],
  },
  {
    id: "dream-portal",
    label: "DREAM PORTAL",
    icon: Users,
    path: "/member-portal",
    description: "Premium member experience platform",
    color: "bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500",
    personality: "luxurious-premium",
    subItems: [
      {
        id: "member-dashboard",
        label: "Member Dashboard",
        path: "/member-portal",
        icon: Users,
      },
      {
        id: "benefits-vault",
        label: "Benefits Vault",
        path: "/member-portal",
        icon: Package,
      },
      {
        id: "member-profile",
        label: "Member Profile",
        path: "/member-portal",
        icon: User,
      },
    ],
  },
  {
    id: "velocify-hub",
    label: "VELOCIFY HUB",
    icon: Package,
    path: "/client-portal",
    description: "Ultra-efficient frictionless fulfillment speedway",
    color: "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600",
    personality: "speed-efficiency",
    subItems: [
      {
        id: "rapid-fulfillment",
        label: "Rapid Fulfillment",
        path: "/client-portal",
        icon: Package,
      },
      {
        id: "velocity-tracking",
        label: "Velocity Tracking",
        path: "/lead-journey",
        icon: TrendingUp,
      },
      {
        id: "express-delivery",
        label: "Express Delivery",
        path: "/fulfillment",
        icon: Send,
      },
    ],
  },
  {
    id: "nexus-sync",
    label: "NEXUS SYNC",
    icon: Database,
    path: "/admin",
    description: "Connective tissue for seamless data integration",
    color: "bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600",
    personality: "data-nexus",
    subItems: [
      {
        id: "data-nexus",
        label: "Data Nexus",
        path: "/admin",
        icon: Database,
      },
      {
        id: "intelligent-upload",
        label: "Intelligent Upload Manager",
        path: "/admin/uploads",
        icon: Package,
      },
      {
        id: "data-uploads",
        label: "Data Uploads",
        path: "/admin/uploads",
        icon: Upload,
      },
      {
        id: "sync-engine",
        label: "Sync Engine",
        path: "/admin",
        icon: Zap,
      },
      {
        id: "table-builder",
        label: "Table Builder",
        path: "/admin",
        icon: Database,
      },
    ],
  },
  {
    id: "payment-processing",
    label: "PAYMENT PROCESSING",
    icon: CreditCard,
    path: "/billing",
    description: "Complete payment processing & chargeback defense",
    color: "bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600",
    personality: "payment-processing",
    subItems: [
      {
        id: "billing-logic",
        label: "Billing Logic",
        path: "/billing",
        icon: CreditCard,
      },
      {
        id: "zero-cb-fortress",
        label: "Zero-CB Fortress",
        path: "/chargeback-tracker",
        icon: Shield,
      },
      {
        id: "payment-gateway",
        label: "Payment Gateway",
        path: "/billing/gateway",
        icon: Wallet,
      },
      {
        id: "transaction-logs",
        label: "Transaction Logs",
        path: "/billing/logs",
        icon: BarChart3,
      },
    ],
  },
  {
    id: "command-center",
    label: "COMMAND CENTER",
    icon: Settings,
    path: "/integrations",
    description: "Mission control for all system operations",
    color: "bg-gradient-to-r from-gray-700 via-slate-600 to-zinc-800",
    personality: "mission-control",
    subItems: [
      {
        id: "mission-control",
        label: "Mission Control",
        path: "/integrations",
        icon: Settings,
      },
      {
        id: "administration-center",
        label: "Administration Center",
        path: "/business-overview",
        icon: Building,
      },
      {
        id: "system-monitor",
        label: "System Monitor",
        path: "/business-overview",
        icon: BarChart3,
      },
      {
        id: "security-grid",
        label: "Security Grid",
        path: "/devops",
        icon: Shield,
      },
    ],
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentSection = navigationItems.find((item) =>
    location.pathname.startsWith(item.path),
  );

  return (
    <div className="min-h-screen animate-fade-in animated-bg">
      {/* Top Header */}
      <header className="glass-nav sticky top-0 z-50 animate-slide-up corp-shadow">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200/30 bg-gradient-to-r from-slate-900 to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wider">
                ECELONX
              </h1>
              <p className="text-xs text-cyan-300/80 font-bold uppercase tracking-widest">
                Elite Business Command Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex">
              <Bell className="w-3 h-3 mr-1" />3 Active
            </Badge>

            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Shannon</span>
            </Button>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>

            {/* Horizontal Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-bold tracking-wide",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-green-600 text-white corp-shadow"
                        : "text-blue-700 hover:text-blue-900 hover:bg-blue-50",
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              {/* Mission Control Button */}
              <Link to="/integrations">
                <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white font-bold tracking-wide border-none hover:shadow-xl"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">MISSION CONTROL</span>
                </Button>
              </Link>

              {/* Shannon Profile Menu */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-zinc-900 rounded-lg px-3 py-2 border border-slate-600">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                    Shannon
                  </div>
                  <div className="text-xs text-slate-400">Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Navigation */}
        <nav
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 glass-sidebar transform transition-all duration-300 ease-out lg:hidden corp-shadow-lg",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex flex-col h-full pt-20">
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="px-4 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);

                  return (
                    <div key={item.id}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-500 group font-bold text-sm tracking-wide overflow-hidden",
                          isActive
                            ? `${item.color || "bg-gradient-to-r from-blue-600 to-green-600"} text-white shadow-2xl border border-white/20`
                            : "text-slate-700 hover:text-slate-900 hover:bg-gradient-to-r hover:from-slate-100 hover:to-white hover:shadow-lg",
                        )}
                      >
                        {/* Personality Effect Overlay */}
                        {isActive && (
                          <div
                            className={cn(
                              "absolute inset-0 opacity-20",
                              item.personality === "explosive-energy" &&
                                "bg-gradient-to-r from-yellow-400 to-red-600 animate-pulse",
                              item.personality === "luxurious-premium" &&
                                "bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse",
                              item.personality === "speed-efficiency" &&
                                "bg-gradient-to-r from-cyan-400 to-blue-600 animate-bounce",
                              item.personality === "data-nexus" &&
                                "bg-gradient-to-r from-green-400 to-emerald-600",
                              item.personality === "fortress-defense" &&
                                "bg-gradient-to-r from-amber-400 to-orange-600",
                            )}
                          />
                        )}

                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg relative z-10",
                            isActive
                              ? "bg-white/20 backdrop-blur-sm"
                              : "bg-gradient-to-br from-slate-200 to-slate-300 group-hover:from-slate-300 group-hover:to-slate-400",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-4 h-4 relative z-10",
                              isActive
                                ? "text-white drop-shadow-md"
                                : "text-slate-600 group-hover:text-slate-800",
                              item.personality === "explosive-energy" &&
                                isActive &&
                                "animate-pulse",
                              item.personality === "speed-efficiency" &&
                                isActive &&
                                "animate-bounce",
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                          <div
                            className={cn(
                              "font-black text-sm tracking-widest uppercase",
                              isActive
                                ? "text-white drop-shadow-md"
                                : "text-slate-800",
                            )}
                          >
                            {item.label}
                          </div>
                          <div
                            className={cn(
                              "text-xs font-medium mt-1 leading-tight",
                              isActive ? "text-white/90" : "text-slate-600/80",
                            )}
                          >
                            {item.description}
                          </div>
                        </div>
                      </Link>

                      {/* Subitems for active section */}
                      {isActive && item.subItems && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive =
                              location.pathname === subItem.path;
                            return (
                              <Link
                                key={subItem.id}
                                to={subItem.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-xs font-medium",
                                  isSubActive
                                    ? "bg-white/20 text-white"
                                    : "text-white/70 hover:text-white hover:bg-white/10",
                                )}
                              >
                                <SubIcon className="w-4 h-4" />
                                {subItem.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* System Status */}
              <div className="px-4 py-4 border-t border-blue-200/50 mt-auto">
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                    System Status
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700 font-medium">
                        Database
                      </span>
                      <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700 font-medium">
                        Payment Gateway
                      </span>
                      <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">
                        Standby
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700 font-medium">
                        Communications
                      </span>
                      <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700 font-medium">
                        API Services
                      </span>
                      <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                        Running
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sub-navigation for current section */}
          {currentSection && currentSection.subItems && (
            <div className="glass-card m-6 mb-0 p-4 corp-shadow">
              <div className="flex items-center gap-4 overflow-x-auto">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-800 whitespace-nowrap">
                  <currentSection.icon className="w-4 h-4" />
                  {currentSection.label}
                </div>
                <div className="flex items-center gap-2">
                  {currentSection.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = location.pathname === subItem.path;
                    return (
                      <Link
                        key={subItem.id}
                        to={subItem.path}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all whitespace-nowrap",
                          isSubActive
                            ? `${currentSection.color || "bg-gradient-to-r from-blue-600 to-green-600"} text-white corp-shadow`
                            : "text-blue-700 hover:text-blue-900 hover:bg-blue-50",
                        )}
                      >
                        <SubIcon className="w-3 h-3" />
                        {subItem.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

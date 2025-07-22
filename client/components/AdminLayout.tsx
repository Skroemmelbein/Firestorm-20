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
  Wallet
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
    id: 'xano-builder',
    label: 'XANO BUILDER',
    icon: Database,
    path: '/admin',
    description: 'Database & API management',
    subItems: [
      { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: Database },
      { id: 'table-manager', label: 'Table Manager', path: '/admin', icon: Database },
      { id: 'api-endpoints', label: 'API Endpoints', path: '/integrations', icon: Zap }
    ]
  },
  {
    id: 'merchant-management',
    label: 'MERCHANT MANAGEMENT',
    icon: Building,
    path: '/merchant',
    description: 'Payment gateway & merchant accounts',
    subItems: [
      { id: 'nmi-gateway', label: 'NMI Gateway', path: '/billing', icon: CreditCard },
      { id: 'payment-vault', label: 'Payment Vault', path: '/twilio-vault', icon: Shield },
      { id: 'merchant-settings', label: 'Settings', path: '/integrations', icon: Settings }
    ]
  },
  {
    id: 'comm-center',
    label: 'COMM CENTER',
    icon: MessageSquare,
    path: '/comm-center',
    description: 'Customer communication hub',
    subItems: [
      { id: 'sms-campaigns', label: 'SMS Campaigns', path: '/comm-center', icon: Phone },
      { id: 'email-templates', label: 'Email Templates', path: '/comm-center', icon: Mail },
      { id: 'twilio-config', label: 'Twilio Config', path: '/twilio-vault', icon: Settings }
    ]
  },
  {
    id: 'billing-tools',
    label: 'BILLING TOOLS',
    icon: CreditCard,
    path: '/billing-kit',
    description: 'Invoice & billing management',
    subItems: [
      { id: 'invoice-builder', label: 'Invoice Builder', path: '/billing-kit', icon: CreditCard },
      { id: 'billing-analytics', label: 'Analytics', path: '/business-overview', icon: BarChart3 },
      { id: 'recurring-billing', label: 'Recurring Billing', path: '/billing', icon: Wallet }
    ]
  },
  {
    id: 'member-portal',
    label: 'MEMBER PORTAL CONTROL',
    icon: Users,
    path: '/members',
    description: 'Customer portal management',
    subItems: [
      { id: 'portal-design', label: 'Portal Design', path: '/members', icon: Settings },
      { id: 'member-accounts', label: 'Member Accounts', path: '/members', icon: Users },
      { id: 'access-control', label: 'Access Control', path: '/members', icon: Shield }
    ]
  },
  {
    id: 'fulfillment',
    label: 'FULFILLMENT',
    icon: Package,
    path: '/fulfillment',
    description: 'Order & delivery management',
    subItems: [
      { id: 'orders', label: 'Orders', path: '/fulfillment', icon: Package },
      { id: 'shipping', label: 'Shipping', path: '/fulfillment', icon: Package },
      { id: 'inventory', label: 'Inventory', path: '/fulfillment', icon: Database }
    ]
  },
  {
    id: 'intelligent-ai',
    label: 'INTELLIGENT AI',
    icon: Bot,
    path: '/ai',
    description: 'AI-powered insights & automation',
    subItems: [
      { id: 'predictive-analytics', label: 'Predictive Analytics', path: '/business-overview', icon: BarChart3 },
      { id: 'smart-recommendations', label: 'Smart Recommendations', path: '/ai', icon: Robot },
      { id: 'automated-workflows', label: 'Automated Workflows', path: '/ai', icon: Zap }
    ]
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentSection = navigationItems.find(item => 
    location.pathname.startsWith(item.path)
  );

  return (
    <div className="min-h-screen animate-fade-in animated-bg">
      {/* Top Header */}
      <header className="glass-nav sticky top-0 z-50 animate-slide-up corp-shadow">
        {/* Top Brand Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-blue-200/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 flex items-center justify-center corp-shadow">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text tracking-tight">RecurFlow Enterprise</h1>
              <p className="text-xs text-blue-600/70 font-medium">Business Management Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex">
              <Bell className="w-3 h-3 mr-1" />
              3 Active
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
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
                        : "text-blue-700 hover:text-blue-900 hover:bg-blue-50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <Link to="/integrations">
              <Button variant="outline" size="sm" className="gap-2 border-blue-200 text-blue-700">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Navigation */}
        <nav className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 glass-sidebar transform transition-all duration-300 ease-out lg:hidden corp-shadow-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
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
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group font-medium",
                          isActive
                            ? "glass-card bg-gradient-to-r from-blue-600 to-green-600 text-white corp-shadow-lg"
                            : "text-blue-700 hover:text-blue-900 hover:glass-card hover:corp-shadow"
                        )}
                      >
                        <Icon className={cn(
                          "w-5 h-5 flex-shrink-0",
                          isActive ? "text-white" : "text-blue-600 group-hover:text-blue-800"
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            "font-semibold text-xs tracking-wide",
                            isActive ? "text-white" : "text-blue-800"
                          )}>
                            {item.label}
                          </div>
                          <div className={cn(
                            "text-xs font-medium mt-1",
                            isActive ? "text-white/80" : "text-blue-600/70"
                          )}>
                            {item.description}
                          </div>
                        </div>
                      </Link>

                      {/* Subitems for active section */}
                      {isActive && item.subItems && (
                        <div className="ml-4 mt-2 space-y-1">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = location.pathname === subItem.path;
                            return (
                              <Link
                                key={subItem.id}
                                to={subItem.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                  "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 text-xs font-medium",
                                  isSubActive
                                    ? "bg-white/20 text-white"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
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
                  <div className="text-xs font-semibold text-blue-800 uppercase tracking-wider">System Status</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700 font-medium">Database</span>
                      <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700 font-medium">Payment Gateway</span>
                      <Badge className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200">Standby</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700 font-medium">Communications</span>
                      <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700 font-medium">API Services</span>
                      <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Running</Badge>
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
                            ? "bg-gradient-to-r from-blue-600 to-green-600 text-white corp-shadow"
                            : "text-blue-700 hover:text-blue-900 hover:bg-blue-50"
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
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

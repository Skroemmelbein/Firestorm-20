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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigationItems = [
  {
    id: 'admin',
    label: 'Administration',
    icon: Settings,
    path: '/admin',
    description: 'System management & configuration',
    subItems: [
      { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: Database },
      { id: 'api-vault', label: 'API Vault', path: '/twilio-vault', icon: Database },
      { id: 'settings', label: 'Settings', path: '/integrations', icon: Settings }
    ]
  },
  {
    id: 'billing-kit',
    label: 'Client Services',
    icon: CreditCard,
    path: '/billing-kit',
    description: 'Client billing & account management'
  },
  {
    id: 'business-overview',
    label: 'Analytics',
    icon: BarChart3,
    path: '/business-overview',
    description: 'Business intelligence & forecasting'
  },
  {
    id: 'comm',
    label: 'Communications',
    icon: MessageSquare,
    path: '/comm-center',
    description: 'Customer communication management'
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
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 flex items-center justify-center corp-shadow">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text tracking-tight">RecurFlow Enterprise</h1>
                <p className="text-xs text-blue-600/70 font-medium">Business Management Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex">
              <Bell className="w-3 h-3 mr-1" />
              3 Active Subscriptions
            </Badge>
            
            <Link to="/settings">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </Link>

            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 glass-sidebar transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 corp-shadow-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
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
                            "font-semibold text-sm tracking-wide",
                            isActive ? "text-white" : "text-blue-800"
                          )}>
                            {item.label}
                          </div>
                          <div className={cn(
                            "text-xs font-medium",
                            isActive ? "text-white/80" : "text-blue-600/70"
                          )}>
                            {item.description}
                          </div>
                        </div>
                      </Link>

                      {/* Admin subitems */}
                      {item.id === 'admin' && isActive && item.subItems && (
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

              {/* Quick Stats */}
              <div className="px-4 py-4 border-t border-border/50 mt-auto">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-muted-foreground">System Status</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Xano</span>
                      <Badge variant="outline" className="text-xs">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">NMI</span>
                      <Badge variant="outline" className="text-xs">Pending</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Twilio</span>
                      <Badge variant="outline" className="text-xs">Connected</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
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

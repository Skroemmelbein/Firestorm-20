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
    label: 'Admin Dashboard',
    icon: Database,
    path: '/admin',
    description: 'Overview and system management'
  },
  {
    id: 'billing-kit',
    label: 'Client Billing Kit',
    icon: CreditCard,
    path: '/billing-kit',
    description: 'Invoices, ID cards & digital wallet'
  },
  {
    id: 'business-overview',
    label: 'Business Overview',
    icon: BarChart3,
    path: '/business-overview',
    description: 'Analytics, charts & predictions'
  },
  {
    id: 'comm',
    label: 'Comm Center',
    icon: MessageSquare,
    path: '/comm-center',
    description: 'Communication management'
  }
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentSection = navigationItems.find(item => 
    location.pathname.startsWith(item.path)
  );

  return (
    <div className="min-h-screen animate-fade-in">
      {/* Top Header */}
      <header className="glass-nav sticky top-0 z-50 animate-slide-up">
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 flex items-center justify-center animate-glow">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">RecurFlow Pro</h1>
                <p className="text-xs text-purple-600/70">Client Billing Suite</p>
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
          "fixed inset-y-0 left-0 z-40 w-64 glass-sidebar transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="px-4 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);
                  
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group transform hover:scale-105",
                        isActive
                          ? "glass-card bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg animate-glow"
                          : "text-purple-700 hover:text-purple-900 hover:glass-card"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-medium text-sm",
                          isActive ? "text-primary-foreground" : "text-foreground"
                        )}>
                          {item.label}
                        </div>
                        <div className={cn(
                          "text-xs",
                          isActive ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
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

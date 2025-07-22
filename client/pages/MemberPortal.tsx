import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, Shield, Layout, UserCheck, Key } from "lucide-react";

export default function MemberPortal() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text tracking-tight">Member Portal Control</h1>
            <p className="text-blue-700/70 font-medium">Customer portal design and access management</p>
          </div>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 corp-shadow">
            <Settings className="w-4 h-4" />
            Portal Settings
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Active Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">1,247</div>
              <p className="text-xs text-green-600 font-medium">↗ +15% this month</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Portal Views</CardTitle>
              <Layout className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">8,432</div>
              <p className="text-xs text-blue-600 font-medium">Last 30 days</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Login Success</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">97.2%</div>
              <p className="text-xs text-green-600 font-medium">Authentication rate</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Access Levels</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">6</div>
              <p className="text-xs text-blue-600 font-medium">Permission tiers</p>
            </CardContent>
          </Card>
        </div>

        {/* Portal Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card corp-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Portal Design
              </CardTitle>
              <CardDescription>
                Customize the member portal appearance and functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm text-blue-800 mb-2">Current Theme</h4>
                  <Badge className="bg-blue-100 text-blue-700">Corporate Blue</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-sm text-blue-800 mb-2">Layout</h4>
                  <Badge className="bg-green-100 text-green-700">Responsive</Badge>
                </div>
              </div>
              <Button className="w-full gap-2">
                <Settings className="w-4 h-4" />
                Customize Portal
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Access Control
              </CardTitle>
              <CardDescription>
                Manage member permissions and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Two-Factor Auth</span>
                  <Badge className="bg-green-100 text-green-700">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Session Timeout</span>
                  <span className="text-sm text-blue-600">30 minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Password Policy</span>
                  <Badge className="bg-blue-100 text-blue-700">Strong</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <Key className="w-4 h-4" />
                Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

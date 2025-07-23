import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users, Settings, Shield, Layout, UserCheck, Key, Gift, Star,
  Percent, Truck, Headphones, Crown, ChevronRight, Search,
  Loader2, CheckCircle, XCircle, AlertTriangle, Plus
} from "lucide-react";

interface Member {
  id: number;
  uuid: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  status: string;
  membership_type: string;
  engagement_score: number;
  lifetime_value: number;
  created_at: string;
}

interface MemberBenefit {
  id: number;
  uuid: string;
  title: string;
  description: string;
  benefit_type: string;
  benefit_category: string;
  value_description: string;
  conditions?: string;
  is_active: boolean;
  membership_levels: string[];
  sort_order: number;
  icon_name?: string;
  color_theme?: string;
  expires_at?: string;
  usage_limit?: number;
}

export default function MemberPortal() {
  const [members, setMembers] = useState<Member[]>([]);
  const [benefits, setBenefits] = useState<MemberBenefit[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load members and benefits from real Xano API
      const [membersResponse, benefitsResponse] = await Promise.all([
        fetch('/api/real/members?per_page=50'),
        fetch('/api/real/benefits?is_active=true')
      ]);

      if (!membersResponse.ok || !benefitsResponse.ok) {
        throw new Error('Failed to load data from Xano');
      }

      const membersData = await membersResponse.json();
      const benefitsData = await benefitsResponse.json();

      setMembers(membersData.data || []);
      setBenefits(benefitsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconForBenefit = (iconName?: string) => {
    switch (iconName) {
      case 'percent': return Percent;
      case 'truck': return Truck;
      case 'headphones': return Headphones;
      case 'crown': return Crown;
      case 'star': return Star;
      default: return Gift;
    }
  };

  const getBenefitColor = (colorTheme?: string) => {
    switch (colorTheme) {
      case 'green': return 'bg-green-100 text-green-700 border-green-200';
      case 'blue': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'purple': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'orange': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading member portal data...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text tracking-tight">Member Portal</h1>
            <p className="text-blue-700/70 font-medium">Real member benefits from Xano database</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Refresh Data
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 corp-shadow">
              <Plus className="w-4 h-4" />
              Add Benefit
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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

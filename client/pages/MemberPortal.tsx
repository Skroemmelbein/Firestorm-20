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

        {/* Stats - Real Data from Xano */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Total Members</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{members.length.toLocaleString()}</div>
              <p className="text-xs text-green-600 font-medium">Live from Xano DB</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Active Benefits</CardTitle>
              <Gift className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{benefits.length}</div>
              <p className="text-xs text-blue-600 font-medium">Available to members</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Premium Members</CardTitle>
              <Crown className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">
                {members.filter(m => m.membership_type === 'premium' || m.membership_type === 'enterprise').length}
              </div>
              <p className="text-xs text-purple-600 font-medium">Premium + Enterprise</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Avg Engagement</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">
                {members.length > 0 ? Math.round(members.reduce((sum, m) => sum + m.engagement_score, 0) / members.length) : 0}
              </div>
              <p className="text-xs text-yellow-600 font-medium">Engagement score</p>
            </CardContent>
          </Card>
        </div>

        {/* Member Benefits Interface */}
        <Tabs defaultValue="benefits" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="benefits" className="gap-2">
              <Gift className="w-4 h-4" />
              Member Benefits
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              Portal Settings
            </TabsTrigger>
          </TabsList>

          {/* Benefits Tab */}
          <TabsContent value="benefits">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit) => {
                const IconComponent = getIconForBenefit(benefit.icon_name);
                return (
                  <Card key={benefit.id} className="glass-card corp-shadow hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getBenefitColor(benefit.color_theme)}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{benefit.title}</CardTitle>
                            <Badge variant="outline" className="mt-1">
                              {benefit.benefit_category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Value:</span>
                          <span className="text-sm text-primary font-semibold">{benefit.value_description}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Type:</span>
                          <Badge variant="secondary">{benefit.benefit_type}</Badge>
                        </div>

                        <div className="space-y-1">
                          <span className="text-sm font-medium">Available to:</span>
                          <div className="flex flex-wrap gap-1">
                            {benefit.membership_levels.map((level) => (
                              <Badge key={level} className="text-xs bg-blue-100 text-blue-700">
                                {level}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {benefit.conditions && (
                          <div className="pt-2 border-t">
                            <span className="text-xs text-muted-foreground">
                              <strong>Conditions:</strong> {benefit.conditions}
                            </span>
                          </div>
                        )}

                        {benefit.usage_limit && (
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">Usage limit:</span>
                            <span className="text-xs font-medium">{benefit.usage_limit} per member</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Member Directory</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-64"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredMembers.slice(0, 10).map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedMember(member)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {member.first_name[0]}{member.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{member.first_name} {member.last_name}</div>
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            member.membership_type === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                            member.membership_type === 'premium' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }
                        >
                          {member.membership_type}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          Score: {member.engagement_score}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>

                {filteredMembers.length > 10 && (
                  <div className="text-center mt-4">
                    <Button variant="outline">
                      Load More ({filteredMembers.length - 10} remaining)
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card corp-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Portal Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure portal appearance and functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-sm text-blue-800 mb-2">Database</h4>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Xano Connected
                      </Badge>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-sm text-blue-800 mb-2">Benefits</h4>
                      <Badge className="bg-blue-100 text-blue-700">{benefits.length} Active</Badge>
                    </div>
                  </div>
                  <Button className="w-full gap-2" onClick={loadData}>
                    <Settings className="w-4 h-4" />
                    Refresh from Xano
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card corp-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Integration Status
                  </CardTitle>
                  <CardDescription>
                    Real-time connection status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Xano Database</span>
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Member Records</span>
                      <span className="text-sm text-blue-600">{members.length} loaded</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Benefits Catalog</span>
                      <span className="text-sm text-blue-600">{benefits.length} active</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full gap-2">
                    <Key className="w-4 h-4" />
                    View API Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

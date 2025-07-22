import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Phone, 
  MessageSquare, 
  Shield, 
  Video, 
  BarChart3, 
  Search, 
  Plus, 
  Settings,
  TrendingUp,
  DollarSign,
  Users,
  Zap
} from "lucide-react";

interface TwilioAPI {
  id: string;
  name: string;
  endpoint: string;
  category: string;
  subcategory: string;
  businessFunction: string;
  kpiImpact: string;
  costPerUse: number;
  priorityLevel: number;
  status: 'active' | 'inactive' | 'testing';
  monthlyUsage: number;
  lastUsed: string;
}

import { ALL_TWILIO_APIS, TWILIO_BUSINESS_CATEGORIES } from "../shared/twilio-complete-api-registry";

const twilioAPIs = ALL_TWILIO_APIS.map(api => ({
  id: api.id,
  name: api.name,
  endpoint: api.path,
  category: api.category,
  subcategory: api.subcategory,
  businessFunction: api.businessFunction,
  kpiImpact: api.kpiImpact,
  costPerUse: api.costPerUse,
  priorityLevel: api.priorityLevel,
  status: api.status,
  monthlyUsage: api.monthlyUsage,
  lastUsed: api.lastUsed
}));

const iconMap = {
  Shield,
  DollarSign,
  Users,
  Video,
  BarChart3
};

const categories = TWILIO_BUSINESS_CATEGORIES.map(cat => ({
  id: cat.id,
  name: cat.name,
  icon: iconMap[cat.icon as keyof typeof iconMap] || BarChart3,
  description: cat.description,
  color: cat.color
}));

export default function TwilioAPIManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredAPIs = twilioAPIs.filter(api => {
    const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         api.businessFunction.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || api.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || api.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'testing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'bg-red-100 text-red-700';
    if (priority >= 3) return 'bg-yellow-100 text-yellow-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Twilio API Management Center</h2>
          <p className="text-blue-700/70 font-medium">Complete registry of all {twilioAPIs.length} Twilio APIs organized by business function</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-bold gradient-text">{twilioAPIs.length}</div>
            <div className="text-xs text-blue-600/70">Total APIs</div>
          </div>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 corp-shadow">
            <Plus className="w-4 h-4" />
            Add Custom API
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card corp-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-800">Active APIs</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{twilioAPIs.filter(api => api.status === 'active').length}</div>
            <p className="text-xs text-green-600 font-medium">Production ready</p>
          </CardContent>
        </Card>

        <Card className="glass-card corp-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-800">Monthly Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{twilioAPIs.reduce((sum, api) => sum + api.monthlyUsage, 0).toLocaleString()}</div>
            <p className="text-xs text-blue-600 font-medium">API calls this month</p>
          </CardContent>
        </Card>

        <Card className="glass-card corp-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-800">Cost Center</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">
              ${twilioAPIs.reduce((sum, api) => sum + (api.monthlyUsage * api.costPerUse), 0).toFixed(2)}
            </div>
            <p className="text-xs text-green-600 font-medium">Monthly spend</p>
          </CardContent>
        </Card>

        <Card className="glass-card corp-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-800">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gradient-text">{categories.length}</div>
            <p className="text-xs text-purple-600 font-medium">Business functions</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card corp-shadow">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 w-4 h-4" />
                <Input
                  placeholder="Search APIs by name or function..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 glass-card corp-shadow">
          <TabsTrigger value="list">API List View</TabsTrigger>
          <TabsTrigger value="categories">Category View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-4">
            {filteredAPIs.map((api) => (
              <Card key={api.id} className="glass-card corp-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-blue-800">{api.name}</h3>
                        <Badge className={getStatusColor(api.status)}>
                          {api.status}
                        </Badge>
                        <Badge className={getPriorityColor(api.priorityLevel)}>
                          Priority {api.priorityLevel}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-blue-600/70 mb-2">{api.businessFunction}</p>
                      <p className="text-xs text-green-600 font-medium mb-3">{api.kpiImpact}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="font-medium text-blue-800">Monthly Usage:</span>
                          <br />
                          <span className="text-blue-600">{api.monthlyUsage.toLocaleString()} calls</span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-800">Cost per Use:</span>
                          <br />
                          <span className="text-blue-600">${api.costPerUse}</span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-800">Monthly Cost:</span>
                          <br />
                          <span className="text-green-600">${(api.monthlyUsage * api.costPerUse).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-800">Last Used:</span>
                          <br />
                          <span className="text-blue-600">{api.lastUsed}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Settings className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((category) => {
              const categoryAPIs = twilioAPIs.filter(api => api.category === category.id);
              const Icon = category.icon;
              
              return (
                <Card key={category.id} className="glass-card corp-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${category.color}`} />
                      {category.name}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold gradient-text">{categoryAPIs.length}</div>
                          <div className="text-xs text-blue-600/70">APIs</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold gradient-text">
                            {categoryAPIs.reduce((sum, api) => sum + api.monthlyUsage, 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-blue-600/70">Monthly Calls</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold gradient-text">
                            ${categoryAPIs.reduce((sum, api) => sum + (api.monthlyUsage * api.costPerUse), 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-blue-600/70">Monthly Cost</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {categoryAPIs.slice(0, 3).map((api) => (
                          <div key={api.id} className="flex items-center justify-between text-xs">
                            <span className="font-medium text-blue-800">{api.name}</span>
                            <Badge className={getStatusColor(api.status)} size="sm">
                              {api.status}
                            </Badge>
                          </div>
                        ))}
                        {categoryAPIs.length > 3 && (
                          <div className="text-xs text-blue-600/70 text-center">
                            +{categoryAPIs.length - 3} more APIs
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Database, 
  Search, 
  Play, 
  Code, 
  Book,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Phone,
  Video,
  Shield,
  Bell,
  MessageCircle,
  RefreshCw,
  Hash,
  Users,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  TWILIO_API_CATEGORIES, 
  TWILIO_API_VAULT, 
  TwilioAPIEndpoint, 
  TwilioAPICategory,
  TwilioAPITest 
} from "@shared/twilio-api-vault";

const CATEGORY_ICONS = {
  'TrendingUp': TrendingUp,
  'Shield': Shield,
  'CreditCard': CreditCard,
  'Headphones': Users, // Using Users as fallback for Headphones
  'UserCheck': CheckCircle, // Using CheckCircle as fallback for UserCheck
  'Lock': Shield, // Using Shield as fallback for Lock
  'Phone': Phone,
  'BarChart3': BarChart3,
  'Zap': Zap,
  'MessageSquare': MessageSquare,
  'Video': Video,
  'Search': Search,
  'Bell': Bell,
  'MessageCircle': MessageCircle,
  'RefreshCw': RefreshCw,
  'Hash': Hash,
  'Users': Users
};

export default function TwilioVault() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<TwilioAPIEndpoint | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [testParameters, setTestParameters] = useState<Record<string, any>>({});
  const [apiTests, setApiTests] = useState<TwilioAPITest[]>([]);
  const [uploadedAPIs, setUploadedAPIs] = useState<TwilioAPIEndpoint[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const filteredEndpoints = useMemo(() => {
    let endpoints = [...TWILIO_API_VAULT, ...uploadedAPIs];
    
    if (searchQuery) {
      endpoints = endpoints.filter(endpoint => 
        endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      endpoints = endpoints.filter(endpoint => endpoint.category === selectedCategory);
    }
    
    return endpoints;
  }, [searchQuery, selectedCategory, uploadedAPIs]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const parsedAPIs = JSON.parse(text);
      
      // Validate and process the uploaded API data
      if (Array.isArray(parsedAPIs)) {
        const validAPIs = parsedAPIs.filter(api => 
          api.name && api.description && api.method && api.path
        );
        setUploadedAPIs(prev => [...prev, ...validAPIs]);
      }
    } catch (error) {
      console.error('Error uploading API file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const testEndpoint = async (endpoint: TwilioAPIEndpoint) => {
    const testId = Date.now().toString();
    const newTest: TwilioAPITest = {
      endpointId: endpoint.id,
      parameters: testParameters
    };

    try {
      // Simulate API test - in real implementation, this would call the actual Twilio API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      newTest.result = {
        success,
        response: success ? endpoint.responseExample : undefined,
        error: success ? undefined : "API test failed - check credentials and parameters",
        timestamp: new Date()
      };
      
      setApiTests(prev => [newTest, ...prev.slice(0, 9)]); // Keep last 10 tests
    } catch (error) {
      newTest.result = {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date()
      };
      setApiTests(prev => [newTest, ...prev.slice(0, 9)]);
    }
  };

  const renderMethodBadge = (method: string) => {
    const colors = {
      'GET': 'bg-green-500/10 text-green-600 border-green-500/20',
      'POST': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'PUT': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      'DELETE': 'bg-red-500/10 text-red-600 border-red-500/20'
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || 'bg-gray-500/10 text-gray-600'}>
        {method}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Twilio API Vault</h1>
                <p className="text-sm text-muted-foreground">Complete reference and testing environment</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
                id="api-upload"
              />
              <label htmlFor="api-upload">
                <Button variant="outline" className="gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {isUploading ? 'Uploading...' : 'Upload APIs'}
                </Button>
              </label>
              <Badge variant="secondary">{TWILIO_API_VAULT.length + uploadedAPIs.length} APIs</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories and Search */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search APIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(null)}
                >
                  All APIs
                </Button>
                {TWILIO_API_CATEGORIES.map((category) => {
                  const IconComponent = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS];
                  const endpointCount = filteredEndpoints.filter(e => e.category === category.id).length;
                  
                  return (
                    <div key={category.id}>
                      <Button
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className="w-full justify-between"
                        onClick={() => {
                          setSelectedCategory(selectedCategory === category.id ? null : category.id);
                          toggleCategory(category.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <span>{category.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">{endpointCount}</Badge>
                          {expandedCategories.has(category.id) ? 
                            <ChevronDown className="w-3 h-3" /> : 
                            <ChevronRight className="w-3 h-3" />
                          }
                        </div>
                      </Button>
                      
                      <Collapsible open={expandedCategories.has(category.id)}>
                        <CollapsibleContent className="ml-4 mt-1 space-y-1">
                          {category.subcategories?.map((sub) => (
                            <Button
                              key={sub.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs"
                            >
                              {sub.name}
                            </Button>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="browse" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="browse" className="gap-2">
                  <Book className="w-4 h-4" />
                  Browse APIs
                </TabsTrigger>
                <TabsTrigger value="test" className="gap-2">
                  <Play className="w-4 h-4" />
                  Test API
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Test History
                </TabsTrigger>
              </TabsList>

              {/* Browse APIs */}
              <TabsContent value="browse" className="space-y-4">
                <div className="grid gap-4">
                  {filteredEndpoints.map((endpoint) => (
                    <Card 
                      key={endpoint.id} 
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedEndpoint?.id === endpoint.id && "ring-2 ring-primary"
                      )}
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              {endpoint.name}
                              {renderMethodBadge(endpoint.method)}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {endpoint.description}
                            </CardDescription>
                          </div>
                          {endpoint.pricing && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              {endpoint.pricing.cost} {endpoint.pricing.unit}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Code className="w-3 h-3" />
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {endpoint.method} {endpoint.path}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {endpoint.category}
                            </Badge>
                            {endpoint.subcategory && (
                              <Badge variant="outline" className="text-xs">
                                {endpoint.subcategory}
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-auto gap-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(endpoint.documentation, '_blank');
                              }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Docs
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Test API */}
              <TabsContent value="test" className="space-y-4">
                {selectedEndpoint ? (
                  <div className="grid gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="w-5 h-5" />
                          Test {selectedEndpoint.name}
                        </CardTitle>
                        <CardDescription>
                          {selectedEndpoint.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          {renderMethodBadge(selectedEndpoint.method)}
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {selectedEndpoint.path}
                          </code>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Required Parameters</h4>
                            <div className="grid gap-3">
                              {selectedEndpoint.requiredParams.map((param) => (
                                <div key={param.name} className="space-y-1">
                                  <Label htmlFor={param.name}>
                                    {param.name} <span className="text-red-500">*</span>
                                  </Label>
                                  <Input
                                    id={param.name}
                                    placeholder={param.example?.toString() || param.description}
                                    value={testParameters[param.name] || ''}
                                    onChange={(e) => setTestParameters(prev => ({
                                      ...prev,
                                      [param.name]: e.target.value
                                    }))}
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {param.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {selectedEndpoint.optionalParams.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Optional Parameters</h4>
                              <div className="grid gap-3">
                                {selectedEndpoint.optionalParams.map((param) => (
                                  <div key={param.name} className="space-y-1">
                                    <Label htmlFor={param.name}>{param.name}</Label>
                                    <Input
                                      id={param.name}
                                      placeholder={param.example?.toString() || param.description}
                                      value={testParameters[param.name] || ''}
                                      onChange={(e) => setTestParameters(prev => ({
                                        ...prev,
                                        [param.name]: e.target.value
                                      }))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                      {param.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <Button 
                            onClick={() => testEndpoint(selectedEndpoint)}
                            className="w-full gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Test API Call
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-muted-foreground">
                        Select an API endpoint from the Browse tab to test it
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Test History */}
              <TabsContent value="history" className="space-y-4">
                {apiTests.length > 0 ? (
                  <div className="space-y-4">
                    {apiTests.map((test, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {test.result?.success ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              {TWILIO_API_VAULT.find(e => e.id === test.endpointId)?.name}
                            </CardTitle>
                            <Badge variant="outline">
                              {test.result?.timestamp.toLocaleTimeString()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {test.result?.success ? (
                            <div>
                              <h4 className="font-medium mb-2">Response</h4>
                              <pre className="bg-muted p-3 rounded text-sm overflow-auto">
                                {JSON.stringify(test.result.response, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <Alert variant="destructive">
                              <XCircle className="h-4 w-4" />
                              <AlertTitle>Test Failed</AlertTitle>
                              <AlertDescription>{test.result?.error}</AlertDescription>
                            </Alert>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No API tests run yet. Go to the Test tab to start testing APIs.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

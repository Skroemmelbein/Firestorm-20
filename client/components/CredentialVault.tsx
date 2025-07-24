import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Key,
  Database,
  Globe,
  Shield,
  Link,
  Server,
  Code,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Search,
  Lock,
  Unlock,
  Cloud,
  Webhook,
  CreditCard,
  Mail,
  MessageSquare,
  Brain,
  Activity,
  Users,
  Zap,
} from 'lucide-react';

interface Credential {
  id: string;
  name: string;
  type: 'api_key' | 'auth_token' | 'database' | 'webhook' | 'certificate' | 'oauth' | 'environment' | 'integration' | 'ssh_key' | 'sid';
  service: string;
  value: string;
  description?: string;
  environment: 'production' | 'staging' | 'development' | 'all';
  dateAdded: string;
  lastUsed?: string;
  expiresAt?: string;
  status: 'active' | 'expired' | 'revoked' | 'unknown';
  isEncrypted: boolean;
  tags: string[];
  metadata?: Record<string, any>;
}

const CREDENTIAL_TYPES = [
  { 
    value: 'api_key', 
    label: 'API Keys', 
    icon: Key, 
    color: 'bg-blue-500',
    description: 'Service API keys and tokens'
  },
  { 
    value: 'auth_token', 
    label: 'Auth Tokens', 
    icon: Shield, 
    color: 'bg-green-500',
    description: 'Authentication tokens and bearer tokens'
  },
  { 
    value: 'database', 
    label: 'Database', 
    icon: Database, 
    color: 'bg-purple-500',
    description: 'Database connection strings and credentials'
  },
  { 
    value: 'webhook', 
    label: 'Webhooks', 
    icon: Link, 
    color: 'bg-orange-500',
    description: 'Webhook URLs and callback endpoints'
  },
  { 
    value: 'certificate', 
    label: 'Certificates', 
    icon: Lock, 
    color: 'bg-red-500',
    description: 'SSL certificates and private keys'
  },
  { 
    value: 'oauth', 
    label: 'OAuth Config', 
    icon: Users, 
    color: 'bg-pink-500',
    description: 'OAuth client IDs, secrets, and configs'
  },
  { 
    value: 'environment', 
    label: 'Environment Variables', 
    icon: Settings, 
    color: 'bg-indigo-500',
    description: 'Environment variables and secrets'
  },
  { 
    value: 'integration', 
    label: 'Integration Configs', 
    icon: Zap, 
    color: 'bg-yellow-500',
    description: 'Third-party service configurations'
  },
  { 
    value: 'ssh_key', 
    label: 'SSH Keys', 
    icon: Server, 
    color: 'bg-gray-500',
    description: 'SSH private and public keys'
  },
  { 
    value: 'sid', 
    label: 'Service IDs', 
    icon: Globe, 
    color: 'bg-cyan-500',
    description: 'Twilio SIDs and service identifiers'
  },
];

const COMMON_SERVICES = [
  { name: 'Twilio', icon: MessageSquare, category: 'Communication' },
  { name: 'SendGrid', icon: Mail, category: 'Email' },
  { name: 'OpenAI', icon: Brain, category: 'AI/ML' },
  { name: 'Xano', icon: Database, category: 'Backend' },
  { name: 'Stripe', icon: CreditCard, category: 'Payment' },
  { name: 'AWS', icon: Cloud, category: 'Cloud' },
  { name: 'Google Cloud', icon: Cloud, category: 'Cloud' },
  { name: 'GitHub', icon: Code, category: 'Development' },
  { name: 'Vercel', icon: Globe, category: 'Deployment' },
  { name: 'Netlify', icon: Globe, category: 'Deployment' },
  { name: 'MongoDB', icon: Database, category: 'Database' },
  { name: 'PostgreSQL', icon: Database, category: 'Database' },
  { name: 'Redis', icon: Database, category: 'Cache' },
  { name: 'Auth0', icon: Shield, category: 'Authentication' },
  { name: 'Supabase', icon: Database, category: 'Backend' },
  { name: 'Custom', icon: Settings, category: 'Other' },
];

export default function CredentialVault() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [newCredential, setNewCredential] = useState<Partial<Credential>>({
    name: '',
    type: 'api_key',
    service: '',
    value: '',
    description: '',
    environment: 'production',
    tags: [],
    isEncrypted: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = () => {
    try {
      const saved = localStorage.getItem('credential-vault');
      if (saved) {
        setCredentials(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    }
  };

  const saveCredentials = (newCredentials: Credential[]) => {
    try {
      localStorage.setItem('credential-vault', JSON.stringify(newCredentials));
      setCredentials(newCredentials);
    } catch (error) {
      console.error('Failed to save credentials:', error);
    }
  };

  const addCredential = () => {
    if (!newCredential.name || !newCredential.value) return;

    const credential: Credential = {
      id: Date.now().toString(),
      name: newCredential.name,
      type: newCredential.type as Credential['type'],
      service: newCredential.service || 'Custom',
      value: newCredential.value,
      description: newCredential.description,
      environment: newCredential.environment as Credential['environment'],
      dateAdded: new Date().toISOString(),
      status: 'active',
      isEncrypted: false,
      tags: newCredential.tags || [],
    };

    const updatedCredentials = [...credentials, credential];
    saveCredentials(updatedCredentials);
    
    setNewCredential({
      name: '',
      type: 'api_key',
      service: '',
      value: '',
      description: '',
      environment: 'production',
      tags: [],
      isEncrypted: false,
    });
  };

  const deleteCredential = (id: string) => {
    const updatedCredentials = credentials.filter(cred => cred.id !== id);
    saveCredentials(updatedCredentials);
  };

  const toggleShowValue = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyValue = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch (error) {
      console.error('Failed to copy value:', error);
    }
  };

  const exportCredentials = () => {
    const dataStr = JSON.stringify(credentials, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'credential-vault-export.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importCredentials = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (Array.isArray(imported)) {
          saveCredentials(imported);
        }
      } catch (error) {
        console.error('Failed to import credentials:', error);
      }
    };
    reader.readAsText(file);
  };

  const scanEnvironmentVars = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/environment/scan', {
        method: 'POST',
      });
      
      if (response.ok) {
        const discovered = await response.json();
        const existingNames = credentials.map(c => c.name);
        const newCredentials = discovered.filter((d: any) => !existingNames.includes(d.name));
        
        if (newCredentials.length > 0) {
          const updatedCredentials = [...credentials, ...newCredentials];
          saveCredentials(updatedCredentials);
        }
      }
    } catch (error) {
      console.error('Failed to scan environment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCredentials = credentials.filter(cred => {
    const matchesSearch = cred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cred.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cred.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || cred.type === selectedType;
    const matchesEnvironment = selectedEnvironment === 'all' || cred.environment === selectedEnvironment;
    return matchesSearch && matchesType && matchesEnvironment;
  });

  const getTypeInfo = (type: string) => {
    return CREDENTIAL_TYPES.find(t => t.value === type) || CREDENTIAL_TYPES[0];
  };

  const maskValue = (value: string, isVisible: boolean) => {
    if (isVisible) return value;
    if (value.length <= 8) return '*'.repeat(value.length);
    return value.substring(0, 4) + '*'.repeat(value.length - 8) + value.substring(value.length - 4);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Credential Vault
          </h1>
          <p className="text-gray-600">Secure management of all your API keys, tokens, and secrets</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {credentials.length} credentials stored
          </Badge>
          <Button
            onClick={scanEnvironmentVars}
            disabled={isLoading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Auto-Scan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="manage">Manage Credentials</TabsTrigger>
          <TabsTrigger value="add">Add New</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        {/* Manage Credentials Tab */}
        <TabsContent value="manage" className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search credentials by name, service, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-gray-300"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Types</option>
              {CREDENTIAL_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCredentials.map((credential) => {
              const typeInfo = getTypeInfo(credential.type);
              const Icon = typeInfo.icon;
              const isVisible = showValues[credential.id];
              
              return (
                <Card key={credential.id} className="border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{credential.name}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {typeInfo.label}
                            </Badge>
                            <Badge 
                              variant={credential.environment === 'production' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {credential.environment}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => toggleShowValue(credential.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          {isVisible ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          onClick={() => copyValue(credential.value)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                        >
                          {copiedValue === credential.value ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          onClick={() => deleteCredential(credential.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Service:</span>
                        <span className="text-sm text-gray-600">{credential.service}</span>
                      </div>
                      
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded border">
                        {maskValue(credential.value, isVisible)}
                      </div>
                      
                      {credential.description && (
                        <p className="text-sm text-gray-600">{credential.description}</p>
                      )}
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Added: {new Date(credential.dateAdded).toLocaleDateString()}</span>
                        <Badge 
                          variant={credential.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {credential.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredCredentials.length === 0 && (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No credentials found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedType !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first credential to get started'
                }
              </p>
            </div>
          )}
        </TabsContent>

        {/* Add New Credential Tab */}
        <TabsContent value="add" className="space-y-6">
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-purple-600" />
                Add New Credential
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-medium">Name</Label>
                  <Input
                    value={newCredential.name || ''}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Twilio API Key"
                    className="bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Type</Label>
                  <select
                    value={newCredential.type}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, type: e.target.value as Credential['type'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    {CREDENTIAL_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700 font-medium">Service</Label>
                  <select
                    value={newCredential.service}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, service: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">Select a service...</option>
                    {COMMON_SERVICES.map(service => (
                      <option key={service.name} value={service.name}>
                        {service.name} ({service.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-gray-700 font-medium">Environment</Label>
                  <select
                    value={newCredential.environment}
                    onChange={(e) => setNewCredential(prev => ({ ...prev, environment: e.target.value as Credential['environment'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                    <option value="all">All Environments</option>
                  </select>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-700 font-medium">Value</Label>
                <Textarea
                  value={newCredential.value || ''}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter the credential value..."
                  className="bg-white border-gray-300 font-mono"
                  rows={3}
                />
              </div>
              
              <div>
                <Label className="text-gray-700 font-medium">Description (Optional)</Label>
                <Input
                  value={newCredential.description || ''}
                  onChange={(e) => setNewCredential(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional notes about this credential..."
                  className="bg-white border-gray-300"
                />
              </div>
              
              <Button
                onClick={addCredential}
                disabled={!newCredential.name || !newCredential.value}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Credential to Vault
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Operations Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-600" />
                  Export Credentials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Export all your stored credentials to a JSON file for backup.
                </p>
                <Button
                  onClick={exportCredentials}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={credentials.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to JSON
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Import Credentials
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Import credentials from a previously exported JSON file.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={importCredentials}
                  className="hidden"
                  id="import-file"
                />
                <Button
                  onClick={() => document.getElementById('import-file')?.click()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import from JSON
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CREDENTIAL_TYPES.map((type) => {
              const Icon = type.icon;
              const count = credentials.filter(c => c.type === type.value).length;
              
              return (
                <Card key={type.value} className="border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-3 rounded-lg ${type.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{type.label}</h3>
                        <Badge variant="outline" className="text-xs">
                          {count} stored
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
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

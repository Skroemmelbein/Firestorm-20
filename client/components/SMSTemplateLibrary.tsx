import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Send,
  Copy,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Star,
  Heart,
  Gift,
  ShoppingCart,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Zap,
  Target,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Percent,
  Eye,
  Download,
  Upload,
  Settings,
  Play,
  Pause,
  Save
} from 'lucide-react';

interface SMSTemplate {
  id: string;
  name: string;
  category: 'welcome' | 'promotional' | 'abandoned-cart' | 'reminder' | 'transactional' | 'follow-up' | 'event' | 'survey';
  message: string;
  characterCount: number;
  variables: string[];
  tags: string[];
  stats: {
    sent: number;
    delivered: number;
    responseRate: number;
    conversionRate: number;
    optOuts: number;
  };
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface PersonalizationVariable {
  key: string;
  name: string;
  description: string;
  example: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage';
}

const SMS_CATEGORIES = [
  { id: 'welcome', name: 'Welcome Series', icon: Heart, color: '#10B981', description: 'New customer onboarding' },
  { id: 'promotional', name: 'Promotional', icon: Gift, color: '#FF6A00', description: 'Sales and special offers' },
  { id: 'abandoned-cart', name: 'Cart Recovery', icon: ShoppingCart, color: '#EF4444', description: 'Recover abandoned purchases' },
  { id: 'reminder', name: 'Reminders', icon: Clock, color: '#F59E0B', description: 'Appointment and deadline alerts' },
  { id: 'transactional', name: 'Transactional', icon: CheckCircle, color: '#3B82F6', description: 'Order confirmations and updates' },
  { id: 'follow-up', name: 'Follow-up', icon: Users, color: '#8B5CF6', description: 'Post-purchase engagement' },
  { id: 'event', name: 'Events', icon: Calendar, color: '#06B6D4', description: 'Event invitations and updates' },
  { id: 'survey', name: 'Surveys', icon: Target, color: '#84CC16', description: 'Feedback and reviews' }
];

const PERSONALIZATION_VARIABLES: PersonalizationVariable[] = [
  { key: '{firstName}', name: 'First Name', description: 'Customer\'s first name', example: 'John', type: 'text' },
  { key: '{lastName}', name: 'Last Name', description: 'Customer\'s last name', example: 'Doe', type: 'text' },
  { key: '{fullName}', name: 'Full Name', description: 'Customer\'s full name', example: 'John Doe', type: 'text' },
  { key: '{email}', name: 'Email', description: 'Customer\'s email address', example: 'john@example.com', type: 'text' },
  { key: '{phone}', name: 'Phone', description: 'Customer\'s phone number', example: '+1-555-0123', type: 'text' },
  { key: '{company}', name: 'Company', description: 'Customer\'s company name', example: 'ACME Corp', type: 'text' },
  { key: '{orderNumber}', name: 'Order Number', description: 'Order or transaction ID', example: '#12345', type: 'text' },
  { key: '{orderTotal}', name: 'Order Total', description: 'Total order amount', example: '$99.99', type: 'currency' },
  { key: '{discount}', name: 'Discount', description: 'Discount percentage', example: '20%', type: 'percentage' },
  { key: '{discountCode}', name: 'Discount Code', description: 'Promotional code', example: 'SAVE20', type: 'text' },
  { key: '{productName}', name: 'Product Name', description: 'Featured product name', example: 'Premium Plan', type: 'text' },
  { key: '{eventDate}', name: 'Event Date', description: 'Upcoming event date', example: 'March 15, 2024', type: 'date' },
  { key: '{appointmentTime}', name: 'Appointment Time', description: 'Scheduled appointment time', example: '2:00 PM', type: 'text' },
  { key: '{location}', name: 'Location', description: 'Store or event location', example: 'Downtown Store', type: 'text' },
  { key: '{unsubscribeLink}', name: 'Unsubscribe Link', description: 'Opt-out link', example: 'Reply STOP', type: 'text' }
];

const FIRESTORM_SMS_TEMPLATES: Partial<SMSTemplate>[] = [
  {
    id: 'welcome-blast',
    name: '🔥 FIRESTORM Welcome',
    category: 'welcome',
    message: 'Welcome to FIRESTORM {firstName}! 🚀 Your marketing automation journey starts now. Get ready for explosive results! Reply HELP for support.',
    tags: ['welcome', 'onboarding', 'firestorm'],
    isActive: true
  },
  {
    id: 'promo-flash',
    name: '⚡ Flash Sale Alert',
    category: 'promotional',
    message: '🔥 FLASH SALE {firstName}! {discount} OFF everything! Use code {discountCode} - expires in 24hrs! Shop now: [link] Reply STOP to opt out',
    tags: ['flash-sale', 'urgent', 'discount'],
    isActive: true
  },
  {
    id: 'cart-rescue',
    name: '🛒 Cart Rescue Mission',
    category: 'abandoned-cart',
    message: 'Hey {firstName}, you left {productName} in your cart! 🛒 Complete your order now and save {discount}! [checkout-link] Questions? Reply here!',
    tags: ['cart-recovery', 'urgency', 'discount'],
    isActive: true
  },
  {
    id: 'appointment-reminder',
    name: '📅 Appointment Reminder',
    category: 'reminder',
    message: 'Hi {firstName}! Reminder: Your appointment is tomorrow at {appointmentTime} at {location}. Reply C to confirm or R to reschedule.',
    tags: ['appointment', 'reminder', 'confirmation'],
    isActive: true
  },
  {
    id: 'order-confirmed',
    name: '✅ Order Confirmation',
    category: 'transactional',
    message: 'Order confirmed! 🎉 Thanks {firstName}! Order {orderNumber} for {orderTotal} is being processed. Track: [link] Need help? Reply here!',
    tags: ['order', 'confirmation', 'tracking'],
    isActive: true
  },
  {
    id: 'review-request',
    name: '⭐ Review Request',
    category: 'follow-up',
    message: 'Hi {firstName}! How was your experience with {productName}? ⭐ Share a quick review: [review-link] Your feedback helps us improve!',
    tags: ['review', 'feedback', 'follow-up'],
    isActive: true
  }
];

export default function SMSTemplateLibrary() {
  const [templates, setTemplates] = useState<SMSTemplate[]>(
    FIRESTORM_SMS_TEMPLATES.map(t => ({
      ...t,
      characterCount: t.message?.length || 0,
      variables: extractVariables(t.message || ''),
      stats: { sent: Math.floor(Math.random() * 1000), delivered: Math.floor(Math.random() * 950), responseRate: Math.floor(Math.random() * 15), conversionRate: Math.floor(Math.random() * 8), optOuts: Math.floor(Math.random() * 5) },
      createdAt: new Date().toISOString(),
      lastUsed: Math.random() > 0.5 ? new Date().toISOString() : undefined
    })) as SMSTemplate[]
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<SMSTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMessage, setPreviewMessage] = useState('');
  const [testData, setTestData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    discount: '20%',
    discountCode: 'SAVE20',
    productName: 'Premium Plan',
    orderNumber: '#12345',
    orderTotal: '$99.99'
  });

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'promotional' as any,
    message: '',
    tags: []
  });

  function extractVariables(message: string): string[] {
    const regex = /\{([^}]+)\}/g;
    const variables = [];
    let match;
    while ((match = regex.exec(message)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    return variables;
  }

  const personalizeMessage = (message: string, data: any): string => {
    let personalized = message;
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      personalized = personalized.replace(new RegExp(placeholder, 'g'), value as string);
    });
    return personalized;
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const createTemplate = () => {
    if (!newTemplate.name || !newTemplate.message) return;

    const template: SMSTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      category: newTemplate.category,
      message: newTemplate.message,
      characterCount: newTemplate.message.length,
      variables: extractVariables(newTemplate.message),
      tags: newTemplate.tags,
      stats: { sent: 0, delivered: 0, responseRate: 0, conversionRate: 0, optOuts: 0 },
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setTemplates(prev => [...prev, template]);
    setNewTemplate({ name: '', category: 'promotional', message: '', tags: [] });
    setIsEditing(false);
  };

  const duplicateTemplate = (template: SMSTemplate) => {
    const duplicated: SMSTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      stats: { sent: 0, delivered: 0, responseRate: 0, conversionRate: 0, optOuts: 0 },
      createdAt: new Date().toISOString(),
      lastUsed: undefined
    };

    setTemplates(prev => [...prev, duplicated]);
  };

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
  };

  const getCharacterWarning = (count: number) => {
    if (count <= 160) return { color: '#10B981', message: 'Single SMS' };
    if (count <= 320) return { color: '#F59E0B', message: '2 SMS messages' };
    if (count <= 480) return { color: '#EF4444', message: '3 SMS messages' };
    return { color: '#EF4444', message: `${Math.ceil(count / 160)} SMS messages` };
  };

  const renderTemplateGrid = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">SMS Template Library</h3>
          <p className="text-sm text-[#b3b3b3]">Create, manage, and deploy SMS campaigns with personalization</p>
        </div>
        <Button
          onClick={() => setIsEditing(true)}
          className="f10-btn accent-bg text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#737373]" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#1a1a1a] border-[#333333] text-white"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48 bg-[#1a1a1a] border-[#333333] text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {SMS_CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {SMS_CATEGORIES.map(category => {
          const Icon = category.icon;
          const count = templates.filter(t => t.category === category.id).length;
          
          return (
            <Card 
              key={category.id} 
              className={`f10-card text-center cursor-pointer transition-all ${selectedCategory === category.id ? 'border-[#FF6A00]' : 'hover:border-[#FF6A00]/50'}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardContent className="p-3">
                <Icon className="w-6 h-6 mx-auto mb-1" style={{ color: category.color }} />
                <div className="text-xs font-semibold text-white">{category.name}</div>
                <div className="text-xs text-[#737373]">{count} templates</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => {
          const category = SMS_CATEGORIES.find(c => c.id === template.category);
          const CategoryIcon = category?.icon || MessageSquare;
          const charWarning = getCharacterWarning(template.characterCount);

          return (
            <Card key={template.id} className="f10-card hover:border-[#FF6A00]/50 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge
                    style={{
                      backgroundColor: `${category?.color}20`,
                      color: category?.color,
                      borderColor: `${category?.color}40`
                    }}
                    className="text-xs"
                  >
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {category?.name}
                  </Badge>
                  <div className="flex items-center gap-1">
                    {template.isActive ? (
                      <CheckCircle className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <Pause className="w-4 h-4 text-[#737373]" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-white text-base">{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-[#0a0a0a] border border-[#333333] rounded p-3">
                    <div className="text-sm text-white">{template.message.substring(0, 100)}
                      {template.message.length > 100 && '...'}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#737373]">{template.characterCount} chars</span>
                    <span style={{ color: charWarning.color }}>{charWarning.message}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-sm font-bold text-[#10B981]">{template.stats.sent}</div>
                      <div className="text-xs text-[#737373]">SENT</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#FF6A00]">{template.stats.responseRate}%</div>
                      <div className="text-xs text-[#737373]">RESPONSE</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#FFD700]">{template.stats.conversionRate}%</div>
                      <div className="text-xs text-[#737373]">CVR</div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => setSelectedTemplate(template)}
                      className="flex-1 f10-btn text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateTemplate(template)}
                      className="f10-btn text-xs"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setNewTemplate({
                          name: template.name,
                          category: template.category,
                          message: template.message,
                          tags: template.tags
                        });
                        setIsEditing(true);
                      }}
                      className="f10-btn text-xs"
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderTemplateEditor = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          {newTemplate.name ? 'Edit Template' : 'Create SMS Template'}
        </h3>
        <Button
          variant="outline"
          onClick={() => setIsEditing(false)}
          className="f10-btn"
        >
          Back to Library
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <Card className="f10-card">
          <CardHeader>
            <CardTitle className="text-white">Template Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-[#b3b3b3]">Template Name</Label>
              <Input
                value={newTemplate.name}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name..."
                className="bg-[#0a0a0a] border-[#333333] text-white"
              />
            </div>

            <div>
              <Label className="text-[#b3b3b3]">Category</Label>
              <Select
                value={newTemplate.category}
                onValueChange={(value: any) => setNewTemplate(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-[#0a0a0a] border-[#333333] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SMS_CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#b3b3b3]">Message Content</Label>
              <Textarea
                value={newTemplate.message}
                onChange={(e) => {
                  setNewTemplate(prev => ({ ...prev, message: e.target.value }));
                  setPreviewMessage(personalizeMessage(e.target.value, testData));
                }}
                placeholder="Type your SMS message here..."
                className="bg-[#0a0a0a] border-[#333333] text-white"
                rows={6}
              />
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-[#737373]">{newTemplate.message.length} characters</span>
                <span style={{ color: getCharacterWarning(newTemplate.message.length).color }}>
                  {getCharacterWarning(newTemplate.message.length).message}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={createTemplate}
                disabled={!newTemplate.name || !newTemplate.message}
                className="flex-1 f10-btn accent-bg text-black"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
              <Button variant="outline" className="f10-btn">
                <Send className="w-4 h-4 mr-2" />
                Send Test
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Personalization & Preview */}
        <div className="space-y-4">
          {/* Variables */}
          <Card className="f10-card">
            <CardHeader>
              <CardTitle className="text-white">Personalization Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {PERSONALIZATION_VARIABLES.map(variable => (
                  <button
                    key={variable.key}
                    onClick={() => {
                      setNewTemplate(prev => ({
                        ...prev,
                        message: prev.message + variable.key
                      }));
                    }}
                    className="text-left p-2 bg-[#0a0a0a] border border-[#333333] rounded hover:border-[#FF6A00] transition-colors"
                  >
                    <div className="text-xs font-mono text-[#FF6A00]">{variable.key}</div>
                    <div className="text-xs text-[#b3b3b3]">{variable.name}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Data */}
          <Card className="f10-card">
            <CardHeader>
              <CardTitle className="text-white">Test Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(testData).map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <Label className="text-[#b3b3b3] text-xs w-20 capitalize">{key}:</Label>
                  <Input
                    value={value}
                    onChange={(e) => {
                      setTestData(prev => ({ ...prev, [key]: e.target.value }));
                      setPreviewMessage(personalizeMessage(newTemplate.message, { ...testData, [key]: e.target.value }));
                    }}
                    className="bg-[#0a0a0a] border-[#333333] text-white text-xs"
                    size={1}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="f10-card">
            <CardHeader>
              <CardTitle className="text-white">Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-[#0a0a0a] border border-[#333333] rounded p-3">
                <div className="text-sm text-white whitespace-pre-wrap">
                  {personalizeMessage(newTemplate.message, testData) || 'Type a message to see preview...'}
                </div>
              </div>
              <div className="mt-2 text-xs text-[#737373]">
                Preview with test data • {personalizeMessage(newTemplate.message, testData).length} chars
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderTemplatePreview = () => (
    selectedTemplate && (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">{selectedTemplate.name}</h3>
          <Button
            variant="outline"
            onClick={() => setSelectedTemplate(null)}
            className="f10-btn"
          >
            Back to Library
          </Button>
        </div>

        <Card className="f10-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {SMS_CATEGORIES.find(c => c.id === selectedTemplate.category)?.icon && 
                  React.createElement(SMS_CATEGORIES.find(c => c.id === selectedTemplate.category)!.icon, {
                    className: "w-5 h-5",
                    style: { color: SMS_CATEGORIES.find(c => c.id === selectedTemplate.category)?.color }
                  })
                }
                <div>
                  <CardTitle className="text-white">{selectedTemplate.name}</CardTitle>
                  <p className="text-sm text-[#b3b3b3]">
                    {SMS_CATEGORIES.find(c => c.id === selectedTemplate.category)?.name}
                  </p>
                </div>
              </div>
              <Badge className={selectedTemplate.isActive ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-[#737373]/20 text-[#737373]'}>
                {selectedTemplate.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Message Preview */}
            <div>
              <Label className="text-[#b3b3b3]">Message Content</Label>
              <div className="bg-[#0a0a0a] border border-[#333333] rounded p-4 mt-2">
                <div className="text-white whitespace-pre-wrap">{selectedTemplate.message}</div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-[#737373]">{selectedTemplate.characterCount} characters</span>
                <span style={{ color: getCharacterWarning(selectedTemplate.characterCount).color }}>
                  {getCharacterWarning(selectedTemplate.characterCount).message}
                </span>
              </div>
            </div>

            {/* Variables */}
            {selectedTemplate.variables.length > 0 && (
              <div>
                <Label className="text-[#b3b3b3]">Personalization Variables</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.variables.map(variable => (
                    <Badge key={variable} className="bg-[#FF6A00]/20 text-[#FF6A00] border-[#FF6A00]/40">
                      {'{' + variable + '}'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div>
              <Label className="text-[#b3b3b3]">Performance Statistics</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                <div className="text-center">
                  <div className="text-lg font-bold text-[#10B981]">{selectedTemplate.stats.sent}</div>
                  <div className="text-xs text-[#737373]">SENT</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#00BFFF]">{selectedTemplate.stats.delivered}</div>
                  <div className="text-xs text-[#737373]">DELIVERED</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#FF6A00]">{selectedTemplate.stats.responseRate}%</div>
                  <div className="text-xs text-[#737373]">RESPONSE</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#FFD700]">{selectedTemplate.stats.conversionRate}%</div>
                  <div className="text-xs text-[#737373]">CONVERSION</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-[#EF4444]">{selectedTemplate.stats.optOuts}</div>
                  <div className="text-xs text-[#737373]">OPT-OUTS</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button className="f10-btn accent-bg text-black">
                <Send className="w-4 h-4 mr-2" />
                Use in Campaign
              </Button>
              <Button variant="outline" className="f10-btn">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button variant="outline" className="f10-btn">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" className="f10-btn">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  );

  if (selectedTemplate) {
    return renderTemplatePreview();
  }

  if (isEditing) {
    return renderTemplateEditor();
  }

  return renderTemplateGrid();
}

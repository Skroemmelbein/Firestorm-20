import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Type,
  Image as ImageIcon,
  Layout,
  Palette,
  Eye,
  Send,
  Save,
  Copy,
  Download,
  Upload,
  Settings,
  Smartphone,
  Monitor,
  Tablet,
  Bold,
  Italic,
  Underline,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  Quote,
  Code,
  Plus,
  Trash2,
  Move,
  Grid,
  Zap,
  Users,
  Star,
  Heart,
  ShoppingCart,
  Calendar,
  MapPin,
  Phone
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  category: 'welcome' | 'promotional' | 'transactional' | 'newsletter' | 'abandoned-cart' | 'follow-up';
  subject: string;
  preheader: string;
  content: EmailBlock[];
  styles: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    headerFont: string;
    bodyFont: string;
  };
  stats: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    sent: number;
  };
  lastModified: string;
}

interface EmailBlock {
  id: string;
  type: 'header' | 'text' | 'button' | 'image' | 'divider' | 'social' | 'footer' | 'product' | 'testimonial';
  content: any;
  styles: any;
  position: number;
}

const TEMPLATE_CATEGORIES = [
  { id: 'welcome', name: 'Welcome Series', icon: Heart, color: '#10B981' },
  { id: 'promotional', name: 'Promotional', icon: Star, color: '#FF6A00' },
  { id: 'transactional', name: 'Transactional', icon: Mail, color: '#3B82F6' },
  { id: 'newsletter', name: 'Newsletter', icon: Users, color: '#8B5CF6' },
  { id: 'abandoned-cart', name: 'Abandoned Cart', icon: ShoppingCart, color: '#EF4444' },
  { id: 'follow-up', name: 'Follow-up', icon: Calendar, color: '#F59E0B' }
];

const EMAIL_BLOCKS = {
  header: {
    icon: Type,
    name: 'Header',
    description: 'Company logo and navigation',
    defaultContent: {
      logo: 'https://via.placeholder.com/200x60?text=LOGO',
      text: 'ECELONX',
      showNav: true,
      links: ['Home', 'About', 'Contact']
    }
  },
  text: {
    icon: Type,
    name: 'Text Block',
    description: 'Formatted text content',
    defaultContent: {
      text: 'Your message here...',
      fontSize: '16px',
      textAlign: 'left'
    }
  },
  button: {
    icon: Zap,
    name: 'Call to Action',
    description: 'Action button with link',
    defaultContent: {
      text: 'Get Started',
      url: '#',
      style: 'primary'
    }
  },
  image: {
    icon: ImageIcon,
    name: 'Image',
    description: 'Hero image or graphic',
    defaultContent: {
      src: 'https://via.placeholder.com/600x300?text=IMAGE',
      alt: 'Image description',
      link: ''
    }
  },
  divider: {
    icon: Layout,
    name: 'Divider',
    description: 'Visual separator line',
    defaultContent: {
      style: 'solid',
      color: '#E5E7EB',
      width: '100%'
    }
  },
  social: {
    icon: Users,
    name: 'Social Links',
    description: 'Social media icons',
    defaultContent: {
      platforms: ['twitter', 'facebook', 'linkedin', 'instagram'],
      size: 'medium'
    }
  },
  footer: {
    icon: Layout,
    name: 'Footer',
    description: 'Company info and unsubscribe',
    defaultContent: {
      company: 'ECELONX',
      address: '123 Business Ave, Suite 100',
      showUnsubscribe: true
    }
  },
  product: {
    icon: ShoppingCart,
    name: 'Product Showcase',
    description: 'Product grid with pricing',
    defaultContent: {
      products: [
        { name: 'Product 1', price: '$99', image: 'https://via.placeholder.com/200x200', url: '#' }
      ]
    }
  },
  testimonial: {
    icon: Quote,
    name: 'Testimonial',
    description: 'Customer review or quote',
    defaultContent: {
      quote: '"Amazing service and results!"',
      author: 'John Doe',
      title: 'CEO, Company',
      avatar: 'https://via.placeholder.com/60x60'
    }
  }
};

const FIRESTORM_TEMPLATES: Partial<EmailTemplate>[] = [
  {
    id: 'welcome-blast',
    name: 'FIRESTORM Welcome Blast',
    category: 'welcome',
    subject: '🔥 Welcome to the FIRESTORM Revolution!',
    preheader: 'Your marketing automation journey starts now',
    styles: {
      primaryColor: '#FF6A00',
      secondaryColor: '#FFD700',
      backgroundColor: '#0F0F0F',
      textColor: '#FFFFFF',
      headerFont: 'Inter',
      bodyFont: 'Inter'
    }
  },
  {
    id: 'promo-inferno',
    name: 'Promotional Inferno',
    category: 'promotional',
    subject: '🚀 Explosive Deal Alert - Limited Time!',
    preheader: 'Don\'t miss this scorching hot offer',
    styles: {
      primaryColor: '#FF6A00',
      secondaryColor: '#EF4444',
      backgroundColor: '#1A1A1A',
      textColor: '#FFFFFF',
      headerFont: 'Inter',
      bodyFont: 'Inter'
    }
  },
  {
    id: 'cart-rescue',
    name: 'Cart Rescue Mission',
    category: 'abandoned-cart',
    subject: '🛒 Don\'t let your cart go cold!',
    preheader: 'Complete your purchase before the fire dies out',
    styles: {
      primaryColor: '#EF4444',
      secondaryColor: '#FF6A00',
      backgroundColor: '#111111',
      textColor: '#FFFFFF',
      headerFont: 'Inter',
      bodyFont: 'Inter'
    }
  }
];

export default function EmailTemplateDesigner() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>(
    FIRESTORM_TEMPLATES.map(t => ({
      ...t,
      content: [],
      stats: { openRate: 0, clickRate: 0, conversionRate: 0, sent: 0 },
      lastModified: new Date().toISOString()
    })) as EmailTemplate[]
  );
  
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedBlock, setSelectedBlock] = useState<EmailBlock | null>(null);
  const [isDesigning, setIsDesigning] = useState(false);
  const [newTemplateForm, setNewTemplateForm] = useState({
    name: '',
    category: '' as any,
    subject: '',
    preheader: ''
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  const createNewTemplate = () => {
    if (!newTemplateForm.name || !newTemplateForm.category) return;

    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: newTemplateForm.name,
      category: newTemplateForm.category,
      subject: newTemplateForm.subject || `Welcome to ${newTemplateForm.name}`,
      preheader: newTemplateForm.preheader || 'Your journey begins here',
      content: [
        {
          id: 'header-1',
          type: 'header',
          content: EMAIL_BLOCKS.header.defaultContent,
          styles: { padding: '20px', backgroundColor: '#FF6A00' },
          position: 0
        },
        {
          id: 'text-1',
          type: 'text',
          content: { text: 'Welcome to FIRESTORM! 🔥', fontSize: '24px', textAlign: 'center' },
          styles: { padding: '40px 20px' },
          position: 1
        }
      ],
      styles: {
        primaryColor: '#FF6A00',
        secondaryColor: '#FFD700',
        backgroundColor: '#FFFFFF',
        textColor: '#333333',
        headerFont: 'Inter',
        bodyFont: 'Inter'
      },
      stats: { openRate: 0, clickRate: 0, conversionRate: 0, sent: 0 },
      lastModified: new Date().toISOString()
    };

    setTemplates(prev => [...prev, newTemplate]);
    setSelectedTemplate(newTemplate);
    setIsDesigning(true);
    setNewTemplateForm({ name: '', category: '' as any, subject: '', preheader: '' });
  };

  const addBlock = (blockType: keyof typeof EMAIL_BLOCKS) => {
    if (!selectedTemplate) return;

    const newBlock: EmailBlock = {
      id: `${blockType}-${Date.now()}`,
      type: blockType as any,
      content: EMAIL_BLOCKS[blockType].defaultContent,
      styles: { padding: '20px' },
      position: selectedTemplate.content.length
    };

    const updatedTemplate = {
      ...selectedTemplate,
      content: [...selectedTemplate.content, newBlock],
      lastModified: new Date().toISOString()
    };

    setSelectedTemplate(updatedTemplate);
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  };

  const removeBlock = (blockId: string) => {
    if (!selectedTemplate) return;

    const updatedTemplate = {
      ...selectedTemplate,
      content: selectedTemplate.content.filter(b => b.id !== blockId),
      lastModified: new Date().toISOString()
    };

    setSelectedTemplate(updatedTemplate);
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    setSelectedBlock(null);
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '600px';
      default: return '600px';
    }
  };

  const renderTemplatesList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Email Templates</h3>
        <Button
          onClick={() => setIsDesigning(true)}
          className="f10-btn accent-bg text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Template Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {TEMPLATE_CATEGORIES.map((category) => {
          const Icon = category.icon;
          const templateCount = templates.filter(t => t.category === category.id).length;
          
          return (
            <Card key={category.id} className="f10-card text-center hover:border-[#FF6A00]/50 transition-all cursor-pointer">
              <CardContent className="p-4">
                <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: category.color }} />
                <h4 className="font-semibold text-white text-sm">{category.name}</h4>
                <p className="text-xs text-[#737373]">{templateCount} templates</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const category = TEMPLATE_CATEGORIES.find(c => c.id === template.category);
          const CategoryIcon = category?.icon || Mail;

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
                  <div className="text-xs text-[#737373]">
                    {new Date(template.lastModified).toLocaleDateString()}
                  </div>
                </div>
                <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                <p className="text-sm text-[#b3b3b3]">{template.subject}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#10B981]">{template.stats.openRate}%</div>
                    <div className="text-xs text-[#737373]">OPEN RATE</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#FF6A00]">{template.stats.clickRate}%</div>
                    <div className="text-xs text-[#737373]">CLICK RATE</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-[#FFD700]">{template.stats.sent}</div>
                    <div className="text-xs text-[#737373]">SENT</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setIsDesigning(true);
                    }}
                    className="flex-1 f10-btn"
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="f10-btn">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" className="f10-btn">
                    <Copy className="w-3 h-3 mr-1" />
                    Clone
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderBlockPalette = () => (
    <div className="w-64 bg-[#1a1a1a] border-r border-[#333333] p-4 space-y-4">
      <h4 className="font-semibold text-white mb-3">Email Blocks</h4>
      
      {Object.entries(EMAIL_BLOCKS).map(([type, config]) => {
        const Icon = config.icon;
        return (
          <div
            key={type}
            onClick={() => addBlock(type as any)}
            className="p-3 bg-[#0a0a0a] border border-[#333333] rounded cursor-pointer hover:border-[#FF6A00]/50 transition-all"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-[#FF6A00]" />
              <span className="font-medium text-white text-sm">{config.name}</span>
            </div>
            <div className="text-xs text-[#b3b3b3]">{config.description}</div>
          </div>
        );
      })}

      <div className="pt-4 border-t border-[#333333]">
        <h5 className="font-medium text-white mb-2">Quick Actions</h5>
        <div className="space-y-2">
          <Button size="sm" variant="outline" className="w-full f10-btn text-xs">
            <Save className="w-3 h-3 mr-1" />
            Save Template
          </Button>
          <Button size="sm" variant="outline" className="w-full f10-btn text-xs">
            <Send className="w-3 h-3 mr-1" />
            Send Test
          </Button>
          <Button size="sm" variant="outline" className="w-full f10-btn text-xs">
            <Download className="w-3 h-3 mr-1" />
            Export HTML
          </Button>
        </div>
      </div>
    </div>
  );

  const renderEmailPreview = () => (
    <div className="flex-1 bg-[#0a0a0a] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            onClick={() => setPreviewMode('desktop')}
            className="f10-btn"
          >
            <Monitor className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={previewMode === 'tablet' ? 'default' : 'outline'}
            onClick={() => setPreviewMode('tablet')}
            className="f10-btn"
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            onClick={() => setPreviewMode('mobile')}
            className="f10-btn"
          >
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-sm text-[#b3b3b3]">
          {selectedTemplate?.name} - {previewMode} preview
        </div>
      </div>

      <div className="flex justify-center">
        <div
          ref={canvasRef}
          className="bg-white border border-[#333333] rounded-lg overflow-hidden transition-all"
          style={{ width: getPreviewWidth(), minHeight: '600px' }}
        >
          {/* Email Subject Line Preview */}
          <div className="bg-[#F3F4F6] border-b border-[#E5E7EB] p-3">
            <div className="text-sm font-medium text-gray-900">{selectedTemplate?.subject}</div>
            <div className="text-xs text-gray-600">{selectedTemplate?.preheader}</div>
          </div>

          {/* Email Content */}
          <div className="min-h-[500px]">
            {selectedTemplate?.content.map((block) => (
              <div
                key={block.id}
                className={`relative group cursor-pointer ${selectedBlock?.id === block.id ? 'ring-2 ring-[#FF6A00]' : ''}`}
                onClick={() => setSelectedBlock(block)}
                style={block.styles}
              >
                {renderEmailBlock(block)}
                
                {/* Block controls */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                    <Move className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBlock(block.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}

            {selectedTemplate && selectedTemplate.content.length === 0 && (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <div className="text-center">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-[#FF6A00]" />
                  <h3 className="text-lg font-semibold mb-2">Start Building Your Email</h3>
                  <p className="text-sm">Add blocks from the palette to create your template</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailBlock = (block: EmailBlock) => {
    switch (block.type) {
      case 'header':
        return (
          <div className="bg-[#FF6A00] text-white p-4 text-center">
            <h1 className="text-2xl font-bold">{block.content.text}</h1>
          </div>
        );
      
      case 'text':
        return (
          <div 
            style={{ 
              fontSize: block.content.fontSize,
              textAlign: block.content.textAlign,
              color: selectedTemplate?.styles.textColor 
            }}
          >
            {block.content.text}
          </div>
        );
      
      case 'button':
        return (
          <div className="text-center">
            <a
              href={block.content.url}
              className="inline-block bg-[#FF6A00] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#FF8533] transition-colors"
            >
              {block.content.text}
            </a>
          </div>
        );
      
      case 'image':
        return (
          <div className="text-center">
            <img 
              src={block.content.src} 
              alt={block.content.alt}
              className="max-w-full h-auto"
            />
          </div>
        );
      
      case 'divider':
        return (
          <hr 
            style={{
              border: 'none',
              borderTop: `1px ${block.content.style} ${block.content.color}`,
              width: block.content.width,
              margin: '20px auto'
            }}
          />
        );
      
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            {block.type} block content
          </div>
        );
    }
  };

  const renderNewTemplateForm = () => (
    <div className="max-w-md mx-auto space-y-4 p-6">
      <h3 className="text-xl font-bold text-white text-center">Create Email Template</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="text-[#b3b3b3]">Template Name</Label>
          <Input
            value={newTemplateForm.name}
            onChange={(e) => setNewTemplateForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter template name..."
            className="bg-[#0a0a0a] border-[#333333] text-white"
          />
        </div>
        
        <div>
          <Label className="text-[#b3b3b3]">Category</Label>
          <Select
            value={newTemplateForm.category}
            onValueChange={(value: any) => setNewTemplateForm(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="bg-[#0a0a0a] border-[#333333] text-white">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_CATEGORIES.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label className="text-[#b3b3b3]">Subject Line</Label>
          <Input
            value={newTemplateForm.subject}
            onChange={(e) => setNewTemplateForm(prev => ({ ...prev, subject: e.target.value }))}
            placeholder="Your compelling subject line..."
            className="bg-[#0a0a0a] border-[#333333] text-white"
          />
        </div>
        
        <div>
          <Label className="text-[#b3b3b3]">Preheader Text</Label>
          <Input
            value={newTemplateForm.preheader}
            onChange={(e) => setNewTemplateForm(prev => ({ ...prev, preheader: e.target.value }))}
            placeholder="Preview text that appears after subject..."
            className="bg-[#0a0a0a] border-[#333333] text-white"
          />
        </div>
        
        <div className="flex gap-2 pt-4">
          <Button
            onClick={createNewTemplate}
            disabled={!newTemplateForm.name || !newTemplateForm.category}
            className="flex-1 f10-btn accent-bg text-black"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDesigning(false)}
            className="f10-btn"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  if (isDesigning && selectedTemplate) {
    return (
      <div className="h-[calc(100vh-200px)] flex">
        {renderBlockPalette()}
        {renderEmailPreview()}
        
        {/* Properties Panel */}
        {selectedBlock && (
          <div className="w-80 bg-[#1a1a1a] border-l border-[#333333] p-4">
            <h4 className="font-semibold text-white mb-3">Block Properties</h4>
            <div className="space-y-3">
              <div>
                <Label className="text-[#b3b3b3]">Block Type</Label>
                <div className="text-sm text-white capitalize">{selectedBlock.type}</div>
              </div>
              
              {selectedBlock.type === 'text' && (
                <>
                  <div>
                    <Label className="text-[#b3b3b3]">Text Content</Label>
                    <Textarea
                      value={selectedBlock.content.text}
                      onChange={(e) => {
                        const updatedBlock = {
                          ...selectedBlock,
                          content: { ...selectedBlock.content, text: e.target.value }
                        };
                        setSelectedBlock(updatedBlock);
                      }}
                      className="bg-[#0a0a0a] border-[#333333] text-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-[#b3b3b3]">Font Size</Label>
                    <Select
                      value={selectedBlock.content.fontSize}
                      onValueChange={(value) => {
                        const updatedBlock = {
                          ...selectedBlock,
                          content: { ...selectedBlock.content, fontSize: value }
                        };
                        setSelectedBlock(updatedBlock);
                      }}
                    >
                      <SelectTrigger className="bg-[#0a0a0a] border-[#333333] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12px">Small (12px)</SelectItem>
                        <SelectItem value="16px">Normal (16px)</SelectItem>
                        <SelectItem value="20px">Large (20px)</SelectItem>
                        <SelectItem value="24px">Extra Large (24px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              {selectedBlock.type === 'button' && (
                <>
                  <div>
                    <Label className="text-[#b3b3b3]">Button Text</Label>
                    <Input
                      value={selectedBlock.content.text}
                      onChange={(e) => {
                        const updatedBlock = {
                          ...selectedBlock,
                          content: { ...selectedBlock.content, text: e.target.value }
                        };
                        setSelectedBlock(updatedBlock);
                      }}
                      className="bg-[#0a0a0a] border-[#333333] text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#b3b3b3]">Button URL</Label>
                    <Input
                      value={selectedBlock.content.url}
                      onChange={(e) => {
                        const updatedBlock = {
                          ...selectedBlock,
                          content: { ...selectedBlock.content, url: e.target.value }
                        };
                        setSelectedBlock(updatedBlock);
                      }}
                      className="bg-[#0a0a0a] border-[#333333] text-white"
                      placeholder="https://"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isDesigning && !selectedTemplate) {
    return renderNewTemplateForm();
  }

  return (
    <div className="p-6">
      {renderTemplatesList()}
    </div>
  );
}

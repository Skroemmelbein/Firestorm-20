import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  CreditCard,
  QrCode,
  Wallet,
  Download,
  Upload,
  Eye,
  Edit,
  Save,
  Palette,
  Type,
  Image,
  Layout,
  Smartphone,
  Globe,
  Share2,
  Copy,
  Check,
  Star,
  Gift,
  Shield,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  plan: string;
  amount: number;
  nextBilling: Date;
  status: 'active' | 'pending' | 'overdue';
}

interface InvoiceTemplate {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  layout: 'modern' | 'classic' | 'minimal';
  logo?: string;
  headerText: string;
  footerText: string;
}

export default function ClientBillingKit() {
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [clients] = useState<ClientData[]>([
    {
      id: '1',
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      phone: '+1-555-0123',
      company: 'Acme Corp',
      plan: 'Enterprise',
      amount: 299.99,
      nextBilling: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: '2',
      name: 'TechStart Inc',
      email: 'admin@techstart.io',
      phone: '+1-555-0456',
      company: 'TechStart Inc',
      plan: 'Professional',
      amount: 99.99,
      nextBilling: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'active'
    },
    {
      id: '3',
      name: 'Local Biz LLC',
      email: 'owner@localbiz.com',
      phone: '+1-555-0789',
      company: 'Local Biz LLC',
      plan: 'Starter',
      amount: 29.99,
      nextBilling: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'overdue'
    }
  ]);

  const [invoiceTemplate, setInvoiceTemplate] = useState<InvoiceTemplate>({
    id: '1',
    name: 'Modern Purple',
    primaryColor: '#8B5CF6',
    secondaryColor: '#A78BFA',
    font: 'Inter',
    layout: 'modern',
    headerText: 'INVOICE',
    footerText: 'Thank you for your business!'
  });

  const [qrCodeData, setQrCodeData] = useState({
    clientId: '',
    paymentLink: '',
    accountInfo: ''
  });

  const [digitalWallet, setDigitalWallet] = useState({
    balance: 1250.00,
    rewards: 128,
    tier: 'Premium',
    nextReward: 50
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateInvoice = () => {
    if (!selectedClient) return;
    
    // Simulate invoice generation
    console.log('Generating invoice for:', selectedClient.name);
    
    // In real implementation, this would:
    // 1. Create PDF using invoice template
    // 2. Save to Xano
    // 3. Send notification
  };

  const generateQRCode = () => {
    if (!selectedClient) return;
    
    const qrData = {
      clientId: selectedClient.id,
      paymentLink: `https://pay.recurflow.com/client/${selectedClient.id}`,
      amount: selectedClient.amount,
      dueDate: selectedClient.nextBilling.toISOString()
    };
    
    setQrCodeData({
      clientId: qrData.clientId,
      paymentLink: qrData.paymentLink,
      accountInfo: JSON.stringify(qrData)
    });
  };

  const generateVirtualCard = () => {
    if (!selectedClient) return;
    
    // Simulate virtual card generation
    console.log('Generating virtual card for:', selectedClient.name);
  };

  const StatusBadge = ({ status }: { status: ClientData['status'] }) => {
    const config = {
      active: { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Check },
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
      overdue: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle }
    };
    
    const { color, icon: Icon } = config[status];
    return (
      <Badge className={cn('border', color)}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between animate-slide-up">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Client Billing Kit</h1>
            <p className="text-purple-600/70">Create invoices, ID cards, digital wallets & more</p>
          </div>
          <div className="flex gap-2">
            <Button className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 animate-glow">
              <Upload className="w-4 h-4" />
              Sync to Xano
            </Button>
          </div>
        </div>

        {/* Client Selector */}
        <Card className="glass-card animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-600" />
              Select Client
            </CardTitle>
            <CardDescription>Choose a client to generate billing materials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {clients.map((client) => (
                <Card 
                  key={client.id}
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:scale-105 border-2",
                    selectedClient?.id === client.id 
                      ? "border-purple-500 glass-card animate-glow" 
                      : "border-purple-200 hover:border-purple-400"
                  )}
                  onClick={() => setSelectedClient(client)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <StatusBadge status={client.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-600/70">Plan:</span>
                        <span className="font-medium">{client.plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-600/70">Amount:</span>
                        <span className="font-bold text-purple-700">${client.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-600/70">Next Billing:</span>
                        <span className="font-medium">{client.nextBilling.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedClient && (
          <Tabs defaultValue="invoice" className="space-y-4 animate-slide-up">
            <TabsList className="grid w-full grid-cols-5 glass-card">
              <TabsTrigger value="invoice" className="gap-2">
                <FileText className="w-4 h-4" />
                Invoice Builder
              </TabsTrigger>
              <TabsTrigger value="id-card" className="gap-2">
                <CreditCard className="w-4 h-4" />
                ID Card
              </TabsTrigger>
              <TabsTrigger value="qr-code" className="gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="digital-wallet" className="gap-2">
                <Wallet className="w-4 h-4" />
                Digital Wallet
              </TabsTrigger>
              <TabsTrigger value="virtual-card" className="gap-2">
                <Smartphone className="w-4 h-4" />
                Virtual Card
              </TabsTrigger>
            </TabsList>

            {/* Invoice Builder */}
            <TabsContent value="invoice" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-purple-600" />
                      Invoice Design
                    </CardTitle>
                    <CardDescription>Customize the look and feel of your invoices</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={invoiceTemplate.primaryColor}
                            onChange={(e) => setInvoiceTemplate(prev => ({ ...prev, primaryColor: e.target.value }))}
                            className="w-16 h-10"
                          />
                          <Input
                            value={invoiceTemplate.primaryColor}
                            onChange={(e) => setInvoiceTemplate(prev => ({ ...prev, primaryColor: e.target.value }))}
                            placeholder="#8B5CF6"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={invoiceTemplate.secondaryColor}
                            onChange={(e) => setInvoiceTemplate(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            className="w-16 h-10"
                          />
                          <Input
                            value={invoiceTemplate.secondaryColor}
                            onChange={(e) => setInvoiceTemplate(prev => ({ ...prev, secondaryColor: e.target.value }))}
                            placeholder="#A78BFA"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Layout Style</Label>
                      <Select 
                        value={invoiceTemplate.layout} 
                        onValueChange={(value) => setInvoiceTemplate(prev => ({ ...prev, layout: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Header Text</Label>
                      <Input
                        value={invoiceTemplate.headerText}
                        onChange={(e) => setInvoiceTemplate(prev => ({ ...prev, headerText: e.target.value }))}
                        placeholder="INVOICE"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Footer Text</Label>
                      <Textarea
                        value={invoiceTemplate.footerText}
                        onChange={(e) => setInvoiceTemplate(prev => ({ ...prev, footerText: e.target.value }))}
                        placeholder="Thank you for your business!"
                        className="h-20"
                      />
                    </div>

                    <Button onClick={generateInvoice} className="w-full gap-2 bg-gradient-to-r from-purple-500 to-indigo-600">
                      <FileText className="w-4 h-4" />
                      Generate Invoice
                    </Button>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-600" />
                      Invoice Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="border rounded-lg p-6 min-h-[400px] bg-white"
                      style={{ 
                        borderColor: invoiceTemplate.primaryColor,
                        fontFamily: invoiceTemplate.font 
                      }}
                    >
                      <div className="text-center mb-6">
                        <h1 
                          className="text-2xl font-bold"
                          style={{ color: invoiceTemplate.primaryColor }}
                        >
                          {invoiceTemplate.headerText}
                        </h1>
                        <div className="w-full h-1 bg-gradient-to-r mt-2" 
                             style={{ 
                               backgroundImage: `linear-gradient(to right, ${invoiceTemplate.primaryColor}, ${invoiceTemplate.secondaryColor})` 
                             }} 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="font-semibold mb-2" style={{ color: invoiceTemplate.primaryColor }}>Bill To:</h3>
                          <div className="text-sm space-y-1">
                            <div className="font-medium">{selectedClient.name}</div>
                            <div>{selectedClient.email}</div>
                            <div>{selectedClient.phone}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm space-y-1">
                            <div><span className="font-medium">Invoice #:</span> INV-2024-001</div>
                            <div><span className="font-medium">Date:</span> {new Date().toLocaleDateString()}</div>
                            <div><span className="font-medium">Due:</span> {selectedClient.nextBilling.toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-b py-4 mb-6">
                        <div className="grid grid-cols-4 gap-4 text-sm font-medium mb-2" style={{ color: invoiceTemplate.primaryColor }}>
                          <div>Description</div>
                          <div className="text-center">Qty</div>
                          <div className="text-center">Rate</div>
                          <div className="text-right">Amount</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>{selectedClient.plan} Plan</div>
                          <div className="text-center">1</div>
                          <div className="text-center">${selectedClient.amount}</div>
                          <div className="text-right font-medium">${selectedClient.amount}</div>
                        </div>
                      </div>

                      <div className="text-right mb-6">
                        <div className="text-xl font-bold" style={{ color: invoiceTemplate.primaryColor }}>
                          Total: ${selectedClient.amount}
                        </div>
                      </div>

                      <div className="text-center text-sm text-gray-600">
                        {invoiceTemplate.footerText}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ID Card */}
            <TabsContent value="id-card" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    Client ID Card
                  </CardTitle>
                  <CardDescription>Generate a digital ID card for {selectedClient.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="w-80 h-48 glass-card rounded-xl p-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white relative overflow-hidden animate-float">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-xs opacity-80">CLIENT ID</div>
                            <div className="font-mono text-sm">{selectedClient.id.padStart(8, '0')}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span className="text-xs">{selectedClient.plan}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="font-semibold text-lg">{selectedClient.name}</div>
                          <div className="text-sm opacity-90">{selectedClient.email}</div>
                        </div>
                        
                        <div className="absolute bottom-6 right-6">
                          <div className="text-xs opacity-80">Member Since</div>
                          <div className="text-sm font-medium">2024</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-2 mt-6">
                    <Button variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Download PNG
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600">
                      <Save className="w-4 h-4" />
                      Save to Xano
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* QR Code */}
            <TabsContent value="qr-code" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-purple-600" />
                    Client QR Code
                  </CardTitle>
                  <CardDescription>Generate QR codes for payments and client information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Button onClick={generateQRCode} className="w-full gap-2 bg-gradient-to-r from-purple-500 to-indigo-600">
                        <QrCode className="w-4 h-4" />
                        Generate QR Code
                      </Button>
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Client ID</Label>
                          <Input value={qrCodeData.clientId || selectedClient.id} readOnly />
                        </div>
                        <div>
                          <Label>Payment Link</Label>
                          <div className="flex gap-2">
                            <Input value={qrCodeData.paymentLink} readOnly />
                            <Button size="sm" variant="outline">
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-48 h-48 glass-card rounded-xl flex items-center justify-center mb-4">
                        {qrCodeData.paymentLink ? (
                          <div className="w-40 h-40 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <QrCode className="w-24 h-24 text-white" />
                          </div>
                        ) : (
                          <div className="text-center">
                            <QrCode className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                            <p className="text-sm text-purple-600/70">Generate QR code to preview</p>
                          </div>
                        )}
                      </div>
                      
                      {qrCodeData.paymentLink && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="w-4 h-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Digital Wallet */}
            <TabsContent value="digital-wallet" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-purple-600" />
                    Digital Wallet
                  </CardTitle>
                  <CardDescription>Manage {selectedClient.name}'s digital wallet and rewards</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="w-full h-56 glass-card rounded-xl p-6 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
                        
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <Wallet className="w-6 h-6" />
                              <Badge className="bg-white/20 text-white border-white/30">
                                {digitalWallet.tier}
                              </Badge>
                            </div>
                            <div className="text-2xl font-bold mb-1">
                              ${digitalWallet.balance.toLocaleString()}
                            </div>
                            <div className="text-sm opacity-80">Available Balance</div>
                          </div>
                          
                          <div>
                            <div className="text-sm opacity-80 mb-1">Rewards Points</div>
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4" />
                              <span className="font-semibold">{digitalWallet.rewards}</span>
                              <span className="text-xs opacity-60">• {digitalWallet.nextReward} to next reward</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">Rewards</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-700">{digitalWallet.rewards}</div>
                          <div className="text-xs text-purple-600/70">Points earned</div>
                        </Card>
                        
                        <Card className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">Security</span>
                          </div>
                          <div className="text-sm font-medium text-green-600">Protected</div>
                          <div className="text-xs text-purple-600/70">256-bit encryption</div>
                        </Card>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3">Recent Transactions</h3>
                        <div className="space-y-2">
                          {[
                            { type: 'payment', amount: -selectedClient.amount, desc: 'Monthly subscription', date: 'Today' },
                            { type: 'reward', amount: 25, desc: 'Loyalty bonus', date: 'Yesterday' },
                            { type: 'refund', amount: 15.99, desc: 'Service credit', date: '2 days ago' }
                          ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-3 glass-card rounded-lg">
                              <div>
                                <div className="text-sm font-medium">{tx.desc}</div>
                                <div className="text-xs text-purple-600/70">{tx.date}</div>
                              </div>
                              <div className={cn(
                                "font-bold",
                                tx.amount > 0 ? "text-green-600" : "text-red-600"
                              )}>
                                {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button className="flex-1 gap-2 bg-gradient-to-r from-purple-500 to-indigo-600">
                          <Upload className="w-4 h-4" />
                          Add Funds
                        </Button>
                        <Button variant="outline" className="flex-1 gap-2">
                          <Download className="w-4 h-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Virtual Card */}
            <TabsContent value="virtual-card" className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    Virtual Payment Card
                  </CardTitle>
                  <CardDescription>Generate a virtual payment card for {selectedClient.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-6">
                    <div className="w-96 h-60 glass-card rounded-2xl p-8 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 text-white relative overflow-hidden shadow-2xl animate-float">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
                      <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-18 -translate-x-18"></div>
                      
                      <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div>
                            <Zap className="w-8 h-8" />
                          </div>
                          <div className="text-right">
                            <div className="text-xs opacity-80">Virtual Card</div>
                            <div className="font-semibold">RecurFlow</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="font-mono text-xl tracking-wider">
                            •••• •••• •••• {String(Math.floor(Math.random() * 10000)).padStart(4, '0')}
                          </div>
                          
                          <div className="flex items-end justify-between">
                            <div>
                              <div className="text-xs opacity-80 mb-1">CARDHOLDER NAME</div>
                              <div className="text-sm font-semibold">{selectedClient.name.toUpperCase()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs opacity-80 mb-1">EXPIRES</div>
                              <div className="text-sm font-semibold">
                                {String(new Date().getMonth() + 13).padStart(2, '0')}/{String(new Date().getFullYear() + 3).slice(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 text-center">
                      <Shield className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Secure</div>
                      <div className="text-xs text-purple-600/70">256-bit encryption</div>
                    </Card>
                    
                    <Card className="p-4 text-center">
                      <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Instant</div>
                      <div className="text-xs text-purple-600/70">Ready to use</div>
                    </Card>
                    
                    <Card className="p-4 text-center">
                      <Globe className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <div className="text-sm font-medium">Global</div>
                      <div className="text-xs text-purple-600/70">Worldwide accepted</div>
                    </Card>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    <Button onClick={generateVirtualCard} className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600">
                      <Smartphone className="w-4 h-4" />
                      Generate New Card
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" />
                      Copy Details
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Save className="w-4 h-4" />
                      Save to Xano
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}

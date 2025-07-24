import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Users,
  Building,
  Shield,
  Crown,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Upload,
  Settings,
  Bell,
  Lock,
  Eye,
  Edit,
  Plus,
  Trash2,
  MessageSquare,
  Video,
  CreditCard,
  BarChart,
  Target,
  Award,
  Briefcase,
  Globe,
  Zap,
  Heart,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Officer {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  role: "owner" | "admin" | "manager" | "user";
  permissions: string[];
  lastLogin: Date;
  avatar?: string;
  department: string;
  joinedDate: Date;
  status: "active" | "inactive" | "pending";
}

interface Client {
  id: string;
  companyName: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  foundedYear: number;
  employees: string;
  revenue: string;
  accountStatus: "active" | "trial" | "suspended" | "cancelled";
  subscriptionTier: "basic" | "professional" | "enterprise";
  monthlySpend: number;
  totalSpend: number;
  contractStart: Date;
  contractEnd: Date;
  officers: Officer[];
  documents: Document[];
  billingHistory: BillingRecord[];
  supportTickets: SupportTicket[];
  meetings: Meeting[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedDate: Date;
  category: "contract" | "invoice" | "report" | "compliance" | "other";
  url: string;
}

interface BillingRecord {
  id: string;
  date: Date;
  amount: number;
  description: string;
  status: "paid" | "pending" | "overdue" | "failed";
  invoiceNumber: string;
  paymentMethod: string;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  createdBy: string;
  createdDate: Date;
  assignedTo: string;
  lastUpdate: Date;
}

interface Meeting {
  id: string;
  title: string;
  date: Date;
  duration: number;
  attendees: string[];
  type: "onboarding" | "review" | "support" | "sales" | "training";
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

export default function ClientPortal() {
  const [client, setClient] = useState<Client>({
    id: "1",
    companyName: "Acme Corporation",
    industry: "Technology",
    website: "https://acme.com",
    phone: "+1-555-0123",
    email: "contact@acme.com",
    address: "123 Business St",
    city: "San Francisco",
    state: "CA",
    zip: "94105",
    country: "USA",
    foundedYear: 2015,
    employees: "500-1000",
    revenue: "$50M-$100M",
    accountStatus: "active",
    subscriptionTier: "enterprise",
    monthlySpend: 12500,
    totalSpend: 148000,
    contractStart: new Date("2023-01-01"),
    contractEnd: new Date("2024-12-31"),
    officers: [
      {
        id: "1",
        firstName: "John",
        lastName: "Smith",
        title: "CEO",
        email: "john.smith@acme.com",
        phone: "+1-555-0101",
        role: "owner",
        permissions: ["all"],
        lastLogin: new Date(),
        department: "Executive",
        joinedDate: new Date("2023-01-01"),
        status: "active",
      },
      {
        id: "2",
        firstName: "Sarah",
        lastName: "Johnson",
        title: "CTO",
        email: "sarah.johnson@acme.com",
        phone: "+1-555-0102",
        role: "admin",
        permissions: ["billing", "users", "reports"],
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        department: "Technology",
        joinedDate: new Date("2023-01-15"),
        status: "active",
      },
      {
        id: "3",
        firstName: "Mike",
        lastName: "Rodriguez",
        title: "Marketing Manager",
        email: "mike.rodriguez@acme.com",
        phone: "+1-555-0103",
        role: "manager",
        permissions: ["campaigns", "reports"],
        lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000),
        department: "Marketing",
        joinedDate: new Date("2023-02-01"),
        status: "active",
      },
    ],
    documents: [
      {
        id: "1",
        name: "Service Agreement 2024",
        type: "PDF",
        size: "2.4 MB",
        uploadedBy: "John Smith",
        uploadedDate: new Date("2024-01-01"),
        category: "contract",
        url: "/documents/service-agreement-2024.pdf",
      },
      {
        id: "2",
        name: "January Invoice",
        type: "PDF",
        size: "1.1 MB",
        uploadedBy: "System",
        uploadedDate: new Date("2024-01-31"),
        category: "invoice",
        url: "/documents/invoice-jan-2024.pdf",
      },
    ],
    billingHistory: [
      {
        id: "1",
        date: new Date("2024-01-01"),
        amount: 12500,
        description: "Monthly Enterprise Subscription",
        status: "paid",
        invoiceNumber: "INV-2024-001",
        paymentMethod: "Credit Card ending in 4242",
      },
      {
        id: "2",
        date: new Date("2023-12-01"),
        amount: 12500,
        description: "Monthly Enterprise Subscription",
        status: "paid",
        invoiceNumber: "INV-2023-012",
        paymentMethod: "Credit Card ending in 4242",
      },
    ],
    supportTickets: [
      {
        id: "1",
        title: "API Integration Issue",
        description: "Having trouble with webhook configuration",
        status: "in-progress",
        priority: "high",
        createdBy: "Sarah Johnson",
        createdDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        assignedTo: "Tech Support Team",
        lastUpdate: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    ],
    meetings: [
      {
        id: "1",
        title: "Quarterly Business Review",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        duration: 60,
        attendees: ["John Smith", "Sarah Johnson", "Account Manager"],
        type: "review",
        status: "scheduled",
      },
    ],
  });

  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);
  const [isAddingOfficer, setIsAddingOfficer] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      trial: "bg-blue-100 text-blue-800 border-blue-200",
      suspended: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getRoleIcon = (role: string) => {
    const icons = {
      owner: Crown,
      admin: Shield,
      manager: Star,
      user: Users,
    };
    const Icon = icons[role as keyof typeof icons] || Users;
    return <Icon className="w-4 h-4" />;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      owner: "text-yellow-600",
      admin: "text-purple-600",
      manager: "text-blue-600",
      user: "text-gray-600",
    };
    return colors[role as keyof typeof colors] || colors.user;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                {client.companyName.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {client.companyName}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {client.industry}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    {client.website}
                  </span>
                  <Badge className={getStatusColor(client.accountStatus)}>
                    {client.accountStatus.toUpperCase()}
                  </Badge>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                <Crown className="w-3 h-3 mr-1" />
                {client.subscriptionTier.toUpperCase()}
              </Badge>
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-green-200 dark:border-green-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                Monthly Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                ${client.monthlySpend.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8.2% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Lifetime Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                ${client.totalSpend.toLocaleString()}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                <DollarSign className="w-3 h-3 mr-1" />
                Since {client.contractStart.getFullYear()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Active Officers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {client.officers.filter((o) => o.status === "active").length}
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center mt-1">
                <Users className="w-3 h-3 mr-1" />
                Across {
                  new Set(client.officers.map((o) => o.department)).size
                }{" "}
                departments
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Contract Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                {Math.ceil(
                  (client.contractEnd.getTime() - Date.now()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                days
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                <Calendar className="w-3 h-3 mr-1" />
                Until renewal
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="officers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="officers" className="gap-2">
              <Users className="w-4 h-4" />
              Officers
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Support
            </TabsTrigger>
            <TabsTrigger value="meetings" className="gap-2">
              <Video className="w-4 h-4" />
              Meetings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Officers Tab */}
          <TabsContent value="officers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Company Officers</h2>
              <Button
                onClick={() => setIsAddingOfficer(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Officer
              </Button>
            </div>

            <div className="grid gap-4">
              {client.officers.map((officer) => (
                <Card
                  key={officer.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={officer.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {officer.firstName[0]}
                            {officer.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {officer.firstName} {officer.lastName}
                            <span
                              className={cn(
                                "flex items-center gap-1",
                                getRoleColor(officer.role),
                              )}
                            >
                              {getRoleIcon(officer.role)}
                              <span className="text-sm font-medium">
                                {officer.role.toUpperCase()}
                              </span>
                            </span>
                          </CardTitle>
                          <CardDescription className="flex items-center gap-3">
                            <span>{officer.title}</span>
                            <span>•</span>
                            <span>{officer.department}</span>
                            <span>•</span>
                            <Badge className={getStatusColor(officer.status)}>
                              {officer.status}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Last login: {officer.lastLogin.toLocaleDateString()}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Contact
                        </Label>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3" />
                            {officer.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-3 h-3" />
                            {officer.phone}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Permissions
                        </Label>
                        <div className="flex flex-wrap gap-1">
                          {officer.permissions.slice(0, 3).map((perm) => (
                            <Badge
                              key={perm}
                              variant="outline"
                              className="text-xs"
                            >
                              {perm}
                            </Badge>
                          ))}
                          {officer.permissions.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{officer.permissions.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Joined
                        </Label>
                        <div className="text-sm">
                          {officer.joinedDate.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Billing & Payments</h2>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download Statement
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Plan</span>
                      <Badge className="bg-purple-100 text-purple-700">
                        {client.subscriptionTier.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly</span>
                      <span className="font-semibold">
                        ${client.monthlySpend.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next billing</span>
                      <span>Feb 1, 2024</span>
                    </div>
                    <Button className="w-full">Manage Subscription</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {client.billingHistory.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {record.description}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {record.invoiceNumber} • {record.paymentMethod}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${record.amount.toLocaleString()}
                          </div>
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Documents & Files</h2>
              <Button className="gap-2">
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            </div>

            <div className="grid gap-4">
              {client.documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.type} • {doc.size} • Uploaded by{" "}
                            {doc.uploadedBy} on{" "}
                            {doc.uploadedDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{doc.category}</Badge>
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Support Tickets</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Ticket
              </Button>
            </div>

            <div className="grid gap-4">
              {client.supportTickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {ticket.title}
                        </CardTitle>
                        <CardDescription>
                          Created by {ticket.createdBy} on{" "}
                          {ticket.createdDate.toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            ticket.priority === "urgent" &&
                              "border-red-500 text-red-700",
                            ticket.priority === "high" &&
                              "border-orange-500 text-orange-700",
                            ticket.priority === "medium" &&
                              "border-yellow-500 text-yellow-700",
                            ticket.priority === "low" &&
                              "border-green-500 text-green-700",
                          )}
                        >
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {ticket.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        Assigned to: {ticket.assignedTo}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Last update: {ticket.lastUpdate.toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Meetings Tab */}
          <TabsContent value="meetings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Meetings & Events</h2>
              <Button className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Meeting
              </Button>
            </div>

            <div className="grid gap-4">
              {client.meetings.map((meeting) => (
                <Card key={meeting.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Video className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">{meeting.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {meeting.date.toLocaleDateString()} at{" "}
                            {meeting.date.toLocaleTimeString()} •{" "}
                            {meeting.duration} minutes
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{meeting.type}</Badge>
                        <Badge className={getStatusColor(meeting.status)}>
                          {meeting.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold">Usage Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Usage Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Calls</span>
                      <span className="font-medium">847,231</span>
                    </div>
                    <Progress value={78} />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Data Storage</span>
                      <span className="font-medium">12.4 GB</span>
                    </div>
                    <Progress value={62} />

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Users</span>
                      <span className="font-medium">287</span>
                    </div>
                    <Progress value={91} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      99.8%
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Uptime this month
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold">Response Time</div>
                        <div className="text-muted-foreground">142ms avg</div>
                      </div>
                      <div>
                        <div className="font-semibold">Error Rate</div>
                        <div className="text-muted-foreground">0.02%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

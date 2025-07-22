import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, Database, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

export default function Fulfillment() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text tracking-tight">Fulfillment Center</h1>
            <p className="text-blue-700/70 font-medium">Order processing and delivery management</p>
          </div>
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 corp-shadow">
            <Package className="w-4 h-4" />
            New Order
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">47</div>
              <p className="text-xs text-yellow-600 font-medium">Awaiting fulfillment</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Shipped Today</CardTitle>
              <Truck className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">128</div>
              <p className="text-xs text-blue-600 font-medium">In transit</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">1,247</div>
              <p className="text-xs text-green-600 font-medium">This month</p>
            </CardContent>
          </Card>

          <Card className="glass-card corp-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">Fulfillment Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">94.8%</div>
              <p className="text-xs text-green-600 font-medium">On-time delivery</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 glass-card corp-shadow">
            <TabsTrigger value="orders" className="gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="shipping" className="gap-2">
              <Truck className="w-4 h-4" />
              Shipping
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Database className="w-4 h-4" />
              Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Orders requiring fulfillment action</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { id: 'ORD-001', customer: 'John Smith', items: 3, status: 'pending', priority: 'high' },
                    { id: 'ORD-002', customer: 'Sarah Johnson', items: 1, status: 'processing', priority: 'normal' },
                    { id: 'ORD-003', customer: 'Mike Davis', items: 5, status: 'shipped', priority: 'normal' },
                    { id: 'ORD-004', customer: 'Emily Brown', items: 2, status: 'pending', priority: 'urgent' }
                  ].map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-semibold text-blue-800">{order.id}</div>
                          <div className="text-sm text-blue-600/70">{order.customer}</div>
                        </div>
                        <Badge variant="outline">{order.items} items</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`
                          ${order.priority === 'urgent' ? 'bg-red-100 text-red-700' : ''}
                          ${order.priority === 'high' ? 'bg-orange-100 text-orange-700' : ''}
                          ${order.priority === 'normal' ? 'bg-blue-100 text-blue-700' : ''}
                        `}>
                          {order.priority}
                        </Badge>
                        <Badge className={`
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${order.status === 'processing' ? 'bg-blue-100 text-blue-700' : ''}
                          ${order.status === 'shipped' ? 'bg-green-100 text-green-700' : ''}
                        `}>
                          {order.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          Process
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shipping" className="space-y-4">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <CardTitle>Shipping Management</CardTitle>
                <CardDescription>Track and manage shipments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">UPS</h4>
                      <div className="text-2xl font-bold gradient-text">67</div>
                      <p className="text-xs text-blue-600/70">Active shipments</p>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">FedEx</h4>
                      <div className="text-2xl font-bold gradient-text">34</div>
                      <p className="text-xs text-blue-600/70">Active shipments</p>
                    </Card>
                    <Card className="p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">USPS</h4>
                      <div className="text-2xl font-bold gradient-text">27</div>
                      <p className="text-xs text-blue-600/70">Active shipments</p>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card className="glass-card corp-shadow">
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Monitor stock levels and product availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { sku: 'PRD-001', name: 'Premium Subscription Box', stock: 247, status: 'in-stock' },
                    { sku: 'PRD-002', name: 'Starter Kit Bundle', stock: 12, status: 'low-stock' },
                    { sku: 'PRD-003', name: 'Digital Access Pass', stock: 0, status: 'out-of-stock' },
                    { sku: 'PRD-004', name: 'Annual Membership', stock: 89, status: 'in-stock' }
                  ].map((item) => (
                    <div key={item.sku} className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div>
                        <div className="font-semibold text-blue-800">{item.name}</div>
                        <div className="text-sm text-blue-600/70">{item.sku}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{item.stock} units</span>
                        <Badge className={`
                          ${item.status === 'in-stock' ? 'bg-green-100 text-green-700' : ''}
                          ${item.status === 'low-stock' ? 'bg-yellow-100 text-yellow-700' : ''}
                          ${item.status === 'out-of-stock' ? 'bg-red-100 text-red-700' : ''}
                        `}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

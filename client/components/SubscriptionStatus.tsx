import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  XCircle,
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Subscription {
  id: number;
  user_id: number;
  plan_id: string;
  status: 'active' | 'past_due' | 'canceled';
  amount_cents: number;
  interval: 'monthly' | 'yearly';
  next_bill_at: string;
  retries: number;
  card_last_four: string;
  card_brand: string;
  card_exp_month: number;
  card_exp_year: number;
  created_at: string;
}

interface Transaction {
  id: number;
  amount_cents: number;
  status: 'approved' | 'declined' | 'error';
  response_text: string;
  orderid: string;
  initiator: 'customer' | 'merchant';
  recurring: 'initial' | 'subsequent';
  created_at: string;
}

interface Plan {
  id: string;
  name: string;
  amount_cents: number;
  interval: 'monthly' | 'yearly';
}

interface SubscriptionStatusProps {
  userEmail?: string;
  subscriptionId?: number;
}

export default function SubscriptionStatus({ userEmail, subscriptionId }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Card update form
  const [showUpdateCard, setShowUpdateCard] = useState(false);
  const [updatingCard, setUpdatingCard] = useState(false);
  const [cardForm, setCardForm] = useState({
    ccnumber: '',
    ccexp: '',
    cvv: '',
    zip: ''
  });
  const [showCvv, setShowCvv] = useState(false);
  
  // Cancellation
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, [userEmail, subscriptionId]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError('');

      // For demo, we'll simulate loading subscription data
      // In real implementation, you'd fetch from your API
      const mockSubscription: Subscription = {
        id: 1,
        user_id: 1,
        plan_id: 'plan_monthly_4999',
        status: 'active',
        amount_cents: 4999,
        interval: 'monthly',
        next_bill_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        retries: 0,
        card_last_four: '1234',
        card_brand: 'visa',
        card_exp_month: 12,
        card_exp_year: 2025,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const mockPlan: Plan = {
        id: 'plan_monthly_4999',
        name: 'Premium Monthly',
        amount_cents: 4999,
        interval: 'monthly'
      };

      const mockTransactions: Transaction[] = [
        {
          id: 1,
          amount_cents: 4999,
          status: 'approved',
          response_text: 'Approved',
          orderid: 'MIT-abc123',
          initiator: 'merchant',
          recurring: 'subsequent',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          amount_cents: 4999,
          status: 'approved',
          response_text: 'Approved',
          orderid: 'CIT-def456',
          initiator: 'customer',
          recurring: 'initial',
          created_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setSubscription(mockSubscription);
      setPlan(mockPlan);
      setTransactions(mockTransactions);

    } catch (err: any) {
      setError(err.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleCardInputChange = (field: keyof typeof cardForm, value: string) => {
    let formattedValue = value;

    if (field === 'ccnumber') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    } else if (field === 'ccexp') {
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'zip') {
      formattedValue = value.replace(/\D/g, '').slice(0, 5);
    }

    setCardForm(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleUpdateCard = async () => {
    if (!subscription) return;

    setUpdatingCard(true);
    try {
      const response = await fetch('/api/billing/update-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: subscription.id,
          card: {
            ccnumber: cardForm.ccnumber.replace(/\s/g, ''),
            ccexp: cardForm.ccexp.replace('/', ''),
            cvv: cardForm.cvv,
            zip: cardForm.zip
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update local subscription data
        setSubscription(prev => prev ? {
          ...prev,
          card_last_four: cardForm.ccnumber.slice(-4),
          status: 'active',
          retries: 0
        } : null);
        
        setShowUpdateCard(false);
        setCardForm({ ccnumber: '', ccexp: '', cvv: '', zip: '' });
        
        // Reload data to get fresh state
        await loadSubscriptionData();
      } else {
        setError(result.message || 'Failed to update payment method');
      }

    } catch (err: any) {
      setError(err.message || 'Error updating payment method');
    } finally {
      setUpdatingCard(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription || !confirm('Are you sure you want to cancel your subscription?')) return;

    setCanceling(true);
    try {
      const response = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription_id: subscription.id })
      });

      const result = await response.json();

      if (result.success) {
        setSubscription(prev => prev ? { ...prev, status: 'canceled' } : null);
        await loadSubscriptionData();
      } else {
        setError(result.message || 'Failed to cancel subscription');
      }

    } catch (err: any) {
      setError(err.message || 'Error canceling subscription');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading subscription...</span>
      </div>
    );
  }

  if (!subscription) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>No Subscription Found</CardTitle>
          <CardDescription>
            We couldn't find an active subscription for this account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/checkout'}>
            Start New Subscription
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription Status
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing information
              </CardDescription>
            </div>
            {getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Plan Details */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-600">Current Plan</h4>
              <div className="text-lg font-semibold">{plan?.name}</div>
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(subscription.amount_cents)}
                <span className="text-sm text-gray-500">/{subscription.interval}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-600">Payment Method</h4>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="capitalize">{subscription.card_brand}</span>
                <span>••••{subscription.card_last_four}</span>
              </div>
              <div className="text-sm text-gray-500">
                Expires {subscription.card_exp_month.toString().padStart(2, '0')}/{subscription.card_exp_year}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowUpdateCard(true)}
                className="mt-2"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Update Card
              </Button>
            </div>

            {/* Next Billing */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-600">Next Billing Date</h4>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(subscription.next_bill_at)}</span>
              </div>
              {subscription.retries > 0 && (
                <div className="text-sm text-orange-600">
                  Failed attempts: {subscription.retries}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Transaction History and Account Actions */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="account">Account Actions</TabsTrigger>
        </TabsList>

        {/* Transaction History Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your last 10 billing transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No transactions found</p>
                ) : (
                  transactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionStatusIcon(transaction.status)}
                        <div>
                          <div className="font-medium">
                            {formatAmount(transaction.amount_cents)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(transaction.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={cn(
                          "text-sm font-medium",
                          transaction.status === 'approved' ? "text-green-600" :
                          transaction.status === 'declined' ? "text-red-600" : "text-yellow-600"
                        )}>
                          {transaction.status === 'approved' ? 'Paid' : 
                           transaction.status === 'declined' ? 'Declined' : 'Error'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {transaction.initiator === 'customer' ? 'Manual' : 'Auto'}
                          {transaction.recurring === 'initial' ? ' • Initial' : ' • Recurring'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Actions Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
              <CardDescription>
                Manage your subscription and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscription.status === 'past_due' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Payment Required</AlertTitle>
                  <AlertDescription>
                    Your subscription is past due. Please update your payment method to reactivate your account.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpdateCard(true)}
                  className="h-20 flex-col gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Update Payment Method</span>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/billing-history'}
                  className="h-20 flex-col gap-2"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>View Billing History</span>
                </Button>
              </div>

              {subscription.status !== 'canceled' && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-red-600 mb-2">Danger Zone</h4>
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelSubscription}
                    disabled={canceling}
                  >
                    {canceling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Canceling...
                      </>
                    ) : (
                      'Cancel Subscription'
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    Cancel your subscription. You'll retain access until the next billing date.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Update Card Modal */}
      {showUpdateCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Update Payment Method
              </CardTitle>
              <CardDescription>
                Enter your new payment information securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-ccnumber">Card Number</Label>
                <Input
                  id="new-ccnumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardForm.ccnumber}
                  onChange={(e) => handleCardInputChange('ccnumber', e.target.value)}
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-ccexp">Expiry</Label>
                  <Input
                    id="new-ccexp"
                    placeholder="MM/YY"
                    value={cardForm.ccexp}
                    onChange={(e) => handleCardInputChange('ccexp', e.target.value)}
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-cvv">CVV</Label>
                  <div className="relative">
                    <Input
                      id="new-cvv"
                      type={showCvv ? "text" : "password"}
                      placeholder="123"
                      value={cardForm.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                      maxLength={4}
                      className="pr-8"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-6 w-6 p-0"
                      onClick={() => setShowCvv(!showCvv)}
                    >
                      {showCvv ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-zip">ZIP</Label>
                  <Input
                    id="new-zip"
                    placeholder="12345"
                    value={cardForm.zip}
                    onChange={(e) => handleCardInputChange('zip', e.target.value)}
                    maxLength={5}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpdateCard(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateCard}
                  disabled={updatingCard || !cardForm.ccnumber || !cardForm.ccexp || !cardForm.cvv || !cardForm.zip}
                  className="flex-1"
                >
                  {updatingCard ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Card'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

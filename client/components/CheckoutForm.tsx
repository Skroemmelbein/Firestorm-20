import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Shield,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Lock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  amount_cents: number;
  interval: "monthly" | "yearly";
  is_active: boolean;
}

interface CheckoutFormProps {
  plans?: Plan[];
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

interface CheckoutFormData {
  email: string;
  name: string;
  plan_id: string;
  ccnumber: string;
  ccexp: string;
  cvv: string;
  zip: string;
}

export default function CheckoutForm({
  plans = [],
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: "",
    name: "",
    plan_id: "",
    ccnumber: "",
    ccexp: "",
    cvv: "",
    zip: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Default plans if none provided
  const defaultPlans: Plan[] = [
    {
      id: "plan_monthly_2999",
      name: "Basic Monthly",
      amount_cents: 2999,
      interval: "monthly",
      is_active: true,
    },
    {
      id: "plan_monthly_4999",
      name: "Premium Monthly",
      amount_cents: 4999,
      interval: "monthly",
      is_active: true,
    },
    {
      id: "plan_yearly_29999",
      name: "Basic Yearly",
      amount_cents: 29999,
      interval: "yearly",
      is_active: true,
    },
    {
      id: "plan_yearly_49999",
      name: "Premium Yearly",
      amount_cents: 49999,
      interval: "yearly",
      is_active: true,
    },
  ];

  const availablePlans = plans.length > 0 ? plans : defaultPlans;
  const selectedPlan = availablePlans.find((p) => p.id === formData.plan_id);

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, "");
    // Add spaces every 4 digits
    return digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value: string) => {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, "");
    // Add slash after 2 digits
    if (digitsOnly.length >= 2) {
      return digitsOnly.slice(0, 2) + "/" + digitsOnly.slice(2, 4);
    }
    return digitsOnly;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.plan_id) newErrors.plan_id = "Please select a plan";

    if (!formData.ccnumber) newErrors.ccnumber = "Card number is required";
    else if (formData.ccnumber.replace(/\s/g, "").length < 13)
      newErrors.ccnumber = "Invalid card number";

    if (!formData.ccexp) newErrors.ccexp = "Expiry date is required";
    else if (!/^\d{2}\/\d{2}$/.test(formData.ccexp))
      newErrors.ccexp = "Invalid expiry format (MM/YY)";

    if (!formData.cvv) newErrors.cvv = "CVV is required";
    else if (formData.cvv.length < 3) newErrors.cvv = "Invalid CVV";

    if (!formData.zip) newErrors.zip = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    let formattedValue = value;

    if (field === "ccnumber") {
      formattedValue = formatCardNumber(value);
    } else if (field === "ccexp") {
      formattedValue = formatExpiry(value);
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    } else if (field === "zip") {
      formattedValue = value.replace(/\D/g, "").slice(0, 5);
    }

    setFormData((prev) => ({ ...prev, [field]: formattedValue }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsProcessing(true);
    setResult(null);

    try {
      // Prepare CIT initial charge request
      const requestData = {
        user: {
          email: formData.email,
          name: formData.name,
        },
        plan_id: formData.plan_id,
        card: {
          ccnumber: formData.ccnumber.replace(/\s/g, ""), // Remove spaces
          ccexp: formData.ccexp.replace("/", ""), // Remove slash for NMI format (MMYY)
          cvv: formData.cvv,
          zip: formData.zip,
        },
      };

      console.log("🚀 Processing CIT initial charge...", {
        plan: selectedPlan?.name,
        amount: selectedPlan
          ? formatAmount(selectedPlan.amount_cents)
          : "Unknown",
      });

      const response = await fetch(`${window.location.origin}/api/billing/charge-initial`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        console.log("✅ CIT charge successful:", result);
        setResult(result);
        onSuccess?.(result);
      } else {
        console.error("❌ CIT charge failed:", result);
        setResult(result);
        onError?.(result.message || "Payment failed");
      }
    } catch (error: any) {
      console.error("💥 Checkout error:", error);
      const errorResult = {
        success: false,
        message: error.message || "An unexpected error occurred",
      };
      setResult(errorResult);
      onError?.(errorResult.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (result?.success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-900">Payment Successful!</CardTitle>
          <CardDescription>
            Your subscription has been activated
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium">{selectedPlan?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">
                {selectedPlan ? formatAmount(selectedPlan.amount_cents) : "N/A"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Billing:</span>
              <span className="font-medium">{selectedPlan?.interval}</span>
            </div>
            {result.transaction?.transaction_id && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-mono text-xs">
                  {result.transaction.transaction_id}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setResult(null)}
              className="flex-1"
            >
              New Payment
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => (window.location.href = "/subscription-status")}
            >
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Secure Checkout
        </CardTitle>
        <CardDescription>
          Start your subscription with our secure payment system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Plan Selection */}
          <div className="space-y-2">
            <Label htmlFor="plan">Select Plan</Label>
            <Select
              value={formData.plan_id}
              onValueChange={(value) => handleInputChange("plan_id", value)}
            >
              <SelectTrigger className={cn(errors.plan_id && "border-red-500")}>
                <SelectValue placeholder="Choose your plan" />
              </SelectTrigger>
              <SelectContent>
                {availablePlans
                  .filter((p) => p.is_active)
                  .map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{plan.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {formatAmount(plan.amount_cents)}/{plan.interval}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.plan_id && (
              <p className="text-sm text-red-500">{errors.plan_id}</p>
            )}
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={cn(errors.email && "border-red-500")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ccnumber">Card Number</Label>
              <Input
                id="ccnumber"
                placeholder="1234 5678 9012 3456"
                value={formData.ccnumber}
                onChange={(e) => handleInputChange("ccnumber", e.target.value)}
                maxLength={19} // 16 digits + 3 spaces
                className={cn(errors.ccnumber && "border-red-500")}
              />
              {errors.ccnumber && (
                <p className="text-sm text-red-500">{errors.ccnumber}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ccexp">Expiry</Label>
                <Input
                  id="ccexp"
                  placeholder="MM/YY"
                  value={formData.ccexp}
                  onChange={(e) => handleInputChange("ccexp", e.target.value)}
                  maxLength={5}
                  className={cn(errors.ccexp && "border-red-500")}
                />
                {errors.ccexp && (
                  <p className="text-sm text-red-500">{errors.ccexp}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange("cvv", e.target.value)}
                  maxLength={4}
                  className={cn(errors.cvv && "border-red-500")}
                />
                {errors.cvv && (
                  <p className="text-sm text-red-500">{errors.cvv}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP</Label>
                <Input
                  id="zip"
                  placeholder="12345"
                  value={formData.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  maxLength={5}
                  className={cn(errors.zip && "border-red-500")}
                />
                {errors.zip && (
                  <p className="text-sm text-red-500">{errors.zip}</p>
                )}
              </div>
            </div>
          </div>

          {/* Selected Plan Summary */}
          {selectedPlan && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Order Summary</h4>
              <div className="flex justify-between items-center">
                <span className="text-blue-800">{selectedPlan.name}</span>
                <span className="font-bold text-blue-900">
                  {formatAmount(selectedPlan.amount_cents)}/
                  {selectedPlan.interval}
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Billing starts today, then every {selectedPlan.interval}
              </p>
            </div>
          )}

          {/* Error Display */}
          {result && !result.success && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Payment Failed</AlertTitle>
              <AlertDescription>
                {result.message || "An error occurred processing your payment."}
                {result.transaction?.response_text && (
                  <div className="mt-2 text-sm">
                    Reason: {result.transaction.response_text}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isProcessing || !selectedPlan}
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Pay{" "}
                {selectedPlan ? formatAmount(selectedPlan.amount_cents) : ""}
              </>
            )}
          </Button>

          {/* Security Notice */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Zap className="w-3 h-3" />
              <span>Powered by NMI Secure Payment Processing</span>
            </div>
            <div>256-bit SSL encryption • PCI DSS compliant</div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

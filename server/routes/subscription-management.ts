import express from "express";
import { getXanoClient } from "../../shared/xano-client";

const router = express.Router();

// NMI Configuration
const NMI_CONFIG = {
  gatewayUrl:
    process.env.NMI_GATEWAY_URL || "https://secure.networkmerchants.com/api/transact.php",
  recurringUrl:
    process.env.NMI_RECURRING_URL || "https://secure.networkmerchants.com/api/recurring.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD,
  apiKey: process.env.NMI_API_KEY,
  vaultKey: process.env.NMI_VAULT_KEY,
};

interface CreateSubscriptionRequest {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  paymentMethod: {
    type: "credit_card" | "bank_account";
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    routingNumber?: string;
    accountNumber?: string;
  };
  subscription: {
    planId: string;
    planName: string;
    amount: number;
    frequency: "monthly" | "weekly" | "yearly" | "daily";
    trialDays?: number;
    startDate?: string;
  };
}

/**
 * Create new subscription from UI
 */
router.post("/create", async (req, res) => {
  try {
    const { customer, paymentMethod, subscription }: CreateSubscriptionRequest =
      req.body;

    console.log("🚀 Creating new subscription:", {
      customer: customer.email,
      plan: subscription.planName,
      amount: subscription.amount,
    });

    // Step 1: Create customer in NMI
    const customerParams = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      customer_vault: "add_customer",
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address1: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zip: customer.zip || "",
    });

    // Add payment method to customer
    if (paymentMethod.type === "credit_card") {
      customerParams.append("ccnumber", paymentMethod.cardNumber!);
      customerParams.append(
        "ccexp",
        `${paymentMethod.expiryMonth}${paymentMethod.expiryYear}`,
      );
      customerParams.append("cvv", paymentMethod.cvv!);
    } else if (paymentMethod.type === "bank_account") {
      customerParams.append(
        "checkname",
        `${customer.firstName} ${customer.lastName}`,
      );
      customerParams.append("checkaba", paymentMethod.routingNumber!);
      customerParams.append("checkaccount", paymentMethod.accountNumber!);
      customerParams.append("account_holder_type", "personal");
      customerParams.append("account_type", "checking");
    }

    const customerResponse = await fetch(NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: customerParams.toString(),
    });

    const customerResult = await customerResponse.text();
    const customerParams2 = new URLSearchParams(customerResult);

    if (customerParams2.get("response") !== "1") {
      throw new Error(
        `Customer creation failed: ${customerParams2.get("responsetext")}`,
      );
    }

    const nmiCustomerId = customerParams2.get("customer_vault_id");
    console.log("✅ Customer created in NMI:", nmiCustomerId);

    // Step 2: Create recurring subscription
    const startDate =
      subscription.startDate ||
      new Date().toISOString().split("T")[0].replace(/-/g, "");

    const subscriptionParams = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "add_subscription",
      customer_vault_id: nmiCustomerId!,
      plan_amount: subscription.amount.toString(),
      plan_payments: "0", // 0 = infinite
      plan_id: subscription.planId,
      start_date: startDate,
      day_frequency: getFrequencyDays(subscription.frequency).toString(),
    });

    if (subscription.trialDays && subscription.trialDays > 0) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + subscription.trialDays);
      subscriptionParams.set(
        "start_date",
        trialEndDate.toISOString().split("T")[0].replace(/-/g, ""),
      );
    }

    const subscriptionResponse = await fetch(NMI_CONFIG.recurringUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: subscriptionParams.toString(),
    });

    const subscriptionResult = await subscriptionResponse.text();
    const subscriptionParams2 = new URLSearchParams(subscriptionResult);

    if (subscriptionParams2.get("response") !== "1") {
      throw new Error(
        `Subscription creation failed: ${subscriptionParams2.get("responsetext")}`,
      );
    }

    const nmiSubscriptionId = subscriptionParams2.get("subscription_id");
    console.log("✅ Subscription created in NMI:", nmiSubscriptionId);

    // Step 3: Save to Xano
    const xanoMember = await getXanoClient().createRecord("members", {
      uuid: `member_${Date.now()}`,
      email: customer.email,
      phone: customer.phone,
      first_name: customer.firstName,
      last_name: customer.lastName,
      status: "active",
      membership_type: subscription.planId.includes("premium")
        ? "premium"
        : "basic",
      nmi_customer_id: nmiCustomerId,
      nmi_vault_id: nmiCustomerId,
      subscription_start_date: new Date().toISOString(),
      billing_cycle: subscription.frequency,
      created_at: new Date().toISOString(),
    });

    const xanoSubscription = await getXanoClient().createRecord("subscriptions", {
      member_id: xanoMember.id,
      nmi_subscription_id: nmiSubscriptionId,
      plan_name: subscription.planName,
      plan_id: subscription.planId,
      status: "active",
      amount: subscription.amount,
      currency: "USD",
      billing_cycle: subscription.frequency,
      next_billing_date: new Date(
        Date.now() +
          getFrequencyDays(subscription.frequency) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    // Step 4: Save payment method
    await getXanoClient().createRecord("payment_methods", {
      member_id: xanoMember.id,
      nmi_vault_id: nmiCustomerId,
      type: paymentMethod.type,
      provider: "nmi",
      provider_id: nmiCustomerId,
      last_four: paymentMethod.cardNumber?.slice(-4) || "",
      brand: getCardBrand(paymentMethod.cardNumber),
      exp_month: parseInt(paymentMethod.expiryMonth || "0"),
      exp_year: parseInt(`20${paymentMethod.expiryYear}` || "0"),
      is_default: true,
      is_active: true,
      created_at: new Date().toISOString(),
    });

    console.log("✅ Subscription created successfully in all systems");

    res.json({
      success: true,
      message: "Subscription created successfully",
      subscription: {
        id: xanoSubscription.id,
        nmiSubscriptionId: nmiSubscriptionId,
        nmiCustomerId: nmiCustomerId,
        member: xanoMember,
        subscription: xanoSubscription,
      },
    });
  } catch (error: any) {
    console.error("❌ Subscription creation failed:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create subscription",
    });
  }
});

/**
 * Get all subscriptions
 */
router.get("/list", async (req, res) => {
  try {
    const subscriptions = await getXanoClient().queryRecords("subscriptions", {});

    // Enhance with member data
    const enhancedSubscriptions = await Promise.all(
      subscriptions.map(async (sub: any) => {
        try {
          const member = await getXanoClient().getRecord("members", sub.member_id);
          return {
            ...sub,
            member: {
              name: `${member.first_name} ${member.last_name}`,
              email: member.email,
              phone: member.phone,
            },
          };
        } catch {
          return {
            ...sub,
            member: { name: "Unknown", email: "Unknown", phone: "Unknown" },
          };
        }
      }),
    );

    res.json({
      success: true,
      subscriptions: enhancedSubscriptions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Update subscription status
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, action } = req.body; // action: 'pause', 'resume', 'cancel'

    // Get subscription from Xano
    const subscription = await getXanoClient().getRecord("subscriptions", parseInt(id));

    if (!subscription.nmi_subscription_id) {
      throw new Error("NMI subscription ID not found");
    }

    // Update in NMI
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: `${action}_subscription`,
      subscription_id: subscription.nmi_subscription_id,
    });

    const response = await fetch(NMI_CONFIG.recurringUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    if (resultParams.get("response") !== "1") {
      throw new Error(
        `NMI ${action} failed: ${resultParams.get("responsetext")}`,
      );
    }

    // Update in Xano
    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (action === "pause") updateData.paused_at = new Date().toISOString();
    if (action === "resume") updateData.resumed_at = new Date().toISOString();
    if (action === "cancel") updateData.cancelled_at = new Date().toISOString();

    const updatedSubscription = await getXanoClient().updateRecord(
      "subscriptions",
      parseInt(id),
      updateData,
    );

    res.json({
      success: true,
      message: `Subscription ${action}d successfully`,
      subscription: updatedSubscription,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get subscription analytics
 */
router.get("/analytics", async (req, res) => {
  try {
    const subscriptions = await getXanoClient().queryRecords("subscriptions", {});

    const analytics = {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: subscriptions.filter(
        (s: any) => s.status === "active",
      ).length,
      pausedSubscriptions: subscriptions.filter(
        (s: any) => s.status === "paused",
      ).length,
      cancelledSubscriptions: subscriptions.filter(
        (s: any) => s.status === "cancelled",
      ).length,
      monthlyRevenue: subscriptions
        .filter(
          (s: any) => s.status === "active" && s.billing_cycle === "monthly",
        )
        .reduce((sum: number, s: any) => sum + parseFloat(s.amount || 0), 0),
      yearlyRevenue: subscriptions
        .filter(
          (s: any) => s.status === "active" && s.billing_cycle === "yearly",
        )
        .reduce((sum: number, s: any) => sum + parseFloat(s.amount || 0), 0),
    };

    res.json({
      success: true,
      analytics: analytics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Helper functions
function getFrequencyDays(frequency: string): number {
  switch (frequency) {
    case "daily":
      return 1;
    case "weekly":
      return 7;
    case "monthly":
      return 30;
    case "yearly":
      return 365;
    default:
      return 30;
  }
}

function getCardBrand(cardNumber?: string): string {
  if (!cardNumber) return "unknown";

  const firstDigit = cardNumber.charAt(0);
  const firstTwo = cardNumber.slice(0, 2);

  if (firstDigit === "4") return "visa";
  if (firstTwo >= "51" && firstTwo <= "55") return "mastercard";
  if (firstTwo === "34" || firstTwo === "37") return "amex";
  if (firstTwo === "60" || firstTwo === "65") return "discover";

  return "unknown";
}

export default router;

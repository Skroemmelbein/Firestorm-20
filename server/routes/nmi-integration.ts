import express from "express";
import { getConvexClient } from "../../shared/convex-client";
import nmiTestPaymentRouter from "./nmi-test-payment";

const router = express.Router();

// NMI Configuration
const NMI_CONFIG = {
  gatewayUrl:
    process.env.NMI_GATEWAY_URL || "https://secure.nmi.com/api/transact.php",
  recurringUrl:
    process.env.NMI_RECURRING_URL || "https://secure.nmi.com/api/recurring.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD,
  apiKey: process.env.NMI_API_KEY, // Main API key for transactions
  vaultKey: process.env.NMI_VAULT_KEY, // Vault-specific key
  recurringVaultId: process.env.NMI_RECURRING_VAULT_ID,
};

interface NMICustomer {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface NMISubscription {
  planId: string;
  amount: number;
  frequency: "monthly" | "weekly" | "yearly" | "daily";
  startDate: string;
  trialDays?: number;
  description: string;
}

interface NMIPaymentMethod {
  type: "credit_card" | "bank_account";
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  routingNumber?: string;
  accountNumber?: string;
}

class NMIRecurringAPI {
  /**
   * Create customer in NMI vault
   */
  async createCustomer(customer: NMICustomer): Promise<any> {
    const params = new URLSearchParams({
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

    const response = await fetch(NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    if (resultParams.get("response") === "1") {
      return {
        success: true,
        customerId: resultParams.get("customer_vault_id"),
        customerVaultId: resultParams.get("customer_vault_id"),
      };
    } else {
      throw new Error(
        `NMI Customer creation failed: ${resultParams.get("responsetext")}`,
      );
    }
  }

  /**
   * Add payment method to customer vault
   */
  async addPaymentMethod(
    customerId: string,
    paymentMethod: NMIPaymentMethod,
  ): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      customer_vault: "add_customer",
      customer_vault_id: customerId,
    });

    if (paymentMethod.type === "credit_card") {
      params.append("ccnumber", paymentMethod.cardNumber!);
      params.append(
        "ccexp",
        `${paymentMethod.expiryMonth}${paymentMethod.expiryYear}`,
      );
      params.append("cvv", paymentMethod.cvv!);
    } else if (paymentMethod.type === "bank_account") {
      params.append("checkname", "Bank Account");
      params.append("checkaba", paymentMethod.routingNumber!);
      params.append("checkaccount", paymentMethod.accountNumber!);
      params.append("account_holder_type", "personal");
      params.append("account_type", "checking");
    }

    const response = await fetch(NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    if (resultParams.get("response") === "1") {
      return {
        success: true,
        customerId: resultParams.get("customer_vault_id"),
        transactionId: resultParams.get("transactionid"),
      };
    } else {
      throw new Error(
        `NMI Payment method failed: ${resultParams.get("responsetext")}`,
      );
    }
  }

  /**
   * Create recurring subscription
   */
  async createSubscription(
    customerId: string,
    subscription: NMISubscription,
  ): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "add_subscription",
      customer_vault_id: customerId,
      plan_amount: subscription.amount.toString(),
      plan_payments: "0", // 0 = infinite
      plan_id: subscription.planId,
      start_date: subscription.startDate,
      day_frequency: this.getFrequencyDays(subscription.frequency).toString(),
    });

    if (subscription.trialDays && subscription.trialDays > 0) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + subscription.trialDays);
      params.set(
        "start_date",
        trialEndDate.toISOString().split("T")[0].replace(/-/g, ""),
      );
    }

    const response = await fetch(NMI_CONFIG.recurringUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    if (resultParams.get("response") === "1") {
      return {
        success: true,
        subscriptionId: resultParams.get("subscription_id"),
        customerId: customerId,
        planId: subscription.planId,
        amount: subscription.amount,
        frequency: subscription.frequency,
        startDate: subscription.startDate,
        status: "active",
      };
    } else {
      throw new Error(
        `NMI Subscription creation failed: ${resultParams.get("responsetext")}`,
      );
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    updates: Partial<NMISubscription>,
  ): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "update_subscription",
      subscription_id: subscriptionId,
    });

    if (updates.amount) {
      params.append("plan_amount", updates.amount.toString());
    }

    if (updates.frequency) {
      params.append(
        "day_frequency",
        this.getFrequencyDays(updates.frequency).toString(),
      );
    }

    const response = await fetch(NMI_CONFIG.recurringUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    if (resultParams.get("response") === "1") {
      return {
        success: true,
        subscriptionId: subscriptionId,
        message: "Subscription updated successfully",
      };
    } else {
      throw new Error(
        `NMI Subscription update failed: ${resultParams.get("responsetext")}`,
      );
    }
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(subscriptionId: string): Promise<any> {
    return this.manageSubscription(subscriptionId, "pause_subscription");
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<any> {
    return this.manageSubscription(subscriptionId, "resume_subscription");
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<any> {
    return this.manageSubscription(subscriptionId, "delete_subscription");
  }

  private async manageSubscription(
    subscriptionId: string,
    action: string,
  ): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: action,
      subscription_id: subscriptionId,
    });

    const response = await fetch(NMI_CONFIG.recurringUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    if (resultParams.get("response") === "1") {
      return {
        success: true,
        subscriptionId: subscriptionId,
        action: action,
        message: `Subscription ${action} successful`,
      };
    } else {
      throw new Error(
        `NMI ${action} failed: ${resultParams.get("responsetext")}`,
      );
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "query_subscription",
      subscription_id: subscriptionId,
    });

    const response = await fetch(NMI_CONFIG.recurringUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    if (resultParams.get("response") === "1") {
      return {
        success: true,
        subscriptionId: subscriptionId,
        status: resultParams.get("subscription_status"),
        amount: parseFloat(resultParams.get("plan_amount") || "0"),
        nextBilling: resultParams.get("next_charge_date"),
        customerId: resultParams.get("customer_vault_id"),
        planId: resultParams.get("plan_id"),
      };
    } else {
      throw new Error(
        `NMI Query subscription failed: ${resultParams.get("responsetext")}`,
      );
    }
  }

  private getFrequencyDays(frequency: string): number {
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
}

const nmiAPI = new NMIRecurringAPI();

// API Routes

/**
 * Test NMI connection
 */
router.post("/test-connection", async (req, res) => {
  try {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      type: "validate",
    });

    const response = await fetch(NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    if (resultParams.get("response") === "1" || response.ok) {
      res.json({
        success: true,
        status: "connected",
        message: "NMI connection successful",
      });
    } else {
      res.status(400).json({
        success: false,
        status: "error",
        message: "NMI connection failed",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: "error",
      message: error.message,
    });
  }
});

/**
 * Create customer and subscription
 */
router.post("/create-subscription", async (req, res) => {
  try {
    const { customer, subscription, paymentMethod } = req.body;

    // 1. Create customer in NMI
    const nmiCustomer = await nmiAPI.createCustomer(customer);
    const customerId = nmiCustomer.customerId;

    // 2. Add payment method
    await nmiAPI.addPaymentMethod(customerId, paymentMethod);

    // 3. Create subscription
    const nmiSubscription = await nmiAPI.createSubscription(
      customerId,
      subscription,
    );

    // 4. Save to Convex
    const xanoCustomer = await getConvexClient().createRecord("members", {
      ...customer,
      nmi_customer_id: customerId,
      subscription_status: "active",
      created_at: new Date().toISOString(),
    });

    const xanoSubscription = await getConvexClient().createRecord("subscriptions", {
      member_id: xanoCustomer.id,
      nmi_subscription_id: nmiSubscription.subscriptionId,
      plan_id: subscription.planId,
      amount: subscription.amount,
      frequency: subscription.frequency,
      status: "active",
      next_billing_date: nmiSubscription.startDate,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      customer: xanoCustomer,
      subscription: xanoSubscription,
      nmi: {
        customerId: customerId,
        subscriptionId: nmiSubscription.subscriptionId,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Update subscription
 */
router.patch("/subscription/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get subscription from Convex
    const xanoSubscription = await getConvexClient().getRecord("subscriptions", id);

    // Update in NMI
    await nmiAPI.updateSubscription(
      xanoSubscription.nmi_subscription_id,
      updates,
    );

    // Update in Convex
    const updatedSubscription = await getConvexClient().updateRecord(
      "subscriptions",
      id,
      {
        ...updates,
        updated_at: new Date().toISOString(),
      },
    );

    res.json({
      success: true,
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
 * Pause subscription
 */
router.post("/subscription/:id/pause", async (req, res) => {
  try {
    const { id } = req.params;

    // Get subscription from Convex
    const xanoSubscription = await getConvexClient().getRecord("subscriptions", id);

    // Pause in NMI
    await nmiAPI.pauseSubscription(xanoSubscription.nmi_subscription_id);

    // Update in Convex
    const updatedSubscription = await getConvexClient().updateRecord(
      "subscriptions",
      id,
      {
        status: "paused",
        paused_at: new Date().toISOString(),
      },
    );

    res.json({
      success: true,
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
 * Resume subscription
 */
router.post("/subscription/:id/resume", async (req, res) => {
  try {
    const { id } = req.params;

    // Get subscription from Convex
    const xanoSubscription = await getConvexClient().getRecord("subscriptions", id);

    // Resume in NMI
    await nmiAPI.resumeSubscription(xanoSubscription.nmi_subscription_id);

    // Update in Convex
    const updatedSubscription = await getConvexClient().updateRecord(
      "subscriptions",
      id,
      {
        status: "active",
        resumed_at: new Date().toISOString(),
      },
    );

    res.json({
      success: true,
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
 * Cancel subscription
 */
router.post("/subscription/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;

    // Get subscription from Convex
    const xanoSubscription = await getConvexClient().getRecord("subscriptions", id);

    // Cancel in NMI
    await nmiAPI.cancelSubscription(xanoSubscription.nmi_subscription_id);

    // Update in Convex
    const updatedSubscription = await getConvexClient().updateRecord(
      "subscriptions",
      id,
      {
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      },
    );

    res.json({
      success: true,
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
 * NMI Webhook handler for payment notifications
 */
router.post("/webhook/payment-notification", async (req, res) => {
  try {
    const {
      response,
      subscription_id,
      customer_vault_id,
      transactionid,
      amount,
      response_code,
      responsetext,
      type,
    } = req.body;

    // Find subscription in Convex
    const subscriptions = await getConvexClient().queryRecords("subscriptions", {
      nmi_subscription_id: subscription_id,
    });

    if (subscriptions.length === 0) {
      res
        .status(404)
        .json({ success: false, message: "Subscription not found" });
      return;
    }

    const subscription = subscriptions[0];

    // Create transaction record
    await getConvexClient().createRecord("transactions", {
      member_id: subscription.member_id,
      subscription_id: subscription.id,
      nmi_transaction_id: transactionid,
      amount: parseFloat(amount),
      status: response === "1" ? "completed" : "failed",
      response_code: response_code,
      response_text: responsetext,
      transaction_type: type || "subscription_payment",
      processed_at: new Date().toISOString(),
    });

    // Update subscription status if payment failed
    if (response !== "1") {
      await getConvexClient().updateRecord("subscriptions", subscription.id, {
        status: "past_due",
        last_failed_payment: new Date().toISOString(),
      });
    } else {
      // Payment successful - update next billing date
      const nextBilling = new Date();
      if (subscription.frequency === "monthly") {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
      } else if (subscription.frequency === "yearly") {
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      }

      await getConvexClient().updateRecord("subscriptions", subscription.id, {
        status: "active",
        next_billing_date: nextBilling.toISOString(),
        last_successful_payment: new Date().toISOString(),
      });
    }

    res.json({ success: true, message: "Webhook processed" });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Sync all subscriptions from NMI
 */
router.post("/sync-subscriptions", async (req, res) => {
  try {
    // Get all active subscriptions from Xano
    const subscriptions = await getConvexClient().queryRecords("subscriptions", {
      status: ["active", "past_due", "paused"],
    });

    const syncResults = [];

    for (const subscription of subscriptions) {
      try {
        // Get current status from NMI
        const nmiStatus = await nmiAPI.getSubscription(
          subscription.nmi_subscription_id,
        );

        // Update Xano if status changed
        if (nmiStatus.status !== subscription.status) {
          await getConvexClient().updateRecord("subscriptions", subscription.id, {
            status: nmiStatus.status,
            amount: nmiStatus.amount,
            next_billing_date: nmiStatus.nextBilling,
            synced_at: new Date().toISOString(),
          });
        }

        syncResults.push({
          subscriptionId: subscription.id,
          status: "synced",
          nmiStatus: nmiStatus.status,
        });
      } catch (error: any) {
        syncResults.push({
          subscriptionId: subscription.id,
          status: "error",
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      totalSynced: syncResults.filter((r) => r.status === "synced").length,
      totalErrors: syncResults.filter((r) => r.status === "error").length,
      results: syncResults,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Mount test payment routes
router.use("/", nmiTestPaymentRouter);

export default router;

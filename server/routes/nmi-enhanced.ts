import express from "express";
import { getConvexClient } from "../../shared/convex-client";
import fetch from "node-fetch";

const router = express.Router();

const NMI_CONFIG = {
  gatewayUrl: process.env.NMI_API_URL || "https://secure.networkmerchants.com/api/transact.php",
  recurringUrl: process.env.NMI_RECURRING_URL || "https://secure.networkmerchants.com/api/recurring.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD,
  webhookSecret: process.env.NMI_WEBHOOK_SECRET || "default_webhook_secret",
  descriptorBase: process.env.DESCRIPTOR_BASE || "ECHELONX",
  retryBackoffHours: (process.env.RETRY_BACKOFF_HOURS || "12,36,72").split(",").map(h => parseInt(h)),
  maxRetries: parseInt(process.env.MAX_RETRIES || "3"),
};

interface CustomerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
}

interface PaymentMethodDetails {
  type: "credit_card" | "bank_account";
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  routingNumber?: string;
  accountNumber?: string;
  accountType?: "checking" | "savings";
}

class EnhancedNMIAPI {
  async createCustomerWithVault(customer: CustomerDetails, paymentMethod: PaymentMethodDetails): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      customer_vault: "add_customer",
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
    });

    if (customer.phone) params.append("phone", customer.phone);
    
    if (customer.address) {
      params.append("address1", customer.address.street1);
      if (customer.address.street2) params.append("address2", customer.address.street2);
      params.append("city", customer.address.city);
      params.append("state", customer.address.state);
      params.append("zip", customer.address.zipCode);
      params.append("country", customer.address.country || "US");
    }

    if (paymentMethod.type === "credit_card") {
      params.append("ccnumber", paymentMethod.cardNumber!);
      params.append("ccexp", `${paymentMethod.expiryMonth}${paymentMethod.expiryYear}`);
      params.append("cvv", paymentMethod.cvv!);
    } else if (paymentMethod.type === "bank_account") {
      params.append("checkaba", paymentMethod.routingNumber!);
      params.append("checkaccount", paymentMethod.accountNumber!);
      params.append("account_type", paymentMethod.accountType || "checking");
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
        authCode: resultParams.get("authcode"),
      };
    } else {
      throw new Error(`NMI Customer creation failed: ${resultParams.get("responsetext")}`);
    }
  }

  async processOneTimePayment(customerId: string, amount: number, description?: string): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      type: "sale",
      customer_vault_id: customerId,
      amount: amount.toFixed(2),
      orderid: `ORDER_${Date.now()}`,
    });

    if (description) params.append("orderdescription", description);

    const response = await fetch(NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    return {
      success: resultParams.get("response") === "1",
      transactionId: resultParams.get("transactionid"),
      authCode: resultParams.get("authcode"),
      amount: amount,
      responseText: resultParams.get("responsetext"),
      responseCode: resultParams.get("response_code"),
    };
  }

  async createRecurringSubscription(
    customerId: string,
    planId: string,
    amount: number,
    frequency: "monthly" | "weekly" | "daily",
    startDate?: Date
  ): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "add_subscription",
      customer_vault_id: customerId,
      plan_id: planId,
      plan_amount: amount.toFixed(2),
      day_frequency: this.getFrequencyDays(frequency).toString(),
    });

    if (startDate) {
      params.append("start_date", startDate.toISOString().split('T')[0]);
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
        planId: planId,
        amount: amount,
        frequency: frequency,
      };
    } else {
      throw new Error(`NMI Subscription creation failed: ${resultParams.get("responsetext")}`);
    }
  }

  async refundTransaction(transactionId: string, amount?: number): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      type: "refund",
      transactionid: transactionId,
    });

    if (amount) {
      params.append("amount", amount.toFixed(2));
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
        refundTransactionId: resultParams.get("transactionid"),
        originalTransactionId: transactionId,
        refundAmount: amount || "full",
      };
    } else {
      throw new Error(`NMI Refund failed: ${resultParams.get("responsetext")}`);
    }
  }

  async pauseSubscription(subscriptionId: string): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "pause_subscription",
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
        status: "paused",
      };
    } else {
      throw new Error(`NMI Subscription pause failed: ${resultParams.get("responsetext")}`);
    }
  }

  async resumeSubscription(subscriptionId: string): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "resume_subscription",
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
        status: "active",
      };
    } else {
      throw new Error(`NMI Subscription resume failed: ${resultParams.get("responsetext")}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "cancel_subscription",
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
        status: "canceled",
      };
    } else {
      throw new Error(`NMI Subscription cancellation failed: ${resultParams.get("responsetext")}`);
    }
  }

  async getSubscriptionStatus(subscriptionId: string): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "get_subscription",
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
        status: resultParams.get("status"),
        amount: parseFloat(resultParams.get("amount") || "0"),
        nextBillDate: resultParams.get("next_bill_date"),
        customerId: resultParams.get("customer_vault_id"),
      };
    } else {
      throw new Error(`NMI Subscription status check failed: ${resultParams.get("responsetext")}`);
    }
  }

  async updatePaymentMethod(customerId: string, paymentMethod: PaymentMethodDetails): Promise<any> {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      customer_vault: "update_customer",
      customer_vault_id: customerId,
    });

    if (paymentMethod.type === "credit_card") {
      params.append("ccnumber", paymentMethod.cardNumber!);
      params.append("ccexp", `${paymentMethod.expiryMonth}${paymentMethod.expiryYear}`);
      params.append("cvv", paymentMethod.cvv!);
    } else if (paymentMethod.type === "bank_account") {
      params.append("checkaba", paymentMethod.routingNumber!);
      params.append("checkaccount", paymentMethod.accountNumber!);
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
        customerId: customerId,
        transactionId: resultParams.get("transactionid"),
        authCode: resultParams.get("authcode"),
      };
    } else {
      throw new Error(`NMI Payment method update failed: ${resultParams.get("responsetext")}`);
    }
  }

  async processRetryPayment(subscriptionId: string, retryAttempt: number): Promise<any> {
    try {
      const subscriptionStatus = await this.getSubscriptionStatus(subscriptionId);
      
      if (subscriptionStatus.status === "canceled") {
        throw new Error("Cannot retry payment for canceled subscription");
      }

      const params = new URLSearchParams({
        username: NMI_CONFIG.username!,
        password: NMI_CONFIG.password!,
        recurring: "process_subscription",
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
          transactionId: resultParams.get("transactionid"),
          amount: parseFloat(resultParams.get("amount") || "0"),
          retryAttempt: retryAttempt,
          status: "processed",
        };
      } else {
        return {
          success: false,
          subscriptionId: subscriptionId,
          error: resultParams.get("responsetext"),
          retryAttempt: retryAttempt,
          status: "failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        subscriptionId: subscriptionId,
        error: error.message,
        retryAttempt: retryAttempt,
        status: "error",
      };
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', NMI_CONFIG.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  private getFrequencyDays(frequency: string): number {
    switch (frequency) {
      case "daily": return 1;
      case "weekly": return 7;
      case "monthly": return 30;
      default: return 30;
    }
  }
}

const enhancedNMIAPI = new EnhancedNMIAPI();

router.post("/enhanced/create-customer", async (req, res) => {
  try {
    const { customer, paymentMethod } = req.body;

    if (!customer || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: customer, paymentMethod",
      });
    }

    const result = await enhancedNMIAPI.createCustomerWithVault(customer, paymentMethod);

    // Log to Convex
    await getConvexClient().createRecord("nmi_customers", {
      nmi_customer_id: result.customerId,
      email: customer.email,
      first_name: customer.firstName,
      last_name: customer.lastName,
      phone: customer.phone,
      created_at: new Date().toISOString(),
      status: "active",
    });

    res.json({
      success: true,
      message: "Customer created successfully",
      result: result,
    });
  } catch (error: any) {
    console.error("Enhanced NMI customer creation error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/enhanced/one-time-payment", async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: customerId, amount",
      });
    }

    const result = await enhancedNMIAPI.processOneTimePayment(
      customerId,
      parseFloat(amount),
      description || "One-time payment"
    );

    // Log to Convex
    await getConvexClient().createRecord("nmi_transactions", {
      nmi_transaction_id: result.transactionId,
      nmi_customer_id: customerId,
      amount: parseFloat(amount),
      description: description,
      status: result.success ? "approved" : "declined",
      auth_code: result.authCode,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: result.success ? "Payment processed successfully" : "Payment declined",
      result: result,
    });
  } catch (error: any) {
    console.error("Enhanced NMI one-time payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/enhanced/create-subscription", async (req, res) => {
  try {
    const { customerId, planId, amount, frequency, startDate } = req.body;

    if (!customerId || !planId || !amount || !frequency) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: customerId, planId, amount, frequency",
      });
    }

    const result = await enhancedNMIAPI.createRecurringSubscription(
      customerId,
      planId,
      parseFloat(amount),
      frequency,
      startDate ? new Date(startDate) : undefined
    );

    // Log to Convex
    await getConvexClient().createRecord("nmi_subscriptions", {
      nmi_subscription_id: result.subscriptionId,
      nmi_customer_id: customerId,
      plan_id: planId,
      amount: parseFloat(amount),
      frequency: frequency,
      status: "active",
      created_at: new Date().toISOString(),
      next_bill_date: startDate || new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Subscription created successfully",
      result: result,
    });
  } catch (error: any) {
    console.error("Enhanced NMI subscription creation error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/enhanced/refund", async (req, res) => {
  try {
    const { transactionId, amount } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: transactionId",
      });
    }

    const result = await enhancedNMIAPI.refundTransaction(
      transactionId,
      amount ? parseFloat(amount) : undefined
    );

    // Log to Convex
    await getConvexClient().createRecord("nmi_transactions", {
      nmi_transaction_id: result.transactionId,
      original_transaction_id: transactionId,
      amount: amount ? parseFloat(amount) : result.amount,
      type: "refund",
      status: result.success ? "approved" : "declined",
      auth_code: result.authCode,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: result.success ? "Refund processed successfully" : "Refund failed",
      result: result,
    });
  } catch (error: any) {
    console.error("Enhanced NMI refund error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/enhanced/pause-subscription", async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: subscriptionId",
      });
    }

    const result = await enhancedNMIAPI.pauseSubscription(subscriptionId);

    await getConvexClient().updateRecord("nmi_subscriptions", subscriptionId, {
      status: "paused",
      paused_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Subscription paused successfully",
      result: result,
    });
  } catch (error: any) {
    console.error("Enhanced NMI pause subscription error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/enhanced/resume-subscription", async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: subscriptionId",
      });
    }

    const result = await enhancedNMIAPI.resumeSubscription(subscriptionId);

    await getConvexClient().updateRecord("nmi_subscriptions", subscriptionId, {
      status: "active",
      resumed_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Subscription resumed successfully",
      result: result,
    });
  } catch (error: any) {
    console.error("Enhanced NMI resume subscription error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/enhanced/cancel-subscription", async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: subscriptionId",
      });
    }

    const result = await enhancedNMIAPI.cancelSubscription(subscriptionId);

    await getConvexClient().updateRecord("nmi_subscriptions", subscriptionId, {
      status: "canceled",
      canceled_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Subscription canceled successfully",
      result: result,
    });
  } catch (error: any) {
    console.error("Enhanced NMI cancel subscription error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get("/enhanced/subscription-status/:subscriptionId", async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const result = await enhancedNMIAPI.getSubscriptionStatus(subscriptionId);

    res.json({
      success: true,
      message: "Subscription status retrieved successfully",
      result: result,
    });
  } catch (error: any) {
    console.error("Enhanced NMI subscription status error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/enhanced/update-payment-method", async (req, res) => {
  try {
    const { customerId, paymentMethod } = req.body;

    if (!customerId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: customerId, paymentMethod",
      });
    }

    const result = await enhancedNMIAPI.updatePaymentMethod(customerId, paymentMethod);

    // Log to Xano
    await getConvexClient().createRecord("nmi_payment_methods", {
      nmi_customer_id: customerId,
      payment_method_type: paymentMethod.type,
      last_four: paymentMethod.cardNumber?.slice(-4) || paymentMethod.accountNumber?.slice(-4),
      updated_at: new Date().toISOString(),
      status: "active",
    });

    res.json({
      success: true,
      message: "Payment method updated successfully",
      result: result,
    });
  } catch (error: any) {
    console.error("Enhanced NMI update payment method error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/enhanced/retry-payment", async (req, res) => {
  try {
    const { subscriptionId, retryAttempt } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field: subscriptionId",
      });
    }

    const result = await enhancedNMIAPI.processRetryPayment(
      subscriptionId,
      retryAttempt || 1
    );

    // Log to Xano
    await getConvexClient().createRecord("nmi_retry_attempts", {
      nmi_subscription_id: subscriptionId,
      retry_attempt: retryAttempt || 1,
      status: result.success ? "success" : "failed",
      error_message: result.error,
      created_at: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: result.success ? "Retry payment processed successfully" : "Retry payment failed",
      result: result,
    });
  } catch (error: any) {
    console.error("Enhanced NMI retry payment error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/enhanced/webhook", async (req, res) => {
  try {
    const signature = req.headers['x-nmi-signature'] as string;
    const payload = JSON.stringify(req.body);

    if (!enhancedNMIAPI.verifyWebhookSignature(payload, signature)) {
      return res.status(401).json({
        success: false,
        error: "Invalid webhook signature",
      });
    }

    const { event_type, subscription_id, transaction_id, customer_vault_id, amount, status } = req.body;

    await getConvexClient().createRecord("nmi_webhook_events", {
      event_type: event_type,
      nmi_subscription_id: subscription_id,
      nmi_transaction_id: transaction_id,
      nmi_customer_id: customer_vault_id,
      amount: amount ? parseFloat(amount) : null,
      status: status,
      payload: payload,
      processed_at: new Date().toISOString(),
    });

    switch (event_type) {
      case 'subscription_payment_success':
        await getConvexClient().createRecord("nmi_transactions", {
          nmi_transaction_id: transaction_id,
          nmi_subscription_id: subscription_id,
          nmi_customer_id: customer_vault_id,
          amount: parseFloat(amount),
          type: "subscription_payment",
          status: "approved",
          created_at: new Date().toISOString(),
        });
        break;

      case 'subscription_payment_failed':
        await getConvexClient().createRecord("nmi_transactions", {
          nmi_transaction_id: transaction_id,
          nmi_subscription_id: subscription_id,
          nmi_customer_id: customer_vault_id,
          amount: parseFloat(amount),
          type: "subscription_payment",
          status: "declined",
          created_at: new Date().toISOString(),
        });
        break;

      case 'subscription_canceled':
        await getConvexClient().updateRecord("nmi_subscriptions", subscription_id, {
          status: "canceled",
          canceled_at: new Date().toISOString(),
        });
        break;
    }

    res.json({
      success: true,
      message: "Webhook processed successfully",
    });
  } catch (error: any) {
    console.error("Enhanced NMI webhook error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;

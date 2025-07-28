import express from "express";
import fetch from "node-fetch";
import { getXanoClient } from "../../shared/xano-client";

const router = express.Router();

// Configuration from environment or secure storage
const XANO_CONFIG = {
  instanceUrl: process.env.XANO_INSTANCE_URL || "https://your-instance.xano.io",
  apiKey: process.env.XANO_API_KEY,
  databaseId: process.env.XANO_DATABASE_ID,
};

const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || "ACf1f39d9f653df3669fa99343e88b2074",
  authToken:
    process.env.TWILIO_AUTH_TOKEN || "1f9a48e4dcd9c518889e148fe931e226",
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || "+18559600037",
};

const NMI_CONFIG = {
  gatewayUrl:
    process.env.NMI_GATEWAY_URL || "https://secure.nmi.com/api/transact.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD,
  recurringVaultUrl:
    process.env.NMI_RECURRING_VAULT_URL ||
    "https://secure.nmi.com/api/recurring.php",
};

// XANO API Functions
class XanoAPI {
  private async makeRequest(
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
    data?: any,
  ) {
    const url = `${XANO_CONFIG.instanceUrl}/api:${XANO_CONFIG.databaseId}${endpoint}`;

    const options: any = {
      method,
      headers: {
        Authorization: `Bearer ${XANO_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
    };

    if (data && method !== "GET") {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(
        `Xano API error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  async getCustomers(filters?: any) {
    return this.makeRequest("/customers", "GET");
  }

  async createCustomer(customerData: any) {
    return this.makeRequest("/customers", "POST", customerData);
  }

  async updateCustomer(id: number, data: any) {
    return this.makeRequest(`/customers/${id}`, "PATCH", data);
  }

  async getCampaigns() {
    return this.makeRequest("/campaigns", "GET");
  }

  async createCampaign(campaignData: any) {
    return this.makeRequest("/campaigns", "POST", campaignData);
  }

  async getLeadJourney(customerId: number) {
    return this.makeRequest(`/lead-journeys?customer_id=${customerId}`, "GET");
  }

  async updateLeadJourney(customerId: number, journeyData: any) {
    return this.makeRequest("/lead-journeys", "POST", {
      customer_id: customerId,
      ...journeyData,
    });
  }

  async getRecurringSubscriptions() {
    return this.makeRequest("/recurring-subscriptions", "GET");
  }

  async createRecurringSubscription(subscriptionData: any) {
    return this.makeRequest(
      "/recurring-subscriptions",
      "POST",
      subscriptionData,
    );
  }
}

// Twilio API Functions
class TwilioAPI {
  private client: any;

  constructor() {
    // In production, use proper Twilio SDK
    this.client = {
      accountSid: TWILIO_CONFIG.accountSid,
      authToken: TWILIO_CONFIG.authToken,
    };
  }

  async sendSMS(to: string, message: string, campaignId?: string) {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.client.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.client.accountSid}:${this.client.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_CONFIG.phoneNumber,
          To: to,
          Body: message,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Twilio SMS error: ${response.status}`);
    }

    const result = await response.json();

    // Log to Xano
    await getXanoClient().createRecord("conversations", {
      customer_phone: to,
      campaign_id: campaignId,
      channel: "sms",
      direction: "outbound",
      content: message,
      twilio_sid: (result as any).sid,
      twilio_status: (result as any).status,
    });

    return result;
  }

  async makeCall(to: string, script: string, campaignId?: string) {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${this.client.accountSid}/Calls.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.client.accountSid}:${this.client.authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_CONFIG.phoneNumber,
          To: to,
          Url: `${process.env.BASE_URL}/api/twilio/voice-response?script=${encodeURIComponent(script)}`,
        }),
      },
    );

    const result = await response.json();

    // Log to Xano
    await getXanoClient().createRecord("conversations", {
      customer_phone: to,
      campaign_id: campaignId,
      channel: "voice",
      direction: "outbound",
      content: script,
      twilio_sid: (result as any).sid,
      twilio_status: (result as any).status,
    });

    return result;
  }
}

// NMI API Functions - FIXED TO USE RECURRING VAULT
class NMIAPI {
  async createRecurringSubscription(customerData: any, subscriptionData: any) {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "add_subscription",

      // Customer billing info for recurring vault
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      address1: customerData.address,
      city: customerData.city,
      state: customerData.state,
      zip: customerData.zip,

      // Subscription details
      plan_amount: subscriptionData.amount,
      plan_payments: subscriptionData.totalPayments || "0", // 0 = until cancelled
      plan_frequency: subscriptionData.frequency || "monthly",
      day_frequency: subscriptionData.dayFrequency || "1",
      start_date:
        subscriptionData.startDate || new Date().toISOString().split("T")[0],

      // Payment method
      ccnumber: subscriptionData.creditCard.number,
      ccexp: subscriptionData.creditCard.expiry,
      cvv: subscriptionData.creditCard.cvv,
    });

    const response = await fetch(NMI_CONFIG.recurringVaultUrl, {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const result = await response.text();

    // Parse NMI response
    const resultParams = new URLSearchParams(result);
    const subscriptionId = resultParams.get("subscription_id");
    const responseCode = resultParams.get("response");

    if (responseCode === "1") {
      // Success - store in Xano recurring vault
      await xanoAPI.createRecurringSubscription({
        customer_id: customerData.id,
        nmi_subscription_id: subscriptionId,
        amount: subscriptionData.amount,
        frequency: subscriptionData.frequency,
        status: "active",
        next_billing_date: subscriptionData.startDate,
        created_at: new Date().toISOString(),
      });

      return {
        success: true,
        subscriptionId,
        message: "Recurring subscription created successfully",
      };
    } else {
      throw new Error(
        `NMI recurring subscription failed: ${resultParams.get("responsetext")}`,
      );
    }
  }

  async updateRecurringSubscription(subscriptionId: string, updates: any) {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      recurring: "update_subscription",
      subscription_id: subscriptionId,
      ...updates,
    });

    const response = await fetch(NMI_CONFIG.recurringVaultUrl, {
      method: "POST",
      body: params,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    return {
      success: resultParams.get("response") === "1",
      message: resultParams.get("responsetext"),
    };
  }

  async pauseSubscription(subscriptionId: string) {
    return this.updateRecurringSubscription(subscriptionId, {
      recurring: "pause_subscription",
    });
  }

  async resumeSubscription(subscriptionId: string) {
    return this.updateRecurringSubscription(subscriptionId, {
      recurring: "resume_subscription",
    });
  }

  async cancelSubscription(subscriptionId: string) {
    return this.updateRecurringSubscription(subscriptionId, {
      recurring: "delete_subscription",
    });
  }
}

const xanoAPI = new XanoAPI();
const twilioAPI = new TwilioAPI();
const nmiAPI = new NMIAPI();

// API Routes

// Customers
router.get("/customers", async (req, res) => {
  try {
    const customers = await xanoAPI.getCustomers(req.query);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/customers", async (req, res) => {
  try {
    const customer = await xanoAPI.createCustomer(req.body);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Campaigns
router.get("/campaigns", async (req, res) => {
  try {
    const campaigns = await xanoAPI.getCampaigns();
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/campaigns", async (req, res) => {
  try {
    const campaign = await xanoAPI.createCampaign(req.body);
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send SMS Campaign
router.post("/campaigns/:id/send-sms", async (req, res) => {
  try {
    const { id } = req.params;
    const { recipients, message } = req.body;

    const results = await Promise.all(
      recipients.map(async (phone: string) => {
        try {
          return await twilioAPI.sendSMS(phone, message, id);
        } catch (error) {
          return { error: error.message, phone };
        }
      }),
    );

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Recurring Subscription (FIXED - goes to recurring vault)
router.post("/subscriptions/recurring", async (req, res) => {
  try {
    const { customerData, subscriptionData } = req.body;

    const result = await nmiAPI.createRecurringSubscription(
      customerData,
      subscriptionData,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscription Management
router.post("/subscriptions/:id/pause", async (req, res) => {
  try {
    const result = await nmiAPI.pauseSubscription(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/subscriptions/:id/resume", async (req, res) => {
  try {
    const result = await nmiAPI.resumeSubscription(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/subscriptions/:id", async (req, res) => {
  try {
    const result = await nmiAPI.cancelSubscription(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lead Journey
router.get("/customers/:id/journey", async (req, res) => {
  try {
    const journey = await xanoAPI.getLeadJourney(parseInt(req.params.id));
    res.json(journey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/customers/:id/journey", async (req, res) => {
  try {
    const journey = await xanoAPI.updateLeadJourney(
      parseInt(req.params.id),
      req.body,
    );
    res.json(journey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Twilio Webhooks
router.post("/webhooks/twilio/sms", async (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;

    // Log incoming message to Xano
    await getXanoClient().createRecord("conversations", {
      customer_phone: From,
      channel: "sms",
      direction: "inbound",
      content: Body,
      twilio_sid: MessageSid,
      twilio_status: "received",
    });

    // Process AI response if needed
    // This would trigger the AI response system

    res.status(200).send("OK");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/webhooks/twilio/status", async (req, res) => {
  try {
    const { MessageSid, MessageStatus } = req.body;

    // Update message status in Xano
    await getXanoClient().createRecord("conversations", {
      twilio_sid: MessageSid,
      status: MessageStatus,
    });

    res.status(200).send("OK");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export { xanoAPI, twilioAPI, nmiAPI };
export default router;

import express from "express";
import fetch from "node-fetch";
import { getConvexClient } from "../../shared/convex-client";

const router = express.Router();

// Convex is the system of record now

const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
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

// Convex-backed helpers (replacing Xano)
class ConvexAPI {
  async getCustomers(filters?: any) {
    return getConvexClient().getMembers(filters || {});
  }
  async createCustomer(customerData: any) {
    return getConvexClient().createMember(customerData);
  }
  async updateCustomer(id: string, data: any) {
    return getConvexClient().updateMember(id, data);
  }
  async getCampaigns(params?: any) {
    return getConvexClient().getCampaigns(params || {});
  }
  async createCampaign(campaignData: any) {
    return getConvexClient().createCampaign(campaignData);
  }
  async getLeadJourney(memberId: string) {
    return getConvexClient().getLeadJourney(memberId);
  }
  async updateLeadJourney(memberId: string, journeyData: any) {
    return getConvexClient().updateLeadJourney(memberId, journeyData);
  }
  async createRecurringSubscriptionRecord(payload: any) {
    return getConvexClient().createRecord("subscriptions", payload);
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
          From: TWILIO_CONFIG.phoneNumber!,
          To: to,
          Body: message,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Twilio SMS error: ${response.status}`);
    }

    const result = await response.json();

    // Log to Convex
    await getConvexClient().createCommunication({
      channel: "sms",
      direction: "outbound",
      to_number: to,
      from_number: TWILIO_CONFIG.phoneNumber,
      content: message,
      provider: "twilio",
      provider_id: (result as any).sid,
      provider_status: (result as any).status,
      campaign_id: campaignId,
      sent_at: new Date().toISOString(),
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
          From: TWILIO_CONFIG.phoneNumber!,
          To: to,
          Url: `${process.env.BASE_URL}/api/twilio/voice-response?script=${encodeURIComponent(script)}`,
        }),
      },
    );

    const result = await response.json();

    // Log to Convex
    await getConvexClient().createCommunication({
      channel: "voice",
      direction: "outbound",
      to_number: to,
      from_number: TWILIO_CONFIG.phoneNumber,
      content: script,
      provider: "twilio",
      provider_id: (result as any).sid,
      provider_status: (result as any).status,
      campaign_id: campaignId,
      sent_at: new Date().toISOString(),
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
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      address1: customerData.address,
      city: customerData.city,
      state: customerData.state,
      zip: customerData.zip,
      plan_amount: subscriptionData.amount,
      plan_payments: subscriptionData.totalPayments || "0",
      plan_frequency: subscriptionData.frequency || "monthly",
      day_frequency: subscriptionData.dayFrequency || "1",
      start_date:
        subscriptionData.startDate || new Date().toISOString().split("T")[0],
      ccnumber: subscriptionData.creditCard.number,
      ccexp: subscriptionData.creditCard.expiry,
      cvv: subscriptionData.creditCard.cvv,
    });

    const response = await fetch(NMI_CONFIG.recurringVaultUrl!, {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const text = await response.text();
    const resultParams = new URLSearchParams(text);
    const subscriptionId = resultParams.get("subscription_id");
    const responseCode = resultParams.get("response");

    if (responseCode === "1") {
      // Success - store in Convex
      await convexAPI.createRecurringSubscriptionRecord({
        member_id: customerData.id,
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

    const response = await fetch(NMI_CONFIG.recurringVaultUrl!, {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

const convexAPI = new ConvexAPI();
const twilioAPI = new TwilioAPI();
const nmiAPI = new NMIAPI();

// API Routes

// Customers
router.get("/customers", async (req, res) => {
  try {
    const customers = await convexAPI.getCustomers(req.query);
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/customers", async (req, res) => {
  try {
    const customer = await convexAPI.createCustomer(req.body);
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Campaigns
router.get("/campaigns", async (req, res) => {
  try {
    const campaigns = await convexAPI.getCampaigns();
    res.json(campaigns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/campaigns", async (req, res) => {
  try {
    const campaign = await convexAPI.createCampaign(req.body);
    res.json(campaign);
  } catch (error: any) {
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
        } catch (error: any) {
          return { error: error.message, phone };
        }
      }),
    );

    res.json({ success: true, results });
  } catch (error: any) {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Subscription Management
router.post("/subscriptions/:id/pause", async (req, res) => {
  try {
    const result = await nmiAPI.pauseSubscription(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/subscriptions/:id/resume", async (req, res) => {
  try {
    const result = await nmiAPI.resumeSubscription(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/subscriptions/:id", async (req, res) => {
  try {
    const result = await nmiAPI.cancelSubscription(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Lead Journey
router.get("/customers/:id/journey", async (req, res) => {
  try {
    const journey = await convexAPI.getLeadJourney(req.params.id);
    res.json(journey);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/customers/:id/journey", async (req, res) => {
  try {
    const journey = await convexAPI.updateLeadJourney(
      req.params.id,
      req.body,
    );
    res.json(journey);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Twilio Webhooks
router.post("/webhooks/twilio/sms", async (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;

    // Log incoming message to Convex
    await getConvexClient().createCommunication({
      channel: "sms",
      direction: "inbound",
      from_number: From,
      content: Body,
      provider: "twilio",
      provider_id: MessageSid,
      provider_status: "received",
      created_at: new Date().toISOString(),
    });

    res.status(200).send("OK");
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/webhooks/twilio/status", async (req, res) => {
  try {
    const { MessageSid, MessageStatus } = req.body;

    // Update message status in Convex
    await getConvexClient().updateCommunicationStatus(MessageSid, {
      status: MessageStatus,
    });

    res.status(200).send("OK");
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

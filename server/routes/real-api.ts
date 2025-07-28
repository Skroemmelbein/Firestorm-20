import express from "express";
import fetch from "node-fetch";
import { initializeXano } from "../../shared/xano-client";

const router = express.Router();

// Initialize Xano client if credentials are available
if (process.env.XANO_BASE_URL && process.env.XANO_API_KEY) {
  try {
    initializeXano({
      instanceUrl: process.env.XANO_BASE_URL,
      apiKey: process.env.XANO_API_KEY,
      databaseId: "CdIRVEJq" // From .env XANO_TWILIO_CAMPAIGN
    });
    console.log("✅ Xano client initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Xano client:", error);
  }
}

// NMI Configuration
const NMI_CONFIG = {
  gatewayUrl: process.env.NMI_GATEWAY_URL || "https://secure.networkmerchants.com/api/transact.php",
  recurringUrl: process.env.NMI_RECURRING_URL || "https://secure.networkmerchants.com/api/recurring.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD,
  webhookSecret: process.env.NMI_WEBHOOK_SECRET || "default_webhook_secret",
  descriptorBase: process.env.DESCRIPTOR_BASE || "ECHELONX",
};

// Test connections (real, no mocks)
// Safe client getters
const getXanoClientSafe = () => {
  try {
    const { getXanoClient } = require("../../shared/xano-client");
    return getXanoClient();
  } catch (error) {
    throw new Error(
      "Xano client not initialized. Please configure Xano credentials first.",
    );
  }
};

const getSafeTwilioClient = async () => {
  console.log("🔍 DEBUG: getSafeTwilioClient called");
  console.log("🔍 DEBUG: Environment variables:", {
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "SET" : "NOT SET",
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? "SET" : "NOT SET", 
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ? "SET" : "NOT SET"
  });
  
  try {
    console.log("🔍 DEBUG: Importing twilio-client module...");
    const { initializeTwilio, getTwilioClient } = await import("../../shared/twilio-client");
    console.log("🔍 DEBUG: Successfully imported twilio-client module");
    
    try {
      console.log("🔍 DEBUG: Attempting to get existing Twilio client...");
      const client = getTwilioClient();
      console.log("🔍 DEBUG: Successfully got existing Twilio client");
      console.log("🔍 DEBUG: Client type:", typeof client);
      console.log("🔍 DEBUG: Client constructor:", client.constructor.name);
      console.log("🔍 DEBUG: Client prototype methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
      console.log("🔍 DEBUG: sendSMS method exists:", typeof client.sendSMS);
      console.log("🔍 DEBUG: sendSMS method:", client.sendSMS);
      return client;
    } catch (initError) {
      console.log("🔍 DEBUG: Failed to get existing client, error:", initError.message);
      
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        console.log("🔍 DEBUG: Environment variables present, initializing Twilio...");
        const client = initializeTwilio({
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
          phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        });
        console.log("🔍 DEBUG: Twilio initialization completed, got client:", typeof client);
        console.log("🔍 DEBUG: New client constructor:", client.constructor.name);
        console.log("🔍 DEBUG: New client prototype methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
        console.log("🔍 DEBUG: New client sendSMS method exists:", typeof client.sendSMS);
        return client;
      } else {
        console.log("🔍 DEBUG: Missing environment variables, cannot initialize");
        throw initError;
      }
    }
  } catch (error) {
    console.log("🔍 DEBUG: Fatal error in getSafeTwilioClient:", error.message);
    throw new Error(
      "Twilio client not initialized. Please configure Twilio credentials first.",
    );
  }
};

router.post("/test/xano", async (req, res) => {
  try {
    const xano = getXanoClientSafe();
    const isConnected = await xano.testConnection();

    if (isConnected) {
      res.json({
        connected: true,
        message: "Successfully connected to Xano",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(400).json({
        connected: false,
        error: "Failed to connect to Xano. Check your credentials.",
      });
    }
  } catch (error) {
    console.error("Xano connection test failed:", error);
    res.status(500).json({
      connected: false,
      error:
        error instanceof Error
          ? error.message
          : "Xano not configured. Please set up Xano credentials.",
    });
  }
});

router.post("/test/twilio", async (req, res) => {
  try {
    const twilio = await getSafeTwilioClient();
    const isConnected = await twilio.testConnection();

    if (isConnected) {
      res.json({
        connected: true,
        message: "Successfully connected to Twilio",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(400).json({
        connected: false,
        error: "Failed to connect to Twilio. Check your credentials.",
      });
    }
  } catch (error) {
    console.error("Twilio connection test failed:", error);
    res.status(500).json({
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

// Members API
router.get("/members", async (req, res) => {
  try {
    // Check if Xano is connected, otherwise return mock data
    try {
      const xano = getXanoClientSafe();
      const { page, per_page, search, status, membership_type } = req.query;

      const members = await xano.getMembers({
        page: page ? parseInt(page as string) : undefined,
        per_page: per_page ? parseInt(per_page as string) : undefined,
        search: search as string,
        status: status as string,
        membership_type: membership_type as string,
      });

      res.json(members);
    } catch (xanoError) {
      console.log("Xano not connected, returning mock member data");

      // Return mock member data
      const mockMembers = {
        data: [
          {
            id: 1,
            uuid: "mem_001",
            email: "john.doe@example.com",
            phone: "+18558600037",
            first_name: "John",
            last_name: "Doe",
            status: "active",
            membership_type: "premium",
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T10:30:00Z",
            engagement_score: 85,
            lifetime_value: 1250.0,
            total_spent: 890.5,
            login_count: 23,
            email_notifications: true,
            sms_notifications: true,
            marketing_emails: true,
            language: "en",
          },
          {
            id: 2,
            uuid: "mem_002",
            email: "sarah.smith@example.com",
            phone: "+18558600037",
            first_name: "Sarah",
            last_name: "Smith",
            status: "active",
            membership_type: "enterprise",
            created_at: "2024-01-10T14:20:00Z",
            updated_at: "2024-01-10T14:20:00Z",
            engagement_score: 92,
            lifetime_value: 2800.0,
            total_spent: 1590.25,
            login_count: 45,
            email_notifications: true,
            sms_notifications: true,
            marketing_emails: false,
            language: "en",
          },
          {
            id: 3,
            uuid: "mem_003",
            email: "mike.wilson@example.com",
            phone: "+18558600037",
            first_name: "Mike",
            last_name: "Wilson",
            status: "active",
            membership_type: "basic",
            created_at: "2024-01-20T09:15:00Z",
            updated_at: "2024-01-20T09:15:00Z",
            engagement_score: 67,
            lifetime_value: 450.0,
            total_spent: 285.75,
            login_count: 12,
            email_notifications: true,
            sms_notifications: false,
            marketing_emails: true,
            language: "en",
          },
        ],
        total: 3,
        page: 1,
      };

      res.json(mockMembers);
    }
  } catch (error) {
    console.error("Error in members endpoint:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

router.get("/members/:id", async (req, res) => {
  try {
    const xano = getXanoClientSafe();
    const member = await xano.getMember(parseInt(req.params.id));
    res.json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ error: "Failed to fetch member" });
  }
});

router.post("/members", async (req, res) => {
  try {
    const xano = getXanoClientSafe();
    const member = await xano.createMember(req.body);
    res.json(member);
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({ error: "Failed to create member" });
  }
});

router.patch("/members/:id", async (req, res) => {
  try {
    const xano = getXanoClientSafe();
    const member = await xano.updateMember(parseInt(req.params.id), req.body);
    res.json(member);
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ error: "Failed to update member" });
  }
});

// Benefits API
router.get("/benefits", async (req, res) => {
  try {
    // Check if Xano is connected, otherwise return mock data
    try {
      const xano = getXanoClientSafe();
      const { membership_level, is_active } = req.query;

      const benefits = await xano.getBenefits({
        membership_level: membership_level as string,
        is_active: is_active ? is_active === "true" : undefined,
      });

      res.json(benefits);
    } catch (xanoError) {
      console.log("Xano not connected, returning mock benefits data");

      // Return mock benefits data
      const mockBenefits = [
        {
          id: 1,
          uuid: "ben_001",
          title: "10% Subscription Discount",
          description:
            "Get 10% off your monthly subscription renewal for the lifetime of your membership",
          benefit_type: "discount",
          benefit_category: "billing",
          value_description: "10% off monthly billing",
          conditions: "Applies to monthly and yearly plans",
          is_active: true,
          membership_levels: ["premium", "enterprise"],
          sort_order: 1,
          icon_name: "percent",
          color_theme: "green",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 2,
          uuid: "ben_002",
          title: "Priority Support",
          description:
            "Get priority customer support with faster response times and dedicated support agents",
          benefit_type: "service",
          benefit_category: "support",
          value_description: "24/7 priority support access",
          conditions: "Response within 2 hours during business hours",
          is_active: true,
          membership_levels: ["premium", "enterprise"],
          sort_order: 2,
          icon_name: "headphones",
          color_theme: "blue",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 3,
          uuid: "ben_003",
          title: "Free Shipping",
          description:
            "Free shipping on all orders over $25, including expedited shipping options",
          benefit_type: "service",
          benefit_category: "shipping",
          value_description: "Free shipping (orders $25+)",
          conditions: "US and Canada only",
          is_active: true,
          membership_levels: ["basic", "premium", "enterprise"],
          sort_order: 3,
          icon_name: "truck",
          color_theme: "purple",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 4,
          uuid: "ben_004",
          title: "Exclusive Content Access",
          description:
            "Access to premium content, webinars, and exclusive member-only resources",
          benefit_type: "access",
          benefit_category: "exclusive",
          value_description: "Premium content library",
          conditions: "Available in member portal",
          is_active: true,
          membership_levels: ["enterprise"],
          sort_order: 4,
          icon_name: "crown",
          color_theme: "orange",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: 5,
          uuid: "ben_005",
          title: "Monthly Credit Bonus",
          description:
            "Receive bonus credits each month that can be used towards purchases or services",
          benefit_type: "product",
          benefit_category: "billing",
          value_description: "$25 monthly credits",
          conditions: "Credits expire after 90 days",
          is_active: true,
          membership_levels: ["premium", "enterprise"],
          sort_order: 5,
          icon_name: "star",
          color_theme: "green",
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];

      res.json(mockBenefits);
    }
  } catch (error) {
    console.error("Error in benefits endpoint:", error);
    res.status(500).json({ error: "Failed to fetch benefits" });
  }
});

router.get("/members/:id/benefits", async (req, res) => {
  try {
    const xano = getXanoClientSafe();
    const benefits = await xano.getMemberBenefits(parseInt(req.params.id));
    res.json(benefits);
  } catch (error) {
    console.error("Error fetching member benefits:", error);
    res.status(500).json({ error: "Failed to fetch member benefits" });
  }
});

router.post("/benefits", async (req, res) => {
  try {
    const xano = getXanoClientSafe();
    const benefit = await xano.createBenefit(req.body);
    res.json(benefit);
  } catch (error) {
    console.error("Error creating benefit:", error);
    res.status(500).json({ error: "Failed to create benefit" });
  }
});

router.post("/benefits/:id/use", async (req, res) => {
  try {
    const xano = getXanoClientSafe();
    const { member_id, usage_details } = req.body;

    await xano.useBenefit(member_id, parseInt(req.params.id), usage_details);
    res.json({ success: true, message: "Benefit usage recorded" });
  } catch (error) {
    console.error("Error recording benefit usage:", error);
    res.status(500).json({ error: "Failed to record benefit usage" });
  }
});

// SMS API
router.post("/sms/send", async (req, res) => {
  try {
    const twilio = await getSafeTwilioClient();
    const { to, body, from, mediaUrl } = req.body;

    if (!to || !body) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, body",
        httpStatus: 400,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await twilio.sendSMS({
      to,
      body,
      from: from || process.env.TWILIO_PHONE_NUMBER || "+15551234567",
      mediaUrl,
    });

    res.json({
      success: true,
      message: "SMS sent successfully",
      result: result,
      httpStatus: 200,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending SMS:", error);

    // Extract detailed error information
    const errorResponse: any = {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS",
      timestamp: new Date().toISOString(),
    };

    // Add Twilio-specific error details if available
    if ((error as any).details?.twilioError) {
      const twilioError = (error as any).details.twilioError;
      errorResponse.code = twilioError.code;
      errorResponse.more_info = twilioError.more_info;
      errorResponse.detail = twilioError.detail;
      errorResponse.httpStatus = twilioError.status;
      errorResponse.httpStatusText = twilioError.statusText;
    }

    // Return appropriate HTTP status
    const httpStatus = (error as any).details?.twilioError?.status || 500;
    res.status(httpStatus).json(errorResponse);
  }
});

router.post("/sms/bulk", async (req, res) => {
  try {
    const twilio = await getSafeTwilioClient();
    const { messages } = req.body;

    const result = await twilio.sendBulkSMS(messages);
    res.json(result);
  } catch (error) {
    console.error("Error sending bulk SMS:", error);
    res.status(500).json({ error: "Failed to send bulk SMS" });
  }
});

// Email API
router.post("/email/send", async (req, res) => {
  try {
    const { to, subject, html, text, body } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, subject",
        timestamp: new Date().toISOString(),
      });
    }

    console.log("📧 Sending email via SendGrid:", { to, subject });

    const sendGridModule = await import("../../shared/sendgrid-client");
    const sendGrid = sendGridModule.getSendGridClient();
    
    const result = await sendGrid.sendEmail({
      to,
      subject,
      html: html || body,
      text: text || body,
    });

    res.json(result);
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
      timestamp: new Date().toISOString(),
    });
  }
});

// Voice API
router.post("/voice/call", async (req, res) => {
  try {
    const twilio = await getSafeTwilioClient();
    const { to, from, url, twiml } = req.body;

    const result = await twilio.makeCall({
      to,
      from,
      url,
      twiml,
    });

    res.json(result);
  } catch (error) {
    console.error("Error making call:", error);
    res.status(500).json({ error: "Failed to make call" });
  }
});

// Communications API
router.get("/communications", async (req, res) => {
  try {
    const xano = getXanoClientSafe();
    const { member_id, channel, direction, limit } = req.query;

    const communications = await xano.getCommunications({
      member_id: member_id ? parseInt(member_id as string) : undefined,
      channel: channel as string,
      direction: direction as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(communications);
  } catch (error) {
    console.error("Error fetching communications:", error);
    res.status(500).json({ error: "Failed to fetch communications" });
  }
});

// Analytics API
router.get("/analytics/dashboard", async (req, res) => {
  try {
    const xano = getXanoClientSafe();
    const stats = await xano.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Twilio Webhooks
router.post("/webhooks/twilio/incoming", async (req, res) => {
  try {
    const twilio = await getSafeTwilioClient();
    await twilio.handleIncomingSMS(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error handling incoming SMS:", error);
    res.status(500).send("Error");
  }
});

router.post("/webhooks/twilio/status", async (req, res) => {
  try {
    const twilio = await getSafeTwilioClient();
    await twilio.handleStatusWebhook(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error handling status webhook:", error);
    res.status(500).send("Error");
  }
});

router.post("/events", async (req, res) => {
  try {
    const eventData = req.body;
    const userAgent = req.headers['user-agent'] || '';
    
    console.log("📨 Unified webhook event received:", {
      userAgent,
      eventType: eventData.event_type || eventData.MessageStatus || 'unknown',
      timestamp: new Date().toISOString()
    });

    if (eventData.MessageSid || userAgent.includes('TwilioProxy')) {
      // Twilio event (SMS/MMS/RCS status or incoming message)
      if (eventData.MessageStatus) {
        const twilio = await getSafeTwilioClient();
        await twilio.handleStatusWebhook(eventData);
      } else if (eventData.Body) {
        const twilio = await getSafeTwilioClient();
        await twilio.handleIncomingSMS(eventData);
      }
    } else if (eventData.event_type || userAgent.includes('SendGrid')) {
      console.log("📧 SendGrid event:", {
        event: eventData.event_type,
        email: eventData.email,
        timestamp: eventData.timestamp,
        sg_event_id: eventData.sg_event_id
      });
      
      try {
        const xano = getXanoClientSafe();
        await xano.createCommunication({
          channel: "email",
          direction: "inbound",
          to_email: eventData.email,
          content: `SendGrid Event: ${eventData.event_type}`,
          status: eventData.event_type,
          provider: "sendgrid",
          provider_id: eventData.sg_event_id,
          delivered_at: eventData.timestamp ? new Date(eventData.timestamp * 1000).toISOString() : new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to log SendGrid event to Xano:", error);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: "Event processed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error processing unified webhook event:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

router.post("/test/whatsapp", async (req, res) => {
  try {
    const { to, message, mediaUrl } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, message",
      });
    }

    const twilioClient = await getSafeTwilioClient();
    if (!twilioClient) {
      return res.json({
        success: false,
        error: "Twilio client not configured",
        message: "Please configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN",
      });
    }

    const result = await twilioClient.sendWhatsApp({
      to: to,
      body: message,
      mediaUrl: mediaUrl ? [mediaUrl] : undefined
    });

    res.json({
      success: true,
      message: "WhatsApp message sent successfully",
      result: result,
    });
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/test/studio-flow", async (req, res) => {
  try {
    const { flowSid, to, parameters } = req.body;

    if (!flowSid || !to) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: flowSid, to",
      });
    }

    const twilioClient = await getSafeTwilioClient();
    if (!twilioClient) {
      return res.json({
        success: false,
        error: "Twilio client not configured",
        message: "Please configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN",
      });
    }

    const result = await twilioClient.executeStudioFlow(
      flowSid,
      to,
      parameters
    );

    res.json({
      success: true,
      message: "Studio Flow execution created successfully",
      result: result,
    });
  } catch (error: any) {
    console.error("Studio Flow execution error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/test/voice-call", async (req, res) => {
  try {
    const { to, url } = req.body;

    if (!to || !url) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, url",
      });
    }

    const twilioClient = await getSafeTwilioClient();
    if (!twilioClient) {
      return res.json({
        success: false,
        error: "Twilio client not configured",
        message: "Please configure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN",
      });
    }

    const result = await twilioClient.makeCall({
      to: to,
      url: url
    });

    res.json({
      success: true,
      message: "Voice call initiated successfully",
      result: result,
    });
  } catch (error: any) {
    console.error("Voice call error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.post("/test/sms-mms-rcs", async (req, res) => {
  try {
    const { to, message, mediaUrl } = req.body;
    
    console.log("🔍 DEBUG: About to call getSafeTwilioClient()");
    const twilio = await getSafeTwilioClient();
    console.log("🔍 DEBUG: getSafeTwilioClient() returned successfully");
    
    console.log("🔍 DEBUG: Twilio client type:", typeof twilio);
    console.log("🔍 DEBUG: Twilio client constructor:", twilio ? twilio.constructor.name : "NO CONSTRUCTOR");
    console.log("🔍 DEBUG: Twilio client is null/undefined:", twilio === null || twilio === undefined);
    
    if (twilio && typeof twilio === 'object') {
      console.log("🔍 DEBUG: Available methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(twilio)));
      console.log("🔍 DEBUG: sendSMS method exists:", typeof twilio.sendSMS);
      console.log("🔍 DEBUG: sendSMS method:", twilio.sendSMS);
      console.log("🔍 DEBUG: All properties:", Object.getOwnPropertyNames(twilio));
    } else {
      console.log("🔍 DEBUG: Twilio client is not an object:", twilio);
    }
    
    const result = await twilio.sendSMS({
      to: to || "+15558675310",
      body: message || "Firestorm Phase 1 test 🚀",
      mediaUrl: mediaUrl ? [mediaUrl] : ["https://demo.cloudinary.com/sample.jpg"]
    });
    
    res.json({
      success: true,
      message: "SMS/MMS/RCS test sent successfully",
      result: result
    });
  } catch (error) {
    console.log("🔍 DEBUG: Error caught in SMS endpoint:", error);
    console.log("🔍 DEBUG: Error type:", typeof error);
    console.log("🔍 DEBUG: Error message:", error instanceof Error ? error.message : "Not an Error object");
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/email", async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    const sendGridModule = await import("../../shared/sendgrid-client");
    const sendGrid = sendGridModule.getSendGridClient();
    
    const result = await sendGrid.sendEmail({
      to: to || "shannonkroemmelbein@gmail.com",
      subject: subject || "ECELONX Phase 1 Test - System Operational",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #111111; color: white; padding: 40px;">
          <h1 style="color: #00CED1;">ECELONX MESSAGE WAR MACHINE</h1>
          <p style="color: #00E676;">Phase 1 Ignition: ${message || 'All systems operational'}</p>
          <p style="color: #b3b3b3;">Test Time: ${new Date().toISOString()}</p>
        </div>
      `
    });
    
    res.json({
      success: true,
      message: "Email test sent successfully", 
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

const getAssetReactorSafe = () => {
  try {
    const { initializeAssetReactor, getAssetReactor } = require("../../shared/asset-reactor");
    
    try {
      return getAssetReactor();
    } catch (initError) {
      if (process.env.UNSPLASH_ACCESS_KEY && process.env.PEXELS_API_KEY && process.env.CLOUDINARY_CLOUD_NAME) {
        initializeAssetReactor({
          unsplash: {
            accessKey: process.env.UNSPLASH_ACCESS_KEY,
          },
          pexels: {
            apiKey: process.env.PEXELS_API_KEY,
          },
          cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY || '',
            apiSecret: process.env.CLOUDINARY_API_SECRET || '',
          },
        });
        return getAssetReactor();
      }
      throw initError;
    }
  } catch (error) {
    throw new Error(
      "Asset Reactor not initialized. Please configure Unsplash, Pexels, and Cloudinary credentials first.",
    );
  }
};

router.get("/assets/hero-image", async (req, res) => {
  const { query, width, height } = req.query;
  
  try {
    const assetReactor = getAssetReactorSafe();
    
    const asset = await assetReactor.getRandomHeroImage(
      query as string,
      width ? parseInt(width as string) : 1200,
      height ? parseInt(height as string) : 630
    );
    
    res.json({
      success: true,
      asset: asset,
      message: "Hero image generated successfully"
    });
  } catch (error) {
    // Fallback demo asset when API keys are not configured
    const demoAsset = {
      type: 'image' as const,
      url: `https://picsum.photos/${width || 1200}/${height || 630}?random=${Date.now()}`,
      originalUrl: 'https://picsum.photos/1200/630',
      width: parseInt(width as string) || 1200,
      height: parseInt(height as string) || 630,
      description: `Demo hero image: ${query || 'random'}`,
      source: 'demo' as const
    };
    
    res.json({
      success: true,
      asset: demoAsset,
      message: "Demo hero image generated (configure Unsplash API key for production)",
      demo_mode: true,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/assets/video-mms", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query parameter is required"
      });
    }
    
    const assetReactor = getAssetReactorSafe();
    const asset = await assetReactor.getVideoForMMS(query as string);
    
    res.json({
      success: true,
      asset: asset,
      message: "MMS video generated successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/assets/hero-with-text", async (req, res) => {
  const { text, query, textColor, textSize, effects } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      error: "Text parameter is required"
    });
  }
  
  try {
    const assetReactor = getAssetReactorSafe();
    const asset = await assetReactor.generateHeroWithText(text, query, {
      textColor,
      textSize,
      effects
    });
    
    res.json({
      success: true,
      asset: asset,
      message: "Hero image with text generated successfully"
    });
  } catch (error) {
    const encodedText = encodeURIComponent(text);
    const demoAsset = {
      type: 'image' as const,
      url: `https://via.placeholder.com/1200x630/1a1a1a/00CED1?text=${encodedText}`,
      originalUrl: 'https://picsum.photos/1200/630',
      width: 1200,
      height: 630,
      description: `Demo hero with text: ${text}`,
      source: 'demo' as const
    };
    
    res.json({
      success: true,
      asset: demoAsset,
      message: "Demo hero with text generated (configure Cloudinary for production text overlays)",
      demo_mode: true,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/assets/health", async (req, res) => {
  try {
    const assetReactor = getAssetReactorSafe();
    const health = await assetReactor.healthCheck();
    
    res.json({
      success: true,
      health: health,
      message: "Asset Reactor health check completed"
    });
  } catch (error) {
    // Fallback health check when credentials are not configured
    const hasUnsplash = process.env.UNSPLASH_ACCESS_KEY && process.env.UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key_here';
    const hasPexels = process.env.PEXELS_API_KEY && process.env.PEXELS_API_KEY !== 'your_pexels_api_key_here';
    const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name';
    
    res.json({
      success: false,
      health: {
        unsplash: hasUnsplash,
        pexels: hasPexels,
        cloudinary: hasCloudinary
      },
      message: "Asset Reactor not configured - placeholder API keys detected",
      error: error instanceof Error ? error.message : "Unknown error",
      required_env_vars: [
        "UNSPLASH_ACCESS_KEY (get from https://unsplash.com/developers)",
        "PEXELS_API_KEY (get from https://www.pexels.com/api/)",
        "CLOUDINARY_CLOUD_NAME (get from https://cloudinary.com/)"
      ]
    });
  }
});

router.post("/test/sms-mms-rcs-with-assets", async (req, res) => {
  try {
    const { to, message, generateAsset, assetQuery } = req.body;
    const twilio = await getSafeTwilioClient();
    
    let mediaUrl: string[] = [];
    
    if (generateAsset) {
      try {
        const assetReactor = getAssetReactorSafe();
        const asset = await assetReactor.getRandomHeroImage(assetQuery || "technology");
        mediaUrl = [asset.url];
      } catch (assetError) {
        console.warn("Failed to generate asset, using fallback:", assetError);
        mediaUrl = ["https://demo.cloudinary.com/sample.jpg"];
      }
    }
    
    const result = await twilio.sendSMS({
      to: to || "+15558675310",
      body: message || "Firestorm Phase 2 test with auto-generated assets 🚀",
      mediaUrl: mediaUrl.length > 0 ? mediaUrl : undefined
    });
    
    res.json({
      success: true,
      message: "SMS/MMS/RCS with assets sent successfully",
      result: result,
      generatedAsset: mediaUrl.length > 0 ? mediaUrl[0] : null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/email-with-assets", async (req, res) => {
  try {
    const { to, subject, message, generateAsset, assetQuery, heroText } = req.body;
    const sendGridModule = await import("../../shared/sendgrid-client");
    const sendGrid = sendGridModule.getSendGridClient();
    
    let heroImageUrl = "https://demo.cloudinary.com/sample.jpg";
    
    if (generateAsset) {
      try {
        const assetReactor = getAssetReactorSafe();
        if (heroText) {
          const asset = await assetReactor.generateHeroWithText(heroText, assetQuery || "business");
          heroImageUrl = asset.url;
        } else {
          const asset = await assetReactor.getRandomHeroImage(assetQuery || "business");
          heroImageUrl = asset.url;
        }
      } catch (assetError) {
        console.warn("Failed to generate asset, using fallback:", assetError);
      }
    }
    
    const result = await sendGrid.sendEmail({
      to: to || "shannonkroemmelbein@gmail.com",
      subject: subject || "ECELONX Phase 2 Test - Asset Reactor Operational",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #111111; color: white; padding: 0;">
          <img src="${heroImageUrl}" alt="Generated Hero Image" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px 8px 0 0;">
          <div style="padding: 40px;">
            <h1 style="color: #00CED1; margin-top: 0;">ECELONX MESSAGE WAR MACHINE</h1>
            <p style="color: #00E676; font-size: 18px;">Phase 2 Asset Reactor: ${message || 'Auto-generated assets operational'}</p>
            <p style="color: #b3b3b3;">Generated Asset: ${heroImageUrl}</p>
            <p style="color: #b3b3b3;">Test Time: ${new Date().toISOString()}</p>
          </div>
        </div>
      `
    });
    
    res.json({
      success: true,
      message: "Email with assets sent successfully", 
      result: result,
      generatedAsset: heroImageUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/nmi/create-customer", async (req, res) => {
  try {
    const { customer, paymentMethod } = req.body;
    
    const testCustomer = customer || {
      firstName: "Test",
      lastName: "Customer",
      email: "test@example.com",
      phone: "+15558675310",
      address: {
        street1: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "90210"
      }
    };

    const testPaymentMethod = paymentMethod || {
      type: "credit_card",
      cardNumber: "4111111111111111",
      expiryMonth: "12",
      expiryYear: "25",
      cvv: "123"
    };

    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      type: "add_customer",
      customer_vault: "add_customer",
      first_name: testCustomer.firstName,
      last_name: testCustomer.lastName,
      email: testCustomer.email,
      phone: testCustomer.phone || "",
      address1: testCustomer.address?.street1 || "",
      city: testCustomer.address?.city || "",
      state: testCustomer.address?.state || "",
      zip: testCustomer.address?.zipCode || "",
      country: testCustomer.address?.country || "US",
      ccnumber: testPaymentMethod.cardNumber,
      ccexp: `${testPaymentMethod.expiryMonth}${testPaymentMethod.expiryYear}`,
      cvv: testPaymentMethod.cvv,
    });

    const response = await fetch(NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const responseText = await response.text();
    const result = new URLSearchParams(responseText);

    const success = result.get("response") === "1";
    const customerId = result.get("customer_vault_id");

    if (success && customerId) {
      // Log to Xano
      try {
        await getXanoClientSafe().createRecord("nmi_customers", {
          nmi_customer_id: customerId,
          first_name: testCustomer.firstName,
          last_name: testCustomer.lastName,
          email: testCustomer.email,
          phone: testCustomer.phone,
          created_at: new Date().toISOString(),
          status: "active",
        });
      } catch (xanoError) {
        console.log("Xano logging failed:", xanoError);
      }
    }

    res.json({
      success: success,
      message: success ? "NMI customer created successfully" : "NMI customer creation failed",
      customerId: customerId,
      responseText: responseText,
      result: Object.fromEntries(result.entries())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/nmi/one-time-payment", async (req, res) => {
  try {
    const { 
      amount = 1.00, 
      cardNumber = "5444720138596149",
      expiryMonth = "07", 
      expiryYear = "32",
      cvv = "772",
      cardholderName = "AL REDMOND",
      billingZip = "82081",
      email = "acmltd105@gmail.com"
    } = req.body;

    const customerData = {
      firstName: cardholderName.split(' ')[0] || "AL",
      lastName: cardholderName.split(' ')[1] || "REDMOND", 
      email: email,
      phone: "+18144409068",
      address: {
        street1: "123 Test St",
        city: "Test City", 
        state: "WY",
        zipCode: billingZip,
        country: "US"
      }
    };

    const paymentParams = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      type: "sale",
      ccnumber: cardNumber,
      ccexp: `${expiryMonth}${expiryYear}`,
      cvv: cvv,
      amount: amount.toString(),
      orderid: `TEST-${Date.now()}`,
      orderdescription: `Test $${amount} payment from ECHELONX`,
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone || "",
      address1: customerData.address?.street1 || "",
      city: customerData.address?.city || "",
      state: customerData.address?.state || "",
      zip: customerData.address?.zipCode || "",
      country: customerData.address?.country || "US",
    });

    const paymentResponse = await fetch(NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: paymentParams.toString(),
    });

    const paymentResponseText = await paymentResponse.text();
    const paymentResult = new URLSearchParams(paymentResponseText);

    const paymentSuccess = paymentResult.get("response") === "1";
    const transactionId = paymentResult.get("transactionid");

    // Log to Xano
    if (paymentSuccess && transactionId) {
      try {
        await getXanoClientSafe().createRecord("nmi_transactions", {
          transaction_id: transactionId,
          amount: amount,
          type: "sale",
          status: "approved",
          created_at: new Date().toISOString(),
          card_last_four: cardNumber.slice(-4),
          cardholder_name: cardholderName,
          email: customerData.email
        });
      } catch (xanoError) {
        console.log("Xano logging failed:", xanoError);
      }
    }

    res.json({
      success: paymentSuccess,
      message: paymentSuccess ? `$${amount} payment processed successfully` : "Payment failed",
      transactionId: transactionId,
      amount: amount,
      responseText: paymentResponseText,
      result: Object.fromEntries(paymentResult.entries())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/nmi/recurring-subscription", async (req, res) => {
  try {
    const { 
      amount = 1.00, 
      cardNumber = "5444720138596149",
      expiryMonth = "07", 
      expiryYear = "32",
      cvv = "772",
      cardholderName = "AL REDMOND",
      billingZip = "82081",
      email = "acmltd105@gmail.com"
    } = req.body;

    const customerData = {
      firstName: cardholderName.split(' ')[0] || "AL",
      lastName: cardholderName.split(' ')[1] || "REDMOND", 
      email: email,
      phone: "+18144409068",
      address: {
        street1: "123 Test St",
        city: "Test City", 
        state: "WY",
        zipCode: billingZip,
        country: "US"
      }
    };

    console.log("🚀 Creating NMI recurring subscription test:", {
      customer: customerData.email,
      amount: amount
    });

    const customerParams = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      customer_vault: "add_customer",
      first_name: customerData.firstName,
      last_name: customerData.lastName,
      email: customerData.email,
      phone: customerData.phone,
      address1: customerData.address?.street1 || "",
      city: customerData.address?.city || "",
      state: customerData.address?.state || "",
      zip: customerData.address?.zipCode || "",
      ccnumber: cardNumber,
      ccexp: `${expiryMonth}${expiryYear}`,
      cvv: cvv,
    });

    const customerResponse = await fetch(NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: customerParams.toString(),
    });

    const customerResult = await customerResponse.text();
    const customerResultParams = new URLSearchParams(customerResult);

    if (customerResultParams.get("response") !== "1") {
      throw new Error(
        `Customer creation failed: ${customerResultParams.get("responsetext")}`
      );
    }

    const nmiCustomerId = customerResultParams.get("customer_vault_id");
    console.log("✅ Customer created in NMI vault:", nmiCustomerId);

    // Step 2: Create recurring subscription
    const startDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
    
    const subscriptionParams = new URLSearchParams();
    subscriptionParams.append("username", NMI_CONFIG.username!);
    subscriptionParams.append("password", NMI_CONFIG.password!);
    subscriptionParams.append("recurring", "add_subscription");
    subscriptionParams.append("customer_vault_id", nmiCustomerId!);
    subscriptionParams.append("plan_amount", amount.toString());
    subscriptionParams.append("plan_payments", "0"); // 0 = infinite
    subscriptionParams.append("plan_id", "TEST_RECURRING_PLAN");
    subscriptionParams.append("start_date", startDate);
    subscriptionParams.append("day_frequency", "30");

    console.log("🔧 Subscription params:", subscriptionParams.toString());
    
    const subscriptionResponse = await fetch(NMI_CONFIG.recurringUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: subscriptionParams.toString(),
    });

    const subscriptionResult = await subscriptionResponse.text();
    console.log("🔧 Raw subscription response:", subscriptionResult);

    if (subscriptionResult.trim() === "File not found.") {
      console.log("⚠️ NMI recurring API not available - account may not have recurring billing features");
      
      const simulatedSubscriptionId = `SIM_${Date.now()}`;
      
      try {
        const xanoMember = await getXanoClientSafe().createRecord("members", {
          uuid: `test_member_${Date.now()}`,
          email: customerData.email,
          phone: customerData.phone,
          first_name: customerData.firstName,
          last_name: customerData.lastName,
          status: "active",
          membership_type: "test",
          nmi_customer_id: nmiCustomerId,
          nmi_vault_id: nmiCustomerId,
          subscription_start_date: new Date().toISOString(),
          billing_cycle: "monthly",
          created_at: new Date().toISOString(),
        });

        const xanoSubscription = await getXanoClientSafe().createRecord("subscriptions", {
          member_id: xanoMember.id,
          nmi_subscription_id: simulatedSubscriptionId,
          plan_name: "Test Recurring Plan (Simulated)",
          plan_id: `TEST_PLAN_${Date.now()}`,
          status: "pending_recurring_setup",
          amount: amount,
          currency: "USD",
          billing_cycle: "monthly",
          next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });

        console.log("✅ Simulated subscription saved to Xano billing tables");
      } catch (xanoError) {
        console.log("Xano logging failed:", xanoError);
      }

      return res.json({
        success: true,
        message: `Customer created in NMI vault, but recurring billing API not available`,
        warning: "NMI account may not have recurring billing features enabled",
        nmiCustomerId: nmiCustomerId,
        nmiSubscriptionId: simulatedSubscriptionId,
        amount: amount,
        billingCycle: "monthly",
        status: "customer_created_subscription_simulated",
        result: {
          customerResult: Object.fromEntries(customerResultParams.entries()),
          subscriptionResult: { error: "File not found - recurring API not available" }
        }
      });
    }
    
    const subscriptionResultParams = new URLSearchParams(subscriptionResult);
    console.log("🔧 Parsed subscription response:", Object.fromEntries(subscriptionResultParams.entries()));

    if (subscriptionResultParams.get("response") !== "1") {
      const errorText = subscriptionResultParams.get("responsetext") || "Unknown error";
      const responseCode = subscriptionResultParams.get("response_code") || "No code";
      throw new Error(
        `Subscription creation failed: ${errorText} (Code: ${responseCode})`
      );
    }

    const nmiSubscriptionId = subscriptionResultParams.get("subscription_id");
    console.log("✅ Subscription created in NMI:", nmiSubscriptionId);

    try {
      const xanoMember = await getXanoClientSafe().createRecord("members", {
        uuid: `test_member_${Date.now()}`,
        email: customerData.email,
        phone: customerData.phone,
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        status: "active",
        membership_type: "test",
        nmi_customer_id: nmiCustomerId,
        nmi_vault_id: nmiCustomerId,
        subscription_start_date: new Date().toISOString(),
        billing_cycle: "monthly",
        created_at: new Date().toISOString(),
      });

      const xanoSubscription = await getXanoClientSafe().createRecord("subscriptions", {
        member_id: xanoMember.id,
        nmi_subscription_id: nmiSubscriptionId,
        plan_name: "Test Recurring Plan",
        plan_id: `TEST_PLAN_${Date.now()}`,
        status: "active",
        amount: amount,
        currency: "USD",
        billing_cycle: "monthly",
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      console.log("✅ Subscription saved to Xano billing tables");
    } catch (xanoError) {
      console.log("Xano logging failed:", xanoError);
    }

    res.json({
      success: true,
      message: `$${amount} recurring subscription created successfully`,
      nmiCustomerId: nmiCustomerId,
      nmiSubscriptionId: nmiSubscriptionId,
      amount: amount,
      billingCycle: "monthly",
      result: {
        customerResult: Object.fromEntries(customerResultParams.entries()),
        subscriptionResult: Object.fromEntries(subscriptionResultParams.entries())
      }
    });
  } catch (error) {
    console.error("❌ Recurring subscription creation failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/nmi/create-subscription", async (req, res) => {
  try {
    const { customerId, planId, amount, frequency } = req.body;
    
    if (!customerId) {
      return res.status(400).json({
        success: false,
        error: "customerId is required for subscription test"
      });
    }

    const response = await fetch("http://localhost:3000/api/real/enhanced/create-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customerId,
        planId: planId || "TEST_PLAN_001",
        amount: amount || "29.99",
        frequency: frequency || "monthly"
      })
    });

    const result = await response.json();
    
    res.json({
      success: true,
      message: "NMI subscription creation test completed",
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/nmi/webhook", async (req, res) => {
  try {
    const testWebhookPayload = {
      event_type: "subscription_payment_success",
      subscription_id: "12345",
      transaction_id: "TXN_67890",
      customer_vault_id: "CUST_123",
      amount: "29.99",
      status: "approved"
    };

    const response = await fetch("http://localhost:3000/api/nmi/enhanced/webhook", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-nmi-signature": "test_signature_placeholder"
      },
      body: JSON.stringify(testWebhookPayload)
    });

    const result = await response.json();
    
    res.json({
      success: true,
      message: "NMI webhook test completed",
      result: result,
      testPayload: testWebhookPayload
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/twilio/whatsapp", async (req, res) => {
  try {
    const { to, message, mediaUrl } = req.body;
    const twilio = await getSafeTwilioClient();
    
    const result = await twilio.sendWhatsApp({
      to: to || "+15558675310",
      body: message || "ECHELONX WhatsApp test message 📱",
      mediaUrl: mediaUrl ? [mediaUrl] : undefined
    });
    
    res.json({
      success: true,
      message: "WhatsApp message sent successfully",
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/twilio/studio-flow", async (req, res) => {
  try {
    const { flowSid, to, parameters } = req.body;
    const twilio = await getSafeTwilioClient();
    
    if (!flowSid) {
      return res.status(400).json({
        success: false,
        error: "flowSid is required for Studio Flow test"
      });
    }
    
    const result = await twilio.executeStudioFlow(
      flowSid,
      to || "+15558675310",
      parameters || { customerName: "Test Customer", accountBalance: "100.00" }
    );
    
    res.json({
      success: true,
      message: "Studio Flow executed successfully",
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/twilio/rcs", async (req, res) => {
  try {
    const { to, message, contentSid, richContent, mediaUrl } = req.body;
    const twilio = await getSafeTwilioClient();
    
    const result = await twilio.sendRCS({
      to: to || "+15558675310",
      body: message || "ECHELONX RCS test with rich content 🚀",
      contentSid: contentSid,
      richContent: richContent,
      mediaUrl: mediaUrl ? [mediaUrl] : undefined
    });
    
    res.json({
      success: true,
      message: "RCS message sent successfully",
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/twilio/advanced-call", async (req, res) => {
  try {
    const { to, twiml, record, transcribe, machineDetection, timeout } = req.body;
    const twilio = await getSafeTwilioClient();
    
    const result = await twilio.makeAdvancedCall({
      to: to || "+15558675310",
      twiml: twiml || "<Response><Say>This is an advanced ECHELONX test call with recording and transcription.</Say></Response>",
      record: record || true,
      transcribe: transcribe || true,
      machineDetection: machineDetection || true,
      timeout: timeout || 30
    });
    
    res.json({
      success: true,
      message: "Advanced voice call initiated successfully",
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/twilio/multi-channel-bulk", async (req, res) => {
  try {
    const { messages } = req.body;
    const twilio = await getSafeTwilioClient();
    
    const testMessages = messages || [
      {
        to: "+15558675310",
        body: "ECHELONX multi-channel test message 1",
        channels: ["sms", "whatsapp"],
        mediaUrl: ["https://demo.cloudinary.com/sample.jpg"]
      },
      {
        to: "+15558675311",
        body: "ECHELONX multi-channel test message 2",
        channels: ["rcs", "sms"],
      }
    ];
    
    const result = await twilio.sendBulkMultiChannel(testMessages);
    
    res.json({
      success: true,
      message: "Multi-channel bulk messaging completed",
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/phase3/translate", async (req, res) => {
  try {
    const { text, targetLang, sourceLang } = req.body;
    
    const testText = text || "Welcome to ECHELONX Message War Machine";
    const testTargetLang = targetLang || "ES";
    
    const { DeepLClient } = await import("../../shared/deepl-client");
    const deepl = new DeepLClient({
      apiKey: process.env.DEEPL_API_KEY || "placeholder_deepl_key",
      baseUrl: "https://api-free.deepl.com"
    });
    
    const translatedText = await deepl.translateText(testText, testTargetLang, sourceLang);
    
    res.json({
      success: true,
      message: "Text translated successfully",
      result: {
        originalText: testText,
        translatedText: translatedText,
        sourceLang: sourceLang || "auto-detected",
        targetLang: testTargetLang
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Translation failed - using demo mode",
      result: {
        originalText: req.body.text || "Welcome to ECHELONX Message War Machine",
        translatedText: "Bienvenido a ECHELONX Message War Machine (Demo)",
        sourceLang: "EN",
        targetLang: req.body.targetLang || "ES",
        demo_mode: true
      },
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/phase3/grammar-check", async (req, res) => {
  try {
    const { text, language } = req.body;
    
    const testText = text || "This are a test message for grammar checking.";
    
    const { LanguageToolClient } = await import("../../shared/languagetool-client");
    const languageTool = new LanguageToolClient({
      baseUrl: "https://api.languagetool.org"
    });
    
    const result = await languageTool.checkGrammar(testText, language || "en-US");
    
    res.json({
      success: true,
      message: "Grammar check completed",
      result: result
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Grammar check failed - using demo mode",
      result: {
        originalText: req.body.text || "This are a test message for grammar checking.",
        correctedText: "This is a test message for grammar checking. (Demo)",
        issues: [
          {
            message: "Grammar error detected",
            suggestions: ["is"],
            offset: 5,
            length: 3
          }
        ],
        demo_mode: true
      },
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/phase4/create-template", async (req, res) => {
  try {
    const { templateName, content, channels } = req.body;
    
    const { TwilioContentClient } = await import("../../shared/twilio-content-client");
    const contentClient = new TwilioContentClient({
      accountSid: process.env.TWILIO_ACCOUNT_SID || "placeholder_sid",
      authToken: process.env.TWILIO_AUTH_TOKEN || "placeholder_token"
    });
    
    const result = await contentClient.createTemplate(
      templateName || "echelonx_test_template",
      content || {
        subject: "ECHELONX Notification",
        body: "Hello {{customerName}}, your account status is {{status}}.",
        media: ["https://demo.cloudinary.com/sample.jpg"]
      },
      channels || ["sms", "whatsapp", "email"]
    );
    
    res.json({
      success: true,
      message: "Template created successfully",
      result: result
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Template creation failed - using demo mode",
      result: {
        templateSid: "CNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        templateName: req.body.templateName || "echelonx_test_template",
        channels: req.body.channels || ["sms", "whatsapp", "email"],
        status: "approved",
        demo_mode: true
      },
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/phase5/sinch-sms", async (req, res) => {
  try {
    const { to, message } = req.body;
    
    const { SinchClient } = await import("../../shared/sinch-client");
    const sinch = new SinchClient({
      servicePlanId: process.env.SINCH_SERVICE_PLAN_ID || "placeholder_plan_id",
      apiToken: process.env.SINCH_API_TOKEN || "placeholder_token",
      baseUrl: "https://sms.api.sinch.com"
    });
    
    const result = await sinch.sendSMS({
      to: [to || "+15558675310"],
      from: "ECHELONX",
      body: message || "ECHELONX fallback SMS via Sinch"
    });
    
    res.json({
      success: true,
      message: "Sinch SMS sent successfully (fallback)",
      result: result
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Sinch SMS failed - using demo mode",
      result: {
        messageId: "demo_sinch_" + Date.now(),
        to: req.body.to || "+15558675310",
        status: "delivered",
        demo_mode: true
      },
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/phase5/shorten-link", async (req, res) => {
  try {
    const { url, domain } = req.body;
    
    const { RebrandlyClient } = await import("../../shared/rebrandly-client");
    const rebrandly = new RebrandlyClient({
      apiKey: process.env.REBRANDLY_API_KEY || "placeholder_key",
      baseUrl: "https://api.rebrandly.com"
    });
    
    const result = await rebrandly.createLink({
      destination: url || "https://echelonx.com/campaign-landing",
      slashtag: domain || "echelonx-campaign"
    });
    
    res.json({
      success: true,
      message: "Link shortened successfully",
      result: result
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Link shortening failed - using demo mode",
      result: {
        originalUrl: req.body.url || "https://echelonx.com/campaign-landing",
        shortUrl: "https://rebrand.ly/demo-" + Date.now(),
        clicks: 0,
        demo_mode: true
      },
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.get("/test/phase5/analytics-chart", async (req, res) => {
  try {
    const { chartType, data } = req.query;
    
    const { QuickChartClient } = await import("../../shared/quickchart-client");
    const quickChart = new QuickChartClient({
      baseUrl: "https://quickchart.io"
    });
    
    const chartUrl = await quickChart.generateChart({
      type: (req.query.chartType as "bar") || "bar",
      data: data ? JSON.parse(data as string) : {
        labels: ["SMS", "WhatsApp", "Email", "Voice"],
        datasets: [{
          label: "Message Delivery Rate",
          data: [95, 98, 92, 87],
          backgroundColor: ["#00CED1", "#00E676", "#FF6B6B", "#4ECDC4"]
        }]
      }
    });
    
    res.json({
      success: true,
      message: "Analytics chart generated successfully",
      result: {
        chartUrl: chartUrl,
        chartType: chartType || "bar"
      }
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Chart generation failed - using demo mode",
      result: {
        chartUrl: "https://quickchart.io/chart?c={type:'bar',data:{labels:['SMS','WhatsApp','Email','Voice'],datasets:[{label:'Delivery Rate',data:[95,98,92,87]}]}}",
        demo_mode: true
      },
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/phase5/slack-alert", async (req, res) => {
  try {
    const { message, channel, bounceRate } = req.body;
    
    const { SlackClient } = await import("../../shared/slack-client");
    const slack = new SlackClient({
      botToken: process.env.SLACK_BOT_TOKEN || "placeholder_token",
      baseUrl: "https://slack.com/api"
    });
    
    const alertMessage = message || `🚨 ECHELONX Alert: Bounce rate is ${bounceRate || 4.2}% (above 3% threshold)`;
    
    const result = await slack.sendMessage({
      channel: channel || "#alerts",
      text: alertMessage
    });
    
    res.json({
      success: true,
      message: "Slack alert sent successfully",
      result: result
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Slack alert failed - using demo mode",
      result: {
        channel: req.body.channel || "#alerts",
        message: req.body.message || `🚨 ECHELONX Alert: Bounce rate is ${req.body.bounceRate || 4.2}% (above 3% threshold)`,
        timestamp: new Date().toISOString(),
        demo_mode: true
      },
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

router.post("/test/email-template", async (req, res) => {
  try {
    const { to, templateId, dynamicData } = req.body;
    
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_API_KEY.startsWith('SG.')) {
      return res.status(500).json({
        success: false,
        error: "SendGrid client not initialized. Please set a valid SENDGRID_API_KEY environment variable (starts with 'SG.')."
      });
    }

    const { getSendGridClient } = await import("../../shared/sendgrid-client");
    const sendGrid = getSendGridClient();

    const result = await sendGrid.sendEmail({
      to: to || "acmltd105@gmail.com",
      subject: "ECHELONX Template Test",
      html: `
        <h2>Template Email Test</h2>
        <p>Hello ${(dynamicData && dynamicData.name) || "Shannon"},</p>
        <p>${(dynamicData && dynamicData.message) || "Template test from ECHELONX - triple check complete!"}</p>
        <p>This email was sent using the template endpoint.</p>
      `
    });

    res.json({
      success: true,
      message: "Template email sent successfully",
      result: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

export default router;

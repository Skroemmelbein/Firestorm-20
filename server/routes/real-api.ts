import express from "express";

const router = express.Router();

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

const getTwilioClientSafe = () => {
  try {
    const { initializeTwilio, getTwilioClient } = require("../../shared/twilio-client");
    
    try {
      return getTwilioClient();
    } catch (initError) {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        initializeTwilio({
          accountSid: process.env.TWILIO_ACCOUNT_SID,
          authToken: process.env.TWILIO_AUTH_TOKEN,
          phoneNumber: process.env.TWILIO_PHONE_NUMBER,
        });
        return getTwilioClient();
      }
      throw initError;
    }
  } catch (error) {
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
    const twilio = getTwilioClientSafe();
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
    const twilio = getTwilioClientSafe();
    const { to, body, from, mediaUrl } = req.body;

    const result = await twilio.sendSMS({
      to,
      body,
      from,
      mediaUrl,
    });

    res.json(result);
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
    const twilio = getTwilioClientSafe();
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
    const { to, subject, html, text } = req.body;

    // For now, simulate email sending until SendGrid is fully configured
    console.log("📧 Sending email:", { to, subject });

    // Simulate SendGrid API call
    const emailResult = {
      success: true,
      messageId: `email_${Date.now()}`,
      to,
      subject,
      from: "noreply@recurflow.com",
      timestamp: new Date().toISOString(),
    };

    res.json(emailResult);
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Voice API
router.post("/voice/call", async (req, res) => {
  try {
    const twilio = getTwilioClientSafe();
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
    const twilio = getTwilioClientSafe();
    await twilio.handleIncomingSMS(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error("Error handling incoming SMS:", error);
    res.status(500).send("Error");
  }
});

router.post("/webhooks/twilio/status", async (req, res) => {
  try {
    const twilio = getTwilioClientSafe();
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
        const twilio = getTwilioClientSafe();
        await twilio.handleStatusWebhook(eventData);
      } else if (eventData.Body) {
        const twilio = getTwilioClientSafe();
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

router.post("/test/sms-mms-rcs", async (req, res) => {
  try {
    const { to, message, mediaUrl } = req.body;
    const twilio = getTwilioClientSafe();
    
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
    const twilio = getTwilioClientSafe();
    
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

export default router;

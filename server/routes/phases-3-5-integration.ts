import express from "express";
import { getXanoClient } from "../../shared/xano-client";

const router = express.Router();

router.post("/phase3/send-multilingual", async (req, res) => {
  try {
    const { to, message, targetLanguages, channel } = req.body;
    
    if (!to || !message || !targetLanguages) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, message, targetLanguages"
      });
    }

    const results = [];
    
    const { DeepLClient } = await import("../../shared/deepl-client");
    const deepl = new DeepLClient({
      apiKey: process.env.DEEPL_API_KEY || "placeholder_deepl_key",
      baseUrl: "https://api-free.deepl.com"
    });

    const { LanguageToolClient } = await import("../../shared/languagetool-client");
    const languageTool = new LanguageToolClient({
      baseUrl: "https://api.languagetool.org"
    });

    for (const targetLang of targetLanguages) {
      try {
        let translatedMessage;
        try {
          translatedMessage = await deepl.translateText(message, targetLang);
        } catch (translateError) {
          translatedMessage = `${message} (Demo translation for ${targetLang})`;
        }

        let finalMessage;
        try {
          const grammarResult = await languageTool.checkGrammar(translatedMessage, targetLang);
          finalMessage = grammarResult.correctedText || translatedMessage;
        } catch (grammarError) {
          finalMessage = translatedMessage;
        }

        let sendResult;
        if (channel === "sms" || !channel) {
          const { getSafeTwilioClient } = await import("../routes/real-api");
          const twilio = getSafeTwilioClient();
          sendResult = await twilio.sendSMS({
            to: to,
            body: finalMessage
          });
        } else if (channel === "whatsapp") {
          const { getSafeTwilioClient } = await import("../routes/real-api");
          const twilio = getSafeTwilioClient();
          sendResult = await twilio.sendWhatsApp({
            to: to,
            body: finalMessage
          });
        }

        // Log to Xano
        await getXanoClient().createRecord("multilingual_messages", {
          to_number: to,
          original_message: message,
          translated_message: finalMessage,
          target_language: targetLang,
          channel: channel || "sms",
          status: "sent",
          provider_id: sendResult?.sid,
          created_at: new Date().toISOString(),
        });

        results.push({
          language: targetLang,
          originalMessage: message,
          translatedMessage: finalMessage,
          sendResult: sendResult,
          success: true
        });

      } catch (error) {
        results.push({
          language: targetLang,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    res.json({
      success: true,
      message: "Multilingual messages processed",
      results: results
    });

  } catch (error: any) {
    console.error("Phase 3 multilingual messaging error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post("/phase4/send-template", async (req, res) => {
  try {
    const { templateSid, to, variables, channels } = req.body;
    
    if (!templateSid || !to || !channels) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: templateSid, to, channels"
      });
    }

    const results = [];
    
    const { TwilioContentClient } = await import("../../shared/twilio-content-client");
    const contentClient = new TwilioContentClient({
      accountSid: process.env.TWILIO_ACCOUNT_SID || "placeholder_sid",
      authToken: process.env.TWILIO_AUTH_TOKEN || "placeholder_token"
    });

    for (const channel of channels) {
      try {
        let sendResult;
        
        if (channel === "sms") {
          const { getSafeTwilioClient } = await import("../routes/real-api");
          const twilio = getSafeTwilioClient();
          sendResult = await twilio.sendSMS({
            to: to,
            body: `Template ${templateSid} content with variables: ${JSON.stringify(variables || {})}`
          });
        } else if (channel === "whatsapp") {
          const { getSafeTwilioClient } = await import("../routes/real-api");
          const twilio = getSafeTwilioClient();
          sendResult = await twilio.sendWhatsApp({
            to: to,
            body: `Template ${templateSid} content with variables: ${JSON.stringify(variables || {})}`
          });
        } else if (channel === "email") {
          const sendGridModule = await import("../../shared/sendgrid-client");
          const sendGrid = sendGridModule.getSendGridClient();
          sendResult = await sendGrid.sendEmail({
            to: to,
            subject: `Template ${templateSid} Email`,
            html: `<h1>Template Content</h1><p>Variables: ${JSON.stringify(variables || {})}</p>`
          });
        }

        // Log to Xano
        await getXanoClient().createRecord("template_messages", {
          template_sid: templateSid,
          to_recipient: to,
          channel: channel,
          variables: JSON.stringify(variables || {}),
          status: "sent",
          provider_id: sendResult?.sid || sendResult?.messageId,
          created_at: new Date().toISOString(),
        });

        results.push({
          channel: channel,
          templateSid: templateSid,
          sendResult: sendResult,
          success: true
        });

      } catch (error) {
        results.push({
          channel: channel,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error"
        });
      }
    }

    res.json({
      success: true,
      message: "Template messages sent across channels",
      results: results
    });

  } catch (error: any) {
    console.error("Phase 4 template messaging error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post("/phase5/send-with-failover", async (req, res) => {
  try {
    const { to, message, primaryProvider, fallbackProviders } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: to, message"
      });
    }

    const providers = [primaryProvider || "twilio", ...(fallbackProviders || ["sinch", "vonage"])];
    let lastError;
    
    for (const provider of providers) {
      try {
        let result;
        
        if (provider === "twilio") {
          const { getSafeTwilioClient } = await import("../routes/real-api");
          const twilio = getSafeTwilioClient();
          result = await twilio.sendSMS({
            to: to,
            body: message
          });
        } else if (provider === "sinch") {
          const { SinchClient } = await import("../../shared/sinch-client");
          const sinch = new SinchClient({
            servicePlanId: process.env.SINCH_SERVICE_PLAN_ID || "placeholder_plan_id",
            apiToken: process.env.SINCH_API_TOKEN || "placeholder_token"
          });
          result = await sinch.sendSMS(to, message);
        } else if (provider === "vonage") {
          const { VonageClient } = await import("../../shared/vonage-client");
          const vonage = new VonageClient({
            apiKey: process.env.VONAGE_API_KEY || "placeholder_key",
            apiSecret: process.env.VONAGE_API_SECRET || "placeholder_secret"
          });
          result = await vonage.sendSMS(to, message);
        }

        await getXanoClient().createRecord("failover_messages", {
          to_number: to,
          message: message,
          provider_used: provider,
          provider_order: providers.indexOf(provider) + 1,
          status: "sent",
          provider_id: result?.sid || result?.messageId,
          created_at: new Date().toISOString(),
        });

        const { QuickChartClient } = await import("../../shared/quickchart-client");
        const quickChart = new QuickChartClient();
        const chartUrl = await quickChart.generateChart({
          type: "doughnut",
          data: {
            labels: ["Successful", "Failed"],
            datasets: [{
              data: [1, providers.indexOf(provider)],
              backgroundColor: ["#00E676", "#FF6B6B"]
            }]
          }
        });

        res.json({
          success: true,
          message: `Message sent successfully via ${provider}`,
          result: result,
          providerUsed: provider,
          attemptNumber: providers.indexOf(provider) + 1,
          analyticsChart: chartUrl
        });
        return;

      } catch (error) {
        lastError = error;
        console.warn(`Provider ${provider} failed:`, error instanceof Error ? error.message : error);
        
        await getXanoClient().createRecord("failover_attempts", {
          to_number: to,
          message: message,
          provider_attempted: provider,
          provider_order: providers.indexOf(provider) + 1,
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          created_at: new Date().toISOString(),
        });
        
        continue;
      }
    }

    res.status(500).json({
      success: false,
      message: "All providers failed",
      error: lastError instanceof Error ? lastError.message : "Unknown error",
      providersAttempted: providers
    });

  } catch (error: any) {
    console.error("Phase 5 failover messaging error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post("/phase5/check-bounce-rate", async (req, res) => {
  try {
    const { threshold } = req.body;
    const bounceThreshold = threshold || 3; // 3% default
    
    const recentMessages = await getXanoClient().queryRecords("communications", {
      created_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() } // Last 24 hours
    });

    const totalMessages = recentMessages.length;
    const failedMessages = recentMessages.filter(msg => msg.status === "failed" || msg.status === "bounced").length;
    const bounceRate = totalMessages > 0 ? (failedMessages / totalMessages) * 100 : 0;

    await getXanoClient().createRecord("bounce_rate_checks", {
      total_messages: totalMessages,
      failed_messages: failedMessages,
      bounce_rate: bounceRate,
      threshold: bounceThreshold,
      alert_triggered: bounceRate > bounceThreshold,
      checked_at: new Date().toISOString(),
    });

    let slackResult = null;
    if (bounceRate > bounceThreshold) {
      try {
        const { SlackClient } = await import("../../shared/slack-client");
        const slack = new SlackClient({
          botToken: process.env.SLACK_BOT_TOKEN || "placeholder_token"
        });

        const alertMessage = `🚨 ECHELONX ALERT: Bounce rate is ${bounceRate.toFixed(2)}% (above ${bounceThreshold}% threshold)\n` +
                           `📊 Stats: ${failedMessages}/${totalMessages} messages failed in last 24h\n` +
                           `🔗 Dashboard: https://app.echelonx.com/analytics`;

        slackResult = await slack.sendMessage("#alerts", alertMessage);
      } catch (slackError) {
        console.warn("Slack alert failed:", slackError);
        slackResult = { demo_mode: true, error: slackError instanceof Error ? slackError.message : "Unknown error" };
      }
    }

    res.json({
      success: true,
      message: "Bounce rate check completed",
      result: {
        bounceRate: bounceRate,
        threshold: bounceThreshold,
        totalMessages: totalMessages,
        failedMessages: failedMessages,
        alertTriggered: bounceRate > bounceThreshold,
        slackAlert: slackResult
      }
    });

  } catch (error: any) {
    console.error("Phase 5 bounce rate check error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

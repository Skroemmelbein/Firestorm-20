import express from "express";
import fetch from "node-fetch";

const router = express.Router();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Create Basic Auth header for Twilio
const twilioAuth = Buffer.from(
  `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
).toString("base64");

// Send SMS endpoint
router.post("/send", async (req, res) => {
  try {
    const { to, message, campaignId } = req.body;

    console.log(`🚀 Sending SMS to ${to}: "${message}"`);

    // Format phone number
    const formattedPhone = to.startsWith("+")
      ? to
      : `+1${to.replace(/\D/g, "")}`;

    // Validate: FROM and TO cannot be the same
    if (formattedPhone === TWILIO_PHONE_NUMBER) {
      return res.status(400).json({
        success: false,
        error: `Cannot send SMS to the same number as FROM number (${TWILIO_PHONE_NUMBER}). Please use a different test number.`,
        code: "SAME_FROM_TO_NUMBER",
        suggestion: "Try using +18559600037 as test number instead",
      });
    }

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${twilioAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: formattedPhone,
          Body: message,
        }),
      },
    );

    // Clone response to avoid "body stream already read" error
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse Twilio response:", parseError);
      result = {
        message: "Failed to parse response",
        error: parseError.message,
      };
    }

    if (response.ok) {
      console.log(`✅ SMS sent successfully! SID: ${result.sid}`);

      // Log to database if Xano is connected
      try {
        // This would integrate with your Xano API
        console.log("📝 Logging SMS to database...");
      } catch (dbError) {
        console.warn("⚠️ Failed to log to database:", dbError);
      }

      res.json({
        success: true,
        sid: result.sid,
        status: result.status,
        message: `SMS sent to ${formattedPhone}`,
      });
    } else {
      console.error("❌ SMS failed:", result);
      res.status(400).json({
        success: false,
        error: result.message || "SMS send failed",
        code: result.code,
      });
    }
  } catch (error) {
    console.error("❌ SMS API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

// Send the test message immediately
async function sendTestMessage() {
  try {
    console.log("🚀 Sending test message to different test number...");

    // Use a different test number - can't send to same as FROM number
    const formattedPhone = "+18559600037"; // Test number different from FROM

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${twilioAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE_NUMBER,
          To: formattedPhone,
          Body: "whhhhaaaa up",
        }),
      },
    );

    // Fix response parsing
    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse test SMS response:", parseError);
      result = {
        message: "Failed to parse response",
        error: parseError.message,
      };
    }

    if (response.ok) {
      console.log("✅ Test SMS sent successfully!");
      console.log("📱 SID:", result.sid);
      console.log("📊 Status:", result.status);
    } else {
      console.error("❌ Test SMS failed:", result);
    }
  } catch (error) {
    console.error("❌ Error sending test SMS:", error);
  }
}

// Auto-send test message
sendTestMessage();

// Webhook for incoming SMS
router.post("/webhook/incoming", async (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;

    console.log(`📨 Incoming SMS from ${From}: "${Body}"`);

    // Log incoming message
    // This would integrate with Xano API

    // Process AI response if needed
    // This would trigger AI response system

    res
      .status(200)
      .send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.status(500).send("Error");
  }
});

// Status webhook
router.post("/webhook/status", async (req, res) => {
  try {
    const { MessageSid, MessageStatus } = req.body;

    console.log(
      `📊 SMS Status Update - SID: ${MessageSid}, Status: ${MessageStatus}`,
    );

    // Update status in database
    // This would integrate with Xano API

    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Status webhook error:", error);
    res.status(500).send("Error");
  }
});

export default router;

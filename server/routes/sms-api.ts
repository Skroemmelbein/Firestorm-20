import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Twilio credentials from provided info
const TWILIO_ACCOUNT_SID = "ACf19a39d865d43659b94a3a2074";
const TWILIO_AUTH_TOKEN = "1f9a48e4dcd9c518889e148fe931e226";
const TWILIO_PHONE_NUMBER = "+18559600037";

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

    const result = await response.json();

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
    console.log("🚀 Sending test message to 8558600037...");

    const formattedPhone = "+18559600037";

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

    const result = await response.json();

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

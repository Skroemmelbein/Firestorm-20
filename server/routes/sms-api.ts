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

router.post("/send", async (req, res) => {
  console.log("🔄 SMS request redirected to main endpoint to avoid 405 conflicts");
  res.status(301).json({
    success: false,
    message: "SMS endpoint moved to /api/real/sms/send",
    redirect: "/api/real/sms/send"
  });
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

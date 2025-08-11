import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Send test SMS immediately
router.post("/send-test", async (req, res) => {
  try {
    const { to, message } = req.body;

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: "+18559600037",
          To: to,
          Body: message,
        }),
      },
    );

    const result = await twilioResponse.json();

    if (twilioResponse.ok) {
      res.json({
        success: true,
        message: `SMS sent successfully to ${to}`,
        sid: (result as any).sid,
      });
    } else {
      res.status(400).json({
        success: false,
        error: (result as any).message || "Failed to send SMS",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Auto-send the test message
async function sendTestMessage() {
  try {
    console.log("🚀 Sending test SMS to 8558600037...");

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: "+18559600037",
          To: "+18144409068",
          Body: "Test SMS from ECHELONX platform",
        }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Test SMS sent successfully!", (result as any).sid);
    } else {
      console.error("❌ Failed to send test SMS:", result);
    }
  } catch (error) {
    console.error("❌ Error sending test SMS:", error);
  }
}

// Send the test message immediately when this module loads
sendTestMessage();

export default router;

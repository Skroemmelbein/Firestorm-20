import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Send test SMS immediately
router.post("/send-test", async (req, res) => {
  try {
    const { to, message } = req.body;

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/ACf19a39d865d43659b94a3a2074/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from("ACf19a39d865d43659b94a3a2074:1f9a48e4dcd9c518889e148fe931e226").toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: "+18558600037",
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
        sid: result.sid,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message || "Failed to send SMS",
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
      `https://api.twilio.com/2010-04-01/Accounts/ACf19a39d865d43659b94a3a2074/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from("ACf19a39d865d43659b94a3a2074:1f9a48e4dcd9c518889e148fe931e226").toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: "+18558600037",
          To: "+18558600037",
          Body: "whhhhaaaa up",
        }),
      },
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Test SMS sent successfully!", result.sid);
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

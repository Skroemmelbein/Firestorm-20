import { RequestHandler } from "express";

export const sendAutomaticNotification: RequestHandler = async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;
    const conversationSid = process.env.TWILIO_CONVERSATION_SID;

    if (!accountSid || !authToken || !fromPhone) {
      return res.status(400).json({
        error: "Missing Twilio credentials",
        message: "Please configure Twilio environment variables"
      });
    }

    // Shannon's phone number
    const shannonPhone = "+18144409068";

    // Notification message
    const message = `🚀 ECELONX SYSTEM UPDATE:

✅ RCS Management Center: DEPLOYED
✅ NexusDynamics RCS Agent: CONFIGURED 
✅ Conversation SID: ${conversationSid}
✅ 100+ Professional Themes: LOADED
✅ Skin Customizer: ACTIVE
✅ Webhook Endpoints: READY

Your Fortune 10-grade command center is fully operational! 

Drive safely! 🚗💨

- ECELONX System`;

    // Send SMS using Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: fromPhone,
        To: shannonPhone,
        Body: message
      })
    });

    const responseText = await response.text();

    if (response.ok) {
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        result = { message: responseText };
      }

      console.log(`📱 Automatic notification sent to Shannon: ${result.sid}`);

      res.json({
        success: true,
        message: "Automatic notification sent successfully",
        messageSid: result.sid,
        to: shannonPhone,
        from: fromPhone,
        status: result.status,
        timestamp: new Date().toISOString(),
        integrations: {
          rcsAgent: "rcs:nexusdynamics_3ohzywua_agent",
          conversationSid: conversationSid,
          studioFlowSid: process.env.TWILIO_STUDIO_FLOW_SID
        }
      });
    } else {
      res.status(response.status).json({
        error: `SMS send failed: ${response.status}`,
        message: responseText
      });
    }

  } catch (error) {
    console.error("Automatic notification error:", error);
    res.status(500).json({
      error: "Failed to send automatic notification",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

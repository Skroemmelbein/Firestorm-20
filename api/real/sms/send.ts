import { VercelRequest, VercelResponse } from '@vercel/node';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, body: message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: 'to' and 'body'",
      });
    }

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      return res.status(500).json({
        success: false,
        error: "Twilio credentials not configured",
      });
    }

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

    // Create Basic Auth header for Twilio
    const twilioAuth = Buffer.from(
      `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`,
    ).toString("base64");

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
      res.json({
        success: true,
        sid: result.sid,
        status: result.status,
        message: `SMS sent to ${formattedPhone}`,
      });
    } else {
      console.error("❌ SMS failed:", result);
      
      let errorMessage = result.message || "SMS send failed";
      if (result.code === 21610) {
        errorMessage = "The recipient has unsubscribed from SMS messages. Please use a different number for testing.";
      }
      
      res.status(400).json({
        success: false,
        error: errorMessage,
        code: result.code,
        twilioError: result
      });
    }
  } catch (error: any) {
    console.error("❌ SMS API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}

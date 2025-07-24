import { RequestHandler } from "express";
import { getSendGridClient } from "../../shared/sendgrid-client";

export const testSendGrid: RequestHandler = async (req, res) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).json({
        error: "SendGrid API key not configured",
        message: "Please add SENDGRID_API_KEY to your .env file"
      });
    }

    if (process.env.SENDGRID_API_KEY === "SG.placeholder_key_replace_with_real_sendgrid_api_key") {
      return res.status(500).json({
        error: "SendGrid API key is placeholder",
        message: "Please replace the placeholder SendGrid API key with a real one"
      });
    }

    const sendGridClient = getSendGridClient();
    
    // Test connection first
    const isConnected = await sendGridClient.testConnection();
    if (!isConnected) {
      return res.status(500).json({
        error: "SendGrid connection failed",
        message: "Unable to connect to SendGrid API. Check your API key."
      });
    }

    // Send test email
    const result = await sendGridClient.sendEmail({
      to: "shannonkroemmelbein@gmail.com",
      subject: "ECELONX SendGrid Test - System Operational",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #111111; color: white; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00CED1; font-size: 24px; margin: 0;">ECELONX COMMAND CENTER</h1>
            <p style="color: #b3b3b3; margin: 10px 0 0 0;">SendGrid Integration Test</p>
          </div>
          
          <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 30px; margin: 20px 0;">
            <h2 style="color: #00E676; margin: 0 0 20px 0;">✅ SendGrid Status: Operational</h2>
            <p style="color: #white; margin: 0 0 15px 0;">Your SendGrid email system is now active and sending from shannonkroemmelbein@gmail.com</p>
            
            <div style="margin: 20px 0;">
              <p style="color: #b3b3b3; margin: 5px 0;"><strong>Test Time:</strong> ${new Date().toISOString()}</p>
              <p style="color: #b3b3b3; margin: 5px 0;"><strong>From Email:</strong> shannonkroemmelbein@gmail.com</p>
              <p style="color: #b3b3b3; margin: 5px 0;"><strong>System:</strong> ECELONX Fortune 10 Command Center</p>
            </div>
          </div>
          
          <p style="color: #737373; font-size: 12px; text-align: center; margin: 30px 0 0 0;">
            This is an automated test from your ECELONX system.
          </p>
        </div>
      `
    });

    res.json({
      success: true,
      message: "SendGrid test email sent successfully",
      result: result,
      from: "shannonkroemmelbein@gmail.com",
      to: "shannonkroemmelbein@gmail.com",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("SendGrid test error:", error);
    res.status(500).json({
      error: "SendGrid test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      details: "Check server logs for more information"
    });
  }
};

export const getSendGridStatus: RequestHandler = async (req, res) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      return res.json({
        configured: false,
        status: "missing_api_key",
        message: "SendGrid API key not found in environment variables"
      });
    }

    if (process.env.SENDGRID_API_KEY === "SG.placeholder_key_replace_with_real_sendgrid_api_key") {
      return res.json({
        configured: false,
        status: "placeholder_key",
        message: "SendGrid API key is still a placeholder"
      });
    }

    const sendGridClient = getSendGridClient();
    const isConnected = await sendGridClient.testConnection();

    res.json({
      configured: true,
      connected: isConnected,
      status: isConnected ? "operational" : "connection_failed",
      fromEmail: "shannonkroemmelbein@gmail.com",
      message: isConnected ? "SendGrid is operational" : "SendGrid connection failed"
    });

  } catch (error) {
    console.error("SendGrid status check error:", error);
    res.json({
      configured: true,
      connected: false,
      status: "error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

import { RequestHandler } from "express";

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export const testTwilioConnection: RequestHandler = async (req, res) => {
  try {
    const config: TwilioConfig = req.body;
    
    if (!config.accountSid || !config.authToken) {
      return res.status(400).json({ error: "Account SID and Auth Token are required" });
    }

    // Simulate Twilio API call
    // In a real implementation, you would use the Twilio SDK:
    /*
    const twilio = require('twilio');
    const client = twilio(config.accountSid, config.authToken);
    
    // Test by fetching account info
    const account = await client.api.accounts(config.accountSid).fetch();
    */

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validate SID format
    if (!config.accountSid.startsWith('AC')) {
      return res.status(400).json({
        error: "Invalid Account SID format. Should start with 'AC'"
      });
    }

    // For demo, randomly succeed or fail to show both states  
    const shouldSucceed = Math.random() > 0.25; // 75% success rate
    
    if (shouldSucceed) {
      res.json({
        connected: true,
        message: "Successfully connected to Twilio",
        accountSid: config.accountSid,
        phoneNumber: config.phoneNumber,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(401).json({
        error: "Failed to authenticate with Twilio. Please check your Account SID and Auth Token."
      });
    }
    
  } catch (error) {
    console.error("Twilio connection test failed:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};

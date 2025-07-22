import { RequestHandler } from "express";

interface IntegrationsConfig {
  xano?: {
    instanceUrl: string;
    apiKey: string;
    databaseId: string;
  };
  twilio?: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
}

// In-memory storage for demo purposes
// In production, you'd use a proper database
let storedConfig: IntegrationsConfig = {};

export const getIntegrationsConfig: RequestHandler = (req, res) => {
  // Return config without sensitive data in response
  const safeConfig = {
    xano: storedConfig.xano ? {
      instanceUrl: storedConfig.xano.instanceUrl,
      apiKey: storedConfig.xano.apiKey ? "***" + storedConfig.xano.apiKey.slice(-4) : "",
      databaseId: storedConfig.xano.databaseId
    } : undefined,
    twilio: storedConfig.twilio ? {
      accountSid: storedConfig.twilio.accountSid,
      authToken: storedConfig.twilio.authToken ? "***" + storedConfig.twilio.authToken.slice(-4) : "",
      phoneNumber: storedConfig.twilio.phoneNumber
    } : undefined
  };

  res.json(safeConfig);
};

export const saveIntegrationsConfig: RequestHandler = (req, res) => {
  try {
    const config: IntegrationsConfig = req.body;
    
    // Validate required fields
    if (config.xano) {
      if (!config.xano.instanceUrl || !config.xano.apiKey) {
        return res.status(400).json({ error: "Xano instance URL and API key are required" });
      }
    }
    
    if (config.twilio) {
      if (!config.twilio.accountSid || !config.twilio.authToken) {
        return res.status(400).json({ error: "Twilio Account SID and Auth Token are required" });
      }
    }

    // Store the configuration
    storedConfig = config;
    
    res.json({ message: "Configuration saved successfully" });
  } catch (error) {
    console.error("Error saving integrations config:", error);
    res.status(500).json({ error: "Failed to save configuration" });
  }
};

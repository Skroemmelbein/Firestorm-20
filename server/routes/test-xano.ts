import { RequestHandler } from "express";

interface XanoConfig {
  instanceUrl: string;
  apiKey: string;
  databaseId: string;
}

export const testXanoConnection: RequestHandler = async (req, res) => {
  try {
    const config: XanoConfig = req.body;
    
    if (!config.instanceUrl || !config.apiKey) {
      return res.status(400).json({ error: "Instance URL and API key are required" });
    }

    // Simulate Xano API call
    // In a real implementation, you would make an actual HTTP request to Xano
    const testUrl = `${config.instanceUrl}/api:health`;
    
    // Simulate network delay and response
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful response for demo purposes
    // Replace this with actual Xano API call:
    /*
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    */

    // For demo, randomly succeed or fail to show both states
    const shouldSucceed = Math.random() > 0.3; // 70% success rate
    
    if (shouldSucceed) {
      res.json({
        connected: true,
        message: "Successfully connected to Xano",
        instance: config.instanceUrl,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        error: "Failed to authenticate with Xano API. Please check your API key and instance URL."
      });
    }
    
  } catch (error) {
    console.error("Xano connection test failed:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};

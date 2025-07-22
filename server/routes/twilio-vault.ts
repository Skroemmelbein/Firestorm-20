import { RequestHandler } from "express";
import { TwilioAPIEndpoint } from "@shared/twilio-api-vault";

// In-memory storage for uploaded APIs
// In production, you'd use a proper database
let uploadedAPIs: TwilioAPIEndpoint[] = [];

export const uploadTwilioAPIs: RequestHandler = (req, res) => {
  try {
    const apis: TwilioAPIEndpoint[] = req.body.apis;
    
    if (!Array.isArray(apis)) {
      return res.status(400).json({ error: "Invalid API data format" });
    }

    // Validate API structure
    const validAPIs = apis.filter(api => 
      api.id && 
      api.name && 
      api.description && 
      api.method && 
      api.path &&
      api.category
    );

    if (validAPIs.length === 0) {
      return res.status(400).json({ error: "No valid APIs found in upload" });
    }

    // Add to stored APIs
    uploadedAPIs.push(...validAPIs);
    
    res.json({ 
      message: `Successfully uploaded ${validAPIs.length} APIs`,
      uploadedCount: validAPIs.length,
      totalAPIs: uploadedAPIs.length
    });
  } catch (error) {
    console.error("Error uploading APIs:", error);
    res.status(500).json({ error: "Failed to upload APIs" });
  }
};

export const getUploadedAPIs: RequestHandler = (req, res) => {
  res.json({ apis: uploadedAPIs });
};

export const clearUploadedAPIs: RequestHandler = (req, res) => {
  uploadedAPIs = [];
  res.json({ message: "All uploaded APIs cleared" });
};

export const testTwilioAPI: RequestHandler = async (req, res) => {
  try {
    const { endpointId, parameters, credentials } = req.body;
    
    if (!endpointId || !credentials) {
      return res.status(400).json({ error: "Endpoint ID and credentials are required" });
    }

    // In a real implementation, you would:
    // 1. Find the API endpoint by ID
    // 2. Make the actual Twilio API call using the credentials
    // 3. Return the real response
    
    // For demo purposes, simulate the API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success/failure
    const success = Math.random() > 0.25; // 75% success rate
    
    if (success) {
      res.json({
        success: true,
        response: {
          sid: 'SM' + Math.random().toString(36).substr(2, 32),
          status: 'queued',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: "API call failed - check your credentials and parameters"
      });
    }
    
  } catch (error) {
    console.error("Twilio API test failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
};

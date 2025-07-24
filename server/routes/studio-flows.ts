import { RequestHandler } from "express";

interface TwilioStudioFlowRequest {
  friendlyName: string;
  status: "draft" | "published";
  definition: string; // JSON string
}

export const createStudioFlow: RequestHandler = async (req, res) => {
  try {
    const { friendlyName, status, definition }: TwilioStudioFlowRequest = req.body;

    // Get Twilio credentials from environment or request
    const accountSid = process.env.TWILIO_ACCOUNT_SID || req.headers['x-twilio-account-sid'];
    const authToken = process.env.TWILIO_AUTH_TOKEN || req.headers['x-twilio-auth-token'];

    if (!accountSid || !authToken) {
      return res.status(400).json({
        error: "Missing Twilio credentials",
        message: "Please provide Account SID and Auth Token"
      });
    }

    // Create flow using Twilio Studio API
    const twilioUrl = `https://studio.twilio.com/v2/Flows`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const formData = new URLSearchParams();
    formData.append('FriendlyName', friendlyName);
    formData.append('Status', status);
    if (definition) {
      formData.append('Definition', definition);
    }

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Twilio Studio API Error:', response.status, responseText);
      return res.status(response.status).json({
        error: `Twilio Studio API Error ${response.status}`,
        message: responseText,
        details: "Check your Twilio credentials and flow definition"
      });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to parse Twilio response",
        message: responseText
      });
    }

    res.json({
      success: true,
      flow: result,
      message: `Studio Flow "${friendlyName}" created successfully`,
      sid: result.sid,
      status: result.status
    });

  } catch (error) {
    console.error("Studio Flow creation error:", error);
    res.status(500).json({
      error: "Failed to create Studio Flow",
      message: error instanceof Error ? error.message : "Unknown error",
      details: "Check server logs for more information"
    });
  }
};

export const getStudioFlows: RequestHandler = async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || req.headers['x-twilio-account-sid'];
    const authToken = process.env.TWILIO_AUTH_TOKEN || req.headers['x-twilio-auth-token'];

    if (!accountSid || !authToken) {
      return res.status(400).json({
        error: "Missing Twilio credentials",
        message: "Please provide Account SID and Auth Token"
      });
    }

    const twilioUrl = `https://studio.twilio.com/v2/Flows`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(twilioUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      }
    });

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Twilio Studio API Error ${response.status}`,
        message: responseText
      });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to parse Twilio response",
        message: responseText
      });
    }

    res.json({
      success: true,
      flows: result.flows || [],
      message: "Studio Flows retrieved successfully"
    });

  } catch (error) {
    console.error("Studio Flows retrieval error:", error);
    res.status(500).json({
      error: "Failed to retrieve Studio Flows",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const updateStudioFlow: RequestHandler = async (req, res) => {
  try {
    const { flowSid } = req.params;
    const { friendlyName, status, definition }: TwilioStudioFlowRequest = req.body;

    const accountSid = process.env.TWILIO_ACCOUNT_SID || req.headers['x-twilio-account-sid'];
    const authToken = process.env.TWILIO_AUTH_TOKEN || req.headers['x-twilio-auth-token'];

    if (!accountSid || !authToken) {
      return res.status(400).json({
        error: "Missing Twilio credentials",
        message: "Please provide Account SID and Auth Token"
      });
    }

    const twilioUrl = `https://studio.twilio.com/v2/Flows/${flowSid}`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const formData = new URLSearchParams();
    if (friendlyName) formData.append('FriendlyName', friendlyName);
    if (status) formData.append('Status', status);
    if (definition) formData.append('Definition', definition);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Twilio Studio API Error ${response.status}`,
        message: responseText
      });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to parse Twilio response",
        message: responseText
      });
    }

    res.json({
      success: true,
      flow: result,
      message: `Studio Flow updated successfully`,
      sid: result.sid,
      status: result.status
    });

  } catch (error) {
    console.error("Studio Flow update error:", error);
    res.status(500).json({
      error: "Failed to update Studio Flow",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const testTwilioConnection: RequestHandler = async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID || req.headers['x-twilio-account-sid'];
    const authToken = process.env.TWILIO_AUTH_TOKEN || req.headers['x-twilio-auth-token'];

    if (!accountSid || !authToken) {
      return res.status(400).json({
        error: "Missing Twilio credentials",
        message: "Please provide Account SID and Auth Token"
      });
    }

    // Test connection by fetching account info
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(twilioUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Twilio API Error ${response.status}`,
        message: "Invalid credentials or connection failed"
      });
    }

    const account = await response.json();

    res.json({
      success: true,
      connected: true,
      account: {
        sid: account.sid,
        friendlyName: account.friendly_name,
        status: account.status,
        type: account.type
      },
      message: "Twilio connection successful"
    });

  } catch (error) {
    console.error("Twilio connection test error:", error);
    res.status(500).json({
      error: "Connection test failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

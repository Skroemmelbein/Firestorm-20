import express, { RequestHandler } from "express";

const router = express.Router();

// Safe Twilio client getter
const getTwilioClientSafe = () => {
  try {
    const { getTwilioClient } = require("../../shared/twilio-client");
    return getTwilioClient();
  } catch (error) {
    throw new Error(
      "Twilio client not initialized. Please configure Twilio credentials first.",
    );
  }
};

// Discover all Twilio SIDs from account
export const discoverTwilioSIDs: RequestHandler = async (req, res) => {
  try {
    const twilio = getTwilioClientSafe();
    const discovered: any[] = [];

    console.log("🔍 Starting Twilio SID discovery...");

    // Discover Phone Numbers
    try {
      const phoneNumbers = await twilio.incomingPhoneNumbers.list({ limit: 50 });
      phoneNumbers.forEach((number: any) => {
        discovered.push({
          id: Date.now().toString() + Math.random(),
          name: `Phone Number ${number.phoneNumber}`,
          sid: number.sid,
          type: 'phone',
          description: `Phone: ${number.phoneNumber}, Friendly Name: ${number.friendlyName || 'N/A'}`,
          dateAdded: new Date().toISOString(),
          status: 'active',
          additionalInfo: {
            phoneNumber: number.phoneNumber,
            friendlyName: number.friendlyName,
            capabilities: number.capabilities,
          }
        });
      });
      console.log(`📱 Found ${phoneNumbers.length} phone numbers`);
    } catch (error) {
      console.log("❌ Could not fetch phone numbers:", error.message);
    }

    // Discover Messaging Services
    try {
      const services = await twilio.messaging.v1.services.list({ limit: 50 });
      services.forEach((service: any) => {
        discovered.push({
          id: Date.now().toString() + Math.random(),
          name: `Messaging Service: ${service.friendlyName}`,
          sid: service.sid,
          type: 'service',
          description: `Messaging Service: ${service.friendlyName}`,
          dateAdded: new Date().toISOString(),
          status: 'active',
          additionalInfo: {
            friendlyName: service.friendlyName,
            inboundRequestUrl: service.inboundRequestUrl,
          }
        });
      });
      console.log(`💬 Found ${services.length} messaging services`);
    } catch (error) {
      console.log("❌ Could not fetch messaging services:", error.message);
    }

    // Discover Studio Flows
    try {
      const flows = await twilio.studio.v2.flows.list({ limit: 50 });
      flows.forEach((flow: any) => {
        discovered.push({
          id: Date.now().toString() + Math.random(),
          name: `Studio Flow: ${flow.friendlyName}`,
          sid: flow.sid,
          type: 'flow',
          description: `Studio Flow: ${flow.friendlyName}, Status: ${flow.status}`,
          dateAdded: new Date().toISOString(),
          status: flow.status === 'published' ? 'active' : 'inactive',
          additionalInfo: {
            friendlyName: flow.friendlyName,
            status: flow.status,
            revision: flow.revision,
          }
        });
      });
      console.log(`🧠 Found ${flows.length} studio flows`);
    } catch (error) {
      console.log("❌ Could not fetch studio flows:", error.message);
    }

    // Discover Conversations
    try {
      const conversations = await twilio.conversations.v1.conversations.list({ limit: 50 });
      conversations.forEach((conversation: any) => {
        discovered.push({
          id: Date.now().toString() + Math.random(),
          name: `Conversation: ${conversation.friendlyName || conversation.sid}`,
          sid: conversation.sid,
          type: 'conversation',
          description: `Conversation: ${conversation.friendlyName || 'Unnamed'}, State: ${conversation.state}`,
          dateAdded: new Date().toISOString(),
          status: conversation.state === 'active' ? 'active' : 'inactive',
          additionalInfo: {
            friendlyName: conversation.friendlyName,
            state: conversation.state,
            dateCreated: conversation.dateCreated,
          }
        });
      });
      console.log(`💬 Found ${conversations.length} conversations`);
    } catch (error) {
      console.log("❌ Could not fetch conversations:", error.message);
    }

    // Discover TaskRouter Workspaces
    try {
      const workspaces = await twilio.taskrouter.v1.workspaces.list({ limit: 50 });
      workspaces.forEach((workspace: any) => {
        discovered.push({
          id: Date.now().toString() + Math.random(),
          name: `Workspace: ${workspace.friendlyName}`,
          sid: workspace.sid,
          type: 'workspace',
          description: `TaskRouter Workspace: ${workspace.friendlyName}`,
          dateAdded: new Date().toISOString(),
          status: 'active',
          additionalInfo: {
            friendlyName: workspace.friendlyName,
            prioritizeQueueOrder: workspace.prioritizeQueueOrder,
          }
        });
      });
      console.log(`🏢 Found ${workspaces.length} workspaces`);
    } catch (error) {
      console.log("❌ Could not fetch workspaces:", error.message);
    }

    // Discover Sync Services
    try {
      const syncServices = await twilio.sync.v1.services.list({ limit: 50 });
      syncServices.forEach((service: any) => {
        discovered.push({
          id: Date.now().toString() + Math.random(),
          name: `Sync Service: ${service.friendlyName || service.sid}`,
          sid: service.sid,
          type: 'other',
          description: `Sync Service: ${service.friendlyName || 'Unnamed'}`,
          dateAdded: new Date().toISOString(),
          status: 'active',
          additionalInfo: {
            friendlyName: service.friendlyName,
            reachabilityWebhooksEnabled: service.reachabilityWebhooksEnabled,
          }
        });
      });
      console.log(`🔄 Found ${syncServices.length} sync services`);
    } catch (error) {
      console.log("❌ Could not fetch sync services:", error.message);
    }

    console.log(`✅ Discovery complete! Found ${discovered.length} total SIDs`);

    res.json({
      success: true,
      message: `Successfully discovered ${discovered.length} Twilio SIDs`,
      sids: discovered,
      summary: {
        total: discovered.length,
        byType: discovered.reduce((acc: any, sid) => {
          acc[sid.type] = (acc[sid.type] || 0) + 1;
          return acc;
        }, {}),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Twilio SID discovery failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to discover SIDs",
      timestamp: new Date().toISOString(),
    });
  }
};

router.post("/discover-sids", discoverTwilioSIDs);

export default router;

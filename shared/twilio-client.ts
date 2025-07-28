// Real Twilio Client - SMS, Voice, and Webhooks
import { getConvexClient } from "./convex-client";

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

interface SMSMessage {
  to: string;
  body: string;
  from?: string;
  mediaUrl?: string[];
}

interface VoiceCall {
  to: string;
  from?: string;
  url?: string; // TwiML URL
  twiml?: string; // Direct TwiML
}

interface TwilioWebhook {
  MessageSid: string;
  MessageStatus: string;
  To: string;
  From: string;
  Body?: string;
  NumMedia?: string;
  AccountSid: string;
  ApiVersion: string;
  ErrorCode?: string;
  ErrorMessage?: string;
}

export class TwilioClient {
  private config: TwilioConfig;
  private baseUrl: string;

  constructor(config: TwilioConfig) {
    this.config = config;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}`;
  }

  private getAuthHeader(): string {
    const credentials = `${this.config.accountSid}:${this.config.authToken}`;
    return `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  private async makeRequest(
    endpoint: string,
    method: "GET" | "POST" = "GET",
    data?: Record<string, string>,
  ) {
    const url = `${this.baseUrl}${endpoint}`;

    const options: any = {
      method,
      headers: {
        Authorization: this.getAuthHeader(),
      },
    };

    if (data && method === "POST") {
      options.headers["Content-Type"] = "application/x-www-form-urlencoded";
      options.body = new URLSearchParams(data);
    }

    try {
      const response = await fetch(url, options);

      // Fix: Clone response to avoid "body stream already read" error
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Failed to parse Twilio response:", parseError);
        result = {
          message: "Failed to parse response",
          error: parseError.message,
          rawResponse: responseText,
        };
      }

      if (!response.ok) {
        // Create detailed error object with Twilio specifics
        const twilioError = {
          status: response.status,
          statusText: response.statusText,
          code: result.code,
          message: result.message,
          more_info: result.more_info,
          detail: result.detail,
          url,
          method,
          timestamp: new Date().toISOString(),
        };

        console.error("Twilio API Error:", twilioError);

        const error = new Error(
          result.message || `HTTP ${response.status}: ${response.statusText}`,
        );
        (error as any).twilioError = twilioError;
        throw error;
      }

      return result;
    } catch (error) {
      console.error("Twilio API Request Failed:", {
        url,
        method,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  // Send SMS
  async sendSMS(message: SMSMessage): Promise<any> {
    const data = {
      To: message.to,
      From: message.from || this.config.phoneNumber,
      Body: message.body,
      ...(process.env.TWILIO_MESSAGING_SERVICE_SID && {
        MessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
      })
    };

    if (message.mediaUrl && message.mediaUrl.length > 0) {
      message.mediaUrl.forEach((url, index) => {
        data[`MediaUrl${index}`] = url;
      });
    }

    try {
      const result = await this.makeRequest("/Messages.json", "POST", data);

      // Log to Convex
      await this.logCommunicationToConvex({
        channel: "sms",
        direction: "outbound",
        to_number: message.to,
        from_number: message.from || this.config.phoneNumber,
        content: message.body,
        status: "sent",
        provider: "twilio",
        provider_id: result.sid,
        provider_status: result.status,
        cost: parseFloat(result.price) || 0,
        sent_at: new Date().toISOString(),
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: message.to,
        from: message.from || this.config.phoneNumber,
        body: message.body,
        price: result.price,
        dateCreated: result.date_created,
      };
    } catch (error) {
      // Enhanced error information
      const errorDetails = {
        message: error instanceof Error ? error.message : "Unknown error",
        twilioError: (error as any).twilioError || null,
        timestamp: new Date().toISOString(),
      };

      // Log failed attempt to Convex
      await this.logCommunicationToConvex({
        channel: "sms",
        direction: "outbound",
        to_number: message.to,
        from_number: message.from || this.config.phoneNumber,
        content: message.body,
        status: "failed",
        provider: "twilio",
        error_message: errorDetails.message,
      });

      // Throw enhanced error
      const enhancedError = new Error(errorDetails.message);
      (enhancedError as any).details = errorDetails;
      throw enhancedError;
    }
  }

  // Make Voice Call
  async makeCall(call: VoiceCall): Promise<any> {
    const data = {
      To: call.to,
      From: call.from || this.config.phoneNumber,
    };

    if (call.url) {
      data["Url"] = call.url;
    } else if (call.twiml) {
      data["Twiml"] = call.twiml;
    } else {
      // Default TwiML for basic call
      data["Twiml"] =
        "<Response><Say>Hello, this is a call from your RecurFlow system.</Say></Response>";
    }

    try {
      const result = await this.makeRequest("/Calls.json", "POST", data);

      // Log to Convex
      await this.logCommunicationToConvex({
        channel: "voice",
        direction: "outbound",
        to_number: call.to,
        from_number: call.from || this.config.phoneNumber,
        content: call.twiml || "Voice call initiated",
        status: "sent",
        provider: "twilio",
        provider_id: result.sid,
        provider_status: result.status,
        cost: parseFloat(result.price) || 0,
        sent_at: new Date().toISOString(),
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: call.to,
        from: call.from || this.config.phoneNumber,
        dateCreated: result.date_created,
      };
    } catch (error) {
      console.error("Voice call failed:", error);
      throw error;
    }
  }

  // Get Message Status
  async getMessageStatus(messageSid: string): Promise<any> {
    return this.makeRequest(`/Messages/${messageSid}.json`);
  }

  // Get Account Info (for testing connection)
  async getAccountInfo(): Promise<any> {
    return this.makeRequest(".json");
  }

  // Test Connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getAccountInfo();
      return true;
    } catch (error) {
      console.error("Twilio connection test failed:", error);
      return false;
    }
  }

  // Handle Incoming SMS Webhook with AI
  async handleIncomingSMS(webhook: TwilioWebhook): Promise<void> {
    try {
      console.log(
        "📨 Incoming SMS from:",
        webhook.From,
        "Message:",
        webhook.Body,
      );

      // Use AI Customer Service to handle the message
      const { getAICustomerService } = await import("./ai-customer-service.js");
      const aiService = getAICustomerService();

      const result = await aiService.handleIncomingMessage(
        webhook.From,
        webhook.Body || "",
        webhook.MessageSid,
      );

      console.log("🤖 AI Analysis:", {
        sentiment: result.analysis.sentiment,
        intent: result.analysis.intent,
        urgency: result.analysis.urgency,
        action: result.actionTaken,
        autoResponse: result.autoResponse ? "Generated" : "None",
      });
    } catch (error) {
      console.error("Error processing incoming SMS with AI:", error);

      // Fallback: basic logging without AI
      const convex = getConvexClient();
      const members = await convex.getMembers({ search: webhook.From });
      let member = members.data.find((m) => m.phone === webhook.From);

      await this.logCommunicationToConvex({
        member_id: member?.id,
        channel: "sms",
        direction: "inbound",
        from_number: webhook.From,
        to_number: webhook.To,
        content: webhook.Body || "",
        status: "delivered",
        provider: "twilio",
        provider_id: webhook.MessageSid,
        delivered_at: new Date().toISOString(),
        ai_generated: false,
      });
    }
  }

  // Handle Message Status Webhook
  async handleStatusWebhook(webhook: TwilioWebhook): Promise<void> {
    try {
      const convex = getConvexClient();

      // Update message status in Convex
      const communications = await convex.getCommunications({
        per_page: 1,
      });

      // Find the communication record by Twilio SID
      const comm = communications.find(
        (c) => c.provider_id === webhook.MessageSid,
      );

      if (comm) {
        const statusMap: Record<string, string> = {
          delivered: "delivered",
          failed: "failed",
          undelivered: "failed",
          sent: "sent",
          received: "delivered",
        };

        await convex.updateCommunicationStatus(comm.id, {
          status: statusMap[webhook.MessageStatus] || webhook.MessageStatus,
          delivered_at: webhook.MessageStatus === "delivered"
            ? new Date().toISOString()
            : undefined,
        });
      }

      console.log("Message status updated:", {
        sid: webhook.MessageSid,
        status: webhook.MessageStatus,
        error: webhook.ErrorMessage,
      });
    } catch (error) {
      console.error("Error processing status webhook:", error);
    }
  }

  // Helper to log communication to Convex
  private async logCommunicationToConvex(commData: any): Promise<void> {
    try {
      const convex = getConvexClient();
      await convex.createCommunication({
        ...commData,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log communication to Convex:", error);
      // Don't throw - logging failure shouldn't stop the main operation
    }
  }

  async sendWhatsApp(message: SMSMessage): Promise<any> {
    const data = {
      To: `whatsapp:${message.to}`,
      From: `whatsapp:${this.config.phoneNumber}`,
      Body: message.body,
    };

    if (message.mediaUrl && message.mediaUrl.length > 0) {
      message.mediaUrl.forEach((url, index) => {
        data[`MediaUrl${index}`] = url;
      });
    }

    try {
      const result = await this.makeRequest("/Messages.json", "POST", data);

      // Log to Convex
      await this.logCommunicationToConvex({
        channel: "whatsapp",
        direction: "outbound",
        to_number: message.to,
        from_number: this.config.phoneNumber,
        content: message.body,
        status: "sent",
        provider: "twilio",
        provider_id: result.sid,
        provider_status: result.status,
        cost: parseFloat(result.price) || 0,
        sent_at: new Date().toISOString(),
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: message.to,
        from: this.config.phoneNumber,
        body: message.body,
        price: result.price,
        dateCreated: result.date_created,
        channel: "whatsapp",
      };
    } catch (error) {
      console.error("WhatsApp message failed:", error);
      throw error;
    }
  }

  async executeStudioFlow(flowSid: string, to: string, parameters?: Record<string, any>): Promise<any> {
    const data = {
      To: to,
      From: this.config.phoneNumber,
    };

    if (parameters) {
      Object.entries(parameters).forEach(([key, value]) => {
        data[`Parameters.${key}`] = String(value);
      });
    }

    try {
      const result = await this.makeRequest(`/Studio/Flows/${flowSid}/Executions.json`, "POST", data);

      // Log to Convex
      await this.logCommunicationToConvex({
        channel: "studio_flow",
        direction: "outbound",
        to_number: to,
        from_number: this.config.phoneNumber,
        content: `Studio Flow executed: ${flowSid}`,
        status: "sent",
        provider: "twilio",
        provider_id: result.sid,
        provider_status: result.status,
        sent_at: new Date().toISOString(),
      });

      return {
        success: true,
        executionSid: result.sid,
        flowSid: flowSid,
        to: to,
        status: result.status,
        dateCreated: result.date_created,
      };
    } catch (error) {
      console.error("Studio Flow execution failed:", error);
      throw error;
    }
  }

  async getStudioFlowExecution(flowSid: string, executionSid: string): Promise<any> {
    return this.makeRequest(`/Studio/Flows/${flowSid}/Executions/${executionSid}.json`);
  }

  async sendRCS(message: SMSMessage & { 
    contentSid?: string; 
    richContent?: any 
  }): Promise<any> {
    const data = {
      To: message.to,
      From: message.from || this.config.phoneNumber,
      Body: message.body,
      ...(process.env.TWILIO_MESSAGING_SERVICE_SID && {
        MessagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID
      })
    };

    if (message.contentSid) {
      data["ContentSid"] = message.contentSid;
    }

    if (message.richContent) {
      data["ContentVariables"] = JSON.stringify(message.richContent);
    }

    if (message.mediaUrl && message.mediaUrl.length > 0) {
      message.mediaUrl.forEach((url, index) => {
        data[`MediaUrl${index}`] = url;
      });
    }

    try {
      const result = await this.makeRequest("/Messages.json", "POST", data);

      // Log to Convex
      await this.logCommunicationToConvex({
        channel: "rcs",
        direction: "outbound",
        to_number: message.to,
        from_number: message.from || this.config.phoneNumber,
        content: message.body,
        status: "sent",
        provider: "twilio",
        provider_id: result.sid,
        provider_status: result.status,
        cost: parseFloat(result.price) || 0,
        sent_at: new Date().toISOString(),
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: message.to,
        from: message.from || this.config.phoneNumber,
        body: message.body,
        price: result.price,
        dateCreated: result.date_created,
        channel: "rcs",
      };
    } catch (error) {
      console.error("RCS message failed:", error);
      throw error;
    }
  }

  // Enhanced Voice Call with TwiML Bins
  async makeAdvancedCall(call: VoiceCall & {
    record?: boolean;
    transcribe?: boolean;
    machineDetection?: boolean;
    timeout?: number;
  }): Promise<any> {
    const data = {
      To: call.to,
      From: call.from || this.config.phoneNumber,
    };

    if (call.url) {
      data["Url"] = call.url;
    } else if (call.twiml) {
      data["Twiml"] = call.twiml;
    } else {
      // Default TwiML for basic call
      data["Twiml"] = "<Response><Say>Hello, this is a call from ECHELONX.</Say></Response>";
    }

    if (call.record) {
      data["Record"] = "true";
    }

    if (call.transcribe) {
      data["Transcribe"] = "true";
    }

    if (call.machineDetection) {
      data["MachineDetection"] = "Enable";
    }

    if (call.timeout) {
      data["Timeout"] = call.timeout.toString();
    }

    try {
      const result = await this.makeRequest("/Calls.json", "POST", data);

      // Log to Convex
      await this.logCommunicationToConvex({
        channel: "voice_advanced",
        direction: "outbound",
        to_number: call.to,
        from_number: call.from || this.config.phoneNumber,
        content: call.twiml || "Advanced voice call initiated",
        status: "sent",
        provider: "twilio",
        provider_id: result.sid,
        provider_status: result.status,
        cost: parseFloat(result.price) || 0,
        sent_at: new Date().toISOString(),
      });

      return {
        success: true,
        sid: result.sid,
        status: result.status,
        to: call.to,
        from: call.from || this.config.phoneNumber,
        dateCreated: result.date_created,
        features: {
          record: call.record,
          transcribe: call.transcribe,
          machineDetection: call.machineDetection,
        },
      };
    } catch (error) {
      console.error("Advanced voice call failed:", error);
      throw error;
    }
  }

  async getCallRecording(callSid: string): Promise<any> {
    return this.makeRequest(`/Calls/${callSid}/Recordings.json`);
  }

  // Bulk SMS for campaigns
  async sendBulkSMS(messages: SMSMessage[]): Promise<{
    successful: number;
    failed: number;
    results: any[];
  }> {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const message of messages) {
      try {
        const result = await this.sendSMS(message);
        results.push({ success: true, ...result });
        successful++;

        // Add delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        results.push({
          success: false,
          to: message.to,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        failed++;
      }
    }

    return { successful, failed, results };
  }

  async sendBulkMultiChannel(messages: Array<{
    to: string;
    body: string;
    channels: Array<'sms' | 'whatsapp' | 'rcs'>;
    mediaUrl?: string[];
    contentSid?: string;
  }>): Promise<{
    successful: number;
    failed: number;
    results: any[];
  }> {
    const results = [];
    let successful = 0;
    let failed = 0;

    for (const message of messages) {
      for (const channel of message.channels) {
        try {
          let result;
          switch (channel) {
            case 'sms':
              result = await this.sendSMS(message);
              break;
            case 'whatsapp':
              result = await this.sendWhatsApp(message);
              break;
            case 'rcs':
              result = await this.sendRCS({ ...message, contentSid: message.contentSid });
              break;
          }
          results.push({ success: true, channel, ...result });
          successful++;
        } catch (error) {
          results.push({
            success: false,
            channel,
            to: message.to,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          failed++;
        }

        // Add delay to respect rate limits
        await new Promise((resolve) => setTimeout(resolve, 150));
      }
    }

    return { successful, failed, results };
  }
}

// Export singleton instance
let twilioClient: TwilioClient | null = null;

export function initializeTwilio(config: TwilioConfig): TwilioClient {
  twilioClient = new TwilioClient(config);
  return twilioClient;
}

export function getTwilioClient(): TwilioClient {
  if (!twilioClient) {
    console.log("🔍 Debugging Twilio client initialization...");
    console.log("TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "SET" : "NOT SET");
    console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "SET" : "NOT SET");
    console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER ? "SET" : "NOT SET");
    
    // Try to auto-initialize if we have the credentials
    if (
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    ) {
      console.log("🚀 Auto-initializing Twilio client with credentials...");
      twilioClient = new TwilioClient({
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
      });
      console.log("✅ Twilio client auto-initialized successfully");
      return twilioClient;
    }

    console.log("❌ Missing Twilio credentials for auto-initialization");
    throw new Error(
      "Twilio client not initialized. Please configure Twilio credentials first.",
    );
  }
  return twilioClient;
}

export default TwilioClient;

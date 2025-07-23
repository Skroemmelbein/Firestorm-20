// Real Twilio Client - SMS, Voice, and Webhooks
import { getXanoClient } from './xano-client';

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
    return `Basic ${Buffer.from(credentials).toString('base64')}`;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: Record<string, string>) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: any = {
      method,
      headers: {
        'Authorization': this.getAuthHeader(),
      },
    };

    if (data && method === 'POST') {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.body = new URLSearchParams(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
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
          timestamp: new Date().toISOString()
        };

        console.error('Twilio API Error:', twilioError);

        const error = new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
        (error as any).twilioError = twilioError;
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Twilio API Request Failed:', {
        url,
        method,
        error: error instanceof Error ? error.message : error
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
    };

    if (message.mediaUrl && message.mediaUrl.length > 0) {
      message.mediaUrl.forEach((url, index) => {
        data[`MediaUrl${index}`] = url;
      });
    }

    try {
      const result = await this.makeRequest('/Messages.json', 'POST', data);
      
      // Log to Xano
      await this.logCommunicationToXano({
        channel: 'sms',
        direction: 'outbound',
        to_number: message.to,
        from_number: message.from || this.config.phoneNumber,
        content: message.body,
        status: 'sent',
        provider: 'twilio',
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
      // Log failed attempt to Xano
      await this.logCommunicationToXano({
        channel: 'sms',
        direction: 'outbound',
        to_number: message.to,
        from_number: message.from || this.config.phoneNumber,
        content: message.body,
        status: 'failed',
        provider: 'twilio',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }

  // Make Voice Call
  async makeCall(call: VoiceCall): Promise<any> {
    const data = {
      To: call.to,
      From: call.from || this.config.phoneNumber,
    };

    if (call.url) {
      data['Url'] = call.url;
    } else if (call.twiml) {
      data['Twiml'] = call.twiml;
    } else {
      // Default TwiML for basic call
      data['Twiml'] = '<Response><Say>Hello, this is a call from your RecurFlow system.</Say></Response>';
    }

    try {
      const result = await this.makeRequest('/Calls.json', 'POST', data);
      
      // Log to Xano
      await this.logCommunicationToXano({
        channel: 'voice',
        direction: 'outbound',
        to_number: call.to,
        from_number: call.from || this.config.phoneNumber,
        content: call.twiml || 'Voice call initiated',
        status: 'sent',
        provider: 'twilio',
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
      console.error('Voice call failed:', error);
      throw error;
    }
  }

  // Get Message Status
  async getMessageStatus(messageSid: string): Promise<any> {
    return this.makeRequest(`/Messages/${messageSid}.json`);
  }

  // Get Account Info (for testing connection)
  async getAccountInfo(): Promise<any> {
    return this.makeRequest('.json');
  }

  // Test Connection
  async testConnection(): Promise<boolean> {
    try {
      await this.getAccountInfo();
      return true;
    } catch (error) {
      console.error('Twilio connection test failed:', error);
      return false;
    }
  }

  // Handle Incoming SMS Webhook with AI
  async handleIncomingSMS(webhook: TwilioWebhook): Promise<void> {
    try {
      console.log('📨 Incoming SMS from:', webhook.From, 'Message:', webhook.Body);

      // Use AI Customer Service to handle the message
      const { getAICustomerService } = await import('./ai-customer-service.js');
      const aiService = getAICustomerService();

      const result = await aiService.handleIncomingMessage(
        webhook.From,
        webhook.Body || '',
        webhook.MessageSid
      );

      console.log('🤖 AI Analysis:', {
        sentiment: result.analysis.sentiment,
        intent: result.analysis.intent,
        urgency: result.analysis.urgency,
        action: result.actionTaken,
        autoResponse: result.autoResponse ? 'Generated' : 'None'
      });

    } catch (error) {
      console.error('Error processing incoming SMS with AI:', error);

      // Fallback: basic logging without AI
      const xano = getXanoClient();
      const members = await xano.getMembers({ search: webhook.From });
      let member = members.data.find(m => m.phone === webhook.From);

      await this.logCommunicationToXano({
        member_id: member?.id,
        channel: 'sms',
        direction: 'inbound',
        from_number: webhook.From,
        to_number: webhook.To,
        content: webhook.Body || '',
        status: 'delivered',
        provider: 'twilio',
        provider_id: webhook.MessageSid,
        delivered_at: new Date().toISOString(),
        ai_generated: false,
      });
    }
  }

  // Handle Message Status Webhook
  async handleStatusWebhook(webhook: TwilioWebhook): Promise<void> {
    try {
      const xano = getXanoClient();
      
      // Update message status in Xano
      const communications = await xano.getCommunications({ 
        limit: 1 
      });
      
      // Find the communication record by Twilio SID
      const comm = communications.find(c => c.provider_id === webhook.MessageSid);
      
      if (comm) {
        const statusMap: Record<string, string> = {
          'delivered': 'delivered',
          'failed': 'failed',
          'undelivered': 'failed',
          'sent': 'sent',
          'received': 'delivered'
        };
        
        await xano.updateCommunicationStatus(
          comm.id, 
          statusMap[webhook.MessageStatus] || webhook.MessageStatus,
          webhook.MessageStatus === 'delivered' ? new Date().toISOString() : undefined
        );
      }
      
      console.log('Message status updated:', {
        sid: webhook.MessageSid,
        status: webhook.MessageStatus,
        error: webhook.ErrorMessage
      });
      
    } catch (error) {
      console.error('Error processing status webhook:', error);
    }
  }

  // Helper to log communication to Xano
  private async logCommunicationToXano(commData: any): Promise<void> {
    try {
      const xano = getXanoClient();
      await xano.createCommunication({
        ...commData,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log communication to Xano:', error);
      // Don't throw - logging failure shouldn't stop the main operation
    }
  }

  // Bulk SMS for campaigns
  async sendBulkSMS(messages: SMSMessage[]): Promise<{ 
    successful: number; 
    failed: number; 
    results: any[] 
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
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({ 
          success: false, 
          to: message.to, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        failed++;
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
    throw new Error('Twilio client not initialized. Call initializeTwilio() first.');
  }
  return twilioClient;
}

export default TwilioClient;

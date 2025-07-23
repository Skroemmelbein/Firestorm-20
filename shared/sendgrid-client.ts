// SendGrid Email Client
interface SendGridConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

interface EmailMessage {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  dynamicData?: any;
}

export class SendGridClient {
  private config: SendGridConfig;

  constructor(config: SendGridConfig) {
    this.config = {
      fromName: 'RecurFlow',
      ...config
    };
  }

  async sendEmail(message: EmailMessage): Promise<any> {
    try {
      const emailData = {
        personalizations: [
          {
            to: [{ email: message.to }],
            ...(message.templateId && message.dynamicData ? { dynamic_template_data: message.dynamicData } : {})
          }
        ],
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        subject: message.subject,
        ...(message.templateId 
          ? { template_id: message.templateId }
          : {
              content: [
                {
                  type: 'text/html',
                  value: message.html || message.text || ''
                }
              ]
            }
        )
      };

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SendGrid API Error ${response.status}: ${errorText}`);
      }

      return {
        success: true,
        messageId: response.headers.get('X-Message-Id'),
        to: message.to,
        subject: message.subject,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('SendGrid send error:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple API key validation call
      const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('SendGrid connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
let sendGridClient: SendGridClient | null = null;

export function initializeSendGrid(config: SendGridConfig): SendGridClient {
  sendGridClient = new SendGridClient(config);
  return sendGridClient;
}

export function getSendGridClient(): SendGridClient {
  if (!sendGridClient) {
    throw new Error('SendGrid client not initialized. Call initializeSendGrid() first.');
  }
  return sendGridClient;
}

export default SendGridClient;

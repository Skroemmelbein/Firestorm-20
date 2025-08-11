import fetch from "node-fetch";

interface SlackConfig {
  botToken: string;
  baseUrl: string;
}

export interface SlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  attachments?: any[];
  thread_ts?: string;
  reply_broadcast?: boolean;
}

export interface SlackMessageResult {
  ok: boolean;
  channel: string;
  ts: string;
  message: {
    text: string;
    user: string;
    ts: string;
  };
}

export class SlackClient {
  private config: SlackConfig;

  constructor(config: SlackConfig) {
    this.config = config;
  }

  async sendMessage(message: SlackMessage): Promise<SlackMessageResult> {
    const response = await fetch(`${this.config.baseUrl}/api/chat.postMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    
    if (!result.ok) {
      throw new Error(`Slack API Error: ${result.error}`);
    }

    return result;
  }

  async sendAlert(
    channel: string,
    title: string,
    message: string,
    severity: "info" | "warning" | "error" = "info"
  ): Promise<SlackMessageResult> {
    const colors = {
      info: "#36a2eb",
      warning: "#ffce56",
      error: "#ff6384",
    };

    const alertMessage: SlackMessage = {
      channel,
      text: `${title}: ${message}`,
      attachments: [
        {
          color: colors[severity],
          fields: [
            {
              title: title,
              value: message,
              short: false,
            },
            {
              title: "Timestamp",
              value: new Date().toISOString(),
              short: true,
            },
            {
              title: "Severity",
              value: severity.toUpperCase(),
              short: true,
            },
          ],
        },
      ],
    };

    return this.sendMessage(alertMessage);
  }

  async sendBounceRateAlert(
    channel: string,
    bounceRate: number,
    threshold: number = 3
  ): Promise<SlackMessageResult> {
    const severity = bounceRate > threshold * 2 ? "error" : "warning";
    
    return this.sendAlert(
      channel,
      "🚨 High Bounce Rate Alert",
      `Email bounce rate has reached ${bounceRate.toFixed(2)}%, which exceeds the threshold of ${threshold}%. Please investigate email deliverability issues.`,
      severity
    );
  }

  async sendDeliveryReport(
    channel: string,
    stats: {
      totalSent: number;
      delivered: number;
      bounced: number;
      failed: number;
      bounceRate: number;
    }
  ): Promise<SlackMessageResult> {
    const reportMessage: SlackMessage = {
      channel,
      text: "📊 Daily Delivery Report",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "📊 Daily Message Delivery Report",
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Total Sent:* ${stats.totalSent}`,
            },
            {
              type: "mrkdwn",
              text: `*Delivered:* ${stats.delivered}`,
            },
            {
              type: "mrkdwn",
              text: `*Bounced:* ${stats.bounced}`,
            },
            {
              type: "mrkdwn",
              text: `*Failed:* ${stats.failed}`,
            },
          ],
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Bounce Rate:* ${stats.bounceRate.toFixed(2)}%`,
          },
        },
      ],
    };

    return this.sendMessage(reportMessage);
  }

  async getChannels(): Promise<any[]> {
    const response = await fetch(`${this.config.baseUrl}/api/conversations.list`, {
      headers: {
        Authorization: `Bearer ${this.config.botToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Slack API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    
    if (!result.ok) {
      throw new Error(`Slack API Error: ${result.error}`);
    }

    return result.channels;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/auth.test`, {
        headers: {
          Authorization: `Bearer ${this.config.botToken}`,
        },
      });

      if (!response.ok) {
        return false;
      }

      const result = await response.json() as any;
      return result.ok;
    } catch (error) {
      console.error("Slack health check failed:", error);
      return false;
    }
  }
}

let slackClient: SlackClient | null = null;

export function initializeSlack(config: SlackConfig): SlackClient {
  slackClient = new SlackClient(config);
  return slackClient;
}

export function getSlackClient(): SlackClient {
  if (!slackClient) {
    throw new Error(
      "Slack client not initialized. Please configure Slack credentials first."
    );
  }
  return slackClient;
}

export default SlackClient;

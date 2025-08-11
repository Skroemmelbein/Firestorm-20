import fetch from "node-fetch";

interface SinchConfig {
  servicePlanId: string;
  apiToken: string;
  baseUrl: string;
}

export interface SinchMessage {
  to: string[];
  from: string;
  body: string;
  type?: "mt_text" | "mt_binary";
  delivery_report?: string;
}

export interface SinchMessageResult {
  id: string;
  to: string;
  from: string;
  body: string;
  type: string;
  created_at: string;
}

export class SinchClient {
  private config: SinchConfig;

  constructor(config: SinchConfig) {
    this.config = config;
  }

  async sendSMS(message: SinchMessage): Promise<SinchMessageResult> {
    const response = await fetch(
      `${this.config.baseUrl}/xms/v1/${this.config.servicePlanId}/batches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: message.to,
          from: message.from,
          body: message.body,
          type: message.type || "mt_text",
          delivery_report: message.delivery_report || "none",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Sinch API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return {
      id: result.id,
      to: result.to[0],
      from: result.from,
      body: result.body,
      type: result.type,
      created_at: result.created_at,
    };
  }

  async getMessageStatus(batchId: string): Promise<any> {
    const response = await fetch(
      `${this.config.baseUrl}/xms/v1/${this.config.servicePlanId}/batches/${batchId}`,
      {
        headers: {
          Authorization: `Bearer ${this.config.apiToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Sinch API Error ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/xms/v1/${this.config.servicePlanId}/batches`,
        {
          headers: {
            Authorization: `Bearer ${this.config.apiToken}`,
          },
        }
      );
      return response.ok;
    } catch (error) {
      console.error("Sinch health check failed:", error);
      return false;
    }
  }
}

let sinchClient: SinchClient | null = null;

export function initializeSinch(config: SinchConfig): SinchClient {
  sinchClient = new SinchClient(config);
  return sinchClient;
}

export function getSinchClient(): SinchClient {
  if (!sinchClient) {
    throw new Error(
      "Sinch client not initialized. Please configure Sinch credentials first."
    );
  }
  return sinchClient;
}

export default SinchClient;

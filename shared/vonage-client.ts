import fetch from "node-fetch";

interface VonageConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
}

export interface VonageMessage {
  from: string;
  to: string;
  text: string;
  type?: "text" | "unicode";
}

export interface VonageMessageResult {
  messageId: string;
  to: string;
  status: string;
  remainingBalance: string;
  messagePrice: string;
  network: string;
}

export class VonageClient {
  private config: VonageConfig;

  constructor(config: VonageConfig) {
    this.config = config;
  }

  async sendSMS(message: VonageMessage): Promise<VonageMessageResult> {
    const params = new URLSearchParams({
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
      from: message.from,
      to: message.to,
      text: message.text,
      type: message.type || "text",
    });

    const response = await fetch(`${this.config.baseUrl}/sms/json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Vonage API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    const message_result = result.messages[0];

    if (message_result.status !== "0") {
      throw new Error(`Vonage SMS failed: ${message_result["error-text"]}`);
    }

    return {
      messageId: message_result["message-id"],
      to: message_result.to,
      status: message_result.status,
      remainingBalance: message_result["remaining-balance"],
      messagePrice: message_result["message-price"],
      network: message_result.network,
    };
  }

  async getBalance(): Promise<{ value: number; autoReload: boolean }> {
    const params = new URLSearchParams({
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
    });

    const response = await fetch(
      `${this.config.baseUrl}/account/get-balance?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error(`Vonage API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return {
      value: parseFloat(result.value),
      autoReload: result.autoReload === "true",
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getBalance();
      return true;
    } catch (error) {
      console.error("Vonage health check failed:", error);
      return false;
    }
  }
}

let vonageClient: VonageClient | null = null;

export function initializeVonage(config: VonageConfig): VonageClient {
  vonageClient = new VonageClient(config);
  return vonageClient;
}

export function getVonageClient(): VonageClient {
  if (!vonageClient) {
    throw new Error(
      "Vonage client not initialized. Please configure Vonage credentials first."
    );
  }
  return vonageClient;
}

export default VonageClient;

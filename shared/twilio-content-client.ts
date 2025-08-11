import fetch from "node-fetch";

interface TwilioContentConfig {
  accountSid: string;
  authToken: string;
}

export interface ContentTemplate {
  sid: string;
  friendlyName: string;
  language: string;
  variables: Record<string, string>;
  types: {
    "twilio/text"?: {
      body: string;
    };
    "twilio/media"?: {
      body: string;
      media: string[];
    };
  };
}

export class TwilioContentClient {
  private config: TwilioContentConfig;

  constructor(config: TwilioContentConfig) {
    this.config = config;
  }

  private getAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString("base64")}`;
  }

  async createTemplate(
    friendlyName: string,
    language: string,
    types: ContentTemplate["types"]
  ): Promise<ContentTemplate> {
    const response = await fetch(
      `https://content.twilio.com/v1/Content`,
      {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          friendly_name: friendlyName,
          language: language,
          types: types,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Twilio Content API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return {
      sid: result.sid,
      friendlyName: result.friendly_name,
      language: result.language,
      variables: result.variables || {},
      types: result.types,
    };
  }

  async getTemplate(contentSid: string): Promise<ContentTemplate> {
    const response = await fetch(
      `https://content.twilio.com/v1/Content/${contentSid}`,
      {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twilio Content API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return {
      sid: result.sid,
      friendlyName: result.friendly_name,
      language: result.language,
      variables: result.variables || {},
      types: result.types,
    };
  }

  async listTemplates(): Promise<ContentTemplate[]> {
    const response = await fetch(
      `https://content.twilio.com/v1/Content`,
      {
        headers: {
          Authorization: this.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twilio Content API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return result.contents.map((content: any) => ({
      sid: content.sid,
      friendlyName: content.friendly_name,
      language: content.language,
      variables: content.variables || {},
      types: content.types,
    }));
  }

  async updateTemplate(
    contentSid: string,
    updates: Partial<Pick<ContentTemplate, "friendlyName" | "types">>
  ): Promise<ContentTemplate> {
    const response = await fetch(
      `https://content.twilio.com/v1/Content/${contentSid}`,
      {
        method: "POST",
        headers: {
          Authorization: this.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          friendly_name: updates.friendlyName,
          types: updates.types,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Twilio Content API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return {
      sid: result.sid,
      friendlyName: result.friendly_name,
      language: result.language,
      variables: result.variables || {},
      types: result.types,
    };
  }

  async deleteTemplate(contentSid: string): Promise<void> {
    const response = await fetch(
      `https://content.twilio.com/v1/Content/${contentSid}`,
      {
        method: "DELETE",
        headers: {
          Authorization: this.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twilio Content API Error ${response.status}: ${await response.text()}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.listTemplates();
      return true;
    } catch (error) {
      console.error("Twilio Content API health check failed:", error);
      return false;
    }
  }
}

let twilioContentClient: TwilioContentClient | null = null;

export function initializeTwilioContent(config: TwilioContentConfig): TwilioContentClient {
  twilioContentClient = new TwilioContentClient(config);
  return twilioContentClient;
}

export function getTwilioContentClient(): TwilioContentClient {
  if (!twilioContentClient) {
    throw new Error(
      "Twilio Content client not initialized. Please configure Twilio credentials first."
    );
  }
  return twilioContentClient;
}

export default TwilioContentClient;

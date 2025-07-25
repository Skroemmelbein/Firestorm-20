import fetch from "node-fetch";

interface RebrandlyConfig {
  apiKey: string;
  baseUrl: string;
}

export interface ShortenedLink {
  id: string;
  title: string;
  slashtag: string;
  destination: string;
  shortUrl: string;
  domainId: string;
  domainName: string;
  https: boolean;
  favourite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LinkCreationRequest {
  destination: string;
  domain?: {
    fullName?: string;
    id?: string;
  };
  slashtag?: string;
  title?: string;
  description?: string;
}

export class RebrandlyClient {
  private config: RebrandlyConfig;

  constructor(config: RebrandlyConfig) {
    this.config = config;
  }

  async createLink(linkData: LinkCreationRequest): Promise<ShortenedLink> {
    const response = await fetch(`${this.config.baseUrl}/v1/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: this.config.apiKey,
      },
      body: JSON.stringify(linkData),
    });

    if (!response.ok) {
      throw new Error(`Rebrandly API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return {
      id: result.id,
      title: result.title,
      slashtag: result.slashtag,
      destination: result.destination,
      shortUrl: result.shortUrl,
      domainId: result.domain.id,
      domainName: result.domain.fullName,
      https: result.https,
      favourite: result.favourite,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async getLink(linkId: string): Promise<ShortenedLink> {
    const response = await fetch(`${this.config.baseUrl}/v1/links/${linkId}`, {
      headers: {
        apikey: this.config.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Rebrandly API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return {
      id: result.id,
      title: result.title,
      slashtag: result.slashtag,
      destination: result.destination,
      shortUrl: result.shortUrl,
      domainId: result.domain.id,
      domainName: result.domain.fullName,
      https: result.https,
      favourite: result.favourite,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async updateLink(linkId: string, updates: Partial<LinkCreationRequest>): Promise<ShortenedLink> {
    const response = await fetch(`${this.config.baseUrl}/v1/links/${linkId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: this.config.apiKey,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Rebrandly API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return {
      id: result.id,
      title: result.title,
      slashtag: result.slashtag,
      destination: result.destination,
      shortUrl: result.shortUrl,
      domainId: result.domain.id,
      domainName: result.domain.fullName,
      https: result.https,
      favourite: result.favourite,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  async deleteLink(linkId: string): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/v1/links/${linkId}`, {
      method: "DELETE",
      headers: {
        apikey: this.config.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Rebrandly API Error ${response.status}: ${await response.text()}`);
    }
  }

  async getClickCount(linkId: string): Promise<{ count: number }> {
    const response = await fetch(`${this.config.baseUrl}/v1/links/${linkId}/clicks/count`, {
      headers: {
        apikey: this.config.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Rebrandly API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return { count: result.count };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/v1/account`, {
        headers: {
          apikey: this.config.apiKey,
        },
      });
      return response.ok;
    } catch (error) {
      console.error("Rebrandly health check failed:", error);
      return false;
    }
  }
}

let rebrandlyClient: RebrandlyClient | null = null;

export function initializeRebrandly(config: RebrandlyConfig): RebrandlyClient {
  rebrandlyClient = new RebrandlyClient(config);
  return rebrandlyClient;
}

export function getRebrandlyClient(): RebrandlyClient {
  if (!rebrandlyClient) {
    throw new Error(
      "Rebrandly client not initialized. Please configure Rebrandly credentials first."
    );
  }
  return rebrandlyClient;
}

export default RebrandlyClient;

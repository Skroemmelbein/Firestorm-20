import fetch from "node-fetch";

interface DeepLConfig {
  apiKey: string;
  baseUrl: string;
}

export interface TranslationResult {
  text: string;
  detectedSourceLanguage?: string;
}

export class DeepLClient {
  private config: DeepLConfig;

  constructor(config: DeepLConfig) {
    this.config = config;
  }

  async translateText(
    text: string,
    targetLang: string,
    sourceLang?: string
  ): Promise<TranslationResult> {
    const params = new URLSearchParams({
      auth_key: this.config.apiKey,
      text: text,
      target_lang: targetLang.toUpperCase(),
    });

    if (sourceLang) {
      params.append("source_lang", sourceLang.toUpperCase());
    }

    const response = await fetch(`${this.config.baseUrl}/v2/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`DeepL API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return {
      text: result.translations[0].text,
      detectedSourceLanguage: result.translations[0].detected_source_language,
    };
  }

  async getSupportedLanguages(): Promise<string[]> {
    const response = await fetch(
      `${this.config.baseUrl}/v2/languages?auth_key=${this.config.apiKey}`
    );

    if (!response.ok) {
      throw new Error(`DeepL API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return result.map((lang: any) => lang.language);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getSupportedLanguages();
      return true;
    } catch (error) {
      console.error("DeepL health check failed:", error);
      return false;
    }
  }
}

let deeplClient: DeepLClient | null = null;

export function initializeDeepL(config: DeepLConfig): DeepLClient {
  deeplClient = new DeepLClient(config);
  return deeplClient;
}

export function getDeepLClient(): DeepLClient {
  if (!deeplClient) {
    throw new Error(
      "DeepL client not initialized. Please configure DeepL credentials first."
    );
  }
  return deeplClient;
}

export default DeepLClient;

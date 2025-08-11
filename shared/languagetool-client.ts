import fetch from "node-fetch";

interface LanguageToolConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface GrammarError {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements: string[];
  rule: {
    id: string;
    category: string;
    description: string;
  };
}

export interface GrammarCheckResult {
  matches: GrammarError[];
  language: {
    name: string;
    code: string;
  };
}

export class LanguageToolClient {
  private config: LanguageToolConfig;

  constructor(config: LanguageToolConfig) {
    this.config = config;
  }

  async checkGrammar(
    text: string,
    language: string = "en-US"
  ): Promise<GrammarCheckResult> {
    const params = new URLSearchParams({
      text: text,
      language: language,
    });

    if (this.config.apiKey) {
      params.append("apiKey", this.config.apiKey);
    }

    const response = await fetch(`${this.config.baseUrl}/v2/check`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`LanguageTool API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return {
      matches: result.matches.map((match: any) => ({
        message: match.message,
        shortMessage: match.shortMessage,
        offset: match.offset,
        length: match.length,
        replacements: match.replacements.map((r: any) => r.value),
        rule: {
          id: match.rule.id,
          category: match.rule.category.name,
          description: match.rule.description,
        },
      })),
      language: result.language,
    };
  }

  async correctText(text: string, language: string = "en-US"): Promise<string> {
    const checkResult = await this.checkGrammar(text, language);
    let correctedText = text;
    
    checkResult.matches
      .sort((a, b) => b.offset - a.offset)
      .forEach((match) => {
        if (match.replacements.length > 0) {
          const before = correctedText.substring(0, match.offset);
          const after = correctedText.substring(match.offset + match.length);
          correctedText = before + match.replacements[0] + after;
        }
      });

    return correctedText;
  }

  async getSupportedLanguages(): Promise<string[]> {
    const response = await fetch(`${this.config.baseUrl}/v2/languages`);

    if (!response.ok) {
      throw new Error(`LanguageTool API Error ${response.status}: ${await response.text()}`);
    }

    const result = await response.json() as any;
    return result.map((lang: any) => lang.code);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.checkGrammar("Test sentence.", "en-US");
      return true;
    } catch (error) {
      console.error("LanguageTool health check failed:", error);
      return false;
    }
  }
}

let languageToolClient: LanguageToolClient | null = null;

export function initializeLanguageTool(config: LanguageToolConfig): LanguageToolClient {
  languageToolClient = new LanguageToolClient(config);
  return languageToolClient;
}

export function getLanguageToolClient(): LanguageToolClient {
  if (!languageToolClient) {
    throw new Error(
      "LanguageTool client not initialized. Please configure LanguageTool credentials first."
    );
  }
  return languageToolClient;
}

export default LanguageToolClient;

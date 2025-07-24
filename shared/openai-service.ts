interface OpenAIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

interface DevelopmentTask {
  action: "create" | "modify" | "delete" | "explain" | "debug";
  target: "component" | "page" | "api" | "database" | "style" | "function";
  details: string;
  code?: string;
  fileName?: string;
  framework?: string;
}

export class OpenAIService {
  private config: OpenAIConfig;
  private baseUrl = "https://api.openai.com/v1";

  constructor(config: OpenAIConfig) {
    this.config = {
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 2000,
      ...config,
    };
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Read the response body once
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      if (!response.ok) {
        console.error("OpenAI API Error:", response.status, responseData);
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText}`,
        );
      }

      return responseData;
    } catch (error) {
      console.error("OpenAI Request Failed:", error);
      throw error;
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const data = {
      model: this.config.model,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    };

    const response: OpenAIResponse = await this.makeRequest(
      "/chat/completions",
      data,
    );
    return response.choices[0]?.message?.content || "";
  }

  async parseVoiceCommand(command: string): Promise<DevelopmentTask | null> {
    const systemPrompt = `You are an AI assistant that converts natural language voice commands into structured development tasks. 

Parse the user's command and return a JSON object with this structure:
{
  "action": "create|modify|delete|explain|debug",
  "target": "component|page|api|database|style|function", 
  "details": "detailed description of what to do",
  "fileName": "suggested file name if creating/modifying",
  "framework": "react|vue|angular|vanilla" (if applicable),
  "code": "generated code if requested"
}

Examples:
- "create a login component" -> {"action": "create", "target": "component", "details": "Create a login component with email and password fields", "fileName": "LoginComponent.tsx", "framework": "react"}
- "fix the header styling" -> {"action": "modify", "target": "style", "details": "Fix styling issues in the header component"}
- "add a new API endpoint for users" -> {"action": "create", "target": "api", "details": "Create API endpoint for user management"}

If the command is not development-related, return null.`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: command },
    ];

    try {
      const response = await this.chat(messages);
      return JSON.parse(response);
    } catch (error) {
      console.error("Error parsing voice command:", error);
      return null;
    }
  }

  async generateCode(task: DevelopmentTask, context?: string): Promise<string> {
    const systemPrompt = `You are an expert full-stack developer. Generate clean, production-ready code based on the task requirements.

Context: ${context || "React TypeScript project with Tailwind CSS and modern best practices"}

Requirements:
- Write clean, maintainable code
- Follow TypeScript best practices
- Use modern React patterns (hooks, functional components)
- Include proper error handling
- Add responsive design with Tailwind CSS
- Follow the existing code style and patterns

Task: ${task.action} ${task.target} - ${task.details}

Return only the code without explanations or markdown formatting.`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate ${task.action === "create" ? "new" : "updated"} ${task.target} code for: ${task.details}`,
      },
    ];

    return await this.chat(messages);
  }

  async explainCode(code: string, question?: string): Promise<string> {
    const systemPrompt = `You are a code expert. Explain the provided code in a clear, concise way. Focus on:
- What the code does
- How it works
- Key patterns and concepts used
- Any potential improvements

Be helpful and educational.`;

    const userMessage = question
      ? `Explain this code with focus on: ${question}\n\nCode:\n${code}`
      : `Explain this code:\n\n${code}`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    return await this.chat(messages);
  }

  async debugCode(code: string, error?: string): Promise<string> {
    const systemPrompt = `You are a debugging expert. Analyze the provided code and identify potential issues, bugs, or improvements.

Provide:
1. Identified issues
2. Suggested fixes
3. Improved code if necessary
4. Best practice recommendations

Be specific and actionable.`;

    const userMessage = error
      ? `Debug this code that's causing error: ${error}\n\nCode:\n${code}`
      : `Debug and improve this code:\n\n${code}`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    return await this.chat(messages);
  }

  async chatWithContext(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
  ): Promise<string> {
    const systemPrompt = `You are an AI development assistant. You help developers build applications by:

1. Understanding natural language commands
2. Generating code and components  
3. Explaining technical concepts
4. Debugging issues
5. Providing architectural guidance

You have access to:
- React/TypeScript frontend
- Node.js backend
- Tailwind CSS styling
- Xano database
- Twilio communications
- OpenAI integration

Be helpful, concise, and practical. When generating code, make it production-ready.`;

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: userMessage },
    ];

    return await this.chat(messages);
  }
}

// Default instance with environment API key
let defaultService: OpenAIService | null = null;

export function getOpenAIService(): OpenAIService {
  if (!defaultService) {
    const apiKey =
      "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";
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }
    defaultService = new OpenAIService({ apiKey });
  }
  return defaultService;
}

export function setOpenAIApiKey(apiKey: string): void {
  defaultService = new OpenAIService({ apiKey });
}

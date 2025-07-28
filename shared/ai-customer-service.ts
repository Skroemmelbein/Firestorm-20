// AI-Powered Customer Service
// Integrates OpenAI with Xano member data and Twilio SMS for intelligent customer support

import { getOpenAIService } from "./openai-service";
import { getConvexClient, Member } from "./convex-client";
import { getTwilioClient } from "./twilio-client";

interface CustomerServiceConfig {
  autoResponseEnabled: boolean;
  sentimentAnalysisEnabled: boolean;
  escalationThreshold: number; // 0-1, when to escalate to human
  responseTimeoutMinutes: number;
}

interface AIAnalysis {
  sentiment: "positive" | "neutral" | "negative";
  confidence: number;
  intent: string;
  urgency: "low" | "medium" | "high";
  suggestedResponse?: string;
  shouldEscalate: boolean;
  keywords: string[];
}

export class AICustomerService {
  private config: CustomerServiceConfig;

  constructor(config: Partial<CustomerServiceConfig> = {}) {
    this.config = {
      autoResponseEnabled: true,
      sentimentAnalysisEnabled: true,
      escalationThreshold: 0.7,
      responseTimeoutMinutes: 5,
      ...config,
    };
  }

  // Main function to handle incoming customer messages
  async handleIncomingMessage(
    phoneNumber: string,
    message: string,
    twilioMessageId: string,
  ): Promise<{
    analysis: AIAnalysis;
    autoResponse?: string;
    actionTaken: string;
  }> {
    try {
      // Get member info from Xano
      const member = await this.findMemberByPhone(phoneNumber);

      // Analyze the message with AI
      const analysis = await this.analyzeMessage(message, member);

      // Log to Xano communications table
      await this.logCommunication(
        parseInt(member?.id || "0"),
        phoneNumber,
        message,
        analysis,
        twilioMessageId,
      );

      let autoResponse: string | undefined;
      let actionTaken = "analyzed";

      // Auto-respond if enabled and confidence is high
      if (this.config.autoResponseEnabled && !analysis.shouldEscalate) {
        autoResponse = await this.generateAutoResponse(
          message,
          member,
          analysis,
        );

        if (autoResponse) {
          // Send SMS response via Twilio
          await this.sendAutoResponse(phoneNumber, autoResponse);
          actionTaken = "auto_responded";

          // Log the outbound response
          await this.logCommunication(
            parseInt(member?.id || "0"),
            phoneNumber,
            autoResponse,
            null,
            null,
            "outbound",
          );
        }
      }

      // Escalate if needed
      if (analysis.shouldEscalate) {
        await this.escalateToHuman(member, message, analysis);
        actionTaken = "escalated";
      }

      return {
        analysis,
        autoResponse,
        actionTaken,
      };
    } catch (error) {
      console.error("Error handling customer message:", error);

      // Send fallback response
      await this.sendAutoResponse(
        phoneNumber,
        "Thanks for your message! We're experiencing high volume. A team member will respond soon.",
      );

      return {
        analysis: {
          sentiment: "neutral",
          confidence: 0.5,
          intent: "unknown",
          urgency: "medium",
          shouldEscalate: true,
          keywords: [],
        },
        actionTaken: "error_fallback",
      };
    }
  }

  // Analyze customer message with AI
  private async analyzeMessage(
    message: string,
    member?: Member,
  ): Promise<AIAnalysis> {
    const openAI = getOpenAIService();

    try {
      // Multi-step analysis using GPT
      const analysisPrompt = `Analyze this customer service message for RecurFlow membership platform.

Customer message: "${message}"
${member ? `Member info: ${member.first_name} ${member.last_name}, ${member.membership_type} member, engagement score: ${member.engagement_score}` : "Unknown customer"}

Provide analysis as JSON:
{
  "sentiment": "positive|neutral|negative",
  "confidence": 0.0-1.0,
  "intent": "billing|support|complaint|compliment|cancel|upgrade|benefits|login|general",
  "urgency": "low|medium|high",
  "shouldEscalate": boolean,
  "keywords": ["keyword1", "keyword2"],
  "summary": "brief summary of issue"
}

Escalation criteria:
- High urgency issues (billing problems, account access)
- Negative sentiment + high confidence
- Cancellation requests
- Complex technical issues
- Complaints about service quality`;

      const response = await openAI.chatWithContext(analysisPrompt);
      const cleaned = response.replace(/```json|```/g, "").trim();
      const analysis = JSON.parse(cleaned);

      // Validate and normalize the response
      return {
        sentiment: analysis.sentiment || "neutral",
        confidence: Math.min(Math.max(analysis.confidence || 0.5, 0), 1),
        intent: analysis.intent || "general",
        urgency: analysis.urgency || "medium",
        shouldEscalate:
          analysis.shouldEscalate ||
          analysis.urgency === "high" ||
          (analysis.sentiment === "negative" && analysis.confidence > 0.7),
        keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
      };
    } catch (error) {
      console.error("Error analyzing message:", error);

      // Fallback analysis
      return {
        sentiment: "neutral",
        confidence: 0.3,
        intent: "general",
        urgency: "medium",
        shouldEscalate: true, // Escalate on analysis failure
        keywords: [],
      };
    }
  }

  // Generate AI response for common questions
  private async generateAutoResponse(
    message: string,
    member?: Member,
    analysis?: AIAnalysis,
  ): Promise<string | null> {
    const openAI = getOpenAIService();

    try {
      const responsePrompt = `Generate a helpful customer service SMS response (under 160 characters) for RecurFlow membership platform.

Customer message: "${message}"
${member ? `Member: ${member.first_name} ${member.last_name} (${member.membership_type})` : "Non-member"}
${analysis ? `Intent: ${analysis.intent}, Sentiment: ${analysis.sentiment}` : ""}

Guidelines:
- Be friendly, professional, and concise
- Provide specific help when possible
- If you can't solve it, acknowledge and mention human follow-up
- Use the member's name if available
- Include relevant membership benefits when appropriate

Common responses:
- Billing: Provide account portal link or explain billing cycle
- Benefits: List relevant benefits for their membership level
- Login: Offer password reset or account recovery steps
- General: Be helpful and offer next steps

Respond only with the SMS message text (no quotes or explanations).`;

      const response = await openAI.chatWithContext(responsePrompt);

      // Clean up the response
      const cleanResponse = response
        .replace(/^["']|["']$/g, "") // Remove surrounding quotes
        .trim();

      // Validate length for SMS
      if (cleanResponse.length > 160) {
        return cleanResponse.substring(0, 157) + "...";
      }

      return cleanResponse;
    } catch (error) {
      console.error("Error generating auto response:", error);
      return null;
    }
  }

  // Send SMS response via Twilio
  private async sendAutoResponse(
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    try {
      const twilio = getTwilioClient();
      await twilio.sendSMS({
        to: phoneNumber,
        body: message,
      });
    } catch (error) {
      console.error("Error sending auto response:", error);
      throw error;
    }
  }

  // Find member by phone number
  private async findMemberByPhone(phoneNumber: string): Promise<Member | null> {
    try {
      const convex = getConvexClient();
      const members = await convex.getMembers({ search: phoneNumber });
      return members.data.find((m) => m.phone === phoneNumber) || null;
    } catch (error) {
      console.error("Error finding member:", error);
      return null;
    }
  }

  // Log communication to Xano
  private async logCommunication(
    memberId: number | undefined,
    phoneNumber: string,
    content: string,
    analysis: AIAnalysis | null,
    twilioMessageId: string | null,
    direction: "inbound" | "outbound" = "inbound",
  ): Promise<void> {
    try {
      const convex = getConvexClient();
      await convex.createCommunication({
        member_id: memberId,
        channel: "sms",
        direction,
        from_number: direction === "inbound" ? phoneNumber : undefined,
        to_number: direction === "outbound" ? phoneNumber : undefined,
        content,
        status: "delivered",
        provider: "twilio",
        provider_id: twilioMessageId,
        ai_generated: direction === "outbound",
        ai_sentiment: analysis?.sentiment,
        ai_intent: analysis?.intent,
        ai_confidence: analysis?.confidence,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error logging communication:", error);
      // Don't throw - logging failure shouldn't stop the main process
    }
  }

  // Escalate to human support
  private async escalateToHuman(
    member: Member | null,
    message: string,
    analysis: AIAnalysis,
  ): Promise<void> {
    try {
      const convex = getConvexClient();

      // Create support ticket in Convex
      await convex.makeRequest("/support_tickets", "POST", {
        member_id: member?.id,
        subject: `SMS Escalation: ${analysis.intent}`,
        description: `Customer message: "${message}"\n\nAI Analysis:\n- Sentiment: ${analysis.sentiment}\n- Intent: ${analysis.intent}\n- Urgency: ${analysis.urgency}\n- Confidence: ${analysis.confidence}`,
        priority:
          analysis.urgency === "high"
            ? "urgent"
            : analysis.urgency === "medium"
              ? "high"
              : "medium",
        status: "open",
        category:
          analysis.intent === "billing"
            ? "billing"
            : analysis.intent === "support"
              ? "technical"
              : "general",
        created_at: new Date().toISOString(),
      });

      console.log("Support ticket created for escalation:", {
        member: member?.email || "unknown",
        intent: analysis.intent,
        urgency: analysis.urgency,
      });
    } catch (error) {
      console.error("Error escalating to human:", error);
    }
  }

  // Generate marketing messages for campaigns
  async generateMarketingMessage(
    audienceSegment: string,
    campaignGoal: string,
    memberSample?: Member[],
  ): Promise<string> {
    const openAI = getOpenAIService();

    const prompt = `Generate a marketing SMS message for RecurFlow membership platform.

Campaign details:
- Target audience: ${audienceSegment}
- Goal: ${campaignGoal}
- Message limit: 160 characters

${memberSample ? `Sample member data: ${JSON.stringify(memberSample.slice(0, 3))}` : ""}

Requirements:
- Compelling but not pushy
- Clear value proposition
- Include call-to-action
- Professional tone
- Mention relevant benefits
- Comply with SMS marketing best practices

Respond with just the SMS message text.`;

    return await openAI.chatWithContext(prompt);
  }

  // Analyze member engagement and suggest actions
  async analyzeEngagement(member: Member): Promise<{
    score: number;
    insights: string[];
    recommendations: string[];
    nextActions: string[];
  }> {
    const openAI = getOpenAIService();

    const prompt = `Analyze this RecurFlow member's engagement and provide insights.

Member data: ${JSON.stringify(member)}

Provide analysis as JSON:
{
  "score": 0-100,
  "insights": ["insight1", "insight2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "nextActions": ["action1", "action2"]
}

Consider:
- Login frequency and engagement score
- Membership type and lifetime value
- Communication preferences
- Account age and activity patterns

Focus on actionable insights to improve member retention and satisfaction.`;

    try {
      const response = await openAI.chatWithContext(prompt);
      const cleaned = response.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error("Error analyzing engagement:", error);
      return {
        score: member.engagement_score || 50,
        insights: ["Analysis unavailable"],
        recommendations: ["Review member activity manually"],
        nextActions: ["Contact member for feedback"],
      };
    }
  }
}

// Export singleton instance
let aiCustomerService: AICustomerService | null = null;

export function getAICustomerService(
  config?: Partial<CustomerServiceConfig>,
): AICustomerService {
  if (!aiCustomerService) {
    aiCustomerService = new AICustomerService(config);
  }
  return aiCustomerService;
}

export default AICustomerService;

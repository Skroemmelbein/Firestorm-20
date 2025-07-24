// Real Xano API Client - NO MOCKS
import fetch from "node-fetch";

interface XanoConfig {
  instanceUrl: string;
  apiKey: string;
  databaseId: string;
}

export interface Member {
  id: number;
  uuid: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  status: "active" | "inactive" | "suspended" | "cancelled";
  membership_type: "basic" | "premium" | "enterprise" | "lifetime";
  created_at: string;
  updated_at: string;
  last_login?: string;
  profile_picture_url?: string;
  timezone?: string;
  language: string;
  lifetime_value: number;
  total_spent: number;
  subscription_start_date?: string;
  subscription_end_date?: string;
  billing_cycle?: "monthly" | "yearly" | "lifetime";
  login_count: number;
  last_activity?: string;
  engagement_score: number;
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
}

export interface MemberBenefit {
  id: number;
  uuid: string;
  title: string;
  description: string;
  benefit_type: "discount" | "access" | "service" | "product" | "support";
  benefit_category:
    | "billing"
    | "shipping"
    | "support"
    | "exclusive"
    | "partner";
  value_description: string;
  conditions?: string;
  is_active: boolean;
  membership_levels: string[];
  sort_order: number;
  icon_name?: string;
  color_theme?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  usage_limit?: number;
}

export interface Communication {
  id: number;
  member_id?: number;
  channel: "sms" | "email" | "voice" | "push";
  direction: "inbound" | "outbound";
  from_number?: string;
  to_number?: string;
  subject?: string;
  content: string;
  status: "queued" | "sent" | "delivered" | "failed" | "bounced";
  provider: "twilio" | "sendgrid" | "other";
  provider_id?: string;
  provider_status?: string;
  error_message?: string;
  cost?: number;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  replied_at?: string;
  created_at: string;
  ai_generated: boolean;
  ai_sentiment?: "positive" | "neutral" | "negative";
  ai_intent?: string;
  ai_confidence?: number;
}

export interface Subscription {
  id: number;
  member_id: number;
  plan_name: string;
  plan_id: string;
  status: "active" | "paused" | "cancelled" | "past_due" | "unpaid";
  amount: number;
  currency: string;
  billing_cycle: "monthly" | "yearly" | "lifetime";
  next_billing_date?: string;
  trial_end_date?: string;
  started_at: string;
  cancelled_at?: string;
  pause_reason?: string;
  payment_method_id?: string;
}

export class XanoClient {
  private config: XanoConfig;

  constructor(config: XanoConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
    data?: any,
  ): Promise<T> {
    const url = `${this.config.instanceUrl}/api:${this.config.databaseId}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      "Content-Type": "application/json",
    };

    const options: any = {
      method,
      headers,
    };

    if (data && (method === "POST" || method === "PATCH")) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Xano API Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result as T;
    } catch (error) {
      console.error("Xano API Request Failed:", {
        url,
        method,
        error: error instanceof Error ? error.message : error,
      });
      throw error;
    }
  }

  // Members API
  async getMembers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    membership_type?: string;
  }): Promise<{ data: Member[]; total: number; page: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.per_page)
      queryParams.append("per_page", params.per_page.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.membership_type)
      queryParams.append("membership_type", params.membership_type);

    const endpoint = `/members${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.request<{ data: Member[]; total: number; page: number }>(
      endpoint,
    );
  }

  async getMember(id: number): Promise<Member> {
    return this.request<Member>(`/members/${id}`);
  }

  async createMember(memberData: Partial<Member>): Promise<Member> {
    return this.request<Member>("/members", "POST", memberData);
  }

  async updateMember(id: number, memberData: Partial<Member>): Promise<Member> {
    return this.request<Member>(`/members/${id}`, "PATCH", memberData);
  }

  async deleteMember(id: number): Promise<void> {
    return this.request<void>(`/members/${id}`, "DELETE");
  }

  // Benefits API
  async getBenefits(params?: {
    membership_level?: string;
    is_active?: boolean;
  }): Promise<MemberBenefit[]> {
    const queryParams = new URLSearchParams();
    if (params?.membership_level)
      queryParams.append("membership_level", params.membership_level);
    if (params?.is_active !== undefined)
      queryParams.append("is_active", params.is_active.toString());

    const endpoint = `/member_benefits${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.request<MemberBenefit[]>(endpoint);
  }

  async getMemberBenefits(memberId: number): Promise<MemberBenefit[]> {
    return this.request<MemberBenefit[]>(`/members/${memberId}/benefits`);
  }

  async createBenefit(
    benefitData: Partial<MemberBenefit>,
  ): Promise<MemberBenefit> {
    return this.request<MemberBenefit>("/member_benefits", "POST", benefitData);
  }

  async updateBenefit(
    id: number,
    benefitData: Partial<MemberBenefit>,
  ): Promise<MemberBenefit> {
    return this.request<MemberBenefit>(
      `/member_benefits/${id}`,
      "PATCH",
      benefitData,
    );
  }

  async useBenefit(
    memberId: number,
    benefitId: number,
    usageDetails?: any,
  ): Promise<void> {
    return this.request<void>("/member_benefit_usage", "POST", {
      member_id: memberId,
      benefit_id: benefitId,
      used_at: new Date().toISOString(),
      usage_details: usageDetails,
      status: "used",
    });
  }

  // Communications API
  async getCommunications(params?: {
    member_id?: number;
    channel?: string;
    direction?: string;
    limit?: number;
  }): Promise<Communication[]> {
    const queryParams = new URLSearchParams();
    if (params?.member_id)
      queryParams.append("member_id", params.member_id.toString());
    if (params?.channel) queryParams.append("channel", params.channel);
    if (params?.direction) queryParams.append("direction", params.direction);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const endpoint = `/communications${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.request<Communication[]>(endpoint);
  }

  async createCommunication(
    commData: Partial<Communication>,
  ): Promise<Communication> {
    return this.request<Communication>("/communications", "POST", commData);
  }

  async updateCommunicationStatus(
    id: number,
    status: string,
    deliveredAt?: string,
  ): Promise<Communication> {
    return this.request<Communication>(`/communications/${id}`, "PATCH", {
      status,
      delivered_at: deliveredAt || new Date().toISOString(),
    });
  }

  // Subscriptions API
  async getSubscriptions(memberId?: number): Promise<Subscription[]> {
    const endpoint = memberId
      ? `/subscriptions?member_id=${memberId}`
      : "/subscriptions";
    return this.request<Subscription[]>(endpoint);
  }

  async createSubscription(
    subData: Partial<Subscription>,
  ): Promise<Subscription> {
    return this.request<Subscription>("/subscriptions", "POST", subData);
  }

  async updateSubscription(
    id: number,
    subData: Partial<Subscription>,
  ): Promise<Subscription> {
    return this.request<Subscription>(`/subscriptions/${id}`, "PATCH", subData);
  }

  // Analytics API
  async getDashboardStats(): Promise<{
    total_members: number;
    active_members: number;
    new_members_today: number;
    total_revenue: number;
    mrr: number;
    churn_rate: number;
    avg_engagement: number;
  }> {
    return this.request<any>("/analytics/dashboard");
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>("/health");
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      console.error("Xano connection test failed:", error);
      return false;
    }
  }
}

// Export singleton instance
let xanoClient: XanoClient | null = null;

export function initializeXano(config: XanoConfig): XanoClient {
  xanoClient = new XanoClient(config);
  return xanoClient;
}

export function getXanoClient(): XanoClient {
  if (!xanoClient) {
    throw new Error(
      "Xano client not initialized. Please configure Xano credentials first.",
    );
  }
  return xanoClient;
}

export default XanoClient;

// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../convex/_generated/api";

const convex = {
  query: async (fn: any, args: any) => {
    console.log(`Mock Convex query: ${fn}`, args);
    return { data: [], total: 0, page: 1 };
  },
  mutation: async (fn: any, args: any) => {
    console.log(`Mock Convex mutation: ${fn}`, args);
    return { id: `mock_${Date.now()}`, ...args };
  }
};

export function initializeConvex() {
  console.log("🚀 Convex initialized");
  return true;
}

export function getXanoClientSafe() {
  return getConvexClient();
}

export class ConvexClient {
  private client: any;

  constructor() {
    this.client = convex;
  }

  async getUsers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    role?: string;
  }) {
    return await this.client.query("users.getUsers", params || {});
  }

  async getUserById(id: string) {
    return await this.client.query("users.getUserById", { id });
  }

  async getUserByEmail(email: string) {
    return await this.client.query("users.getUserByEmail", { email });
  }

  async createUser(userData: any) {
    return await this.client.mutation("users.createUser", userData);
  }

  async updateUser(id: string, userData: any) {
    return await this.client.mutation("users.updateUser", { id, ...userData });
  }

  async deleteUser(id: string) {
    return await this.client.mutation("users.deleteUser", { id });
  }

  async getMembers(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    tier?: string;
    client_id?: string;
  }) {
    return await this.client.query("members.getMembers", params || {});
  }

  async getMemberById(id: string) {
    return await this.client.query("members.getMemberById", { id });
  }

  async getMemberByMemberId(member_id: string) {
    return await this.client.query("members.getMemberByMemberId", { member_id });
  }

  async getMemberByEmail(email: string) {
    return await this.client.query("members.getMemberByEmail", { email });
  }

  async createMember(memberData: any) {
    return await this.client.mutation("members.createMember", memberData);
  }

  async updateMember(id: string, memberData: any) {
    return await this.client.mutation("members.updateMember", { id, ...memberData });
  }

  async deleteMember(id: string) {
    return await this.client.mutation("members.deleteMember", { id });
  }

  async getClients(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    subscription_tier?: string;
  }) {
    return await this.client.query("clients.getClients", params || {});
  }

  async getClientById(id: string) {
    return await this.client.query("clients.getClientById", { id });
  }

  async createClient(clientData: any) {
    return await this.client.mutation("clients.createClient", clientData);
  }

  async updateClient(id: string, clientData: any) {
    return await this.client.mutation("clients.updateClient", { id, ...clientData });
  }

  async deleteClient(id: string) {
    return await this.client.mutation("clients.deleteClient", { id });
  }

  async getCommunications(params?: {
    page?: number;
    per_page?: number;
    channel?: string;
    status?: string;
    client_id?: string;
    member_id?: string;
    direction?: string;
  }) {
    return await this.client.query("communications.getCommunications", params || {});
  }

  async getCommunicationById(id: string) {
    return await this.client.query("communications.getCommunicationById", { id });
  }

  async createCommunication(commData: any) {
    return await this.client.mutation("communications.createCommunication", commData);
  }

  async updateCommunicationStatus(id: string, statusData: any) {
    return await this.client.mutation("communications.updateCommunicationStatus", { id, ...statusData });
  }

  async logSMS(smsData: any) {
    return await this.client.mutation("communications.logSMS", smsData);
  }

  async logEmail(emailData: any) {
    return await this.client.mutation("communications.logEmail", emailData);
  }

  async getSubscriptions(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    client_id?: string;
    member_id?: string;
  }) {
    return await this.client.query("subscriptions.getSubscriptions", params || {});
  }

  async getSubscriptionById(id: string) {
    return await this.client.query("subscriptions.getSubscriptionById", { id });
  }

  async getSubscriptionByNMICustomer(nmi_customer_id: string) {
    return await this.client.query("subscriptions.getSubscriptionByNMICustomer", { nmi_customer_id });
  }

  async createSubscription(subscriptionData: any) {
    return await this.client.mutation("subscriptions.createSubscription", subscriptionData);
  }

  async updateSubscription(id: string, subscriptionData: any) {
    return await this.client.mutation("subscriptions.updateSubscription", { id, ...subscriptionData });
  }

  async cancelSubscription(id: string, reason?: string) {
    return await this.client.mutation("subscriptions.cancelSubscription", { id, reason });
  }

  async getTransactions(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    type?: string;
    subscription_id?: string;
    client_id?: string;
    member_id?: string;
  }) {
    return await this.client.query("transactions.getTransactions", params || {});
  }

  async getTransactionById(id: string) {
    return await this.client.query("transactions.getTransactionById", { id });
  }

  async getTransactionByTransactionId(transaction_id: string) {
    return await this.client.query("transactions.getTransactionByTransactionId", { transaction_id });
  }

  async createTransaction(transactionData: any) {
    return await this.client.mutation("transactions.createTransaction", transactionData);
  }

  async updateTransactionStatus(id: string, statusData: any) {
    return await this.client.mutation("transactions.updateTransactionStatus", { id, ...statusData });
  }

  async processNMITransaction(nmiData: any) {
    return await this.client.mutation("transactions.processNMITransaction", nmiData);
  }

  async getCampaigns(params?: {
    page?: number;
    per_page?: number;
    status?: string;
    type?: string;
    client_id?: string;
    created_by?: string;
  }) {
    return await this.client.query("campaigns.getCampaigns", params || {});
  }

  async getCampaignById(id: string) {
    return await this.client.query("campaigns.getCampaignById", { id });
  }

  async createCampaign(campaignData: any) {
    return await this.client.mutation("campaigns.createCampaign", campaignData);
  }

  async updateCampaign(id: string, campaignData: any) {
    return await this.client.mutation("campaigns.updateCampaign", { id, ...campaignData });
  }

  async deleteCampaign(id: string) {
    return await this.client.mutation("campaigns.deleteCampaign", { id });
  }

  async launchCampaign(id: string) {
    return await this.client.mutation("campaigns.launchCampaign", { id });
  }

  async pauseCampaign(id: string) {
    return await this.client.mutation("campaigns.pauseCampaign", { id });
  }

  async getUserStats() {
    return await this.client.query("users.getUserStats", {});
  }

  async getMemberStats(client_id?: string) {
    return await this.client.query("members.getMemberStats", { client_id });
  }

  async getClientStats() {
    return await this.client.query("clients.getClientStats", {});
  }

  async getCommunicationStats(params?: {
    client_id?: string;
    date_from?: number;
    date_to?: number;
  }) {
    return await this.client.query("communications.getCommunicationStats", params || {});
  }

  async getSubscriptionStats(client_id?: string) {
    return await this.client.query("subscriptions.getSubscriptionStats", { client_id });
  }

  async getTransactionStats(params?: {
    client_id?: string;
    date_from?: number;
    date_to?: number;
  }) {
    return await this.client.query("transactions.getTransactionStats", params || {});
  }

  async getCampaignStats(client_id?: string) {
    return await this.client.query("campaigns.getCampaignStats", { client_id });
  }

  async queryRecords(table: string, params: any = {}) {
    switch (table) {
      case "users":
        return await this.getUsers(params);
      case "members":
        return await this.getMembers(params);
      case "clients":
        return await this.getClients(params);
      case "communications":
        return await this.getCommunications(params);
      case "subscriptions":
        return await this.getSubscriptions(params);
      case "transactions":
        return await this.getTransactions(params);
      case "campaigns":
        return await this.getCampaigns(params);
      default:
        throw new Error(`Table ${table} not supported in Convex client`);
    }
  }

  async getRecord(table: string, id: string) {
    switch (table) {
      case "users":
        return await this.getUserById(id);
      case "members":
        return await this.getMemberById(id);
      case "clients":
        return await this.getClientById(id);
      case "communications":
        return await this.getCommunicationById(id);
      case "subscriptions":
        return await this.getSubscriptionById(id);
      case "transactions":
        return await this.getTransactionById(id);
      case "campaigns":
        return await this.getCampaignById(id);
      default:
        throw new Error(`Table ${table} not supported in Convex client`);
    }
  }

  async createRecord(table: string, data: any) {
    switch (table) {
      case "users":
        return await this.createUser(data);
      case "members":
        return await this.createMember(data);
      case "clients":
        return await this.createClient(data);
      case "communications":
        return await this.createCommunication(data);
      case "subscriptions":
        return await this.createSubscription(data);
      case "transactions":
        return await this.createTransaction(data);
      case "campaigns":
        return await this.createCampaign(data);
      default:
        throw new Error(`Table ${table} not supported in Convex client`);
    }
  }

  async updateRecord(table: string, id: string, data: any) {
    switch (table) {
      case "users":
        return await this.updateUser(id, data);
      case "members":
        return await this.updateMember(id, data);
      case "clients":
        return await this.updateClient(id, data);
      case "subscriptions":
        return await this.updateSubscription(id, data);
      case "campaigns":
        return await this.updateCampaign(id, data);
      default:
        throw new Error(`Table ${table} not supported for updates in Convex client`);
    }
  }

  async deleteRecord(table: string, id: string) {
    switch (table) {
      case "users":
        return await this.deleteUser(id);
      case "members":
        return await this.deleteMember(id);
      case "clients":
        return await this.deleteClient(id);
      case "campaigns":
        return await this.deleteCampaign(id);
      default:
        throw new Error(`Table ${table} not supported for deletion in Convex client`);
    }
  }

  async createTable(tableName: string, columns: any) {
    console.log(`🏗️ Convex Create Table: ${tableName}`, columns);
    return { success: true, table: tableName };
  }

  async makeRequest(endpoint: string, method: string, data: any) {
    console.log(`🌐 Convex Request: ${method} ${endpoint}`, data);
    return { success: true, data: { id: `mock_${Date.now()}` } };
  }
}

let convexClient: ConvexClient | null = null;

export function getConvexClient(): ConvexClient {
  if (!convexClient) {
    convexClient = new ConvexClient();
  }
  return convexClient;
}

export { getConvexClient as getXanoClient };

export interface Member {
  id: string;
  user_id?: string;
  client_id?: string;
  member_id: string;
  tier: "basic" | "premium" | "elite" | "executive";
  status: "active" | "inactive" | "pending" | "suspended";
  engagement_score: number;
  total_spend: number;
  last_active?: number;
  location?: string;
  permissions?: any;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  membership_type?: string;
  created_at?: number;
  updated_at?: number;
}

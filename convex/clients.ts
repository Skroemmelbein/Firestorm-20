import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getClients = query({
  args: {
    page: v.optional(v.number()),
    per_page: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    subscription_tier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let clients = await ctx.db.query("clients").collect();
    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      clients = clients.filter(client => 
        client.name?.toLowerCase().includes(searchLower) ||
        client.email?.toLowerCase().includes(searchLower)
      );
    }
    
    if (args.status) {
      clients = clients.filter(client => client.status === args.status);
    }
    
    if (args.subscription_tier) {
      clients = clients.filter(client => client.subscription_tier === args.subscription_tier);
    }
    
    const page = args.page || 1;
    const perPage = args.per_page || 50;
    const startIndex = (page - 1) * perPage;
    const paginatedClients = clients.slice(startIndex, startIndex + perPage);
    
    return {
      data: paginatedClients,
      total: clients.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(clients.length / perPage),
    };
  },
});

export const getClientById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createClient = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
    subscription_tier: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("enterprise"))),
    created_by: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("clients", {
      ...args,
      status: args.status || "active",
      subscription_tier: args.subscription_tier || "basic",
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
    subscription_tier: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("enterprise"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: Date.now(),
    });
  },
});

export const deleteClient = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getClientStats = query({
  args: {
    date_from: v.optional(v.number()),
    date_to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let clients = await ctx.db.query("clients").collect();
    
    if (args.date_from || args.date_to) {
      clients = clients.filter(client => {
        if (args.date_from && client.created_at < args.date_from) return false;
        if (args.date_to && client.created_at > args.date_to) return false;
        return true;
      });
    }
    
    const stats = {
      total: clients.length,
      active: clients.filter(c => c.status === "active").length,
      inactive: clients.filter(c => c.status === "inactive").length,
      suspended: clients.filter(c => c.status === "suspended").length,
      trial: clients.filter(c => c.status === "trial").length,
      basic: clients.filter(c => c.subscription_tier === "basic").length,
      premium: clients.filter(c => c.subscription_tier === "premium").length,
      enterprise: clients.filter(c => c.subscription_tier === "enterprise").length,
      custom: clients.filter(c => c.subscription_tier === "custom").length,
      total_revenue: clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0),
      avg_revenue: clients.length > 0 
        ? clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0) / clients.length 
        : 0,
      expiring_contracts: clients.filter(c => 
        c.contract_end && c.contract_end < Date.now() + (30 * 24 * 60 * 60 * 1000)
      ).length,
    };
    
    return stats;
  },
});

export const searchClients = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const clients = await ctx.db.query("clients").collect();
    const searchLower = args.query.toLowerCase();
    
    const filtered = clients.filter(client => 
      client.name.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.industry && client.industry.toLowerCase().includes(searchLower))
    );
    
    return filtered.slice(0, args.limit || 20);
  },
});

export const getClientsByTier = query({
  args: {
    tier: v.union(v.literal("basic"), v.literal("premium"), v.literal("enterprise"), v.literal("custom")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let clients = await ctx.db
      .query("clients")
      .withIndex("by_subscription_tier", (q) => q.eq("subscription_tier", args.tier))
      .collect();
    
    clients.sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0));
    
    return clients.slice(0, args.limit || 50);
  },
});

export const bulkUpdateClients = mutation({
  args: {
    client_ids: v.array(v.id("clients")),
    updates: v.object({
      status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"), v.literal("trial"))),
      subscription_tier: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("enterprise"), v.literal("custom"))),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    
    for (const clientId of args.client_ids) {
      try {
        await ctx.db.patch(clientId, {
          ...args.updates,
          updated_at: Date.now(),
        });
        results.push({ id: clientId, success: true });
      } catch (error: any) {
        results.push({ id: clientId, success: false, error: error.message });
      }
    }
    
    return results;
  },
});

export const getExpiringContracts = query({
  args: {
    days_ahead: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysAhead = args.days_ahead || 30;
    const cutoff = Date.now() + (daysAhead * 24 * 60 * 60 * 1000);
    
    const clients = await ctx.db.query("clients").collect();
    
    const expiring = clients.filter(client => 
      client.contract_end && 
      client.contract_end <= cutoff && 
      client.contract_end > Date.now()
    );
    
    return expiring.sort((a, b) => (a.contract_end || 0) - (b.contract_end || 0));
  },
});

export const updateClientRevenue = mutation({
  args: {
    id: v.id("clients"),
    revenue_amount: v.number(),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");
    
    return await ctx.db.patch(args.id, {
      total_revenue: (client.total_revenue || 0) + args.revenue_amount,
      updated_at: Date.now(),
    });
  },
});

export const getClientActivity = query({
  args: {
    id: v.id("clients"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    const members = await ctx.db
      .query("members")
      .withIndex("by_client", (q) => q.eq("client_id", args.id))
      .collect();
    
    const communications = await ctx.db
      .query("communications")
      .withIndex("by_client", (q) => q.eq("client_id", args.id))
      .collect();
    
    const campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_client", (q) => q.eq("client_id", args.id))
      .collect();
    
    const recentCommunications = communications.filter(c => c.created_at > cutoff);
    const activeCampaigns = campaigns.filter(c => c.status === "active");
    
    return {
      client_id: args.id,
      total_members: members.length,
      active_members: members.filter(m => m.status === "active").length,
      total_communications: communications.length,
      recent_communications: recentCommunications.length,
      total_campaigns: campaigns.length,
      active_campaigns: activeCampaigns.length,
      avg_member_engagement: members.length > 0 
        ? members.reduce((sum, m) => sum + (m.engagement_score || 0), 0) / members.length 
        : 0,
    };
  },
});

export const renewContract = mutation({
  args: {
    id: v.id("clients"),
    new_end_date: v.number(),
    new_tier: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("enterprise"), v.literal("custom"))),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");
    
    const updates: any = {
      contract_end: args.new_end_date,
      updated_at: Date.now(),
    };
    
    if (args.new_tier) {
      updates.subscription_tier = args.new_tier;
    }
    
    return await ctx.db.patch(args.id, updates);
  },
});

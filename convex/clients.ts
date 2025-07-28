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
  args: {},
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect();
    
    const stats = {
      total: clients.length,
      active: clients.filter(c => c.status === "active").length,
      inactive: clients.filter(c => c.status === "inactive").length,
      suspended: clients.filter(c => c.status === "suspended").length,
      basic: clients.filter(c => c.subscription_tier === "basic").length,
      premium: clients.filter(c => c.subscription_tier === "premium").length,
      enterprise: clients.filter(c => c.subscription_tier === "enterprise").length,
    };
    
    return stats;
  },
});

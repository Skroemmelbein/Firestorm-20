import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSubscriptions = query({
  args: {
    page: v.optional(v.number()),
    per_page: v.optional(v.number()),
    status: v.optional(v.string()),
    client_id: v.optional(v.id("clients")),
    member_id: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    let subscriptions = await ctx.db.query("subscriptions").collect();
    
    if (args.status) {
      subscriptions = subscriptions.filter(sub => sub.status === args.status);
    }
    
    if (args.client_id) {
      subscriptions = subscriptions.filter(sub => sub.client_id === args.client_id);
    }
    
    if (args.member_id) {
      subscriptions = subscriptions.filter(sub => sub.member_id === args.member_id);
    }
    
    subscriptions.sort((a, b) => b.created_at - a.created_at);
    
    const page = args.page || 1;
    const perPage = args.per_page || 50;
    const startIndex = (page - 1) * perPage;
    const paginatedSubscriptions = subscriptions.slice(startIndex, startIndex + perPage);
    
    return {
      data: paginatedSubscriptions,
      total: subscriptions.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(subscriptions.length / perPage),
    };
  },
});

export const getSubscriptionById = query({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getSubscriptionByNMICustomer = query({
  args: { nmi_customer_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_nmi_customer", (q) => q.eq("nmi_customer_id", args.nmi_customer_id))
      .first();
  },
});

export const createSubscription = mutation({
  args: {
    client_id: v.optional(v.id("clients")),
    user_id: v.optional(v.id("users")),
    member_id: v.optional(v.id("members")),
    plan_name: v.string(),
    plan_type: v.union(v.literal("monthly"), v.literal("yearly"), v.literal("one-time")),
    amount: v.number(),
    currency: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("cancelled"), v.literal("past_due"), v.literal("paused"))),
    nmi_customer_id: v.optional(v.string()),
    nmi_subscription_id: v.optional(v.string()),
    next_billing_date: v.optional(v.number()),
    trial_end_date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("subscriptions", {
      ...args,
      currency: args.currency || "USD",
      status: args.status || "active",
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateSubscription = mutation({
  args: {
    id: v.id("subscriptions"),
    plan_name: v.optional(v.string()),
    plan_type: v.optional(v.union(v.literal("monthly"), v.literal("yearly"), v.literal("one-time"))),
    amount: v.optional(v.number()),
    currency: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("cancelled"), v.literal("past_due"), v.literal("paused"))),
    nmi_customer_id: v.optional(v.string()),
    nmi_subscription_id: v.optional(v.string()),
    next_billing_date: v.optional(v.number()),
    trial_end_date: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: Date.now(),
    });
  },
});

export const cancelSubscription = mutation({
  args: {
    id: v.id("subscriptions"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: "cancelled",
      updated_at: Date.now(),
    });
  },
});

export const getSubscriptionStats = query({
  args: {
    client_id: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    let subscriptions = await ctx.db.query("subscriptions").collect();
    
    if (args.client_id) {
      subscriptions = subscriptions.filter(s => s.client_id === args.client_id);
    }
    
    const stats = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === "active").length,
      inactive: subscriptions.filter(s => s.status === "inactive").length,
      cancelled: subscriptions.filter(s => s.status === "cancelled").length,
      past_due: subscriptions.filter(s => s.status === "past_due").length,
      paused: subscriptions.filter(s => s.status === "paused").length,
      monthly: subscriptions.filter(s => s.plan_type === "monthly").length,
      yearly: subscriptions.filter(s => s.plan_type === "yearly").length,
      one_time: subscriptions.filter(s => s.plan_type === "one-time").length,
      total_mrr: subscriptions
        .filter(s => s.status === "active" && s.plan_type === "monthly")
        .reduce((sum, s) => sum + s.amount, 0),
      total_arr: subscriptions
        .filter(s => s.status === "active" && s.plan_type === "yearly")
        .reduce((sum, s) => sum + s.amount, 0),
    };
    
    return stats;
  },
});

export const updateSubscriptionBilling = mutation({
  args: {
    id: v.id("subscriptions"),
    next_billing_date: v.number(),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: Date.now(),
    });
  },
});

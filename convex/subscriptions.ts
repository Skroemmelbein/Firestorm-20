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

export const getUpcomingBillings = query({
  args: {
    days_ahead: v.optional(v.number()),
    client_id: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    const daysAhead = args.days_ahead || 7;
    const cutoff = Date.now() + (daysAhead * 24 * 60 * 60 * 1000);
    
    let subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_next_billing_date")
      .collect();
    
    subscriptions = subscriptions.filter(sub => 
      sub.next_billing_date && 
      sub.next_billing_date <= cutoff && 
      sub.next_billing_date > Date.now() &&
      sub.status === "active"
    );
    
    if (args.client_id) {
      subscriptions = subscriptions.filter(sub => sub.client_id === args.client_id);
    }
    
    return subscriptions.sort((a, b) => (a.next_billing_date || 0) - (b.next_billing_date || 0));
  },
});

export const pauseSubscription = mutation({
  args: {
    id: v.id("subscriptions"),
    pause_until: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.id);
    if (!subscription) throw new Error("Subscription not found");
    
    if (subscription.status !== "active") {
      throw new Error("Only active subscriptions can be paused");
    }
    
    return await ctx.db.patch(args.id, {
      status: "paused",
      updated_at: Date.now(),
    });
  },
});

export const resumeSubscription = mutation({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, args) => {
    const subscription = await ctx.db.get(args.id);
    if (!subscription) throw new Error("Subscription not found");
    
    if (subscription.status !== "paused") {
      throw new Error("Only paused subscriptions can be resumed");
    }
    
    return await ctx.db.patch(args.id, {
      status: "active",
      updated_at: Date.now(),
    });
  },
});

export const calculateMRR = query({
  args: {
    client_id: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    let subscriptions = await ctx.db
      .query("subscriptions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
    
    if (args.client_id) {
      subscriptions = subscriptions.filter(sub => sub.client_id === args.client_id);
    }
    
    let mrr = 0;
    let arr = 0;
    
    for (const sub of subscriptions) {
      if (sub.plan_type === "monthly") {
        mrr += sub.amount;
        arr += sub.amount * 12;
      } else if (sub.plan_type === "yearly") {
        const monthlyAmount = sub.amount / 12;
        mrr += monthlyAmount;
        arr += sub.amount;
      }
    }
    
    return {
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(arr * 100) / 100,
      total_active_subscriptions: subscriptions.length,
      avg_subscription_value: subscriptions.length > 0 ? mrr / subscriptions.length : 0,
    };
  },
});

export const getChurnAnalysis = query({
  args: {
    client_id: v.optional(v.id("clients")),
    months_back: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const monthsBack = args.months_back || 12;
    const cutoff = Date.now() - (monthsBack * 30 * 24 * 60 * 60 * 1000);
    
    let subscriptions = await ctx.db.query("subscriptions").collect();
    
    if (args.client_id) {
      subscriptions = subscriptions.filter(sub => sub.client_id === args.client_id);
    }
    
    const recentSubscriptions = subscriptions.filter(sub => sub.created_at > cutoff);
    const cancelledSubscriptions = recentSubscriptions.filter(sub => sub.status === "cancelled");
    
    const churnRate = recentSubscriptions.length > 0 
      ? (cancelledSubscriptions.length / recentSubscriptions.length) * 100 
      : 0;
    
    return {
      total_subscriptions: recentSubscriptions.length,
      cancelled_subscriptions: cancelledSubscriptions.length,
      churn_rate: Math.round(churnRate * 100) / 100,
      avg_subscription_lifetime: cancelledSubscriptions.length > 0
        ? cancelledSubscriptions.reduce((sum, sub) => {
            const lifetime = (sub.cancellation_date || Date.now()) - sub.created_at;
            return sum + lifetime;
          }, 0) / cancelledSubscriptions.length / (24 * 60 * 60 * 1000)
        : 0,
    };
  },
});

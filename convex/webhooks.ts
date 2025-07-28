import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getWebhooks = query({
  args: {
    provider: v.optional(v.string()),
    event_type: v.optional(v.string()),
    status: v.optional(v.string()),
    date_from: v.optional(v.number()),
    date_to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let webhooks = await ctx.db.query("webhooks").collect();
    
    if (args.provider) {
      webhooks = webhooks.filter(w => w.provider === args.provider);
    }
    
    if (args.event_type) {
      webhooks = webhooks.filter(w => w.event_type === args.event_type);
    }
    
    if (args.status) {
      webhooks = webhooks.filter(w => w.status === args.status);
    }
    
    if (args.date_from) {
      webhooks = webhooks.filter(w => w.created_at >= args.date_from!);
    }
    
    if (args.date_to) {
      webhooks = webhooks.filter(w => w.created_at <= args.date_to!);
    }
    
    webhooks.sort((a, b) => b.created_at - a.created_at);
    
    return webhooks;
  },
});

export const logWebhookEvent = mutation({
  args: {
    provider: v.string(),
    event_type: v.string(),
    payload: v.any(),
    status: v.optional(v.union(v.literal("received"), v.literal("processed"), v.literal("failed"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("webhooks", {
      provider: args.provider,
      event_type: args.event_type,
      payload: args.payload,
      status: args.status || "received",
      created_at: now,
    });
  },
});

export const updateWebhookStatus = mutation({
  args: {
    id: v.id("webhooks"),
    status: v.union(v.literal("received"), v.literal("processed"), v.literal("failed")),
    error_message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      processed_at: Date.now(),
    });
  },
});

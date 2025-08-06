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

export const getWebhooksByEvent = query({
  args: {
    event_type: v.string(),
    client_id: v.optional(v.id("clients")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let webhooks = await ctx.db
      .query("webhooks")
      .withIndex("by_event_type", (q) => q.eq("event_type", args.event_type))
      .collect();
    
    if (args.client_id) {
      webhooks = webhooks.filter(w => w.client_id === args.client_id);
    }
    
    if (args.status) {
      webhooks = webhooks.filter(w => w.status === args.status);
    }
    
    return webhooks.sort((a, b) => b.created_at - a.created_at);
  },
});

export const triggerWebhook = mutation({
  args: {
    id: v.id("webhooks"),
    payload: v.any(),
    trigger_source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const webhook = await ctx.db.get(args.id);
    if (!webhook) throw new Error("Webhook not found");
    
    if (webhook.status !== "received") {
      throw new Error("Webhook is not in received status");
    }
    
    const now = Date.now();
    
    return await ctx.db.patch(args.id, {
      status: "processed",
      processed_at: now,
    });
  },
});

export const getWebhookStats = query({
  args: {
    client_id: v.optional(v.id("clients")),
    days_back: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let webhooks = await ctx.db.query("webhooks").collect();
    
    if (args.client_id) {
      webhooks = webhooks.filter(w => w.client_id === args.client_id);
    }
    
    const daysBack = args.days_back || 30;
    const cutoff = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
    
    const recentlyProcessed = webhooks.filter(w => 
      w.processed_at && w.processed_at > cutoff
    );
    
    const stats = {
      total: webhooks.length,
      received: webhooks.filter(w => w.status === "received").length,
      processed: webhooks.filter(w => w.status === "processed").length,
      failed: webhooks.filter(w => w.status === "failed").length,
      recently_processed: recentlyProcessed.length,
      avg_processing_time: recentlyProcessed.length > 0 
        ? recentlyProcessed.reduce((sum, w) => {
            const processingTime = (w.processed_at || 0) - w.created_at;
            return sum + processingTime;
          }, 0) / recentlyProcessed.length / (60 * 1000)
        : 0,
    };
    
    return stats;
  },
});

export const bulkUpdateWebhooks = mutation({
  args: {
    webhook_ids: v.array(v.id("webhooks")),
    updates: v.object({
      status: v.optional(v.union(v.literal("received"), v.literal("processed"), v.literal("failed"))),
    }),
  },
  handler: async (ctx, args) => {
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    
    for (const webhookId of args.webhook_ids) {
      try {
        await ctx.db.patch(webhookId, {
          ...args.updates,
          processed_at: Date.now(),
        });
        results.push({ id: webhookId, success: true });
      } catch (error: any) {
        results.push({ id: webhookId, success: false, error: error.message });
      }
    }
    
    return results;
  },
});

export const getFailedWebhooks = query({
  args: {
    client_id: v.optional(v.id("clients")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let webhooks = await ctx.db
      .query("webhooks")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();
    
    if (args.client_id) {
      webhooks = webhooks.filter(w => w.client_id === args.client_id);
    }
    
    webhooks.sort((a, b) => b.created_at - a.created_at);
    
    return webhooks.slice(0, args.limit || 20);
  },
});

export const retryFailedWebhooks = mutation({
  args: {
    client_id: v.optional(v.id("clients")),
    max_retry_count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let webhooks = await ctx.db
      .query("webhooks")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();
    
    if (args.client_id) {
      webhooks = webhooks.filter(w => w.client_id === args.client_id);
    }
    
    const maxRetries = args.max_retry_count || 3;
    const eligibleForRetry = webhooks.filter(w => (w.retry_count || 0) < maxRetries);
    
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    
    for (const webhook of eligibleForRetry) {
      try {
        await ctx.db.patch(webhook._id, {
          status: "received",
          retry_count: (webhook.retry_count || 0) + 1,
          error_message: undefined,
        });
        results.push({ id: webhook._id, success: true });
      } catch (error: any) {
        results.push({ id: webhook._id, success: false, error: error.message });
      }
    }
    
    return {
      total_failed: webhooks.length,
      eligible_for_retry: eligibleForRetry.length,
      retry_results: results,
    };
  },
});

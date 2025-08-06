import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCommunications = query({
  args: {
    page: v.optional(v.number()),
    per_page: v.optional(v.number()),
    channel: v.optional(v.string()),
    status: v.optional(v.string()),
    client_id: v.optional(v.id("clients")),
    member_id: v.optional(v.id("members")),
    direction: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let communications = await ctx.db.query("communications").collect();
    
    if (args.channel) {
      communications = communications.filter(comm => comm.channel === args.channel);
    }
    
    if (args.status) {
      communications = communications.filter(comm => comm.status === args.status);
    }
    
    if (args.client_id) {
      communications = communications.filter(comm => comm.client_id === args.client_id);
    }
    
    if (args.member_id) {
      communications = communications.filter(comm => comm.member_id === args.member_id);
    }
    
    if (args.direction) {
      communications = communications.filter(comm => comm.direction === args.direction);
    }
    
    communications.sort((a, b) => b.created_at - a.created_at);
    
    const page = args.page || 1;
    const perPage = args.per_page || 50;
    const startIndex = (page - 1) * perPage;
    const paginatedCommunications = communications.slice(startIndex, startIndex + perPage);
    
    return {
      data: paginatedCommunications,
      total: communications.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(communications.length / perPage),
    };
  },
});

export const getCommunicationById = query({
  args: { id: v.id("communications") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createCommunication = mutation({
  args: {
    channel: v.union(v.literal("sms"), v.literal("mms"), v.literal("email"), v.literal("voice"), v.literal("chat"), v.literal("conversation")),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    to_number: v.optional(v.string()),
    from_number: v.optional(v.string()),
    to_email: v.optional(v.string()),
    from_email: v.optional(v.string()),
    content: v.string(),
    subject: v.optional(v.string()),
    status: v.optional(v.union(v.literal("queued"), v.literal("sent"), v.literal("delivered"), v.literal("failed"), v.literal("bounced"), v.literal("read"))),
    provider: v.union(v.literal("twilio"), v.literal("sendgrid"), v.literal("other")),
    provider_id: v.optional(v.string()),
    provider_status: v.optional(v.string()),
    cost: v.optional(v.number()),
    error_message: v.optional(v.string()),
    metadata: v.optional(v.any()),
    client_id: v.optional(v.id("clients")),
    user_id: v.optional(v.id("users")),
    member_id: v.optional(v.id("members")),
    sent_at: v.optional(v.number()),
    delivered_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("communications", {
      ...args,
      status: args.status || "queued",
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateCommunicationStatus = mutation({
  args: {
    id: v.id("communications"),
    status: v.union(v.literal("queued"), v.literal("sent"), v.literal("delivered"), v.literal("failed"), v.literal("bounced"), v.literal("read")),
    provider_status: v.optional(v.string()),
    error_message: v.optional(v.string()),
    delivered_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: Date.now(),
    });
  },
});

export const getCommunicationStats = query({
  args: {
    client_id: v.optional(v.id("clients")),
    date_from: v.optional(v.number()),
    date_to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let communications = await ctx.db.query("communications").collect();
    
    if (args.client_id) {
      communications = communications.filter(c => c.client_id === args.client_id);
    }
    
    if (args.date_from) {
      communications = communications.filter(c => c.created_at >= args.date_from!);
    }
    
    if (args.date_to) {
      communications = communications.filter(c => c.created_at <= args.date_to!);
    }
    
    const stats = {
      total: communications.length,
      sms: communications.filter(c => c.channel === "sms").length,
      mms: communications.filter(c => c.channel === "mms").length,
      email: communications.filter(c => c.channel === "email").length,
      voice: communications.filter(c => c.channel === "voice").length,
      chat: communications.filter(c => c.channel === "chat").length,
      conversation: communications.filter(c => c.channel === "conversation").length,
      sent: communications.filter(c => c.status === "sent").length,
      delivered: communications.filter(c => c.status === "delivered").length,
      failed: communications.filter(c => c.status === "failed").length,
      bounced: communications.filter(c => c.status === "bounced").length,
      total_cost: communications.reduce((sum, c) => sum + (c.cost || 0), 0),
      delivery_rate: communications.length > 0 
        ? (communications.filter(c => c.status === "delivered").length / communications.length) * 100 
        : 0,
    };
    
    return stats;
  },
});

export const logSMS = mutation({
  args: {
    to_number: v.string(),
    from_number: v.string(),
    content: v.string(),
    provider_id: v.optional(v.string()),
    cost: v.optional(v.number()),
    client_id: v.optional(v.id("clients")),
    member_id: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("communications", {
      channel: "sms",
      direction: "outbound",
      to_number: args.to_number,
      from_number: args.from_number,
      content: args.content,
      status: "sent",
      provider: "twilio",
      provider_id: args.provider_id,
      cost: args.cost,
      client_id: args.client_id,
      member_id: args.member_id,
      sent_at: now,
      created_at: now,
      updated_at: now,
    });
  },
});

export const logEmail = mutation({
  args: {
    to_email: v.string(),
    from_email: v.string(),
    subject: v.string(),
    content: v.string(),
    provider_id: v.optional(v.string()),
    client_id: v.optional(v.id("clients")),
    member_id: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("communications", {
      channel: "email",
      direction: "outbound",
      to_email: args.to_email,
      from_email: args.from_email,
      subject: args.subject,
      content: args.content,
      status: "sent",
      provider: "sendgrid",
      provider_id: args.provider_id,
      client_id: args.client_id,
      member_id: args.member_id,
      sent_at: now,
      created_at: now,
      updated_at: now,
    });
  },
});

export const getCommunicationsByChannel = query({
  args: {
    channel: v.union(v.literal("sms"), v.literal("mms"), v.literal("email"), v.literal("voice"), v.literal("chat"), v.literal("conversation"), v.literal("push"), v.literal("webhook")),
    client_id: v.optional(v.id("clients")),
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let communications = await ctx.db
      .query("communications")
      .withIndex("by_channel", (q) => q.eq("channel", args.channel))
      .collect();
    
    if (args.client_id) {
      communications = communications.filter(comm => comm.client_id === args.client_id);
    }
    
    if (args.status) {
      communications = communications.filter(comm => comm.status === args.status);
    }
    
    communications.sort((a, b) => b.created_at - a.created_at);
    
    return communications.slice(0, args.limit || 50);
  },
});

export const getCommunicationsByMember = query({
  args: {
    member_id: v.id("members"),
    limit: v.optional(v.number()),
    channel: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let communications = await ctx.db
      .query("communications")
      .withIndex("by_member", (q) => q.eq("member_id", args.member_id))
      .collect();
    
    if (args.channel) {
      communications = communications.filter(comm => comm.channel === args.channel);
    }
    
    communications.sort((a, b) => b.created_at - a.created_at);
    
    return communications.slice(0, args.limit || 50);
  },
});

export const bulkCreateCommunications = mutation({
  args: {
    communications: v.array(v.object({
      channel: v.union(v.literal("sms"), v.literal("mms"), v.literal("email"), v.literal("voice"), v.literal("chat"), v.literal("conversation"), v.literal("push"), v.literal("webhook")),
      direction: v.union(v.literal("inbound"), v.literal("outbound")),
      to_number: v.optional(v.string()),
      from_number: v.optional(v.string()),
      to_email: v.optional(v.string()),
      from_email: v.optional(v.string()),
      content: v.string(),
      subject: v.optional(v.string()),
      member_id: v.optional(v.id("members")),
      client_id: v.optional(v.id("clients")),
      campaign_id: v.optional(v.id("campaigns")),
    })),
  },
  handler: async (ctx, args) => {
    const results: Array<{ success: boolean; id?: string; error?: string }> = [];
    const now = Date.now();
    
    for (const comm of args.communications) {
      try {
        const id = await ctx.db.insert("communications", {
          ...comm,
          status: "queued",
          provider: "other",
          created_at: now,
          updated_at: now,
        });
        results.push({ success: true, id });
      } catch (error: any) {
        results.push({ success: false, error: error.message });
      }
    }
    
    return results;
  },
});

export const getDeliveryRates = query({
  args: {
    client_id: v.optional(v.id("clients")),
    channel: v.optional(v.string()),
    date_from: v.optional(v.number()),
    date_to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let communications = await ctx.db.query("communications").collect();
    
    if (args.client_id) {
      communications = communications.filter(comm => comm.client_id === args.client_id);
    }
    
    if (args.channel) {
      communications = communications.filter(comm => comm.channel === args.channel);
    }
    
    if (args.date_from || args.date_to) {
      communications = communications.filter(comm => {
        if (args.date_from && comm.created_at < args.date_from) return false;
        if (args.date_to && comm.created_at > args.date_to) return false;
        return true;
      });
    }
    
    const sent = communications.filter(c => c.status === "sent" || c.status === "delivered");
    const delivered = communications.filter(c => c.status === "delivered");
    const failed = communications.filter(c => c.status === "failed");
    const bounced = communications.filter(c => c.status === "bounced");
    
    return {
      total_sent: sent.length,
      total_delivered: delivered.length,
      total_failed: failed.length,
      total_bounced: bounced.length,
      delivery_rate: sent.length > 0 ? (delivered.length / sent.length) * 100 : 0,
      failure_rate: sent.length > 0 ? (failed.length / sent.length) * 100 : 0,
      bounce_rate: sent.length > 0 ? (bounced.length / sent.length) * 100 : 0,
    };
  },
});

export const getCommunicationCosts = query({
  args: {
    client_id: v.optional(v.id("clients")),
    date_from: v.optional(v.number()),
    date_to: v.optional(v.number()),
    group_by: v.optional(v.union(v.literal("channel"), v.literal("provider"), v.literal("campaign"))),
  },
  handler: async (ctx, args) => {
    let communications = await ctx.db.query("communications").collect();
    
    if (args.client_id) {
      communications = communications.filter(comm => comm.client_id === args.client_id);
    }
    
    if (args.date_from || args.date_to) {
      communications = communications.filter(comm => {
        if (args.date_from && comm.created_at < args.date_from) return false;
        if (args.date_to && comm.created_at > args.date_to) return false;
        return true;
      });
    }
    
    const totalCost = communications.reduce((sum, c) => sum + (c.cost || 0), 0);
    const avgCost = communications.length > 0 ? totalCost / communications.length : 0;
    
    let breakdown = {};
    
    if (args.group_by === "channel") {
      breakdown = communications.reduce((acc, c) => {
        const key = c.channel;
        acc[key] = (acc[key] || 0) + (c.cost || 0);
        return acc;
      }, {} as Record<string, number>);
    } else if (args.group_by === "provider") {
      breakdown = communications.reduce((acc, c) => {
        const key = c.provider;
        acc[key] = (acc[key] || 0) + (c.cost || 0);
        return acc;
      }, {} as Record<string, number>);
    }
    
    return {
      total_cost: totalCost,
      avg_cost: avgCost,
      total_messages: communications.length,
      breakdown,
    };
  },
});

export const retryFailedCommunications = mutation({
  args: {
    client_id: v.optional(v.id("clients")),
    max_retry_count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let communications = await ctx.db
      .query("communications")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();
    
    if (args.client_id) {
      communications = communications.filter(comm => comm.client_id === args.client_id);
    }
    
    const maxRetries = args.max_retry_count || 3;
    const eligibleForRetry = communications.filter(c => (c.retry_count || 0) < maxRetries);
    
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    
    for (const comm of eligibleForRetry) {
      try {
        await ctx.db.patch(comm._id, {
          status: "queued",
          retry_count: (comm.retry_count || 0) + 1,
          updated_at: Date.now(),
        });
        results.push({ id: comm._id, success: true });
      } catch (error: any) {
        results.push({ id: comm._id, success: false, error: error.message });
      }
    }
    
    return {
      total_failed: communications.length,
      eligible_for_retry: eligibleForRetry.length,
      retry_results: results,
    };
  },
});

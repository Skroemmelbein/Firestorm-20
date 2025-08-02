import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCampaigns = query({
  args: {
    page: v.optional(v.number()),
    per_page: v.optional(v.number()),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    client_id: v.optional(v.id("clients")),
    created_by: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let campaigns = await ctx.db.query("campaigns").collect();
    
    if (args.status) {
      campaigns = campaigns.filter(campaign => campaign.status === args.status);
    }
    
    if (args.type) {
      campaigns = campaigns.filter(campaign => campaign.type === args.type);
    }
    
    if (args.client_id) {
      campaigns = campaigns.filter(campaign => campaign.client_id === args.client_id);
    }
    
    if (args.created_by) {
      campaigns = campaigns.filter(campaign => campaign.created_by === args.created_by);
    }
    
    campaigns.sort((a, b) => b.created_at - a.created_at);
    
    const page = args.page || 1;
    const perPage = args.per_page || 50;
    const startIndex = (page - 1) * perPage;
    const paginatedCampaigns = campaigns.slice(startIndex, startIndex + perPage);
    
    return {
      data: paginatedCampaigns,
      total: campaigns.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(campaigns.length / perPage),
    };
  },
});

export const getCampaignById = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createCampaign = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("sms"), v.literal("email"), v.literal("mixed")),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("paused"), v.literal("completed"))),
    target_audience: v.optional(v.any()),
    message_template: v.optional(v.string()),
    schedule_type: v.union(v.literal("immediate"), v.literal("scheduled"), v.literal("recurring")),
    scheduled_at: v.optional(v.number()),
    created_by: v.id("users"),
    client_id: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("campaigns", {
      ...args,
      status: args.status || "draft",
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("sms"), v.literal("email"), v.literal("mixed"))),
    status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("paused"), v.literal("completed"))),
    target_audience: v.optional(v.any()),
    message_template: v.optional(v.string()),
    schedule_type: v.optional(v.union(v.literal("immediate"), v.literal("scheduled"), v.literal("recurring"))),
    scheduled_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: Date.now(),
    });
  },
});

export const deleteCampaign = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getCampaignStats = query({
  args: {
    client_id: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    let campaigns = await ctx.db.query("campaigns").collect();
    
    if (args.client_id) {
      campaigns = campaigns.filter(c => c.client_id === args.client_id);
    }
    
    const stats = {
      total: campaigns.length,
      draft: campaigns.filter(c => c.status === "draft").length,
      active: campaigns.filter(c => c.status === "active").length,
      paused: campaigns.filter(c => c.status === "paused").length,
      completed: campaigns.filter(c => c.status === "completed").length,
      sms: campaigns.filter(c => c.type === "sms").length,
      email: campaigns.filter(c => c.type === "email").length,
      mixed: campaigns.filter(c => c.type === "mixed").length,
    };
    
    return stats;
  },
});

export const launchCampaign = mutation({
  args: {
    id: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) {
      throw new Error("Campaign not found");
    }
    
    await ctx.db.patch(args.id, {
      status: "active",
      updated_at: Date.now(),
    });
    
    if (campaign.schedule_type === "scheduled" && campaign.scheduled_at) {
      await ctx.db.insert("scheduled_jobs", {
        campaign_id: args.id,
        job_type: "send_message",
        scheduled_at: campaign.scheduled_at,
        status: "pending",
        retry_count: 0,
        max_retries: 3,
        payload: {
          target_count: 0,
          targets: campaign.target_audience || []
        },
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    } else if (campaign.schedule_type === "immediate") {
      await ctx.db.insert("scheduled_jobs", {
        campaign_id: args.id,
        job_type: "send_message",
        scheduled_at: Date.now(),
        status: "pending",
        retry_count: 0,
        max_retries: 3,
        payload: {
          target_count: 0,
          targets: campaign.target_audience || []
        },
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    }
    
    return { success: true };
  },
});

export const pauseCampaign = mutation({
  args: {
    id: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: "paused",
      updated_at: Date.now(),
    });
  },
});

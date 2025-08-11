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

export const resumeCampaign = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) throw new Error("Campaign not found");
    
    if (campaign.status !== "paused") {
      throw new Error("Only paused campaigns can be resumed");
    }
    
    return await ctx.db.patch(args.id, {
      status: "active",
      updated_at: Date.now(),
    });
  },
});

export const duplicateCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    new_name: v.string(),
  },
  handler: async (ctx, args) => {
    const originalCampaign = await ctx.db.get(args.id);
    if (!originalCampaign) throw new Error("Campaign not found");
    
    const now = Date.now();
    
    const { _id, _creationTime, created_at, updated_at, ...campaignData } = originalCampaign;
    
    return await ctx.db.insert("campaigns", {
      ...campaignData,
      name: args.new_name,
      status: "draft",
      created_at: now,
      updated_at: now,
    });
  },
});

export const getCampaignsByStatus = query({
  args: {
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("paused"), v.literal("completed"), v.literal("archived")),
    client_id: v.optional(v.id("clients")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    
    if (args.client_id) {
      campaigns = campaigns.filter(campaign => campaign.client_id === args.client_id);
    }
    
    campaigns.sort((a, b) => b.created_at - a.created_at);
    
    return campaigns.slice(0, args.limit || 50);
  },
});

export const getScheduledCampaigns = query({
  args: {
    upcoming_hours: v.optional(v.number()),
    client_id: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    const hoursAhead = args.upcoming_hours || 24;
    const cutoff = Date.now() + (hoursAhead * 60 * 60 * 1000);
    
    let campaigns = await ctx.db
      .query("campaigns")
      .withIndex("by_scheduled_at")
      .collect();
    
    campaigns = campaigns.filter(campaign => 
      campaign.scheduled_at && 
      campaign.scheduled_at <= cutoff && 
      campaign.scheduled_at > Date.now() &&
      campaign.status === "draft"
    );
    
    if (args.client_id) {
      campaigns = campaigns.filter(campaign => campaign.client_id === args.client_id);
    }
    
    return campaigns.sort((a, b) => (a.scheduled_at || 0) - (b.scheduled_at || 0));
  },
});

export const getCampaignROI = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) return null;
    
    const communications = await ctx.db
      .query("communications")
      .withIndex("by_campaign", (q) => q.eq("campaign_id", args.id))
      .collect();
    
    const totalCost = communications.reduce((sum, c) => sum + (c.cost || 0), 0);
    const budgetSpent = totalCost;
    const expectedRevenue = campaign.expected_revenue || 0;
    const budgetRemaining = (campaign.budget || 0) - budgetSpent;
    
    const roi = totalCost > 0 ? ((expectedRevenue - totalCost) / totalCost) * 100 : 0;
    
    return {
      campaign_id: args.id,
      budget: campaign.budget || 0,
      budget_spent: budgetSpent,
      budget_remaining: budgetRemaining,
      expected_revenue: expectedRevenue,
      total_cost: totalCost,
      roi_percentage: roi,
      messages_sent: communications.length,
      avg_cost_per_message: communications.length > 0 ? totalCost / communications.length : 0,
    };
  },
});

export const getCampaignEngagement = query({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const communications = await ctx.db
      .query("communications")
      .withIndex("by_campaign", (q) => q.eq("campaign_id", args.id))
      .collect();
    
    const sent = communications.filter(c => c.status === "sent" || c.status === "delivered");
    const delivered = communications.filter(c => c.status === "delivered");
    const opened = communications.filter(c => c.status === "read");
    const clicked = communications.filter(c => c.status === "clicked");
    const replied = communications.filter(c => c.status === "replied");
    
    return {
      campaign_id: args.id,
      total_sent: sent.length,
      total_delivered: delivered.length,
      total_opened: opened.length,
      total_clicked: clicked.length,
      total_replied: replied.length,
      delivery_rate: sent.length > 0 ? (delivered.length / sent.length) * 100 : 0,
      open_rate: delivered.length > 0 ? (opened.length / delivered.length) * 100 : 0,
      click_rate: opened.length > 0 ? (clicked.length / opened.length) * 100 : 0,
      reply_rate: delivered.length > 0 ? (replied.length / delivered.length) * 100 : 0,
      engagement_score: delivered.length > 0 
        ? ((opened.length + clicked.length + replied.length) / delivered.length) * 100 
        : 0,
    };
  },
});

export const bulkUpdateCampaigns = mutation({
  args: {
    campaign_ids: v.array(v.id("campaigns")),
    updates: v.object({
      status: v.optional(v.union(v.literal("draft"), v.literal("active"), v.literal("paused"), v.literal("completed"), v.literal("archived"))),
      priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    
    for (const campaignId of args.campaign_ids) {
      try {
        await ctx.db.patch(campaignId, {
          ...args.updates,
          updated_at: Date.now(),
        });
        results.push({ id: campaignId, success: true });
      } catch (error: any) {
        results.push({ id: campaignId, success: false, error: error.message });
      }
    }
    
    return results;
  },
});

export const archiveCampaign = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, args) => {
    const campaign = await ctx.db.get(args.id);
    if (!campaign) throw new Error("Campaign not found");
    
    if (campaign.status !== "completed") {
      throw new Error("Only completed campaigns can be archived");
    }
    
    return await ctx.db.patch(args.id, {
      status: "archived",
      updated_at: Date.now(),
    });
  },
});

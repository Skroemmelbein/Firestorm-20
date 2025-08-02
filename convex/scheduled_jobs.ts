import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createScheduledJob = mutation({
  args: {
    campaign_id: v.id("campaigns"),
    job_type: v.union(v.literal("send_message"), v.literal("delay"), v.literal("trigger_event")),
    scheduled_at: v.number(),
    payload: v.optional(v.any()),
    max_retries: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("scheduled_jobs", {
      ...args,
      status: "pending",
      retry_count: 0,
      max_retries: args.max_retries || 3,
      created_at: now,
      updated_at: now,
    });
  },
});

export const getDueJobs = query({
  args: {
    before_timestamp: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scheduled_jobs")
      .withIndex("by_scheduled_at")
      .filter((q) => 
        q.and(
          q.lte(q.field("scheduled_at"), args.before_timestamp),
          q.eq(q.field("status"), "pending")
        )
      )
      .take(args.limit || 50);
  },
});

export const getJobsByCampaign = query({
  args: {
    campaign_id: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("scheduled_jobs")
      .withIndex("by_campaign")
      .filter((q) => q.eq(q.field("campaign_id"), args.campaign_id))
      .collect();
  },
});

export const updateJobStatus = mutation({
  args: {
    id: v.id("scheduled_jobs"),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    error_message: v.optional(v.string()),
    executed_at: v.optional(v.number()),
    retry_count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: Date.now(),
    });
  },
});

export const getJobStats = query({
  args: {
    campaign_id: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    let jobs = await ctx.db.query("scheduled_jobs").collect();
    
    if (args.campaign_id) {
      jobs = jobs.filter(j => j.campaign_id === args.campaign_id);
    }
    
    const stats = {
      total: jobs.length,
      pending: jobs.filter(j => j.status === "pending").length,
      running: jobs.filter(j => j.status === "running").length,
      completed: jobs.filter(j => j.status === "completed").length,
      failed: jobs.filter(j => j.status === "failed").length,
      send_message: jobs.filter(j => j.job_type === "send_message").length,
      delay: jobs.filter(j => j.job_type === "delay").length,
      trigger_event: jobs.filter(j => j.job_type === "trigger_event").length,
    };
    
    return stats;
  },
});

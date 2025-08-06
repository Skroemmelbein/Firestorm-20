import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createExecution = mutation({
  args: {
    campaign_id: v.id("campaigns"),
    execution_type: v.union(v.literal("immediate"), v.literal("scheduled"), v.literal("recurring")),
    target_count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("campaign_executions", {
      ...args,
      sent_count: 0,
      failed_count: 0,
      status: "queued",
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateExecutionProgress = mutation({
  args: {
    id: v.id("campaign_executions"),
    sent_count: v.optional(v.number()),
    failed_count: v.optional(v.number()),
    status: v.optional(v.union(v.literal("running"), v.literal("completed"), v.literal("failed"), v.literal("paused"))),
    error_message: v.optional(v.string()),
    completed_at: v.optional(v.number()),
    started_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    const now = Date.now();
    
    if (updateData.status === "completed") {
      updateData.completed_at = now;
    } else if (updateData.status === "running") {
      const execution = await ctx.db.get(id);
      if (execution && !execution.started_at) {
        updateData.started_at = now;
      }
    }
    
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: now,
    });
  },
});

export const getExecutionsByCampaign = query({
  args: {
    campaign_id: v.id("campaigns"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("campaign_executions")
      .withIndex("by_campaign")
      .filter((q) => q.eq(q.field("campaign_id"), args.campaign_id))
      .collect();
  },
});

export const getRecentExecutions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const executions = await ctx.db.query("campaign_executions").collect();
    executions.sort((a, b) => b.created_at - a.created_at);
    return executions.slice(0, args.limit || 20);
  },
});

export const getExecutionStats = query({
  args: {
    campaign_id: v.optional(v.id("campaigns")),
  },
  handler: async (ctx, args) => {
    let executions = await ctx.db.query("campaign_executions").collect();
    
    if (args.campaign_id) {
      executions = executions.filter(e => e.campaign_id === args.campaign_id);
    }
    
    const stats = {
      total: executions.length,
      queued: executions.filter(e => e.status === "queued").length,
      running: executions.filter(e => e.status === "running").length,
      completed: executions.filter(e => e.status === "completed").length,
      failed: executions.filter(e => e.status === "failed").length,
      paused: executions.filter(e => e.status === "paused").length,
      total_sent: executions.reduce((sum, e) => sum + (e.sent_count || 0), 0),
      total_failed: executions.reduce((sum, e) => sum + (e.failed_count || 0), 0),
    };
    
    return stats;
  },
});

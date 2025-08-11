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

export const getJobsByStatus = query({
  args: {
    status: v.union(v.literal("pending"), v.literal("running"), v.literal("completed"), v.literal("failed")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let jobs = await ctx.db
      .query("scheduled_jobs")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    
    jobs.sort((a, b) => a.scheduled_at - b.scheduled_at);
    
    return jobs.slice(0, args.limit || 50);
  },
});

export const getOverdueJobs = query({
  args: {
    grace_period_minutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const gracePeriod = (args.grace_period_minutes || 5) * 60 * 1000;
    const cutoff = Date.now() - gracePeriod;
    
    const jobs = await ctx.db
      .query("scheduled_jobs")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    
    const overdueJobs = jobs.filter(job => job.scheduled_at < cutoff);
    
    return overdueJobs.sort((a, b) => a.scheduled_at - b.scheduled_at);
  },
});

export const retryFailedJobs = mutation({
  args: {
    max_retry_count: v.optional(v.number()),
    job_type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let jobs = await ctx.db
      .query("scheduled_jobs")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();
    
    if (args.job_type) {
      jobs = jobs.filter(job => job.job_type === args.job_type);
    }
    
    const maxRetries = args.max_retry_count || 3;
    const eligibleForRetry = jobs.filter(job => job.retry_count < maxRetries);
    
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    
    for (const job of eligibleForRetry) {
      try {
        await ctx.db.patch(job._id, {
          status: "pending",
          retry_count: job.retry_count + 1,
          error_message: undefined,
          scheduled_at: Date.now() + (5 * 60 * 1000),
          updated_at: Date.now(),
        });
        results.push({ id: job._id, success: true });
      } catch (error: any) {
        results.push({ id: job._id, success: false, error: error.message });
      }
    }
    
    return {
      total_failed: jobs.length,
      eligible_for_retry: eligibleForRetry.length,
      retry_results: results,
    };
  },
});

export const bulkDeleteCompletedJobs = mutation({
  args: {
    older_than_days: v.optional(v.number()),
    job_type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const daysOld = args.older_than_days || 30;
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    let jobs = await ctx.db
      .query("scheduled_jobs")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();
    
    jobs = jobs.filter(job => (job.executed_at || job.updated_at) < cutoff);
    
    if (args.job_type) {
      jobs = jobs.filter(job => job.job_type === args.job_type);
    }
    
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    
    for (const job of jobs) {
      try {
        await ctx.db.delete(job._id);
        results.push({ id: job._id, success: true });
      } catch (error: any) {
        results.push({ id: job._id, success: false, error: error.message });
      }
    }
    
    return {
      deleted_count: results.filter(r => r.success).length,
      failed_count: results.filter(r => !r.success).length,
      results,
    };
  },
});

export const getJobExecutionStats = query({
  args: {
    job_type: v.optional(v.string()),
    days_back: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysBack = args.days_back || 7;
    const cutoff = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
    
    let jobs = await ctx.db.query("scheduled_jobs").collect();
    
    jobs = jobs.filter(job => job.created_at > cutoff);
    
    if (args.job_type) {
      jobs = jobs.filter(job => job.job_type === args.job_type);
    }
    
    const completedJobs = jobs.filter(job => job.status === "completed");
    const failedJobs = jobs.filter(job => job.status === "failed");
    
    const avgExecutionTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, job) => {
          const executionTime = (job.executed_at || job.updated_at) - job.created_at;
          return sum + executionTime;
        }, 0) / completedJobs.length / (60 * 1000)
      : 0;
    
    return {
      total_jobs: jobs.length,
      completed: completedJobs.length,
      failed: failedJobs.length,
      pending: jobs.filter(job => job.status === "pending").length,
      running: jobs.filter(job => job.status === "running").length,
      success_rate: jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0,
      avg_execution_time_minutes: avgExecutionTime,
      total_retries: jobs.reduce((sum, job) => sum + job.retry_count, 0),
    };
  },
});

export const scheduleRecurringJob = mutation({
  args: {
    campaign_id: v.id("campaigns"),
    job_type: v.string(),
    interval_minutes: v.number(),
    max_executions: v.optional(v.number()),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const nextExecution = now + (args.interval_minutes * 60 * 1000);
    
    return await ctx.db.insert("scheduled_jobs", {
      campaign_id: args.campaign_id,
      job_type: args.job_type,
      scheduled_at: nextExecution,
      status: "pending",
      retry_count: 0,
      max_retries: 3,
      payload: {
        ...args.payload,
        is_recurring: true,
        interval_minutes: args.interval_minutes,
        max_executions: args.max_executions,
        execution_count: 0,
      },
      created_at: now,
      updated_at: now,
    });
  },
});

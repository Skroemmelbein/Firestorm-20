import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAnalytics = query({
  args: {
    metric_name: v.optional(v.string()),
    client_id: v.optional(v.id("clients")),
    date_from: v.optional(v.number()),
    date_to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let analytics = await ctx.db.query("analytics").collect();
    
    if (args.metric_name) {
      analytics = analytics.filter(a => a.metric_name === args.metric_name);
    }
    
    if (args.client_id) {
      analytics = analytics.filter(a => a.client_id === args.client_id);
    }
    
    if (args.date_from) {
      analytics = analytics.filter(a => a.recorded_at >= args.date_from!);
    }
    
    if (args.date_to) {
      analytics = analytics.filter(a => a.recorded_at <= args.date_to!);
    }
    
    analytics.sort((a, b) => b.recorded_at - a.recorded_at);
    
    return analytics;
  },
});

export const recordMetric = mutation({
  args: {
    metric_name: v.string(),
    metric_value: v.number(),
    metric_type: v.union(v.literal("counter"), v.literal("gauge"), v.literal("histogram")),
    dimensions: v.optional(v.any()),
    client_id: v.optional(v.id("clients")),
    user_id: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("analytics", {
      ...args,
      recorded_at: now,
    });
  },
});

export const getDashboardAnalytics = query({
  args: {
    client_id: v.optional(v.id("clients")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const dateFrom = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    let analytics = await ctx.db.query("analytics").collect();
    
    if (args.client_id) {
      analytics = analytics.filter(a => a.client_id === args.client_id);
    }
    
    analytics = analytics.filter(a => a.recorded_at >= dateFrom);
    
    const metrics = analytics.reduce((acc, metric) => {
      if (!acc[metric.metric_name]) {
        acc[metric.metric_name] = {
          name: metric.metric_name,
          type: metric.metric_type,
          values: [],
          total: 0,
          average: 0,
          count: 0,
        };
      }
      
      acc[metric.metric_name].values.push({
        value: metric.metric_value,
        timestamp: metric.recorded_at,
        dimensions: metric.dimensions,
      });
      
      acc[metric.metric_name].total += metric.metric_value;
      acc[metric.metric_name].count += 1;
      acc[metric.metric_name].average = acc[metric.metric_name].total / acc[metric.metric_name].count;
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(metrics);
  },
});

export const getSystemHealth = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    
    const recentMetrics = await ctx.db
      .query("analytics")
      .filter((q) => q.gte(q.field("recorded_at"), oneHourAgo))
      .collect();
    
    const healthMetrics = {
      total_requests: recentMetrics.filter(m => m.metric_name === "api_requests").length,
      error_rate: 0,
      avg_response_time: 0,
      active_users: recentMetrics.filter(m => m.metric_name === "active_users").length,
      system_status: "healthy" as "healthy" | "warning" | "critical",
    };
    
    const errorMetrics = recentMetrics.filter(m => m.metric_name === "api_errors");
    const requestMetrics = recentMetrics.filter(m => m.metric_name === "api_requests");
    
    if (requestMetrics.length > 0) {
      healthMetrics.error_rate = (errorMetrics.length / requestMetrics.length) * 100;
    }
    
    const responseTimeMetrics = recentMetrics.filter(m => m.metric_name === "response_time");
    if (responseTimeMetrics.length > 0) {
      healthMetrics.avg_response_time = responseTimeMetrics.reduce((sum, m) => sum + m.metric_value, 0) / responseTimeMetrics.length;
    }
    
    if (healthMetrics.error_rate > 10) {
      healthMetrics.system_status = "critical";
    } else if (healthMetrics.error_rate > 5 || healthMetrics.avg_response_time > 2000) {
      healthMetrics.system_status = "warning";
    }
    
    return healthMetrics;
  },
});

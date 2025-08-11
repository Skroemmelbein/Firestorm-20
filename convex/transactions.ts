import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTransactions = query({
  args: {
    page: v.optional(v.number()),
    per_page: v.optional(v.number()),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    subscription_id: v.optional(v.id("subscriptions")),
    client_id: v.optional(v.id("clients")),
    member_id: v.optional(v.id("members")),
  },
  handler: async (ctx, args) => {
    let transactions = await ctx.db.query("transactions").collect();
    
    if (args.status) {
      transactions = transactions.filter(t => t.status === args.status);
    }
    
    if (args.type) {
      transactions = transactions.filter(t => t.type === args.type);
    }
    
    if (args.subscription_id) {
      transactions = transactions.filter(t => t.subscription_id === args.subscription_id);
    }
    
    if (args.client_id) {
      transactions = transactions.filter(t => t.client_id === args.client_id);
    }
    
    if (args.member_id) {
      transactions = transactions.filter(t => t.member_id === args.member_id);
    }
    
    transactions.sort((a, b) => b.created_at - a.created_at);
    
    const page = args.page || 1;
    const perPage = args.per_page || 50;
    const startIndex = (page - 1) * perPage;
    const paginatedTransactions = transactions.slice(startIndex, startIndex + perPage);
    
    return {
      data: paginatedTransactions,
      total: transactions.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(transactions.length / perPage),
    };
  },
});

export const getTransactionById = query({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTransactionByTransactionId = query({
  args: { transaction_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("by_transaction_id", (q) => q.eq("transaction_id", args.transaction_id))
      .first();
  },
});

export const createTransaction = mutation({
  args: {
    subscription_id: v.optional(v.id("subscriptions")),
    client_id: v.optional(v.id("clients")),
    user_id: v.optional(v.id("users")),
    member_id: v.optional(v.id("members")),
    transaction_id: v.string(),
    nmi_transaction_id: v.optional(v.string()),
    amount: v.number(),
    currency: v.optional(v.string()),
    type: v.union(v.literal("charge"), v.literal("refund"), v.literal("chargeback")),
    status: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("cancelled"))),
    payment_method: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    processed_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("transactions", {
      ...args,
      currency: args.currency || "USD",
      status: args.status || "pending",
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateTransactionStatus = mutation({
  args: {
    id: v.id("transactions"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("cancelled")),
    processed_at: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      processed_at: updateData.processed_at || Date.now(),
      updated_at: Date.now(),
    });
  },
});

export const getTransactionStats = query({
  args: {
    client_id: v.optional(v.id("clients")),
    date_from: v.optional(v.number()),
    date_to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let transactions = await ctx.db.query("transactions").collect();
    
    if (args.client_id) {
      transactions = transactions.filter(t => t.client_id === args.client_id);
    }
    
    if (args.date_from) {
      transactions = transactions.filter(t => t.created_at >= args.date_from!);
    }
    
    if (args.date_to) {
      transactions = transactions.filter(t => t.created_at <= args.date_to!);
    }
    
    const completedTransactions = transactions.filter(t => t.status === "completed");
    
    const stats = {
      total: transactions.length,
      completed: completedTransactions.length,
      pending: transactions.filter(t => t.status === "pending").length,
      failed: transactions.filter(t => t.status === "failed").length,
      cancelled: transactions.filter(t => t.status === "cancelled").length,
      charges: transactions.filter(t => t.type === "charge").length,
      refunds: transactions.filter(t => t.type === "refund").length,
      chargebacks: transactions.filter(t => t.type === "chargeback").length,
      total_revenue: completedTransactions
        .filter(t => t.type === "charge")
        .reduce((sum, t) => sum + t.amount, 0),
      total_refunded: completedTransactions
        .filter(t => t.type === "refund")
        .reduce((sum, t) => sum + t.amount, 0),
      success_rate: transactions.length > 0 
        ? (completedTransactions.length / transactions.length) * 100 
        : 0,
    };
    
    return stats;
  },
});

export const processNMITransaction = mutation({
  args: {
    nmi_transaction_id: v.string(),
    amount: v.number(),
    status: v.string(),
    customer_id: v.optional(v.string()),
    subscription_id: v.optional(v.string()),
    response_data: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const existingTransaction = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("nmi_transaction_id"), args.nmi_transaction_id))
      .first();
    
    if (existingTransaction) {
      return await ctx.db.patch(existingTransaction._id, {
        status: args.status === "1" ? "completed" : "failed",
        metadata: args.response_data,
        processed_at: now,
        updated_at: now,
      });
    } else {
      return await ctx.db.insert("transactions", {
        transaction_id: `NMI_${args.nmi_transaction_id}`,
        nmi_transaction_id: args.nmi_transaction_id,
        amount: args.amount,
        currency: "USD",
        type: "charge",
        status: args.status === "1" ? "completed" : "failed",
        payment_method: "credit_card",
        description: "NMI Payment Gateway Transaction",
        metadata: args.response_data,
        processed_at: now,
        created_at: now,
        updated_at: now,
      });
    }
  },
});

export const getTransactionsByStatus = query({
  args: {
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("cancelled"), v.literal("disputed"), v.literal("refunded")),
    client_id: v.optional(v.id("clients")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let transactions = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
    
    if (args.client_id) {
      transactions = transactions.filter(t => t.client_id === args.client_id);
    }
    
    transactions.sort((a, b) => b.created_at - a.created_at);
    
    return transactions.slice(0, args.limit || 50);
  },
});

export const refundTransaction = mutation({
  args: {
    original_transaction_id: v.id("transactions"),
    refund_amount: v.optional(v.number()),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const originalTransaction = await ctx.db.get(args.original_transaction_id);
    if (!originalTransaction) throw new Error("Original transaction not found");
    
    if (originalTransaction.status !== "completed") {
      throw new Error("Can only refund completed transactions");
    }
    
    const refundAmount = args.refund_amount || originalTransaction.amount;
    if (refundAmount > originalTransaction.amount) {
      throw new Error("Refund amount cannot exceed original transaction amount");
    }
    
    const now = Date.now();
    const refundTransactionId = `ref_${now}_${Math.random().toString(36).substr(2, 9)}`;
    
    return await ctx.db.insert("transactions", {
      transaction_id: refundTransactionId,
      subscription_id: originalTransaction.subscription_id,
      member_id: originalTransaction.member_id,
      amount: -refundAmount,
      currency: originalTransaction.currency,
      type: "refund",
      status: "completed",
      payment_method: originalTransaction.payment_method,
      description: args.reason || "Refund",
      metadata: { original_transaction_id: args.original_transaction_id },
      processed_at: now,
      created_at: now,
      updated_at: now,
    });
  },
});

export const getFailedTransactions = query({
  args: {
    client_id: v.optional(v.id("clients")),
    days_back: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysBack = args.days_back || 7;
    const cutoff = Date.now() - (daysBack * 24 * 60 * 60 * 1000);
    
    let transactions = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "failed"))
      .collect();
    
    transactions = transactions.filter(t => t.created_at > cutoff);
    
    if (args.client_id) {
      transactions = transactions.filter(t => t.client_id === args.client_id);
    }
    
    return {
      failed_transactions: transactions.sort((a, b) => b.created_at - a.created_at),
      total_failed: transactions.length,
      total_failed_amount: transactions.reduce((sum, t) => sum + t.amount, 0),
    };
  },
});

export const getRevenueAnalytics = query({
  args: {
    client_id: v.optional(v.id("clients")),
    period: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"), v.literal("year"))),
    periods_back: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const period = args.period || "month";
    const periodsBack = args.periods_back || 12;
    
    let transactions = await ctx.db
      .query("transactions")
      .withIndex("by_status", (q) => q.eq("status", "completed"))
      .collect();
    
    if (args.client_id) {
      transactions = transactions.filter(t => t.client_id === args.client_id);
    }
    
    const now = Date.now();
    let periodMs: number;
    
    switch (period) {
      case "day": periodMs = 24 * 60 * 60 * 1000; break;
      case "week": periodMs = 7 * 24 * 60 * 60 * 1000; break;
      case "month": periodMs = 30 * 24 * 60 * 60 * 1000; break;
      case "year": periodMs = 365 * 24 * 60 * 60 * 1000; break;
      default: periodMs = 30 * 24 * 60 * 60 * 1000;
    }
    
    const cutoff = now - (periodsBack * periodMs);
    const recentTransactions = transactions.filter(t => t.created_at > cutoff);
    
    const periodData: Array<{
      period_start: number;
      period_end: number;
      revenue: number;
      transaction_count: number;
      avg_transaction_value: number;
    }> = [];
    
    for (let i = 0; i < periodsBack; i++) {
      const periodStart = now - ((i + 1) * periodMs);
      const periodEnd = now - (i * periodMs);
      
      const periodTransactions = recentTransactions.filter(t => 
        t.created_at >= periodStart && t.created_at < periodEnd
      );
      
      const revenue = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      periodData.unshift({
        period_start: periodStart,
        period_end: periodEnd,
        revenue,
        transaction_count: periodTransactions.length,
        avg_transaction_value: periodTransactions.length > 0 ? revenue / periodTransactions.length : 0,
      });
    }
    
    return {
      period_data: periodData,
      total_revenue: recentTransactions.reduce((sum, t) => sum + t.amount, 0),
      total_transactions: recentTransactions.length,
    };
  },
});

export const bulkUpdateTransactions = mutation({
  args: {
    transaction_ids: v.array(v.id("transactions")),
    updates: v.object({
      status: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("cancelled"), v.literal("disputed"), v.literal("refunded"))),
    }),
  },
  handler: async (ctx, args) => {
    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    
    for (const transactionId of args.transaction_ids) {
      try {
        await ctx.db.patch(transactionId, {
          ...args.updates,
          updated_at: Date.now(),
        });
        results.push({ id: transactionId, success: true });
      } catch (error: any) {
        results.push({ id: transactionId, success: false, error: error.message });
      }
    }
    
    return results;
  },
});

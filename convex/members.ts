import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getMembers = query({
  args: {
    page: v.optional(v.number()),
    per_page: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    tier: v.optional(v.string()),
    client_id: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    let members = await ctx.db.query("members").collect();
    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      members = members.filter(member => 
        member.first_name?.toLowerCase().includes(searchLower) ||
        member.last_name?.toLowerCase().includes(searchLower) ||
        member.email?.toLowerCase().includes(searchLower) ||
        member.member_id?.toLowerCase().includes(searchLower)
      );
    }
    
    if (args.status) {
      members = members.filter(member => member.status === args.status);
    }
    
    if (args.tier) {
      members = members.filter(member => member.tier === args.tier);
    }
    
    if (args.client_id) {
      members = members.filter(member => member.client_id === args.client_id);
    }
    
    const page = args.page || 1;
    const perPage = args.per_page || 50;
    const startIndex = (page - 1) * perPage;
    const paginatedMembers = members.slice(startIndex, startIndex + perPage);
    
    return {
      data: paginatedMembers,
      total: members.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(members.length / perPage),
    };
  },
});

export const getMemberById = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getMemberByMemberId = query({
  args: { member_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_member_id", (q) => q.eq("member_id", args.member_id))
      .first();
  },
});

export const getMemberByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("members")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const createMember = mutation({
  args: {
    user_id: v.optional(v.id("users")),
    client_id: v.optional(v.id("clients")),
    member_id: v.string(),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    tier: v.union(v.literal("basic"), v.literal("premium"), v.literal("elite"), v.literal("executive")),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"), v.literal("suspended"))),
    engagement_score: v.optional(v.number()),
    total_spend: v.optional(v.number()),
    location: v.optional(v.string()),
    permissions: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("members", {
      ...args,
      status: args.status || "active",
      engagement_score: args.engagement_score || 0,
      total_spend: args.total_spend || 0,
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateMember = mutation({
  args: {
    id: v.id("members"),
    user_id: v.optional(v.id("users")),
    client_id: v.optional(v.id("clients")),
    member_id: v.optional(v.string()),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    tier: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("elite"), v.literal("executive"))),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"), v.literal("suspended"))),
    engagement_score: v.optional(v.number()),
    total_spend: v.optional(v.number()),
    last_active: v.optional(v.number()),
    location: v.optional(v.string()),
    permissions: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: Date.now(),
    });
  },
});

export const deleteMember = mutation({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getMemberStats = query({
  args: { client_id: v.optional(v.id("clients")) },
  handler: async (ctx, args) => {
    let members = await ctx.db.query("members").collect();
    
    if (args.client_id) {
      members = members.filter(m => m.client_id === args.client_id);
    }
    
    const stats = {
      total: members.length,
      active: members.filter(m => m.status === "active").length,
      inactive: members.filter(m => m.status === "inactive").length,
      pending: members.filter(m => m.status === "pending").length,
      suspended: members.filter(m => m.status === "suspended").length,
      basic: members.filter(m => m.tier === "basic").length,
      premium: members.filter(m => m.tier === "premium").length,
      elite: members.filter(m => m.tier === "elite").length,
      executive: members.filter(m => m.tier === "executive").length,
      total_spend: members.reduce((sum, m) => sum + (m.total_spend || 0), 0),
      avg_engagement: members.length > 0 
        ? members.reduce((sum, m) => sum + (m.engagement_score || 0), 0) / members.length 
        : 0,
    };
    
    return stats;
  },
});

export const updateMemberEngagement = mutation({
  args: {
    id: v.id("members"),
    engagement_score: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      engagement_score: args.engagement_score,
      last_active: Date.now(),
      updated_at: Date.now(),
    });
  },
});

export const updateMemberSpend = mutation({
  args: {
    id: v.id("members"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.id);
    if (!member) throw new Error("Member not found");
    
    return await ctx.db.patch(args.id, {
      total_spend: (member.total_spend || 0) + args.amount,
      updated_at: Date.now(),
    });
  },
});

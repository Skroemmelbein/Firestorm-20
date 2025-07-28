import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBenefits = query({
  args: {
    page: v.optional(v.number()),
    per_page: v.optional(v.number()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    client_id: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    let benefits = await ctx.db.query("benefits").collect();
    
    if (args.type) {
      benefits = benefits.filter(benefit => benefit.type === args.type);
    }
    
    if (args.status) {
      benefits = benefits.filter(benefit => benefit.status === args.status);
    }
    
    if (args.client_id) {
      benefits = benefits.filter(benefit => benefit.client_id === args.client_id);
    }
    
    const page = args.page || 1;
    const perPage = args.per_page || 50;
    const startIndex = (page - 1) * perPage;
    const paginatedBenefits = benefits.slice(startIndex, startIndex + perPage);
    
    return {
      data: paginatedBenefits,
      total: benefits.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(benefits.length / perPage),
    };
  },
});

export const getBenefitById = query({
  args: { id: v.id("benefits") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createBenefit = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("discount"), v.literal("reward"), v.literal("access"), v.literal("service")),
    value: v.optional(v.string()),
    tier_requirement: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("elite"), v.literal("executive"))),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    client_id: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("benefits", {
      ...args,
      status: args.status || "active",
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateBenefit = mutation({
  args: {
    id: v.id("benefits"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("discount"), v.literal("reward"), v.literal("access"), v.literal("service"))),
    value: v.optional(v.string()),
    tier_requirement: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("elite"), v.literal("executive"))),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: Date.now(),
    });
  },
});

export const deleteBenefit = mutation({
  args: { id: v.id("benefits") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getMemberBenefits = query({
  args: {
    member_id: v.id("members"),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let memberBenefits = await ctx.db
      .query("member_benefits")
      .withIndex("by_member", (q) => q.eq("member_id", args.member_id))
      .collect();
    
    if (args.status) {
      memberBenefits = memberBenefits.filter(mb => mb.status === args.status);
    }
    
    const benefitsWithDetails = await Promise.all(
      memberBenefits.map(async (mb) => {
        const benefit = await ctx.db.get(mb.benefit_id);
        return {
          ...mb,
          benefit_details: benefit,
        };
      })
    );
    
    return benefitsWithDetails;
  },
});

export const grantBenefitToMember = mutation({
  args: {
    member_id: v.id("members"),
    benefit_id: v.id("benefits"),
    expires_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("member_benefits", {
      member_id: args.member_id,
      benefit_id: args.benefit_id,
      status: "active",
      granted_at: now,
      expires_at: args.expires_at,
    });
  },
});

export const useMemberBenefit = mutation({
  args: {
    id: v.id("member_benefits"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.patch(args.id, {
      status: "used",
      used_at: now,
    });
  },
});

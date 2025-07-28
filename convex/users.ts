import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUsers = query({
  args: {
    page: v.optional(v.number()),
    per_page: v.optional(v.number()),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").collect();
    
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      users = users.filter(user => 
        user.first_name?.toLowerCase().includes(searchLower) ||
        user.last_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    
    if (args.status) {
      users = users.filter(user => user.status === args.status);
    }
    
    if (args.role) {
      users = users.filter(user => user.role === args.role);
    }
    
    const page = args.page || 1;
    const perPage = args.per_page || 50;
    const startIndex = (page - 1) * perPage;
    const paginatedUsers = users.slice(startIndex, startIndex + perPage);
    
    return {
      data: paginatedUsers,
      total: users.length,
      page,
      per_page: perPage,
      total_pages: Math.ceil(users.length / perPage),
    };
  },
});

export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    password_hash: v.optional(v.string()),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("user")),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
    phone: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("users", {
      ...args,
      status: args.status || "active",
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    email: v.optional(v.string()),
    password_hash: v.optional(v.string()),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("manager"), v.literal("user"))),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
    phone: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    last_login: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: Date.now(),
    });
  },
});

export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    const stats = {
      total: users.length,
      active: users.filter(u => u.status === "active").length,
      inactive: users.filter(u => u.status === "inactive").length,
      suspended: users.filter(u => u.status === "suspended").length,
      admins: users.filter(u => u.role === "admin").length,
      managers: users.filter(u => u.role === "manager").length,
      regular_users: users.filter(u => u.role === "user").length,
    };
    
    return stats;
  },
});

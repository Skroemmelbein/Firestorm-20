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

export const getUsersByRole = query({
  args: { 
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("user")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let users = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", args.status || "active"))
      .collect();
    
    users = users.filter(user => user.role === args.role);
    return users.sort((a, b) => b.created_at - a.created_at);
  },
});

export const searchUsers = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    const searchLower = args.query.toLowerCase();
    
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchLower) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchLower)) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchLower))
    );
    
    return filtered.slice(0, args.limit || 20);
  },
});

export const updateLastLogin = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      last_login: Date.now(),
      updated_at: Date.now(),
    });
  },
});

export const bulkUpdateUsers = mutation({
  args: {
    user_ids: v.array(v.id("users")),
    updates: v.object({
      status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("suspended"))),
      role: v.optional(v.union(v.literal("admin"), v.literal("manager"), v.literal("user"))),
    }),
  },
  handler: async (ctx, args) => {
    const results = [];
    
    for (const userId of args.user_ids) {
      try {
        await ctx.db.patch(userId, {
          ...args.updates,
          updated_at: Date.now(),
        });
        results.push({ id: userId, success: true });
      } catch (error) {
        results.push({ id: userId, success: false, error: error.message });
      }
    }
    
    return results;
  },
});

export const getUserActivity = query({
  args: {
    id: v.id("users"),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;
    
    const days = args.days || 30;
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    return {
      user_id: args.id,
      last_login: user.last_login,
      days_since_last_login: user.last_login 
        ? Math.floor((Date.now() - user.last_login) / (24 * 60 * 60 * 1000))
        : null,
      is_active_user: user.last_login && user.last_login > cutoff,
    };
  },
});

export const getUserStats = query({
  args: {
    date_from: v.optional(v.number()),
    date_to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    
    let filteredUsers = users;
    if (args.date_from || args.date_to) {
      filteredUsers = users.filter(user => {
        if (args.date_from && user.created_at < args.date_from) return false;
        if (args.date_to && user.created_at > args.date_to) return false;
        return true;
      });
    }
    
    const stats = {
      total: filteredUsers.length,
      active: filteredUsers.filter(u => u.status === "active").length,
      inactive: filteredUsers.filter(u => u.status === "inactive").length,
      suspended: filteredUsers.filter(u => u.status === "suspended").length,
      admins: filteredUsers.filter(u => u.role === "admin").length,
      managers: filteredUsers.filter(u => u.role === "manager").length,
      regular_users: filteredUsers.filter(u => u.role === "user").length,
      recent_logins: filteredUsers.filter(u => u.last_login && u.last_login > Date.now() - 7 * 24 * 60 * 60 * 1000).length,
    };
    
    return stats;
  },
});

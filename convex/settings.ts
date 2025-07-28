import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: {
    key: v.optional(v.string()),
    type: v.optional(v.string()),
    client_id: v.optional(v.id("clients")),
    user_id: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let settings = await ctx.db.query("settings").collect();
    
    if (args.key) {
      settings = settings.filter(s => s.key === args.key);
    }
    
    if (args.type) {
      settings = settings.filter(s => s.type === args.type);
    }
    
    if (args.client_id) {
      settings = settings.filter(s => s.client_id === args.client_id);
    }
    
    if (args.user_id) {
      settings = settings.filter(s => s.user_id === args.user_id);
    }
    
    return settings;
  },
});

export const getSettingByKey = query({
  args: { 
    key: v.string(),
    client_id: v.optional(v.id("clients")),
    user_id: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .filter((q) => {
        let filter = q.eq(q.field("key"), args.key);
        if (args.client_id) {
          filter = q.and(filter, q.eq(q.field("client_id"), args.client_id));
        }
        if (args.user_id) {
          filter = q.and(filter, q.eq(q.field("user_id"), args.user_id));
        }
        return filter;
      })
      .first();
  },
});

export const setSetting = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    type: v.union(v.literal("system"), v.literal("client"), v.literal("user")),
    client_id: v.optional(v.id("clients")),
    user_id: v.optional(v.id("users")),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const existingSetting = await ctx.db
      .query("settings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .filter((q) => {
        let filter = q.eq(q.field("key"), args.key);
        if (args.client_id) {
          filter = q.and(filter, q.eq(q.field("client_id"), args.client_id));
        }
        if (args.user_id) {
          filter = q.and(filter, q.eq(q.field("user_id"), args.user_id));
        }
        return filter;
      })
      .first();
    
    if (existingSetting) {
      return await ctx.db.patch(existingSetting._id, {
        value: args.value,
        description: args.description,
        updated_at: now,
      });
    } else {
      return await ctx.db.insert("settings", {
        key: args.key,
        value: args.value,
        type: args.type,
        client_id: args.client_id,
        user_id: args.user_id,
        description: args.description,
        created_at: now,
        updated_at: now,
      });
    }
  },
});

export const deleteSetting = mutation({
  args: { id: v.id("settings") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getSystemSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_type", (q) => q.eq("type", "system"))
      .collect();
    
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
    
    return settingsObj;
  },
});

export const getClientSettings = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_client", (q) => q.eq("client_id", args.client_id))
      .collect();
    
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
    
    return settingsObj;
  },
});

export const getUserSettings = query({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
      .collect();
    
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
    
    return settingsObj;
  },
});

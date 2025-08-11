import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getConversations = query({
  args: {
    client_id: v.optional(v.id("clients")),
    member_id: v.optional(v.id("members")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let conversations = await ctx.db.query("conversations").collect();
    
    if (args.client_id) {
      conversations = conversations.filter(c => c.client_id === args.client_id);
    }
    
    if (args.member_id) {
      conversations = conversations.filter(c => c.member_id === args.member_id);
    }
    
    if (args.status) {
      conversations = conversations.filter(c => c.status === args.status);
    }
    
    conversations.sort((a, b) => b.created_at - a.created_at);
    
    return conversations;
  },
});

export const getConversationBySid = query({
  args: { conversation_sid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_conversation_sid", (q) => q.eq("conversation_sid", args.conversation_sid))
      .first();
  },
});

export const createConversation = mutation({
  args: {
    conversation_sid: v.string(),
    friendly_name: v.optional(v.string()),
    client_id: v.optional(v.id("clients")),
    member_id: v.optional(v.id("members")),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("closed"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("conversations", {
      ...args,
      status: args.status || "active",
      participant_count: 0,
      message_count: 0,
      created_at: now,
      updated_at: now,
    });
  },
});

export const updateConversation = mutation({
  args: {
    id: v.id("conversations"),
    friendly_name: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"), v.literal("closed"))),
    participant_count: v.optional(v.number()),
    message_count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args;
    
    return await ctx.db.patch(id, {
      ...updateData,
      updated_at: Date.now(),
    });
  },
});

export const updateConversationMessageCount = mutation({
  args: {
    conversation_sid: v.string(),
    increment: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_conversation_sid", (q) => q.eq("conversation_sid", args.conversation_sid))
      .first();
    
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    
    const increment = args.increment || 1;
    
    return await ctx.db.patch(conversation._id, {
      message_count: (conversation.message_count || 0) + increment,
      updated_at: Date.now(),
    });
  },
});

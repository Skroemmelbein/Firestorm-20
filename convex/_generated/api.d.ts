/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as benefits from "../benefits.js";
import type * as campaign_executions from "../campaign_executions.js";
import type * as campaigns from "../campaigns.js";
import type * as clients from "../clients.js";
import type * as communications from "../communications.js";
import type * as conversations from "../conversations.js";
import type * as members from "../members.js";
import type * as scheduled_jobs from "../scheduled_jobs.js";
import type * as settings from "../settings.js";
import type * as subscriptions from "../subscriptions.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  benefits: typeof benefits;
  campaign_executions: typeof campaign_executions;
  campaigns: typeof campaigns;
  clients: typeof clients;
  communications: typeof communications;
  conversations: typeof conversations;
  members: typeof members;
  scheduled_jobs: typeof scheduled_jobs;
  settings: typeof settings;
  subscriptions: typeof subscriptions;
  transactions: typeof transactions;
  users: typeof users;
  webhooks: typeof webhooks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

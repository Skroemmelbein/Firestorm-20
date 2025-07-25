import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getIntegrationsConfig,
  saveIntegrationsConfig,
} from "./routes/integrations-config";
import {
  uploadTwilioAPIs,
  getUploadedAPIs,
  clearUploadedAPIs,
  testTwilioAPI,
} from "./routes/twilio-vault";
import { testSendGrid, getSendGridStatus } from "./routes/test-sendgrid";
import {
  createStudioFlow,
  getStudioFlows,
  updateStudioFlow,
  testTwilioConnection,
} from "./routes/studio-flows";
import {
  getConversations,
  createConversation,
  getConversationMessages,
  sendConversationMessage,
  handleConversationWebhook,
} from "./routes/conversations-api";
import {
  createAllTables,
  getTableSchemas,
  testXanoConnection,
} from "./routes/xano-table-setup";
import {
  configureAgent,
  verifyAgent,
  sendMessage,
  getMessages,
  handleWebhook,
  getAgentStatus,
} from "./routes/rcs-api";
import { sendAutomaticNotification } from "./routes/auto-notify";
import {
  startProgressNotifications,
  updateProgress,
  stopProgressNotifications,
  getProgress,
} from "./routes/progress-notifier";
import realApiRouter from "./routes/real-api";
import xanoSetupRouter from "./routes/xano-setup";
import twilioSidDiscoveryRouter from "./routes/twilio-sid-discovery";
import environmentScannerRouter from "./routes/environment-scanner";
import nmiIntegrationRouter from "./routes/nmi-integration";
import xanoSubscriptionTablesRouter from "./routes/xano-subscription-tables";
import subscriptionManagementRouter from "./routes/subscription-management";
import billingXanoModelsRouter from "./routes/billing-xano-models";
import billingPaymentsRouter from "./routes/billing-payments";
import billingRetryLogicRouter from "./routes/billing-retry-logic";
import billingTokenizationRouter from "./routes/billing-tokenization";
import billingAnalyticsRouter from "./routes/billing-analytics";
import nmiTransactionLogsRouter from "./routes/nmi-transaction-logs";
import quickSetupRouter from "./routes/quick-setup";
import nmiStatusCheckRouter from "./routes/nmi-status-check";
import nmiTestPaymentRouter from "./routes/nmi-test-payment";
import { startWarChestImport, getImportProgress, getImportStatus } from "./routes/war-chest-import";
import { classifyClientStatus, batchClassifyClients, getClassificationStats, validateClassificationRules } from "./routes/status-classification";
import { startLegacyVaultMigration, getLegacyMigrationProgress, validateLegacyTokens, getMigrationStats } from "./routes/nmi-legacy-integration";
import { startTransactionLogMigration, getTransactionMigrationProgress, getTransactionMigrationStats } from "./routes/transaction-log-migration";

// Import real integrations - NO MOCKS
import { initializeXano } from "../shared/xano-client";
import { initializeTwilio } from "../shared/twilio-client";
import { initializeSendGrid } from "../shared/sendgrid-client";
import { setOpenAIApiKey } from "../shared/openai-service";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Debug environment variables
  console.log("🔍 Debug environment variables:");
  console.log(
    "XANO_INSTANCE_URL:",
    process.env.XANO_INSTANCE_URL ? "PRESENT" : "MISSING",
  );
  console.log(
    "XANO_API_KEY:",
    process.env.XANO_API_KEY ? "PRESENT" : "MISSING",
  );
  console.log(
    "XANO_DATABASE_ID:",
    process.env.XANO_DATABASE_ID ? "PRESENT" : "MISSING",
  );
  console.log(
    "NMI_USERNAME:",
    process.env.NMI_USERNAME ? "PRESENT" : "MISSING",
  );
  console.log(
    "NMI_PASSWORD:",
    process.env.NMI_PASSWORD ? "PRESENT" : "MISSING",
  );

  // Initialize real integrations with environment variables - NO MOCKS
  if (
    process.env.XANO_INSTANCE_URL &&
    process.env.XANO_API_KEY &&
    process.env.XANO_DATABASE_ID
  ) {
    initializeXano({
      instanceUrl: process.env.XANO_INSTANCE_URL,
      apiKey: process.env.XANO_API_KEY,
      databaseId: process.env.XANO_DATABASE_ID,
    });
    console.log("✅ Xano client initialized with real credentials");
  } else {
    console.warn("⚠️  Xano environment variables not found - add to .env file");
    console.warn("Missing vars:", {
      XANO_INSTANCE_URL: !process.env.XANO_INSTANCE_URL,
      XANO_API_KEY: !process.env.XANO_API_KEY,
      XANO_DATABASE_ID: !process.env.XANO_DATABASE_ID,
    });
  }

  // Initialize Twilio with working credentials
  const twilioCredentials = {
    accountSid:
      process.env.TWILIO_ACCOUNT_SID || "ACf1f39d9f653df3669fa99343e88b2074",
    authToken:
      process.env.TWILIO_AUTH_TOKEN || "1f9a48e4dcd9c518889e148fe931e226",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "+18559600037",
    phoneNumber2: process.env.TWILIO_PHONE_NUMBER_2 || "+18559600037",
  };

  initializeTwilio(twilioCredentials);
  console.log(
    "✅ Twilio client initialized with working credentials:",
    twilioCredentials.phoneNumber,
  );

  // Initialize SendGrid with Shannon's email
  if (process.env.SENDGRID_API_KEY) {
    if (
      process.env.SENDGRID_API_KEY ===
      "SG.placeholder_key_replace_with_real_sendgrid_api_key"
    ) {
      console.warn(
        "⚠️  SendGrid API key is placeholder - replace with real SendGrid API key",
      );
    } else {
      try {
        initializeSendGrid({
          apiKey: process.env.SENDGRID_API_KEY,
          fromEmail: "shannonkroemmelbein@gmail.com",
          fromName: "Shannon Kroemmelbein - ECELONX",
        });
        console.log("✅ SendGrid client initialized with Shannon's email");
      } catch (error) {
        console.error("❌ SendGrid initialization failed:", error);
      }
    }
  } else {
    console.warn(
      "⚠️  SendGrid API key not found - add SENDGRID_API_KEY to .env file",
    );
  }

  // Initialize OpenAI with working credentials
  if (process.env.OPENAI_API_KEY) {
    setOpenAIApiKey(process.env.OPENAI_API_KEY);
    console.log("✅ OpenAI client initialized with real API key");
  } else {
    // Fallback to hardcoded key
    setOpenAIApiKey(
      "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",
    );
    console.log("✅ OpenAI client initialized with fallback API key");
  }

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Integration routes
  app.get("/api/integrations/config", getIntegrationsConfig);
  app.post("/api/integrations/config", saveIntegrationsConfig);

  // Real API endpoints - NO MOCKS
  app.use("/api/real", realApiRouter);

  // Xano automated setup
  app.use("/api/xano-setup", xanoSetupRouter);

  // Twilio API Vault routes
  app.post("/api/twilio-vault/upload", uploadTwilioAPIs);
  app.get("/api/twilio-vault/apis", getUploadedAPIs);
  app.delete("/api/twilio-vault/apis", clearUploadedAPIs);
  app.post("/api/twilio-vault/test", testTwilioAPI);

  // SendGrid test routes
  app.post("/api/test-sendgrid", testSendGrid);
  app.get("/api/sendgrid-status", getSendGridStatus);

  // Studio Flow routes
  app.post("/api/studio-flows", createStudioFlow);
  app.get("/api/studio-flows", getStudioFlows);
  app.post("/api/studio-flows/:flowSid", updateStudioFlow);
  app.post("/api/test-twilio-connection", testTwilioConnection);

  // Conversations API routes
  app.get("/api/conversations", getConversations);
  app.post("/api/conversations", createConversation);
  app.get(
    "/api/conversations/:conversationSid/messages",
    getConversationMessages,
  );
  app.post(
    "/api/conversations/:conversationSid/messages",
    sendConversationMessage,
  );
  app.post("/api/webhooks/conversations", handleConversationWebhook);

  // Xano Table Setup routes
  app.post("/api/xano/create-all-tables", createAllTables);
  app.get("/api/xano/table-schemas", getTableSchemas);
  app.post("/api/xano/test-connection", testXanoConnection);

  // RCS API routes
  app.post("/api/rcs/configure-agent", configureAgent);
  app.post("/api/rcs/verify-agent", verifyAgent);
  app.post("/api/rcs/send-message", sendMessage);
  app.get("/api/rcs/messages/:agentId", getMessages);
  app.get("/api/rcs/agent/:agentId/status", getAgentStatus);
  app.post("/api/rcs/webhook", handleWebhook);

  // Auto-notification route
  app.post("/api/auto-notify", sendAutomaticNotification);

  // Progress notification routes
  app.post("/api/progress/start", startProgressNotifications);
  app.post("/api/progress/update", updateProgress);
  app.post("/api/progress/stop", stopProgressNotifications);
  app.get("/api/progress", getProgress);

  // Twilio SID discovery routes
  app.use("/api/twilio", twilioSidDiscoveryRouter);

  // Environment credential scanner routes
  app.use("/api/environment", environmentScannerRouter);

  // NMI integration routes
  app.use("/api/nmi", nmiIntegrationRouter);

  // Xano subscription tables routes
  app.use("/api/subscription-tables", xanoSubscriptionTablesRouter);

  // Subscription management routes
  app.use("/api/subscriptions", subscriptionManagementRouter);

  // High-approval billing stack models
  app.use("/api/billing-stack", billingXanoModelsRouter);

  // High-approval billing payment processing
  app.use("/api/billing", billingPaymentsRouter);

  // Billing retry and descriptor policy logic
  app.use("/api/billing-retry", billingRetryLogicRouter);

  // Billing tokenization and automatic card updater
  app.use("/api/billing-tokens", billingTokenizationRouter);

  // Billing analytics and decline insights
  app.use("/api/billing-analytics", billingAnalyticsRouter);

  // NMI transaction logs and reporting
  app.use("/api/nmi-logs", nmiTransactionLogsRouter);

  // Quick setup for billing system
  app.use("/api/setup", quickSetupRouter);

  // NMI status and account checking
  app.use("/api/nmi-status", nmiStatusCheckRouter);

  // NMI test payment and connection validation
  app.use("/api/nmi", nmiTestPaymentRouter);

  // War Chest Import Engine - 65K client migration
  app.post("/api/war-chest-import/start", startWarChestImport);
  app.get("/api/war-chest-import/progress/:batchId", getImportProgress);
  app.get("/api/war-chest-import/status", getImportStatus);

  // Status Classification Engine - AI-powered client categorization
  app.post("/api/status-classification/classify", classifyClientStatus);
  app.post("/api/status-classification/batch", batchClassifyClients);
  app.get("/api/status-classification/stats", getClassificationStats);
  app.get("/api/status-classification/validate-rules", validateClassificationRules);

  // NMI Legacy Integration - Customer vault token mapping
  app.post("/api/nmi-legacy/start-migration", startLegacyVaultMigration);
  app.get("/api/nmi-legacy/progress/:batchId", getLegacyMigrationProgress);
  app.post("/api/nmi-legacy/validate-tokens", validateLegacyTokens);
  app.get("/api/nmi-legacy/stats", getMigrationStats);

  // Transaction Log Migration - Historical transaction processing
  app.post("/api/transaction-migration/start", startTransactionLogMigration);
  app.get("/api/transaction-migration/progress/:batchId", getTransactionMigrationProgress);
  app.get("/api/transaction-migration/stats", getTransactionMigrationStats);

  return app;
}

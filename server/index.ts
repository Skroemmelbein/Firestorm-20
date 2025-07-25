import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import existing route modules
import apiIntegrationsRouter from "./routes/api-integrations";
import autoNotifyRouter from "./routes/auto-notify";
import billingAnalyticsRouter from "./routes/billing-analytics";
import billingPaymentsRouter from "./routes/billing-payments";
import billingRetryLogicRouter from "./routes/billing-retry-logic";
import billingTokenizationRouter from "./routes/billing-tokenization";
import billingXanoModelsRouter from "./routes/billing-xano-models";
import conversationsApiRouter from "./routes/conversations-api";
import subscriptionManagementRouter from "./routes/subscription-management";

// NMI Upgrade Project Routes
import warChestImportRouter from "./routes/war-chest-import";
import statusClassificationRouter from "./routes/status-classification";
import nmiLegacyIntegrationRouter from "./routes/nmi-legacy-integration";
import transactionLogMigrationRouter from "./routes/transaction-log-migration";
import vaultExportProcessingRouter from "./routes/vault-export-processing";
import updatedCardsHandlerRouter from "./routes/updated-cards-handler";
import customerMasterImportRouter from "./routes/customer-master-import";
import customerMasterXanoTablesRouter from "./routes/customer-master-xano-tables";
import consentTosImportRouter from "./routes/consent-tos-import";
import consentTosXanoTablesRouter from "./routes/consent-tos-xano-tables";
import descriptorHistoryImportRouter from "./routes/descriptor-history-import";

// Other existing routes
import demoRouter from "./routes/demo";
import environmentScannerRouter from "./routes/environment-scanner";
import integrationsConfigRouter from "./routes/integrations-config";
import nmiIntegrationRouter from "./routes/nmi-integration";
import nmiStatusCheckRouter from "./routes/nmi-status-check";
import nmiTestPaymentRouter from "./routes/nmi-test-payment";
import nmiTransactionLogsRouter from "./routes/nmi-transaction-logs";
import progressNotifierRouter from "./routes/progress-notifier";
import quickSetupRouter from "./routes/quick-setup";
import rcsApiRouter from "./routes/rcs-api";
import realApiRouter from "./routes/real-api";
import smsApiRouter from "./routes/sms-api";
import studioFlowsRouter from "./routes/studio-flows";
import testSendgridRouter from "./routes/test-sendgrid";
import testSmsRouter from "./routes/test-sms";
import testTwilioRouter from "./routes/test-twilio";
import testXanoRouter from "./routes/test-xano";
import twilioSidDiscoveryRouter from "./routes/twilio-sid-discovery";
import twilioVaultRouter from "./routes/twilio-vault";
import xanoSetupRouter from "./routes/xano-setup";
import xanoSubscriptionTablesRouter from "./routes/xano-subscription-tables";
import xanoTableSetupRouter from "./routes/xano-table-setup";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "RecurFlow Enterprise API Server",
    status: "running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Mount route handlers
app.use("/api/integrations", apiIntegrationsRouter);
app.use("/api/auto-notify", autoNotifyRouter);
app.use("/api/billing-analytics", billingAnalyticsRouter);
app.use("/api/billing-payments", billingPaymentsRouter);
app.use("/api/billing-retry-logic", billingRetryLogicRouter);
app.use("/api/billing-tokenization", billingTokenizationRouter);
app.use("/api/billing-xano-models", billingXanoModelsRouter);
app.use("/api/conversations", conversationsApiRouter);
app.use("/api/subscription-management", subscriptionManagementRouter);

// NMI Upgrade Project API Routes
app.use("/api/war-chest-import", warChestImportRouter);
app.use("/api/status-classification", statusClassificationRouter);
app.use("/api/nmi-legacy-integration", nmiLegacyIntegrationRouter);
app.use("/api/transaction-log-migration", transactionLogMigrationRouter);
app.use("/api/vault-export-processing", vaultExportProcessingRouter);
app.use("/api/updated-cards-handler", updatedCardsHandlerRouter);
app.use("/api/customer-master-import", customerMasterImportRouter);
app.use("/api/customer-master-xano-tables", customerMasterXanoTablesRouter);
app.use("/api/consent-tos-import", consentTosImportRouter);
app.use("/api/consent-tos-xano-tables", consentTosXanoTablesRouter);
app.use("/api/descriptor-history-import", descriptorHistoryImportRouter);

// Other API Routes
app.use("/api/demo", demoRouter);
app.use("/api/environment-scanner", environmentScannerRouter);
app.use("/api/integrations-config", integrationsConfigRouter);
app.use("/api/nmi-integration", nmiIntegrationRouter);
app.use("/api/nmi-status-check", nmiStatusCheckRouter);
app.use("/api/nmi-test-payment", nmiTestPaymentRouter);
app.use("/api/nmi-transaction-logs", nmiTransactionLogsRouter);
app.use("/api/progress-notifier", progressNotifierRouter);
app.use("/api/quick-setup", quickSetupRouter);
app.use("/api/rcs-api", rcsApiRouter);
app.use("/api/real-api", realApiRouter);
app.use("/api/sms-api", smsApiRouter);
app.use("/api/studio-flows", studioFlowsRouter);
app.use("/api/test-sendgrid", testSendgridRouter);
app.use("/api/test-sms", testSmsRouter);
app.use("/api/test-twilio", testTwilioRouter);
app.use("/api/test-xano", testXanoRouter);
app.use("/api/twilio-sid-discovery", twilioSidDiscoveryRouter);
app.use("/api/twilio-vault", twilioVaultRouter);
app.use("/api/xano-setup", xanoSetupRouter);
app.use("/api/xano-subscription-tables", xanoSubscriptionTablesRouter);
app.use("/api/xano-table-setup", xanoTableSetupRouter);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 RecurFlow Enterprise API Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🏗️  NMI Upgrade Project APIs mounted and ready`);
});

export default app;

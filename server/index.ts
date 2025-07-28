import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import all route modules
import apiIntegrationsRouter from "./routes/api-integrations";
import autoNotifyRouter from "./routes/auto-notify";
import billingAnalyticsRouter from "./routes/billing-analytics";
import billingPaymentsRouter from "./routes/billing-payments";
import billingRetryLogicRouter from "./routes/billing-retry-logic";
import billingTokenizationRouter from "./routes/billing-tokenization";
import billingXanoModelsRouter from "./routes/billing-xano-models";
import conversationsApiRouter from "./routes/conversations-api";
import customersRouter from "./routes/customers";
import dataValidationRouter from "./routes/data-validation";
import debugApiRouter from "./routes/debug-api";
import fraudDetectionRouter from "./routes/fraud-detection";
import kycManagementRouter from "./routes/kyc-management";
import leadScoringRouter from "./routes/lead-scoring";
import memberBenefitsRouter from "./routes/member-benefits";
import nmiAdvancedRouter from "./routes/nmi-advanced";
import nmiGatewayRouter from "./routes/nmi-gateway";
import nmiRecurringRouter from "./routes/nmi-recurring";
import nmiWebhooksRouter from "./routes/nmi-webhooks";
import notificationWorkflowsRouter from "./routes/notification-workflows";
import paymentOptimizationRouter from "./routes/payment-optimization";
import quickBooksRouter from "./routes/quickbooks";
import recurlyIntegrationRouter from "./routes/recurly-integration";
import sendgridIntegrationRouter from "./routes/sendgrid-integration";
import smsManagementRouter from "./routes/sms-management";
import stripeIntegrationRouter from "./routes/stripe-integration";
import subscriptionManagementRouter from "./routes/subscription-management";
import supportTicketsRouter from "./routes/support-tickets";
import systemHealthRouter from "./routes/system-health";
import telephonyRouter from "./routes/telephony";
import twilioIntegrationRouter from "./routes/twilio-integration";
import userManagementRouter from "./routes/user-management";
import voiceManagementRouter from "./routes/voice-management";
import webhookProcessingRouter from "./routes/webhook-processing";
import xanoBuilderRouter from "./routes/xano-builder";

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
app.use("/api/customers", customersRouter);
app.use("/api/data-validation", dataValidationRouter);
app.use("/api/debug", debugApiRouter);
app.use("/api/fraud-detection", fraudDetectionRouter);
app.use("/api/kyc-management", kycManagementRouter);
app.use("/api/lead-scoring", leadScoringRouter);
app.use("/api/member-benefits", memberBenefitsRouter);
app.use("/api/nmi-advanced", nmiAdvancedRouter);
app.use("/api/nmi-gateway", nmiGatewayRouter);
app.use("/api/nmi-recurring", nmiRecurringRouter);
app.use("/api/nmi-webhooks", nmiWebhooksRouter);
app.use("/api/notification-workflows", notificationWorkflowsRouter);
app.use("/api/payment-optimization", paymentOptimizationRouter);
app.use("/api/quickbooks", quickBooksRouter);
app.use("/api/recurly-integration", recurlyIntegrationRouter);
app.use("/api/sendgrid-integration", sendgridIntegrationRouter);
app.use("/api/sms-management", smsManagementRouter);
app.use("/api/stripe-integration", stripeIntegrationRouter);
app.use("/api/subscription-management", subscriptionManagementRouter);
app.use("/api/support-tickets", supportTicketsRouter);
app.use("/api/system-health", systemHealthRouter);
app.use("/api/telephony", telephonyRouter);
app.use("/api/twilio-integration", twilioIntegrationRouter);
app.use("/api/user-management", userManagementRouter);
app.use("/api/voice-management", voiceManagementRouter);
app.use("/api/webhook-processing", webhookProcessingRouter);
app.use("/api/xano-builder", xanoBuilderRouter);

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

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development" ? err.message : "Server error",
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

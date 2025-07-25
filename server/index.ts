import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import only core working route modules
import billingXanoModelsRouter from "./routes/billing-xano-models";
import subscriptionManagementRouter from "./routes/subscription-management";

// Import NMI upgrade routes that have proper exports
import customerMasterImportRouter from "./routes/customer-master-import";
import customerMasterXanoTablesRouter from "./routes/customer-master-xano-tables";
import consentTosImportRouter from "./routes/consent-tos-import";
import consentTosXanoTablesRouter from "./routes/consent-tos-xano-tables";
import descriptorHistoryImportRouter from "./routes/descriptor-history-import";

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

// Basic test endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount core route handlers
app.use("/api/billing-xano-models", billingXanoModelsRouter);
app.use("/api/subscription-management", subscriptionManagementRouter);

// NMI Upgrade Project API Routes
app.use("/api/customer-master-import", customerMasterImportRouter);
app.use("/api/customer-master-xano-tables", customerMasterXanoTablesRouter);
app.use("/api/consent-tos-import", consentTosImportRouter);
app.use("/api/consent-tos-xano-tables", consentTosXanoTablesRouter);
app.use("/api/descriptor-history-import", descriptorHistoryImportRouter);

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

// Export for Vite
export function createServer() {
  return app;
}

export default app;

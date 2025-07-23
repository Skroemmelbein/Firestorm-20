import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getIntegrationsConfig, saveIntegrationsConfig } from "./routes/integrations-config";
import { uploadTwilioAPIs, getUploadedAPIs, clearUploadedAPIs, testTwilioAPI } from "./routes/twilio-vault";
import realApiRouter from "./routes/real-api";

// Import real integrations - NO MOCKS
import { initializeXano } from "../shared/xano-client";
import { initializeTwilio } from "../shared/twilio-client";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize real integrations with environment variables - NO MOCKS
  if (process.env.XANO_INSTANCE_URL && process.env.XANO_API_KEY && process.env.XANO_DATABASE_ID) {
    initializeXano({
      instanceUrl: process.env.XANO_INSTANCE_URL,
      apiKey: process.env.XANO_API_KEY,
      databaseId: process.env.XANO_DATABASE_ID,
    });
    console.log('✅ Xano client initialized with real credentials');
  } else {
    console.warn('⚠️  Xano environment variables not found - add to .env file');
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    initializeTwilio({
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    });
    console.log('✅ Twilio client initialized with real credentials');
  } else {
    console.warn('⚠️  Twilio environment variables not found - add to .env file');
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

  // Twilio API Vault routes
  app.post("/api/twilio-vault/upload", uploadTwilioAPIs);
  app.get("/api/twilio-vault/apis", getUploadedAPIs);
  app.delete("/api/twilio-vault/apis", clearUploadedAPIs);
  app.post("/api/twilio-vault/test", testTwilioAPI);

  return app;
}

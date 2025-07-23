import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getIntegrationsConfig, saveIntegrationsConfig } from "./routes/integrations-config";
import { uploadTwilioAPIs, getUploadedAPIs, clearUploadedAPIs, testTwilioAPI } from "./routes/twilio-vault";
import realApiRouter from "./routes/real-api";
import xanoSetupRouter from "./routes/xano-setup";

// Import real integrations - NO MOCKS
import { initializeXano } from "../shared/xano-client";
import { initializeTwilio } from "../shared/twilio-client";
import { setOpenAIApiKey } from "../shared/openai-service";

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

  // Initialize Twilio with working credentials
  const twilioCredentials = {
    accountSid: process.env.TWILIO_ACCOUNT_SID || 'AC721cd9c8bf374b3166ce89ab0023d073',
    authToken: process.env.TWILIO_AUTH_TOKEN || '5f2d8be5da1f4b6428348ddb9cdb99bf',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '+18558000037',
  };

  initializeTwilio(twilioCredentials);
  console.log('✅ Twilio client initialized with working credentials:', twilioCredentials.phoneNumber);

  // Initialize OpenAI with working credentials
  if (process.env.OPENAI_API_KEY) {
    setOpenAIApiKey(process.env.OPENAI_API_KEY);
    console.log('✅ OpenAI client initialized with real API key');
  } else {
    // Fallback to hardcoded key
    setOpenAIApiKey('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');
    console.log('✅ OpenAI client initialized with fallback API key');
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

  return app;
}

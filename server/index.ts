import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getIntegrationsConfig, saveIntegrationsConfig } from "./routes/integrations-config";
import { testXanoConnection } from "./routes/test-xano";
import { testTwilioConnection } from "./routes/test-twilio";
import { uploadTwilioAPIs, getUploadedAPIs, clearUploadedAPIs, testTwilioAPI } from "./routes/twilio-vault";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Integration routes
  app.get("/api/integrations/config", getIntegrationsConfig);
  app.post("/api/integrations/config", saveIntegrationsConfig);
  app.post("/api/integrations/test/xano", testXanoConnection);
  app.post("/api/integrations/test/twilio", testTwilioConnection);

  // Twilio API Vault routes
  app.post("/api/twilio-vault/upload", uploadTwilioAPIs);
  app.get("/api/twilio-vault/apis", getUploadedAPIs);
  app.delete("/api/twilio-vault/apis", clearUploadedAPIs);
  app.post("/api/twilio-vault/test", testTwilioAPI);

  return app;
}

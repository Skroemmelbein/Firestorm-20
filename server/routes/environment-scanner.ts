import express, { RequestHandler } from "express";

const router = express.Router();

// Scan and discover environment variables and credentials
export const scanEnvironmentCredentials: RequestHandler = async (req, res) => {
  try {
    const discovered: any[] = [];

    console.log("🔍 Starting environment credential scan...");

    // Scan environment variables for common credential patterns
    const envVars = process.env;
    const credentialPatterns = [
      { pattern: /.*API.*KEY.*/i, type: "api_key", service: "Unknown API" },
      {
        pattern: /.*AUTH.*TOKEN.*/i,
        type: "auth_token",
        service: "Authentication",
      },
      { pattern: /.*SECRET.*/i, type: "environment", service: "Application" },
      { pattern: /.*PASSWORD.*/i, type: "database", service: "Database" },
      { pattern: /.*WEBHOOK.*/i, type: "webhook", service: "Webhook" },
      { pattern: /.*CLIENT.*ID.*/i, type: "oauth", service: "OAuth" },
      { pattern: /.*CLIENT.*SECRET.*/i, type: "oauth", service: "OAuth" },
      { pattern: /.*DATABASE.*URL.*/i, type: "database", service: "Database" },
      { pattern: /.*DB.*URL.*/i, type: "database", service: "Database" },
      { pattern: /.*TWILIO.*/i, type: "integration", service: "Twilio" },
      { pattern: /.*SENDGRID.*/i, type: "integration", service: "SendGrid" },
      { pattern: /.*OPENAI.*/i, type: "integration", service: "OpenAI" },
      { pattern: /.*SUPABASE.*/i, type: "integration", service: "Supabase" },
      { pattern: /.*STRIPE.*/i, type: "integration", service: "Stripe" },
      { pattern: /.*AWS.*/i, type: "integration", service: "AWS" },
      { pattern: /.*GOOGLE.*/i, type: "integration", service: "Google" },
      { pattern: /.*GITHUB.*/i, type: "integration", service: "GitHub" },
    ];

    for (const [key, value] of Object.entries(envVars)) {
      if (!value || typeof value !== "string") continue;

      // Skip common non-credential environment variables
      const skipPatterns = [
        /^PATH$/i,
        /^HOME$/i,
        /^USER$/i,
        /^PWD$/i,
        /^SHELL$/i,
        /^NODE_ENV$/i,
        /^PORT$/i,
        /^HOST$/i,
        /^DEBUG$/i,
        /^LANG$/i,
        /^TZ$/i,
      ];

      if (skipPatterns.some((pattern) => pattern.test(key))) {
        continue;
      }

      // Check if this environment variable matches credential patterns
      for (const { pattern, type, service } of credentialPatterns) {
        if (pattern.test(key)) {
          // Determine more specific service based on key name
          let detectedService = service;
          if (key.toLowerCase().includes("twilio")) detectedService = "Twilio";
          else if (key.toLowerCase().includes("sendgrid"))
            detectedService = "SendGrid";
          else if (key.toLowerCase().includes("openai"))
            detectedService = "OpenAI";
          else if (key.toLowerCase().includes("supabase"))
            detectedService = "Supabase";
          else if (key.toLowerCase().includes("stripe"))
            detectedService = "Stripe";
          else if (key.toLowerCase().includes("aws")) detectedService = "AWS";
          else if (key.toLowerCase().includes("google"))
            detectedService = "Google";
          else if (key.toLowerCase().includes("github"))
            detectedService = "GitHub";
          else if (key.toLowerCase().includes("vercel"))
            detectedService = "Vercel";
          // Prefer Vercel; ignore Netlify

          // Determine environment based on key or value patterns
          let environment = "production";
          if (
            key.toLowerCase().includes("dev") ||
            key.toLowerCase().includes("development")
          ) {
            environment = "development";
          } else if (
            key.toLowerCase().includes("test") ||
            key.toLowerCase().includes("staging")
          ) {
            environment = "staging";
          }

          discovered.push({
            id: Date.now().toString() + Math.random(),
            name: key,
            type: type,
            service: detectedService,
            value: value,
            description: `Environment variable: ${key}`,
            environment: environment,
            dateAdded: new Date().toISOString(),
            status: "active",
            isEncrypted: false,
            tags: ["auto-discovered", "environment"],
            metadata: {
              source: "environment",
              originalKey: key,
            },
          });
          break; // Found a match, don't check other patterns
        }
      }
    }

    // Add some common credential locations that might be missing
    const commonCredentials = [
      {
        name: "Database Connection String",
        type: "database",
        service: "Database",
        placeholder: "postgres://username:password@host:port/database",
        description: "Primary database connection string",
      },
      {
        name: "JWT Secret",
        type: "environment",
        service: "Authentication",
        placeholder: "your-jwt-secret-key",
        description: "Secret key for JWT token signing",
      },
      {
        name: "Encryption Key",
        type: "environment",
        service: "Security",
        placeholder: "your-encryption-key",
        description: "Application encryption key",
      },
    ];

    console.log(
      `✅ Environment scan complete! Found ${discovered.length} potential credentials`,
    );

    res.json({
      success: true,
      message: `Successfully scanned environment and found ${discovered.length} potential credentials`,
      credentials: discovered,
      suggestions: commonCredentials,
      summary: {
        total: discovered.length,
        byType: discovered.reduce((acc: any, cred) => {
          acc[cred.type] = (acc[cred.type] || 0) + 1;
          return acc;
        }, {}),
        byService: discovered.reduce((acc: any, cred) => {
          acc[cred.service] = (acc[cred.service] || 0) + 1;
          return acc;
        }, {}),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Environment credential scan failed:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to scan environment",
      timestamp: new Date().toISOString(),
    });
  }
};

router.post("/scan", scanEnvironmentCredentials);

export default router;

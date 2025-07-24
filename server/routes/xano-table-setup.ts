import { RequestHandler } from "express";

// Define all table schemas for ECELONX system
const ECELONX_TABLE_SCHEMAS = {
  // Core Users & Authentication
  users: {
    name: "users",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      { name: "email", type: "text", unique: true, required: true },
      { name: "password_hash", type: "text", required: true },
      { name: "first_name", type: "text", required: true },
      { name: "last_name", type: "text", required: true },
      {
        name: "role",
        type: "enum",
        values: ["admin", "manager", "user"],
        default: "user",
      },
      {
        name: "status",
        type: "enum",
        values: ["active", "inactive", "suspended"],
        default: "active",
      },
      { name: "phone", type: "text" },
      { name: "avatar_url", type: "text" },
      { name: "last_login", type: "datetime" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
      { name: "updated_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Client Management (Velocify Hub)
  clients: {
    name: "clients",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      { name: "company_name", type: "text", required: true },
      { name: "contact_email", type: "text", required: true },
      { name: "contact_phone", type: "text" },
      { name: "contact_name", type: "text" },
      { name: "industry", type: "text" },
      { name: "website", type: "text" },
      { name: "address", type: "text" },
      { name: "city", type: "text" },
      { name: "state", type: "text" },
      { name: "zip", type: "text" },
      { name: "country", type: "text", default: "USA" },
      {
        name: "subscription_tier",
        type: "enum",
        values: ["basic", "professional", "enterprise"],
        default: "basic",
      },
      {
        name: "account_status",
        type: "enum",
        values: ["active", "trial", "suspended", "cancelled"],
        default: "trial",
      },
      { name: "monthly_spend", type: "float", default: 0 },
      { name: "total_spend", type: "float", default: 0 },
      { name: "contract_start", type: "date" },
      { name: "contract_end", type: "date" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
      { name: "updated_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Members Management (Dream Portal)
  members: {
    name: "members",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      { name: "user_id", type: "integer", foreign_key: "users.id" },
      { name: "client_id", type: "integer", foreign_key: "clients.id" },
      { name: "member_id", type: "text", unique: true },
      {
        name: "tier",
        type: "enum",
        values: ["basic", "premium", "elite", "executive"],
        default: "basic",
      },
      {
        name: "status",
        type: "enum",
        values: ["active", "inactive", "pending", "suspended"],
        default: "pending",
      },
      { name: "engagement_score", type: "float", default: 0 },
      { name: "total_spend", type: "float", default: 0 },
      { name: "last_active", type: "datetime" },
      { name: "location", type: "text" },
      { name: "permissions", type: "json" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
      { name: "updated_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Communications Log (SMS, Email, Voice)
  communications: {
    name: "communications",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      {
        name: "channel",
        type: "enum",
        values: ["sms", "email", "voice", "chat"],
        required: true,
      },
      {
        name: "direction",
        type: "enum",
        values: ["inbound", "outbound"],
        required: true,
      },
      { name: "to_number", type: "text" },
      { name: "from_number", type: "text" },
      { name: "to_email", type: "text" },
      { name: "from_email", type: "text" },
      { name: "content", type: "text" },
      { name: "subject", type: "text" },
      {
        name: "status",
        type: "enum",
        values: ["queued", "sent", "delivered", "failed", "bounced"],
        default: "queued",
      },
      {
        name: "provider",
        type: "enum",
        values: ["twilio", "sendgrid", "other"],
        required: true,
      },
      { name: "provider_id", type: "text" },
      { name: "provider_status", type: "text" },
      { name: "cost", type: "float", default: 0 },
      { name: "error_message", type: "text" },
      { name: "metadata", type: "json" },
      { name: "client_id", type: "integer", foreign_key: "clients.id" },
      { name: "user_id", type: "integer", foreign_key: "users.id" },
      { name: "sent_at", type: "datetime" },
      { name: "delivered_at", type: "datetime" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Twilio Conversations
  conversations: {
    name: "conversations",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      { name: "conversation_sid", type: "text", unique: true, required: true },
      { name: "friendly_name", type: "text", required: true },
      { name: "unique_name", type: "text", unique: true },
      {
        name: "state",
        type: "enum",
        values: ["active", "inactive", "closed"],
        default: "active",
      },
      { name: "client_id", type: "integer", foreign_key: "clients.id" },
      { name: "participant_phone", type: "text" },
      { name: "message_count", type: "integer", default: 0 },
      { name: "last_message_at", type: "datetime" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
      { name: "updated_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Conversation Messages
  conversation_messages: {
    name: "conversation_messages",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      {
        name: "conversation_id",
        type: "integer",
        foreign_key: "conversations.id",
        required: true,
      },
      { name: "message_sid", type: "text", unique: true, required: true },
      { name: "author", type: "text" },
      { name: "body", type: "text", required: true },
      {
        name: "direction",
        type: "enum",
        values: ["inbound", "outbound"],
        required: true,
      },
      { name: "participant_sid", type: "text" },
      { name: "media_url", type: "text" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Marketing Campaigns (FIRESTORM)
  campaigns: {
    name: "campaigns",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      { name: "name", type: "text", required: true },
      {
        name: "type",
        type: "enum",
        values: ["email", "sms", "voice", "multi"],
        required: true,
      },
      {
        name: "status",
        type: "enum",
        values: ["draft", "active", "paused", "completed"],
        default: "draft",
      },
      { name: "template_content", type: "text" },
      { name: "target_audience", type: "json" },
      { name: "schedule", type: "json" },
      { name: "metrics", type: "json" },
      { name: "reach", type: "integer", default: 0 },
      { name: "engagement_rate", type: "float", default: 0 },
      { name: "conversion_rate", type: "float", default: 0 },
      { name: "created_by", type: "integer", foreign_key: "users.id" },
      { name: "last_run", type: "datetime" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
      { name: "updated_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Studio Flows
  studio_flows: {
    name: "studio_flows",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      { name: "flow_sid", type: "text", unique: true, required: true },
      { name: "friendly_name", type: "text", required: true },
      {
        name: "status",
        type: "enum",
        values: ["draft", "published"],
        default: "draft",
      },
      { name: "definition", type: "json", required: true },
      { name: "description", type: "text" },
      { name: "widget_count", type: "integer", default: 0 },
      { name: "created_by", type: "integer", foreign_key: "users.id" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
      { name: "updated_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Integrations (Nexus Sync)
  integrations: {
    name: "integrations",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      { name: "name", type: "text", required: true },
      {
        name: "type",
        type: "enum",
        values: ["api", "database", "service", "webhook"],
        required: true,
      },
      { name: "provider", type: "text", required: true },
      {
        name: "status",
        type: "enum",
        values: ["connected", "disconnected", "error", "pending"],
        default: "pending",
      },
      { name: "endpoint", type: "text" },
      { name: "config", type: "json" },
      { name: "credentials", type: "json" },
      { name: "health_score", type: "float", default: 100 },
      { name: "request_count", type: "integer", default: 0 },
      { name: "error_rate", type: "float", default: 0 },
      { name: "last_sync", type: "datetime" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
      { name: "updated_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Chargebacks (Zero-CB Fortress)
  chargebacks: {
    name: "chargebacks",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      { name: "transaction_id", type: "text", required: true },
      { name: "chargeback_id", type: "text", unique: true },
      { name: "amount", type: "float", required: true },
      { name: "currency", type: "text", default: "USD" },
      { name: "reason", type: "text" },
      {
        name: "category",
        type: "enum",
        values: ["fraud", "processing", "authorization", "consumer"],
        required: true,
      },
      {
        name: "status",
        type: "enum",
        values: ["pending", "disputed", "won", "lost", "prevented"],
        default: "pending",
      },
      { name: "risk_score", type: "float", default: 0 },
      { name: "customer_name", type: "text" },
      { name: "customer_email", type: "text" },
      { name: "processor", type: "text", default: "NMI" },
      { name: "client_id", type: "integer", foreign_key: "clients.id" },
      { name: "disputed_at", type: "datetime" },
      { name: "resolved_at", type: "datetime" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
      { name: "updated_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Billing & Subscriptions
  subscriptions: {
    name: "subscriptions",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      {
        name: "client_id",
        type: "integer",
        foreign_key: "clients.id",
        required: true,
      },
      { name: "subscription_id", type: "text", unique: true, required: true },
      { name: "plan_name", type: "text", required: true },
      {
        name: "plan_type",
        type: "enum",
        values: ["monthly", "yearly", "custom"],
        default: "monthly",
      },
      { name: "amount", type: "float", required: true },
      { name: "currency", type: "text", default: "USD" },
      {
        name: "status",
        type: "enum",
        values: ["active", "paused", "cancelled", "expired"],
        default: "active",
      },
      { name: "billing_cycle", type: "integer", default: 30 },
      { name: "next_billing_date", type: "date" },
      { name: "payment_method", type: "json" },
      { name: "nmi_vault_id", type: "text" },
      { name: "failed_payments", type: "integer", default: 0 },
      { name: "created_at", type: "datetime", auto_timestamp: true },
      { name: "updated_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Payment Transactions
  transactions: {
    name: "transactions",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      { name: "transaction_id", type: "text", unique: true, required: true },
      {
        name: "subscription_id",
        type: "integer",
        foreign_key: "subscriptions.id",
      },
      {
        name: "client_id",
        type: "integer",
        foreign_key: "clients.id",
        required: true,
      },
      { name: "amount", type: "float", required: true },
      { name: "currency", type: "text", default: "USD" },
      {
        name: "type",
        type: "enum",
        values: ["charge", "refund", "chargeback"],
        default: "charge",
      },
      {
        name: "status",
        type: "enum",
        values: ["pending", "completed", "failed", "cancelled"],
        default: "pending",
      },
      { name: "processor", type: "text", default: "NMI" },
      { name: "processor_response", type: "json" },
      { name: "fees", type: "float", default: 0 },
      { name: "net_amount", type: "float" },
      { name: "processed_at", type: "datetime" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // System Logs & Audit Trail
  system_logs: {
    name: "system_logs",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      {
        name: "level",
        type: "enum",
        values: ["info", "warning", "error", "critical"],
        required: true,
      },
      { name: "module", type: "text", required: true },
      { name: "action", type: "text", required: true },
      { name: "message", type: "text", required: true },
      { name: "details", type: "json" },
      { name: "user_id", type: "integer", foreign_key: "users.id" },
      { name: "client_id", type: "integer", foreign_key: "clients.id" },
      { name: "ip_address", type: "text" },
      { name: "user_agent", type: "text" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
    ],
  },

  // Customer Segments (for FIRESTORM)
  customer_segments: {
    name: "customer_segments",
    fields: [
      { name: "id", type: "integer", auto_increment: true, primary: true },
      { name: "name", type: "text", required: true },
      { name: "description", type: "text" },
      {
        name: "type",
        type: "enum",
        values: ["behavioral", "demographic", "psychographic", "geographic"],
        required: true,
      },
      { name: "criteria", type: "json", required: true },
      { name: "audience_size", type: "integer", default: 0 },
      { name: "conversion_rate", type: "float", default: 0 },
      { name: "engagement_score", type: "float", default: 0 },
      {
        name: "status",
        type: "enum",
        values: ["active", "inactive", "building"],
        default: "building",
      },
      { name: "created_by", type: "integer", foreign_key: "users.id" },
      { name: "created_at", type: "datetime", auto_timestamp: true },
      { name: "updated_at", type: "datetime", auto_timestamp: true },
    ],
  },
};

export const createAllTables: RequestHandler = async (req, res) => {
  try {
    const xanoInstanceUrl = process.env.XANO_INSTANCE_URL;
    const xanoApiKey = process.env.XANO_API_KEY;

    if (!xanoInstanceUrl || !xanoApiKey) {
      return res.status(400).json({
        error: "Missing Xano configuration",
        message: "Please configure XANO_INSTANCE_URL and XANO_API_KEY",
      });
    }

    console.log(
      "🚀 Starting ECELONX table creation on upgraded Xano instance...",
    );
    console.log("📍 Xano URL:", xanoInstanceUrl);

    const results = [];
    const errors = [];

    // Create tables in dependency order
    const tableOrder = [
      "users",
      "clients",
      "members",
      "communications",
      "conversations",
      "conversation_messages",
      "campaigns",
      "studio_flows",
      "integrations",
      "chargebacks",
      "subscriptions",
      "transactions",
      "system_logs",
      "customer_segments",
    ];

    for (const tableName of tableOrder) {
      try {
        console.log(`📋 Creating table: ${tableName}`);

        const tableSchema = ECELONX_TABLE_SCHEMAS[tableName];
        if (!tableSchema) {
          throw new Error(`Schema not found for table: ${tableName}`);
        }

        // Create table via Xano API
        const response = await fetch(`${xanoInstanceUrl}/api/schema/table`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${xanoApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: tableSchema.name,
            fields: tableSchema.fields,
          }),
        });

        const responseText = await response.text();
        let result;

        try {
          result = JSON.parse(responseText);
        } catch (parseError) {
          result = { message: responseText };
        }

        if (response.ok) {
          console.log(`✅ Successfully created table: ${tableName}`);
          results.push({
            table: tableName,
            success: true,
            message: `Table ${tableName} created successfully`,
            fields: tableSchema.fields.length,
            result: result,
          });
        } else {
          console.error(`❌ Failed to create table ${tableName}:`, result);
          errors.push({
            table: tableName,
            error: result.message || `HTTP ${response.status}`,
            status: response.status,
          });
        }

        // Small delay between table creations
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Error creating table ${tableName}:`, error);
        errors.push({
          table: tableName,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const summary = {
      success: true,
      message: "ECELONX table creation completed",
      totalTables: tableOrder.length,
      successful: results.length,
      failed: errors.length,
      xanoInstance: xanoInstanceUrl,
      timestamp: new Date().toISOString(),
      results: results,
      errors: errors.length > 0 ? errors : undefined,
    };

    console.log("🎉 Table creation summary:", {
      successful: results.length,
      failed: errors.length,
      total: tableOrder.length,
    });

    res.json(summary);
  } catch (error) {
    console.error("❌ Fatal error in table creation:", error);
    res.status(500).json({
      error: "Failed to create tables",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
  }
};

export const getTableSchemas: RequestHandler = (req, res) => {
  res.json({
    success: true,
    message: "ECELONX table schemas",
    totalTables: Object.keys(ECELONX_TABLE_SCHEMAS).length,
    schemas: ECELONX_TABLE_SCHEMAS,
    xanoInstance: process.env.XANO_INSTANCE_URL,
  });
};

export const testXanoConnection: RequestHandler = async (req, res) => {
  try {
    const xanoInstanceUrl = process.env.XANO_INSTANCE_URL;
    const xanoApiKey = process.env.XANO_API_KEY;

    if (!xanoInstanceUrl || !xanoApiKey) {
      return res.status(400).json({
        error: "Missing Xano configuration",
        message: "Please configure XANO_INSTANCE_URL and XANO_API_KEY",
      });
    }

    // Test connection to new Xano instance
    const response = await fetch(`${xanoInstanceUrl}/api/schema/table`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${xanoApiKey}`,
      },
    });

    const responseText = await response.text();

    if (response.ok) {
      let tables;
      try {
        tables = JSON.parse(responseText);
      } catch (parseError) {
        tables = { message: responseText };
      }

      res.json({
        success: true,
        connected: true,
        message: "Successfully connected to upgraded Xano instance",
        xanoInstance: xanoInstanceUrl,
        existingTables: tables,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(response.status).json({
        success: false,
        connected: false,
        error: `Xano connection failed: ${response.status}`,
        message: responseText,
        xanoInstance: xanoInstanceUrl,
      });
    }
  } catch (error) {
    console.error("Xano connection test failed:", error);
    res.status(500).json({
      success: false,
      connected: false,
      error: "Connection test failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

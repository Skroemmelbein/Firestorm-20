import express from "express";
import { xanoAPI } from "./api-integrations";

const router = express.Router();

// High-approval recurring billing Xano data models following NMI best practices
const BILLING_STACK_TABLES = [
  {
    name: "users",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "email", type: "text", unique: true, indexed: true },
      { name: "name", type: "text" },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" },
    ],
  },

  {
    name: "plans",
    columns: [
      { name: "id", type: "text", primary_key: true }, // e.g., "plan_monthly_4999"
      { name: "name", type: "text" },
      { name: "amount_cents", type: "integer" }, // Store in cents to avoid decimal issues
      { name: "interval", type: "enum", values: ["monthly", "yearly"] },
      { name: "is_active", type: "boolean", default: true },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" },
    ],
  },

  {
    name: "subscriptions",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      {
        name: "user_id",
        type: "integer",
        foreign_key: "users.id",
        indexed: true,
      },
      { name: "plan_id", type: "text", foreign_key: "plans.id" },
      {
        name: "status",
        type: "enum",
        values: ["active", "past_due", "canceled"],
      },
      { name: "amount_cents", type: "integer" }, // Current amount in cents
      { name: "interval", type: "enum", values: ["monthly", "yearly"] },
      { name: "next_bill_at", type: "timestamp", indexed: true },
      { name: "nmi_customer_vault_id", type: "text", indexed: true }, // NMI vault token - NO PAN storage
      { name: "retries", type: "integer", default: 0 },
      { name: "last_attempt_at", type: "timestamp" },
      { name: "card_last_four", type: "text" }, // Only last 4 digits for display
      { name: "card_brand", type: "text" }, // visa, mastercard, etc.
      { name: "card_exp_month", type: "integer" },
      { name: "card_exp_year", type: "integer" },
      { name: "auto_card_updater_enabled", type: "boolean", default: false },
      { name: "auto_card_updater_last_update", type: "timestamp" },
      { name: "network_token_enabled", type: "boolean", default: false },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" },
    ],
  },

  {
    name: "transactions",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      {
        name: "subscription_id",
        type: "integer",
        foreign_key: "subscriptions.id",
        indexed: true,
      },
      {
        name: "user_id",
        type: "integer",
        foreign_key: "users.id",
        indexed: true,
      },
      { name: "amount_cents", type: "integer" },
      {
        name: "status",
        type: "enum",
        values: ["approved", "declined", "error"],
      },
      { name: "auth_code", type: "text" }, // NMI authorization code
      { name: "response_code", type: "text" }, // NMI response code (01, 05, 14, 51, etc.)
      { name: "response_text", type: "text" }, // NMI response message
      { name: "orderid", type: "text", unique: true, indexed: true }, // CIT-UUID or MIT-UUID
      { name: "transaction_id", type: "text", indexed: true }, // NMI transaction ID
      { name: "initiator", type: "enum", values: ["customer", "merchant"] }, // CIT vs MIT
      { name: "recurring", type: "enum", values: ["initial", "subsequent"] }, // CIT initial vs MIT subsequent
      { name: "descriptor", type: "text" }, // What appears on customer statement
      { name: "retry_attempt", type: "integer", default: 0 }, // Which retry attempt (0 = first try)
      { name: "decline_reason_category", type: "text" }, // categorized: insufficient_funds, expired_card, do_not_honor, etc.
      { name: "issuer_bin", type: "text" }, // First 6 digits for analytics
      { name: "created_at", type: "timestamp", indexed: true },
      { name: "updated_at", type: "timestamp" },
    ],
  },

  {
    name: "webhook_events",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "source", type: "enum", values: ["nmi", "system", "cron"] },
      { name: "event_type", type: "text" }, // payment.succeeded, payment.failed, etc.
      { name: "raw_json", type: "json" }, // Full webhook payload
      { name: "processed", type: "boolean", default: false },
      {
        name: "related_transaction_id",
        type: "integer",
        foreign_key: "transactions.id",
      },
      {
        name: "related_subscription_id",
        type: "integer",
        foreign_key: "subscriptions.id",
      },
      { name: "processing_error", type: "text" },
      { name: "created_at", type: "timestamp", indexed: true },
    ],
  },

  {
    name: "retry_schedule",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      {
        name: "subscription_id",
        type: "integer",
        foreign_key: "subscriptions.id",
        indexed: true,
      },
      { name: "retry_attempt", type: "integer" }, // 1, 2, 3
      { name: "scheduled_at", type: "timestamp", indexed: true },
      { name: "executed_at", type: "timestamp" },
      {
        name: "status",
        type: "enum",
        values: ["pending", "executed", "skipped"],
      },
      { name: "descriptor_suffix", type: "text" }, // Custom descriptor for retry
      { name: "created_at", type: "timestamp" },
    ],
  },

  {
    name: "billing_analytics",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "date", type: "date", indexed: true },
      { name: "total_attempts", type: "integer", default: 0 },
      { name: "successful_charges", type: "integer", default: 0 },
      { name: "declined_charges", type: "integer", default: 0 },
      {
        name: "approval_rate_percent",
        type: "decimal",
        precision: 5,
        scale: 2,
      },
      { name: "revenue_cents", type: "integer", default: 0 },
      { name: "mrr_cents", type: "integer", default: 0 }, // Monthly Recurring Revenue
      { name: "active_subscriptions", type: "integer", default: 0 },
      { name: "churn_rate_percent", type: "decimal", precision: 5, scale: 2 },
      {
        name: "retry_success_rate_percent",
        type: "decimal",
        precision: 5,
        scale: 2,
      },
      { name: "top_decline_reason", type: "text" },
      { name: "auto_updater_updates", type: "integer", default: 0 },
      { name: "created_at", type: "timestamp" },
    ],
  },

  {
    name: "decline_insights",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "date", type: "date", indexed: true },
      { name: "response_code", type: "text", indexed: true }, // 05, 14, 51, etc.
      { name: "response_text", type: "text" },
      { name: "decline_count", type: "integer", default: 0 },
      { name: "issuer_bin", type: "text", indexed: true }, // For issuer analysis
      { name: "card_brand", type: "text" }, // visa, mastercard, etc.
      {
        name: "retry_stage",
        type: "enum",
        values: ["initial", "retry_1", "retry_2", "retry_3"],
      },
      { name: "created_at", type: "timestamp" },
    ],
  },
];

/**
 * Create all billing stack tables with proper indexing
 */
router.post("/create-billing-tables", async (req, res) => {
  try {
    const results = [];

    console.log("🏗️  Creating high-approval billing stack tables...");

    for (const table of BILLING_STACK_TABLES) {
      try {
        console.log(`Creating table: ${table.name}`);

        const result = await xanoAPI.createTable(table.name, table.columns);

        results.push({
          table: table.name,
          status: "created",
          columns: table.columns.length,
          result: result,
        });

        console.log(
          `✅ Table ${table.name} created with ${table.columns.length} columns`,
        );

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error: any) {
        console.error(`❌ Error creating table ${table.name}:`, error.message);
        results.push({
          table: table.name,
          status: "error",
          error: error.message,
        });
      }
    }

    const successCount = results.filter((r) => r.status === "created").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    res.json({
      success: true,
      message: `Billing stack tables created: ${successCount} successful, ${errorCount} errors`,
      totalTables: BILLING_STACK_TABLES.length,
      successCount: successCount,
      errorCount: errorCount,
      results: results,
      features: [
        "MIT/CIT transaction tagging",
        "Vault tokenization (no PAN storage)",
        "Disciplined retry logic with backoff",
        "Decline reason analytics",
        "Automatic Card Updater tracking",
        "Network token support",
        "Comprehensive observability",
      ],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Seed initial plans for testing
 */
router.post("/seed-plans", async (req, res) => {
  try {
    const plans = [
      {
        id: "plan_monthly_2999",
        name: "Basic Monthly",
        amount_cents: 2999,
        interval: "monthly",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "plan_monthly_4999",
        name: "Premium Monthly",
        amount_cents: 4999,
        interval: "monthly",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "plan_yearly_29999",
        name: "Basic Yearly",
        amount_cents: 29999,
        interval: "yearly",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "plan_yearly_49999",
        name: "Premium Yearly",
        amount_cents: 49999,
        interval: "yearly",
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const results = [];

    for (const plan of plans) {
      try {
        const result = await xanoAPI.createRecord("plans", plan);
        results.push({
          plan: plan.id,
          status: "created",
          result: result,
        });
      } catch (error: any) {
        results.push({
          plan: plan.id,
          status: "error",
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: "Billing plans seeded successfully",
      plans: results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Create test user for development
 */
router.post("/create-test-user", async (req, res) => {
  try {
    const testUser = {
      email: "test@ecelonx.com",
      name: "Test Customer",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const user = await xanoAPI.createRecord("users", testUser);

    res.json({
      success: true,
      message: "Test user created successfully",
      user: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get billing stack health check
 */
router.get("/health-check", async (req, res) => {
  try {
    const health = {
      tables: {},
      summary: {
        totalUsers: 0,
        activeSubscriptions: 0,
        totalPlans: 0,
        totalTransactions: 0,
        approvalRate: 0,
      },
    };

    // Check each table exists and get counts
    for (const table of BILLING_STACK_TABLES) {
      try {
        const records = await xanoAPI.queryRecords(table.name, {});
        health.tables[table.name] = {
          exists: true,
          count: records.length,
        };

        // Update summary
        if (table.name === "users") health.summary.totalUsers = records.length;
        if (table.name === "plans") health.summary.totalPlans = records.length;
        if (table.name === "transactions")
          health.summary.totalTransactions = records.length;
        if (table.name === "subscriptions") {
          health.summary.activeSubscriptions = records.filter(
            (s: any) => s.status === "active",
          ).length;
        }
      } catch (error) {
        health.tables[table.name] = {
          exists: false,
          error: "Table not found or empty",
        };
      }
    }

    // Calculate approval rate
    try {
      const transactions = await xanoAPI.queryRecords("transactions", {});
      const approved = transactions.filter(
        (t: any) => t.status === "approved",
      ).length;
      health.summary.approvalRate =
        transactions.length > 0
          ? Math.round((approved / transactions.length) * 100)
          : 0;
    } catch (e) {
      health.summary.approvalRate = 0;
    }

    res.json({
      success: true,
      health: health,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

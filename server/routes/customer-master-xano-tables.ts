import express from "express";
import { getConvexClient } from "../../shared/convex-client";

const router = express.Router();

// Customer Master Import Tables for NMI Upgrade Project
const CUSTOMER_MASTER_TABLES = [
  {
    name: "customer_master",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },

      // Core Identity
      { name: "customerId", type: "text", unique: true, indexed: true },
      { name: "legalFirstName", type: "text", required: true },
      { name: "legalLastName", type: "text", required: true },
      { name: "emailAddress", type: "text", unique: true, indexed: true },
      { name: "phoneNumber", type: "text", indexed: true },

      // Additional Identity
      { name: "middleName", type: "text" },
      { name: "suffix", type: "text" },
      { name: "dateOfBirth", type: "date" },
      { name: "socialSecurityLastFour", type: "text", indexed: true },

      // Billing Address (JSON structure)
      { name: "billingAddress", type: "json" },

      // Legal & Compliance
      {
        name: "kycStatus",
        type: "enum",
        values: ["verified", "pending", "failed", "not_required"],
        default: "pending",
      },
      {
        name: "amlStatus",
        type: "enum",
        values: ["clear", "flagged", "under_review", "rejected"],
        default: "clear",
      },
      { name: "consentToSMarketingDate", type: "timestamp" },
      { name: "consentToEmail", type: "boolean", default: false },
      { name: "consentToSMS", type: "boolean", default: false },
      { name: "consentToAutoDialer", type: "boolean", default: false },
      { name: "tcpaConsentDate", type: "timestamp" },
      { name: "privacyPolicyAcceptedDate", type: "timestamp" },

      // Financial Information
      {
        name: "estimatedAnnualIncome",
        type: "decimal",
        precision: 12,
        scale: 2,
      },
      {
        name: "bankAccountType",
        type: "enum",
        values: ["checking", "savings", "business", "unknown"],
      },
      { name: "creditScore", type: "integer" },

      // Historical Data
      { name: "customerSince", type: "timestamp", indexed: true },
      { name: "lastLoginDate", type: "timestamp" },
      {
        name: "totalLifetimeValue",
        type: "decimal",
        precision: 12,
        scale: 2,
        default: 0,
      },
      { name: "totalTransactions", type: "integer", default: 0 },
      { name: "lastTransactionDate", type: "timestamp" },

      // Risk Assessment
      { name: "fraudScore", type: "integer", default: 0 },
      { name: "chargebackHistory", type: "integer", default: 0 },
      { name: "disputeHistory", type: "integer", default: 0 },
      {
        name: "riskTier",
        type: "enum",
        values: ["low", "medium", "high", "blocked"],
        default: "low",
      },

      // Account Status
      {
        name: "accountStatus",
        type: "enum",
        values: ["active", "suspended", "closed", "pending_verification"],
        default: "active",
      },
      { name: "suspensionReason", type: "text" },
      { name: "closureDate", type: "timestamp" },
      { name: "closureReason", type: "text" },

      // Communication Preferences
      { name: "preferredLanguage", type: "text", default: "en" },
      { name: "timezone", type: "text", default: "America/New_York" },
      {
        name: "communicationFrequency",
        type: "enum",
        values: ["daily", "weekly", "monthly", "never"],
        default: "weekly",
      },

      // Source Tracking
      { name: "acquisitionChannel", type: "text" },
      { name: "referralSource", type: "text" },
      { name: "campaignId", type: "text" },

      // Data Quality
      { name: "dataQualityScore", type: "integer", default: 50 },
      { name: "lastVerificationDate", type: "timestamp" },
      {
        name: "verificationMethod",
        type: "enum",
        values: ["manual", "automated", "third_party", "none"],
        default: "none",
      },

      // Additional Metadata
      { name: "tags", type: "json" },
      { name: "notes", type: "text" },
      { name: "importSource", type: "text", default: "war_chest" },
      { name: "importBatch", type: "text", indexed: true },

      // System Fields
      { name: "importedAt", type: "timestamp" },
      { name: "lastUpdatedAt", type: "timestamp" },
      { name: "version", type: "integer", default: 1 },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" },
    ],
  },

  {
    name: "import_batches",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "batchId", type: "text", unique: true, indexed: true },
      { name: "source", type: "text", default: "war_chest" },
      { name: "totalRecords", type: "integer", default: 0 },
      { name: "processedRecords", type: "integer", default: 0 },
      { name: "successfulRecords", type: "integer", default: 0 },
      { name: "failedRecords", type: "integer", default: 0 },
      { name: "skippedRecords", type: "integer", default: 0 },
      {
        name: "status",
        type: "enum",
        values: ["pending", "processing", "completed", "failed"],
        default: "pending",
      },
      {
        name: "processingMode",
        type: "enum",
        values: ["validate_only", "import", "merge"],
        default: "import",
      },
      {
        name: "duplicateHandling",
        type: "enum",
        values: ["skip", "merge", "create_new", "error"],
        default: "merge",
      },
      { name: "startedAt", type: "timestamp" },
      { name: "completedAt", type: "timestamp" },
      { name: "errorMessage", type: "text" },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" },
    ],
  },

  {
    name: "import_audit_log",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "batchId", type: "text", indexed: true },
      { name: "entityType", type: "text", indexed: true },
      { name: "entityId", type: "integer", indexed: true },
      {
        name: "action",
        type: "enum",
        values: ["import", "merge", "update", "validate", "skip"],
        indexed: true,
      },
      { name: "sourceData", type: "json" },
      { name: "enrichedData", type: "json" },
      { name: "duplicatesFound", type: "integer", default: 0 },
      { name: "dataQualityScore", type: "integer" },
      { name: "processingTimeMs", type: "integer" },
      { name: "errorMessage", type: "text" },
      { name: "importedAt", type: "timestamp", indexed: true },
      { name: "created_at", type: "timestamp" },
    ],
  },

  {
    name: "duplicate_detection_results",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "sourceCustomerId", type: "text", indexed: true },
      { name: "targetCustomerId", type: "text", indexed: true },
      {
        name: "sourceXanoId",
        type: "integer",
        foreign_key: "customer_master.id",
      },
      {
        name: "targetXanoId",
        type: "integer",
        foreign_key: "customer_master.id",
      },
      {
        name: "matchType",
        type: "enum",
        values: [
          "email_exact",
          "phone_exact",
          "name_address_fuzzy",
          "ssn_last4",
        ],
        indexed: true,
      },
      { name: "confidence", type: "decimal", precision: 3, scale: 2 },
      { name: "matchDetails", type: "json" },
      {
        name: "status",
        type: "enum",
        values: ["detected", "reviewed", "merged", "ignored"],
        default: "detected",
      },
      { name: "reviewedBy", type: "text" },
      { name: "reviewedAt", type: "timestamp" },
      { name: "resolution", type: "text" },
      { name: "created_at", type: "timestamp", indexed: true },
      { name: "updated_at", type: "timestamp" },
    ],
  },

  {
    name: "customer_consent_history",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      {
        name: "customerId",
        type: "text",
        foreign_key: "customer_master.customerId",
        indexed: true,
      },
      {
        name: "consentType",
        type: "enum",
        values: [
          "email",
          "sms",
          "auto_dialer",
          "marketing",
          "privacy_policy",
          "terms_of_service",
        ],
        indexed: true,
      },
      { name: "consentStatus", type: "boolean" },
      { name: "consentDate", type: "timestamp", indexed: true },
      { name: "ipAddress", type: "text" },
      { name: "userAgent", type: "text" },
      { name: "consentHash", type: "text" },
      { name: "documentVersion", type: "text" },
      {
        name: "source",
        type: "enum",
        values: ["import", "web", "api", "manual"],
        default: "import",
      },
      { name: "notes", type: "text" },
      { name: "created_at", type: "timestamp" },
    ],
  },

  {
    name: "customer_risk_events",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      {
        name: "customerId",
        type: "text",
        foreign_key: "customer_master.customerId",
        indexed: true,
      },
      {
        name: "eventType",
        type: "enum",
        values: [
          "chargeback",
          "dispute",
          "fraud_alert",
          "kyc_failure",
          "aml_flag",
          "payment_failure",
        ],
        indexed: true,
      },
      {
        name: "severity",
        type: "enum",
        values: ["low", "medium", "high", "critical"],
        default: "medium",
      },
      { name: "description", type: "text" },
      { name: "eventData", type: "json" },
      {
        name: "resolvedStatus",
        type: "enum",
        values: ["open", "investigating", "resolved", "closed"],
        default: "open",
      },
      { name: "resolvedAt", type: "timestamp" },
      { name: "resolvedBy", type: "text" },
      { name: "resolutionNotes", type: "text" },
      { name: "impactOnRiskScore", type: "integer", default: 0 },
      { name: "eventDate", type: "timestamp", indexed: true },
      { name: "created_at", type: "timestamp" },
    ],
  },

  {
    name: "customer_communication_log",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      {
        name: "customerId",
        type: "text",
        foreign_key: "customer_master.customerId",
        indexed: true,
      },
      {
        name: "communicationType",
        type: "enum",
        values: ["email", "sms", "phone", "mail", "portal_message"],
        indexed: true,
      },
      {
        name: "direction",
        type: "enum",
        values: ["inbound", "outbound"],
        indexed: true,
      },
      { name: "subject", type: "text" },
      { name: "content", type: "text" },
      {
        name: "status",
        type: "enum",
        values: ["sent", "delivered", "failed", "bounced", "opened", "replied"],
        indexed: true,
      },
      { name: "provider", type: "text" },
      { name: "providerId", type: "text" },
      { name: "cost", type: "decimal", precision: 8, scale: 4 },
      { name: "sentAt", type: "timestamp", indexed: true },
      { name: "deliveredAt", type: "timestamp" },
      { name: "readAt", type: "timestamp" },
      { name: "repliedAt", type: "timestamp" },
      { name: "metadata", type: "json" },
      { name: "created_at", type: "timestamp" },
    ],
  },

  {
    name: "war_chest_migration_status",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "customerId", type: "text", unique: true, indexed: true },
      {
        name: "xanoCustomerId",
        type: "integer",
        foreign_key: "customer_master.id",
      },
      { name: "originalVertical", type: "text", default: "war_chest" },
      {
        name: "migrationStatus",
        type: "enum",
        values: ["pending", "in_progress", "completed", "failed", "skipped"],
        default: "pending",
      },
      {
        name: "migrationStage",
        type: "enum",
        values: [
          "customer_data",
          "payment_methods",
          "transaction_history",
          "consent_records",
          "finalization",
        ],
        default: "customer_data",
      },
      {
        name: "statusClassification",
        type: "enum",
        values: ["BILL", "REWRITE", "FLIP", "DORMANT", "DO_NOT_BILL"],
      },
      {
        name: "migrationPriority",
        type: "enum",
        values: ["low", "medium", "high", "critical"],
        default: "medium",
      },
      { name: "estimatedValue", type: "decimal", precision: 12, scale: 2 },
      { name: "lastContactDate", type: "timestamp" },
      { name: "nextActionDate", type: "timestamp" },
      { name: "migrationNotes", type: "text" },
      { name: "errorLog", type: "json" },
      { name: "completionPercentage", type: "integer", default: 0 },
      { name: "startedAt", type: "timestamp" },
      { name: "completedAt", type: "timestamp" },
      { name: "assignedTo", type: "text" },
      { name: "created_at", type: "timestamp", indexed: true },
      { name: "updated_at", type: "timestamp" },
    ],
  },
];

/**
 * Create Customer Master Import tables
 */
router.post("/create-customer-master-tables", async (req, res) => {
  try {
    const results = [];

    console.log(
      "🏗️  Creating Customer Master Import tables for NMI upgrade...",
    );

    for (const table of CUSTOMER_MASTER_TABLES) {
      try {
        console.log(`Creating table: ${table.name}`);

        const result = await getConvexClient().createTable(table.name, table.columns);

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
        await new Promise((resolve) => setTimeout(resolve, 250));
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
      message: `Customer Master Import tables created: ${successCount} successful, ${errorCount} errors`,
      totalTables: CUSTOMER_MASTER_TABLES.length,
      successCount: successCount,
      errorCount: errorCount,
      results: results,
      features: [
        "Comprehensive customer identity management",
        "Legal compliance & consent tracking",
        "Advanced duplicate detection with fuzzy matching",
        "Risk assessment & fraud scoring",
        "Data quality scoring & enrichment",
        "War Chest migration status tracking",
        "Complete audit trail for GDPR compliance",
        "Batch import processing with progress tracking",
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
 * Seed sample customer master data for testing
 */
router.post("/seed-customer-data", async (req, res) => {
  try {
    const sampleCustomers = [
      {
        customerId: "WC-000001",
        legalFirstName: "John",
        legalLastName: "Smith",
        emailAddress: "john.smith@example.com",
        phoneNumber: "+1-555-123-4567",
        billingAddress: {
          street1: "123 Main St",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "US",
        },
        kycStatus: "verified",
        consentToEmail: true,
        consentToSMS: true,
        customerSince: "2022-01-15T00:00:00Z",
        totalLifetimeValue: 2500.0,
        totalTransactions: 25,
        fraudScore: 15,
        riskTier: "low",
        dataQualityScore: 95,
        tags: ["high_value", "verified_low_risk"],
        importSource: "war_chest",
      },
      {
        customerId: "WC-000002",
        legalFirstName: "Sarah",
        legalLastName: "Johnson",
        emailAddress: "sarah.j@example.com",
        phoneNumber: "+1-555-987-6543",
        billingAddress: {
          street1: "456 Oak Avenue",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90210",
          country: "US",
        },
        kycStatus: "pending",
        consentToEmail: true,
        consentToSMS: false,
        customerSince: "2023-03-20T00:00:00Z",
        totalLifetimeValue: 850.0,
        totalTransactions: 8,
        fraudScore: 25,
        riskTier: "low",
        dataQualityScore: 78,
        tags: ["recent_customer"],
        importSource: "war_chest",
      },
      {
        customerId: "WC-000003",
        legalFirstName: "Michael",
        legalLastName: "Davis",
        emailAddress: "mdavis@example.com",
        phoneNumber: "+1-555-555-1234",
        billingAddress: {
          street1: "789 Pine Street",
          street2: "Apt 4B",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "US",
        },
        kycStatus: "verified",
        consentToEmail: true,
        consentToSMS: true,
        consentToAutoDialer: true,
        customerSince: "2021-11-10T00:00:00Z",
        totalLifetimeValue: 15600.0,
        totalTransactions: 156,
        fraudScore: 5,
        chargebackHistory: 0,
        riskTier: "low",
        dataQualityScore: 98,
        tags: ["high_value", "frequent_customer", "verified_low_risk"],
        importSource: "war_chest",
      },
    ];

    const results = [];

    for (const customer of sampleCustomers) {
      try {
        // Add import metadata
        (customer as any).importedAt = new Date().toISOString();
        (customer as any).lastUpdatedAt = new Date().toISOString();
        (customer as any).version = 1;

        const result = await getConvexClient().createRecord("customer_master", customer);

        results.push({
          customerId: customer.customerId,
          status: "created",
          xanoId: result.id,
          dataQualityScore: customer.dataQualityScore,
        });
      } catch (error: any) {
        results.push({
          customerId: customer.customerId,
          status: "error",
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: "Sample customer master data seeded successfully",
      customers: results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Health check for Customer Master Import system
 */
router.get("/health-check", async (req, res) => {
  try {
    const health = {
      tables: {},
      summary: {
        totalCustomers: 0,
        verifiedCustomers: 0,
        highQualityCustomers: 0,
        highRiskCustomers: 0,
        activeBatches: 0,
        totalBatches: 0,
        averageDataQuality: 0,
      },
    };

    // Check each table exists and get counts
    for (const table of CUSTOMER_MASTER_TABLES) {
      try {
        const records = await getConvexClient().queryRecords(table.name, {});
        health.tables[table.name] = {
          exists: true,
          count: records.length,
        };

        // Update summary
        if (table.name === "customer_master") {
          health.summary.totalCustomers = records.length;
          health.summary.verifiedCustomers = records.filter(
            (c: any) => c.kycStatus === "verified",
          ).length;
          health.summary.highQualityCustomers = records.filter(
            (c: any) => (c.dataQualityScore || 0) >= 80,
          ).length;
          health.summary.highRiskCustomers = records.filter(
            (c: any) => c.riskTier === "high",
          ).length;

          if (records.length > 0) {
            health.summary.averageDataQuality = Math.round(
              records.reduce(
                (sum: number, c: any) => sum + (c.dataQualityScore || 0),
                0,
              ) / records.length,
            );
          }
        }

        if (table.name === "import_batches") {
          health.summary.totalBatches = records.length;
          health.summary.activeBatches = records.filter(
            (b: any) => b.status === "processing" || b.status === "pending",
          ).length;
        }
      } catch (error) {
        health.tables[table.name] = {
          exists: false,
          error: "Table not found or empty",
        };
      }
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

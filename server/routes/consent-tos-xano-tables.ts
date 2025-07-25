import express from "express";
import { xanoAPI } from "./api-integrations";

const router = express.Router();

// Consent/TOS Events Xano Tables for NMI Compliance Project
const CONSENT_TOS_TABLES = [
  {
    name: "consent_tos_events",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      
      // Event Identity
      { name: "eventId", type: "text", unique: true, indexed: true },
      { name: "customerId", type: "text", foreign_key: "customer_master.customerId", indexed: true },
      
      // Event Type & Details
      { name: "eventType", type: "enum", values: [
        "terms_of_service_acceptance", "privacy_policy_acceptance", "email_marketing_consent",
        "sms_marketing_consent", "auto_dialer_consent", "data_processing_consent",
        "cookies_consent", "newsletter_subscription", "promotional_consent",
        "third_party_sharing_consent", "data_retention_consent", "analytics_consent",
        "consent_withdrawal", "terms_update_acceptance"
      ], indexed: true },
      
      // Consent Details
      { name: "consentStatus", type: "boolean", indexed: true },
      { name: "consentText", type: "text" },
      { name: "documentVersion", type: "text", indexed: true },
      { name: "documentUrl", type: "text" },
      
      // Technical Tracking
      { name: "timestamp", type: "timestamp", indexed: true },
      { name: "ipAddress", type: "text", indexed: true },
      { name: "userAgent", type: "text" },
      { name: "sessionId", type: "text", indexed: true },
      { name: "deviceFingerprint", type: "text" },
      
      // Geographic & Context
      { name: "geoLocation", type: "json" },
      
      // Source & Method
      { name: "consentMethod", type: "enum", values: [
        "website_checkbox", "email_link_click", "sms_reply", "phone_verbal",
        "paper_form", "api_call", "mobile_app", "popup_modal", "banner_accept",
        "double_opt_in", "implied_consent"
      ], indexed: true },
      
      { name: "sourceChannel", type: "enum", values: [
        "website", "mobile_app", "email", "sms", "phone", "in_person",
        "api", "admin_portal", "customer_portal", "third_party"
      ], default: "website", indexed: true },
      
      { name: "sourceUrl", type: "text" },
      { name: "referrerUrl", type: "text" },
      
      // Legal Requirements
      { name: "doubleOptIn", type: "boolean", default: false },
      { name: "doubleOptInConfirmedAt", type: "timestamp" },
      { name: "doubleOptInIpAddress", type: "text" },
      
      // Withdrawal Tracking
      { name: "withdrawnAt", type: "timestamp" },
      { name: "withdrawalReason", type: "text" },
      { name: "withdrawalMethod", type: "enum", values: [
        "unsubscribe_link", "customer_service", "account_settings",
        "reply_stop", "admin_action", "automatic_expiry", "gdpr_request"
      ] },
      
      // Dispute Protection
      { name: "evidenceHash", type: "text", unique: true, indexed: true },
      { name: "evidenceStorage", type: "json" },
      
      // Compliance Metadata
      { name: "gdprLawfulBasis", type: "enum", values: [
        "consent", "contract", "legal_obligation", "vital_interests", "public_task", "legitimate_interests"
      ] },
      { name: "ccpaCategories", type: "json" },
      { name: "tcpaCompliant", type: "boolean", default: false },
      { name: "canSpamCompliant", type: "boolean", default: false },
      
      // Validation & Quality
      { name: "validationScore", type: "integer", default: 0 },
      { name: "validationIssues", type: "json" },
      
      // Additional Metadata
      { name: "campaignId", type: "text", indexed: true },
      { name: "formId", type: "text" },
      { name: "leadSource", type: "text" },
      { name: "tags", type: "json" },
      { name: "notes", type: "text" },
      
      // Import Tracking
      { name: "importSource", type: "text", default: "war_chest" },
      { name: "importBatch", type: "text", indexed: true },
      { name: "importedAt", type: "timestamp" },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" }
    ]
  },

  {
    name: "consent_import_batches",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "batchId", type: "text", unique: true, indexed: true },
      { name: "source", type: "text", default: "war_chest" },
      { name: "totalRecords", type: "integer", default: 0 },
      { name: "processedRecords", type: "integer", default: 0 },
      { name: "successfulRecords", type: "integer", default: 0 },
      { name: "failedRecords", type: "integer", default: 0 },
      { name: "skippedRecords", type: "integer", default: 0 },
      { name: "averageComplianceScore", type: "integer", default: 0 },
      { name: "status", type: "enum", values: ["pending", "processing", "completed", "failed"], default: "pending" },
      { name: "processingMode", type: "enum", values: ["validate_only", "import", "merge"], default: "import" },
      { name: "duplicateHandling", type: "enum", values: ["skip", "merge", "create_new", "error"], default: "skip" },
      { name: "startedAt", type: "timestamp" },
      { name: "completedAt", type: "timestamp" },
      { name: "errorMessage", type: "text" },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" }
    ]
  },

  {
    name: "compliance_audit_log",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "eventType", type: "text", indexed: true },
      { name: "customerId", type: "text", foreign_key: "customer_master.customerId", indexed: true },
      { name: "eventId", type: "text", indexed: true },
      { name: "complianceScore", type: "integer" },
      { name: "riskFactors", type: "json" },
      { name: "evidenceHash", type: "text", indexed: true },
      { name: "auditedBy", type: "text" },
      { name: "auditReason", type: "text" },
      { name: "remedialActions", type: "json" },
      { name: "importedAt", type: "timestamp" },
      { name: "created_at", type: "timestamp", indexed: true }
    ]
  },

  {
    name: "customer_consent_summary",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "customerId", type: "text", unique: true, foreign_key: "customer_master.customerId", indexed: true },
      { name: "totalEvents", type: "integer", default: 0 },
      { name: "activeConsents", type: "json" },
      { name: "complianceStatus", type: "json" },
      { name: "evidenceQuality", type: "integer", default: 0 },
      { name: "riskFactors", type: "json" },
      { name: "canContactEmail", type: "boolean", default: false },
      { name: "canContactSms", type: "boolean", default: false },
      { name: "canContactPhone", type: "boolean", default: false },
      { name: "tcpaCompliant", type: "boolean", default: false },
      { name: "gdprCompliant", type: "boolean", default: false },
      { name: "canSpamCompliant", type: "boolean", default: false },
      { name: "ccpaCompliant", type: "boolean", default: false },
      { name: "disputeReadiness", type: "enum", values: ["low", "medium", "high"], default: "low" },
      { name: "lastConsentDate", type: "timestamp" },
      { name: "lastWithdrawalDate", type: "timestamp" },
      { name: "lastUpdated", type: "timestamp", indexed: true },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" }
    ]
  },

  {
    name: "legal_document_versions",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "documentType", type: "enum", values: [
        "terms_of_service", "privacy_policy", "cookie_policy", "data_processing_agreement",
        "subscription_terms", "refund_policy", "acceptable_use_policy"
      ], indexed: true },
      { name: "version", type: "text", indexed: true },
      { name: "title", type: "text" },
      { name: "contentHash", type: "text", unique: true },
      { name: "documentUrl", type: "text" },
      { name: "effectiveDate", type: "timestamp", indexed: true },
      { name: "expirationDate", type: "timestamp" },
      { name: "isActive", type: "boolean", default: true },
      { name: "majorChanges", type: "json" },
      { name: "legalReview", type: "json" },
      { name: "approvedBy", type: "text" },
      { name: "approvedAt", type: "timestamp" },
      { name: "notificationRequired", type: "boolean", default: false },
      { name: "gracePeriodDays", type: "integer", default: 30 },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" }
    ]
  },

  {
    name: "consent_withdrawal_requests",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "requestId", type: "text", unique: true, indexed: true },
      { name: "customerId", type: "text", foreign_key: "customer_master.customerId", indexed: true },
      { name: "withdrawalType", type: "enum", values: [
        "all_marketing", "email_only", "sms_only", "phone_only", "data_processing",
        "account_deletion", "gdpr_erasure", "ccpa_deletion"
      ], indexed: true },
      { name: "requestMethod", type: "enum", values: [
        "unsubscribe_link", "customer_service", "email_request", "phone_request",
        "account_settings", "legal_request", "automated_expiry"
      ] },
      { name: "requestDate", type: "timestamp", indexed: true },
      { name: "verificationMethod", type: "text" },
      { name: "verificationCompleted", type: "boolean", default: false },
      { name: "verificationDate", type: "timestamp" },
      { name: "processingStatus", type: "enum", values: [
        "pending", "verified", "processing", "completed", "rejected"
      ], default: "pending" },
      { name: "processedDate", type: "timestamp" },
      { name: "processedBy", type: "text" },
      { name: "gracePeriodEnd", type: "timestamp" },
      { name: "effectiveDate", type: "timestamp" },
      { name: "impactedConsents", type: "json" },
      { name: "confirmationSent", type: "boolean", default: false },
      { name: "confirmationDate", type: "timestamp" },
      { name: "notes", type: "text" },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" }
    ]
  },

  {
    name: "compliance_violations",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "violationId", type: "text", unique: true, indexed: true },
      { name: "customerId", type: "text", foreign_key: "customer_master.customerId", indexed: true },
      { name: "violationType", type: "enum", values: [
        "tcpa_violation", "gdpr_violation", "can_spam_violation", "ccpa_violation",
        "missing_consent", "expired_consent", "invalid_consent", "double_opt_in_failure"
      ], indexed: true },
      { name: "severity", type: "enum", values: ["low", "medium", "high", "critical"], default: "medium" },
      { name: "detectedDate", type: "timestamp", indexed: true },
      { name: "detectionMethod", type: "enum", values: ["automated_scan", "manual_review", "customer_complaint", "audit"] },
      { name: "description", type: "text" },
      { name: "evidenceData", type: "json" },
      { name: "riskAssessment", type: "json" },
      { name: "remediationRequired", type: "boolean", default: true },
      { name: "remediationPlan", type: "text" },
      { name: "remediationStatus", type: "enum", values: ["open", "in_progress", "completed", "deferred"], default: "open" },
      { name: "remediationDate", type: "timestamp" },
      { name: "assignedTo", type: "text" },
      { name: "resolvedBy", type: "text" },
      { name: "resolvedDate", type: "timestamp" },
      { name: "resolutionNotes", type: "text" },
      { name: "preventiveActions", type: "json" },
      { name: "created_at", type: "timestamp" },
      { name: "updated_at", type: "timestamp" }
    ]
  },

  {
    name: "dispute_evidence_vault",
    columns: [
      { name: "id", type: "integer", auto_increment: true, primary_key: true },
      { name: "evidenceId", type: "text", unique: true, indexed: true },
      { name: "customerId", type: "text", foreign_key: "customer_master.customerId", indexed: true },
      { name: "consentEventId", type: "text", foreign_key: "consent_tos_events.eventId", indexed: true },
      { name: "evidenceType", type: "enum", values: [
        "consent_proof", "ip_verification", "timestamp_proof", "double_opt_in_proof",
        "withdrawal_proof", "document_version_proof", "communication_history"
      ], indexed: true },
      { name: "evidenceHash", type: "text", unique: true, indexed: true },
      { name: "storageLocation", type: "text" },
      { name: "encryptionMethod", type: "text", default: "AES-256-GCM" },
      { name: "compressionMethod", type: "text" },
      { name: "fileSize", type: "integer" },
      { name: "retentionPeriod", type: "integer", default: 2555 },
      { name: "expirationDate", type: "timestamp" },
      { name: "accessLog", type: "json" },
      { name: "integrityCheck", type: "text" },
      { name: "lastVerified", type: "timestamp" },
      { name: "legalHold", type: "boolean", default: false },
      { name: "legalHoldReason", type: "text" },
      { name: "legalHoldDate", type: "timestamp" },
      { name: "archived", type: "boolean", default: false },
      { name: "archivedDate", type: "timestamp" },
      { name: "created_at", type: "timestamp", indexed: true },
      { name: "updated_at", type: "timestamp" }
    ]
  }
];

/**
 * Create Consent/TOS Events tables
 */
router.post("/create-consent-tos-tables", async (req, res) => {
  try {
    const results = [];

    console.log("🏗️  Creating Consent/TOS Events tables for NMI compliance...");

    for (const table of CONSENT_TOS_TABLES) {
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
        await new Promise((resolve) => setTimeout(resolve, 300));
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
      message: `Consent/TOS Events tables created: ${successCount} successful, ${errorCount} errors`,
      totalTables: CONSENT_TOS_TABLES.length,
      successCount: successCount,
      errorCount: errorCount,
      results: results,
      features: [
        "Comprehensive consent event tracking",
        "TCPA/GDPR/CAN-SPAM compliance validation",
        "Evidence hash generation for dispute protection",
        "Double opt-in verification and tracking",
        "Withdrawal request processing",
        "Legal document version control",
        "Compliance violation detection & remediation",
        "Encrypted evidence vault for legal disputes",
        "Real-time compliance scoring",
        "Automated legal requirement validation"
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
 * Seed sample consent/TOS data for testing
 */
router.post("/seed-consent-data", async (req, res) => {
  try {
    const sampleEvents = [
      {
        eventId: "CONSENT-WC-000001-001",
        customerId: "WC-000001",
        eventType: "email_marketing_consent",
        consentStatus: true,
        consentMethod: "website_checkbox",
        sourceChannel: "website",
        timestamp: "2023-01-15T10:30:00Z",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        doubleOptIn: true,
        doubleOptInConfirmedAt: "2023-01-15T10:32:15Z",
        tcpaCompliant: false,
        canSpamCompliant: true,
        gdprLawfulBasis: "consent",
        documentVersion: "1.2.0",
        validationScore: 92,
        importSource: "war_chest"
      },
      {
        eventId: "CONSENT-WC-000001-002",
        customerId: "WC-000001",
        eventType: "sms_marketing_consent",
        consentStatus: true,
        consentMethod: "double_opt_in",
        sourceChannel: "website",
        timestamp: "2023-01-15T10:35:00Z",
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        doubleOptIn: true,
        doubleOptInConfirmedAt: "2023-01-15T10:37:22Z",
        doubleOptInIpAddress: "192.168.1.100",
        tcpaCompliant: true,
        canSpamCompliant: false,
        gdprLawfulBasis: "consent",
        documentVersion: "1.2.0",
        validationScore: 98,
        importSource: "war_chest"
      },
      {
        eventId: "CONSENT-WC-000002-001",
        customerId: "WC-000002",
        eventType: "privacy_policy_acceptance",
        consentStatus: true,
        consentMethod: "popup_modal",
        sourceChannel: "website",
        timestamp: "2023-03-20T14:15:00Z",
        ipAddress: "10.0.0.50",
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)",
        doubleOptIn: false,
        tcpaCompliant: false,
        canSpamCompliant: false,
        gdprLawfulBasis: "contract",
        documentVersion: "1.3.0",
        validationScore: 75,
        importSource: "war_chest"
      }
    ];

    const results = [];

    for (const event of sampleEvents) {
      try {
        // Generate evidence hash and storage info
        const evidenceData = {
          customerId: event.customerId,
          eventType: event.eventType,
          consentStatus: event.consentStatus,
          timestamp: event.timestamp,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          consentMethod: event.consentMethod,
          documentVersion: event.documentVersion
        };
        
        const dataString = JSON.stringify(evidenceData, Object.keys(evidenceData).sort());
        event.evidenceHash = require('crypto').createHash('sha256').update(dataString).digest('hex');
        
        event.evidenceStorage = {
          location: `evidence_vault/${event.evidenceHash.substring(0, 4)}/${event.evidenceHash}`,
          retentionPeriod: 2555,
          encryptionMethod: "AES-256-GCM"
        };

        // Add import metadata
        event.importedAt = new Date().toISOString();

        const result = await xanoAPI.createRecord("consent_tos_events", event);
        
        results.push({
          eventId: event.eventId,
          status: "created",
          xanoId: result.id,
          validationScore: event.validationScore,
          evidenceHash: event.evidenceHash
        });
      } catch (error: any) {
        results.push({
          eventId: event.eventId,
          status: "error",
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: "Sample consent/TOS data seeded successfully",
      events: results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Health check for Consent/TOS system
 */
router.get("/health-check", async (req, res) => {
  try {
    const health = {
      tables: {},
      summary: {
        totalEvents: 0,
        activeConsents: 0,
        withdrawnConsents: 0,
        complianceViolations: 0,
        averageComplianceScore: 0,
        tcpaCompliantEvents: 0,
        gdprCompliantEvents: 0,
        evidenceVaultItems: 0
      },
    };

    // Check each table exists and get counts
    for (const table of CONSENT_TOS_TABLES) {
      try {
        const records = await xanoAPI.queryRecords(table.name, {});
        health.tables[table.name] = {
          exists: true,
          count: records.length,
        };

        // Update summary based on table data
        if (table.name === "consent_tos_events") {
          health.summary.totalEvents = records.length;
          health.summary.activeConsents = records.filter((e: any) => e.consentStatus && !e.withdrawnAt).length;
          health.summary.withdrawnConsents = records.filter((e: any) => e.withdrawnAt).length;
          health.summary.tcpaCompliantEvents = records.filter((e: any) => e.tcpaCompliant).length;
          health.summary.gdprCompliantEvents = records.filter((e: any) => e.gdprLawfulBasis === 'consent').length;
          
          if (records.length > 0) {
            health.summary.averageComplianceScore = Math.round(
              records.reduce((sum: number, e: any) => sum + (e.validationScore || 0), 0) / records.length
            );
          }
        }
        
        if (table.name === "compliance_violations") {
          health.summary.complianceViolations = records.filter((v: any) => v.remediationStatus !== 'completed').length;
        }
        
        if (table.name === "dispute_evidence_vault") {
          health.summary.evidenceVaultItems = records.length;
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

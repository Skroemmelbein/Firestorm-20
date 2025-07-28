import express from "express";
import { z } from "zod";
import crypto from "crypto";
import { getConvexClient } from "../../shared/convex-client";

const router = express.Router();

// Consent/TOS Event Import Validation Schema
const ConsentEventSchema = z.object({
  // Event Identity
  eventId: z.string().min(1),
  customerId: z.string().min(1),

  // Event Type & Details
  eventType: z.enum([
    "terms_of_service_acceptance",
    "privacy_policy_acceptance",
    "email_marketing_consent",
    "sms_marketing_consent",
    "auto_dialer_consent",
    "data_processing_consent",
    "cookies_consent",
    "newsletter_subscription",
    "promotional_consent",
    "third_party_sharing_consent",
    "data_retention_consent",
    "analytics_consent",
    "consent_withdrawal",
    "terms_update_acceptance",
  ]),

  // Consent Details
  consentStatus: z.boolean(),
  consentText: z.string().optional(),
  documentVersion: z.string().optional(),
  documentUrl: z.string().url().optional(),

  // Technical Tracking
  timestamp: z.string().datetime(),
  ipAddress: z.string().ip(),
  userAgent: z.string().min(1),
  sessionId: z.string().optional(),
  deviceFingerprint: z.string().optional(),

  // Geographic & Context
  geoLocation: z
    .object({
      country: z.string().optional(),
      region: z.string().optional(),
      city: z.string().optional(),
      timezone: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    })
    .optional(),

  // Source & Method
  consentMethod: z.enum([
    "website_checkbox",
    "email_link_click",
    "sms_reply",
    "phone_verbal",
    "paper_form",
    "api_call",
    "mobile_app",
    "popup_modal",
    "banner_accept",
    "double_opt_in",
    "implied_consent",
  ]),

  sourceChannel: z
    .enum([
      "website",
      "mobile_app",
      "email",
      "sms",
      "phone",
      "in_person",
      "api",
      "admin_portal",
      "customer_portal",
      "third_party",
    ])
    .default("website"),

  sourceUrl: z.string().url().optional(),
  referrerUrl: z.string().url().optional(),

  // Legal Requirements
  doubleOptIn: z.boolean().default(false),
  doubleOptInConfirmedAt: z.string().datetime().optional(),
  doubleOptInIpAddress: z.string().ip().optional(),

  // Withdrawal Tracking
  withdrawnAt: z.string().datetime().optional(),
  withdrawalReason: z.string().optional(),
  withdrawalMethod: z
    .enum([
      "unsubscribe_link",
      "customer_service",
      "account_settings",
      "reply_stop",
      "admin_action",
      "automatic_expiry",
      "gdpr_request",
    ])
    .optional(),

  // Dispute Protection
  evidenceHash: z.string().optional(),
  evidenceStorage: z
    .object({
      location: z.string(),
      retentionPeriod: z.number(),
      encryptionMethod: z.string(),
    })
    .optional(),

  // Compliance Metadata
  gdprLawfulBasis: z
    .enum([
      "consent",
      "contract",
      "legal_obligation",
      "vital_interests",
      "public_task",
      "legitimate_interests",
    ])
    .optional(),

  ccpaCategories: z.array(z.string()).optional(),
  tcpaCompliant: z.boolean().default(false),
  canSpamCompliant: z.boolean().default(false),

  // Additional Metadata
  campaignId: z.string().optional(),
  formId: z.string().optional(),
  leadSource: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),

  // Import Tracking
  importSource: z.string().default("war_chest"),
  importBatch: z.string().optional(),
});

const BatchConsentImportSchema = z.object({
  batchId: z.string().min(1),
  source: z.string().default("war_chest"),
  events: z.array(ConsentEventSchema),
  processingMode: z
    .enum(["validate_only", "import", "merge"])
    .default("import"),
  duplicateHandling: z
    .enum(["skip", "merge", "create_new", "error"])
    .default("skip"),
});

// Evidence Hash Generator
class EvidenceHashGenerator {
  static generateHash(event: any): string {
    // Create a comprehensive hash for legal evidence
    const evidenceData = {
      customerId: event.customerId,
      eventType: event.eventType,
      consentStatus: event.consentStatus,
      timestamp: event.timestamp,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      consentMethod: event.consentMethod,
      documentVersion: event.documentVersion,
      sourceUrl: event.sourceUrl,
      doubleOptIn: event.doubleOptIn,
    };

    const dataString = JSON.stringify(
      evidenceData,
      Object.keys(evidenceData).sort(),
    );
    return crypto.createHash("sha256").update(dataString).digest("hex");
  }

  static generateSecureStorage(hash: string): any {
    return {
      location: `evidence_vault/${hash.substring(0, 4)}/${hash}`,
      retentionPeriod: 2555, // 7 years in days
      encryptionMethod: "AES-256-GCM",
    };
  }
}

// Consent Validator
class ConsentValidator {
  static validateEvent(event: any): {
    valid: boolean;
    issues: string[];
    score: number;
  } {
    const issues: string[] = [];
    let score = 100;

    // Required legal elements
    if (!event.ipAddress) {
      issues.push("Missing IP address for legal proof");
      score -= 20;
    }

    if (!event.userAgent) {
      issues.push("Missing user agent for device identification");
      score -= 15;
    }

    if (!event.timestamp) {
      issues.push("Missing timestamp for temporal proof");
      score -= 25;
    }

    // TCPA compliance for SMS/Phone
    if (
      ["sms_marketing_consent", "auto_dialer_consent"].includes(event.eventType)
    ) {
      if (!event.tcpaCompliant) {
        issues.push("TCPA compliance not verified for SMS/phone consent");
        score -= 30;
      }

      if (!event.doubleOptIn && event.consentMethod !== "phone_verbal") {
        issues.push("SMS consent should use double opt-in for TCPA compliance");
        score -= 20;
      }
    }

    // GDPR compliance
    if (
      event.geoLocation?.country &&
      ["DE", "FR", "IT", "ES", "NL", "BE", "AT"].includes(
        event.geoLocation.country,
      )
    ) {
      if (!event.gdprLawfulBasis) {
        issues.push("GDPR lawful basis required for EU residents");
        score -= 25;
      }

      if (
        event.eventType === "email_marketing_consent" &&
        event.gdprLawfulBasis !== "consent"
      ) {
        issues.push("Email marketing requires explicit consent under GDPR");
        score -= 20;
      }
    }

    // CAN-SPAM compliance for email
    if (event.eventType === "email_marketing_consent") {
      if (!event.canSpamCompliant) {
        issues.push("CAN-SPAM compliance not verified for email consent");
        score -= 15;
      }
    }

    // Document version tracking
    if (
      ["terms_of_service_acceptance", "privacy_policy_acceptance"].includes(
        event.eventType,
      )
    ) {
      if (!event.documentVersion) {
        issues.push(
          "Document version required for TOS/Privacy Policy acceptance",
        );
        score -= 15;
      }
    }

    // Double opt-in validation
    if (event.doubleOptIn && !event.doubleOptInConfirmedAt) {
      issues.push("Double opt-in marked but no confirmation timestamp");
      score -= 20;
    }

    // Geographic data quality
    if (
      event.geoLocation &&
      (!event.geoLocation.country || !event.geoLocation.timezone)
    ) {
      issues.push("Incomplete geographic data for compliance tracking");
      score -= 10;
    }

    return {
      valid: issues.length === 0,
      issues: issues,
      score: Math.max(0, score),
    };
  }
}

// Compliance Analyzer
class ComplianceAnalyzer {
  static analyzeCustomerConsent(customerId: string, events: any[]): any {
    const analysis = {
      customerId: customerId,
      totalEvents: events.length,
      activeConsents: {},
      complianceStatus: {
        tcpa: false,
        gdpr: false,
        canSpam: false,
        ccpa: false,
      },
      riskFactors: [] as string[],
      evidenceQuality: 0,
      lastUpdated: new Date().toISOString(),
    };

    // Analyze each event type
    const eventsByType = events.reduce((acc: any, event) => {
      if (!acc[event.eventType]) acc[event.eventType] = [];
      acc[event.eventType].push(event);
      return acc;
    }, {});

    // Check current consent status
    Object.keys(eventsByType).forEach((eventType) => {
      const typeEvents = eventsByType[eventType].sort(
        (a: any, b: any) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      const latestEvent = typeEvents[0];
      analysis.activeConsents[eventType] = {
        status: latestEvent.consentStatus,
        timestamp: latestEvent.timestamp,
        method: latestEvent.consentMethod,
        doubleOptIn: latestEvent.doubleOptIn,
        evidenceHash: latestEvent.evidenceHash,
      };
    });

    // TCPA Compliance Check
    const smsConsent = analysis.activeConsents["sms_marketing_consent"];
    const autoDialerConsent = analysis.activeConsents["auto_dialer_consent"];

    if (
      (smsConsent?.status || autoDialerConsent?.status) &&
      (smsConsent?.doubleOptIn || autoDialerConsent?.doubleOptIn)
    ) {
      analysis.complianceStatus.tcpa = true;
    }

    // GDPR Compliance Check
    const emailConsent = analysis.activeConsents["email_marketing_consent"];
    const dataProcessingConsent =
      analysis.activeConsents["data_processing_consent"];

    if (emailConsent?.status && dataProcessingConsent?.status) {
      analysis.complianceStatus.gdpr = true;
    }

    // CAN-SPAM Compliance
    if (emailConsent?.status) {
      analysis.complianceStatus.canSpam = true;
    }

    // Evidence Quality Score
    const validationScores = events.map(
      (event) => ConsentValidator.validateEvent(event).score,
    );
    analysis.evidenceQuality =
      validationScores.length > 0
        ? Math.round(
            validationScores.reduce((sum, score) => sum + score, 0) /
              validationScores.length,
          )
        : 0;

    // Risk Factors
    if (analysis.evidenceQuality < 70) {
      analysis.riskFactors.push("Low evidence quality score");
    }

    if (
      !analysis.complianceStatus.tcpa &&
      (smsConsent?.status || autoDialerConsent?.status)
    ) {
      analysis.riskFactors.push("SMS consent without TCPA compliance");
    }

    if (events.some((e) => !e.evidenceHash)) {
      analysis.riskFactors.push(
        "Missing evidence hashes for dispute protection",
      );
    }

    const withdrawalEvents = events.filter((e) => e.withdrawnAt);
    if (withdrawalEvents.length > events.length * 0.3) {
      analysis.riskFactors.push("High consent withdrawal rate");
    }

    return analysis;
  }
}

/**
 * Import single consent/TOS event
 */
router.post("/import-event", async (req, res) => {
  try {
    const validatedEvent = ConsentEventSchema.parse(req.body);

    console.log(
      `✅ Processing consent event: ${validatedEvent.eventId} for customer ${validatedEvent.customerId}`,
    );

    // Generate evidence hash
    (validatedEvent as any).evidenceHash =
      EvidenceHashGenerator.generateHash(validatedEvent);
    (validatedEvent as any).evidenceStorage =
      EvidenceHashGenerator.generateSecureStorage((validatedEvent as any).evidenceHash);

    // Validate compliance requirements
    const validation = ConsentValidator.validateEvent(validatedEvent);

    if (!validation.valid) {
      console.warn(
        `⚠️ Validation issues found: ${validation.issues.join(", ")}`,
      );
    }

    // Check for duplicate events
    const existingEvents = await getConvexClient().queryRecords("consent_tos_events", {
      eventId: validatedEvent.eventId,
    });

    if (existingEvents.length > 0) {
      return res.json({
        success: false,
        message: "Duplicate event ID detected",
        action: "duplicate_detected",
        eventId: validatedEvent.eventId,
        existingEventId: existingEvents[0].id,
      });
    }

    // Add import metadata
    (validatedEvent as any).importedAt = new Date().toISOString();
    (validatedEvent as any).validationScore = validation.score;
    (validatedEvent as any).validationIssues = validation.issues;

    // Save to Convex
    const savedEvent = await getConvexClient().createRecord(
      "consent_tos_events",
      validatedEvent,
    );

    // Update customer's consent summary
    await updateCustomerConsentSummary(validatedEvent.customerId);

    // Log compliance audit
    await getConvexClient().createRecord("compliance_audit_log", {
      eventType: "consent_import",
      customerId: validatedEvent.customerId,
      eventId: validatedEvent.eventId,
      complianceScore: validation.score,
      riskFactors: validation.issues,
      evidenceHash: validatedEvent.evidenceHash,
      importedAt: new Date().toISOString(),
    });

    console.log(`✅ Consent event imported successfully: ${savedEvent.id}`);

    res.json({
      success: true,
      message: "Consent event imported successfully",
      eventId: savedEvent.id,
      originalEventId: validatedEvent.eventId,
      validationScore: validation.score,
      complianceIssues: validation.issues,
      evidenceHash: validatedEvent.evidenceHash,
    });
  } catch (error: any) {
    console.error("❌ Consent event import error:", error.message);

    res.status(400).json({
      success: false,
      message: "Consent event import failed",
      error: error.message,
      details: error.errors || null,
    });
  }
});

/**
 * Batch import consent/TOS events
 */
router.post("/batch-import", async (req, res) => {
  try {
    const validatedBatch = BatchConsentImportSchema.parse(req.body);

    console.log(
      `📦 Processing consent batch: ${validatedBatch.batchId} with ${validatedBatch.events.length} events`,
    );

    const results = {
      batchId: validatedBatch.batchId,
      totalEvents: validatedBatch.events.length,
      successful: 0,
      failed: 0,
      duplicates: 0,
      skipped: 0,
      averageComplianceScore: 0,
      results: [] as any[],
    };

    // Create batch record
    const batchRecord = await getConvexClient().createRecord("consent_import_batches", {
      batchId: validatedBatch.batchId,
      source: validatedBatch.source,
      totalRecords: validatedBatch.events.length,
      status: "processing",
      startedAt: new Date().toISOString(),
      processingMode: validatedBatch.processingMode,
    });

    let totalComplianceScore = 0;

    // Process each event
    for (let i = 0; i < validatedBatch.events.length; i++) {
      const event = validatedBatch.events[i];

      try {
        // Generate evidence hash
        (event as any).evidenceHash = EvidenceHashGenerator.generateHash(event);
        (event as any).evidenceStorage = EvidenceHashGenerator.generateSecureStorage(
          (event as any).evidenceHash,
        );

        // Validate compliance
        const validation = ConsentValidator.validateEvent(event);
        totalComplianceScore += validation.score;

        if (validatedBatch.processingMode === "validate_only") {
          // Just validate, don't import
          results.results.push({
            eventId: event.eventId,
            status: "validated",
            validationScore: validation.score,
            complianceIssues: validation.issues,
            evidenceHash: event.evidenceHash,
          });

          results.successful++;
        } else {
          // Check for duplicates
          const existingEvents = await getConvexClient().queryRecords(
            "consent_tos_events",
            {
              eventId: event.eventId,
            },
          );

          if (
            existingEvents.length > 0 &&
            validatedBatch.duplicateHandling === "skip"
          ) {
            results.results.push({
              eventId: event.eventId,
              status: "skipped",
              reason: "duplicate_detected",
              existingEventId: existingEvents[0].id,
            });
            results.skipped++;
            continue;
          }

          if (
            existingEvents.length > 0 &&
            validatedBatch.duplicateHandling === "error"
          ) {
            results.results.push({
              eventId: event.eventId,
              status: "failed",
              reason: "duplicate_detected",
            });
            results.failed++;
            continue;
          }

          // Add metadata and save
          (event as any).importBatch = validatedBatch.batchId;
          (event as any).importedAt = new Date().toISOString();
          (event as any).validationScore = validation.score;
          (event as any).validationIssues = validation.issues;

          const savedEvent = await getConvexClient().createRecord(
            "consent_tos_events",
            event,
          );

          results.results.push({
            eventId: event.eventId,
            status: "imported",
            xanoId: savedEvent.id,
            validationScore: validation.score,
            complianceIssues: validation.issues.length,
          });

          results.successful++;
        }

        // Progress update every 50 records
        if ((i + 1) % 50 === 0) {
          console.log(
            `📊 Progress: ${i + 1}/${validatedBatch.events.length} events processed`,
          );

          await getConvexClient().updateRecord("consent_import_batches", batchRecord.id, {
            processedRecords: i + 1,
            successfulRecords: results.successful,
            failedRecords: results.failed,
          });
        }
      } catch (error: any) {
        console.error(
          `❌ Failed to process event ${event.eventId}:`,
          error.message,
        );

        results.results.push({
          eventId: event.eventId,
          status: "failed",
          error: error.message,
        });

        results.failed++;
      }
    }

    // Calculate average compliance score
    results.averageComplianceScore =
      validatedBatch.events.length > 0
        ? Math.round(totalComplianceScore / validatedBatch.events.length)
        : 0;

    // Update batch completion
    await getConvexClient().updateRecord("consent_import_batches", batchRecord.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
      processedRecords: validatedBatch.events.length,
      successfulRecords: results.successful,
      failedRecords: results.failed,
      skippedRecords: results.skipped,
      averageComplianceScore: results.averageComplianceScore,
    });

    console.log(
      `✅ Consent batch completed: ${results.successful} successful, ${results.failed} failed, ${results.skipped} skipped`,
    );

    res.json({
      success: true,
      message: "Consent batch import completed",
      results: results,
      batchRecordId: batchRecord.id,
    });
  } catch (error: any) {
    console.error("❌ Consent batch import error:", error.message);

    res.status(400).json({
      success: false,
      message: "Consent batch import failed",
      error: error.message,
    });
  }
});

/**
 * Get customer consent analysis
 */
router.get("/customer/:customerId/analysis", async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get all consent events for customer
    const events = await getConvexClient().queryRecords("consent_tos_events", {
      customerId: customerId,
    });

    if (events.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No consent events found for customer",
      });
    }

    // Analyze compliance status
    const analysis = ComplianceAnalyzer.analyzeCustomerConsent(
      customerId,
      events,
    );

    // Get recent compliance audit logs
    const auditLogs = await getConvexClient().queryRecords("compliance_audit_log", {
      customerId: customerId,
    });

    res.json({
      success: true,
      analysis: analysis,
      events: events,
      auditLogs: auditLogs.slice(-10), // Last 10 audit entries
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Generate compliance report for dispute protection
 */
router.get("/compliance-report/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const { eventTypes } = req.query;

    let events = await getConvexClient().queryRecords("consent_tos_events", {
      customerId: customerId,
    });

    // Filter by event types if specified
    if (eventTypes) {
      const typeFilter = (eventTypes as string).split(",");
      events = events.filter((e: any) => typeFilter.includes(e.eventType));
    }

    const report = {
      customerId: customerId,
      reportGenerated: new Date().toISOString(),
      totalEvents: events.length,
      complianceStatus: ComplianceAnalyzer.analyzeCustomerConsent(
        customerId,
        events,
      ),
      evidenceChain: events.map((event: any) => ({
        eventId: event.eventId,
        eventType: event.eventType,
        consentStatus: event.consentStatus,
        timestamp: event.timestamp,
        ipAddress: event.ipAddress,
        evidenceHash: event.evidenceHash,
        validationScore: event.validationScore,
        doubleOptIn: event.doubleOptIn,
        tcpaCompliant: event.tcpaCompliant,
        gdprLawfulBasis: event.gdprLawfulBasis,
      })),
      legalSummary: {
        canContact: false,
        tcpaCompliant: false,
        gdprCompliant: false,
        evidenceQuality: "unknown",
        lastConsentDate: null,
        disputeReadiness: "low",
      },
    };

    // Determine if we can legally contact
    const activeEmailConsent = events.find(
      (e: any) =>
        e.eventType === "email_marketing_consent" &&
        e.consentStatus &&
        !e.withdrawnAt,
    );

    const activeSmsConsent = events.find(
      (e: any) =>
        e.eventType === "sms_marketing_consent" &&
        e.consentStatus &&
        !e.withdrawnAt,
    );

    report.legalSummary.canContact = !!(activeEmailConsent || activeSmsConsent);
    report.legalSummary.tcpaCompliant = !!(
      activeSmsConsent?.tcpaCompliant && activeSmsConsent?.doubleOptIn
    );
    report.legalSummary.gdprCompliant = !!(
      activeEmailConsent?.gdprLawfulBasis === "consent"
    );

    // Evidence quality assessment
    const avgValidationScore =
      events.length > 0
        ? events.reduce(
            (sum: number, e: any) => sum + (e.validationScore || 0),
            0,
          ) / events.length
        : 0;

    if (avgValidationScore >= 85)
      report.legalSummary.evidenceQuality = "excellent";
    else if (avgValidationScore >= 70)
      report.legalSummary.evidenceQuality = "good";
    else if (avgValidationScore >= 50)
      report.legalSummary.evidenceQuality = "fair";
    else report.legalSummary.evidenceQuality = "poor";

    // Dispute readiness
    const hasEvidenceHashes = events.every((e: any) => e.evidenceHash);
    const hasRecentConsent = events.some(
      (e: any) =>
        new Date(e.timestamp) >
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Within 1 year
    );

    if (hasEvidenceHashes && hasRecentConsent && avgValidationScore >= 80) {
      report.legalSummary.disputeReadiness = "high";
    } else if (hasEvidenceHashes && avgValidationScore >= 60) {
      report.legalSummary.disputeReadiness = "medium";
    } else {
      report.legalSummary.disputeReadiness = "low";
    }

    // Last consent date
    const sortedEvents = events.sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    if (sortedEvents.length > 0) {
      report.legalSummary.lastConsentDate = sortedEvents[0].timestamp;
    }

    res.json({
      success: true,
      report: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Update customer consent summary (internal helper)
 */
async function updateCustomerConsentSummary(customerId: string) {
  try {
    // Get all events for this customer
    const events = await getConvexClient().queryRecords("consent_tos_events", {
      customerId: customerId,
    });

    // Analyze current status
    const analysis = ComplianceAnalyzer.analyzeCustomerConsent(
      customerId,
      events,
    );

    // Update or create consent summary record
    const existingSummary = await getConvexClient().queryRecords(
      "customer_consent_summary",
      {
        customerId: customerId,
      },
    );

    const summaryData = {
      customerId: customerId,
      totalEvents: analysis.totalEvents,
      activeConsents: analysis.activeConsents,
      complianceStatus: analysis.complianceStatus,
      evidenceQuality: analysis.evidenceQuality,
      riskFactors: analysis.riskFactors,
      lastUpdated: analysis.lastUpdated,
    };

    if (existingSummary.length > 0) {
      await getConvexClient().updateRecord(
        "customer_consent_summary",
        existingSummary[0].id,
        summaryData,
      );
    } else {
      await getConvexClient().createRecord("customer_consent_summary", summaryData);
    }
  } catch (error: any) {
    console.error(
      `⚠️ Failed to update consent summary for ${customerId}:`,
      error.message,
    );
  }
}

export default router;

import express from "express";
import { z } from "zod";
import { getConvexClient } from "../../shared/convex-client";

const router = express.Router();

// Customer Master Import Validation Schema
const CustomerMasterSchema = z.object({
  // Core Identity
  customerId: z.string().min(1),
  legalFirstName: z.string().min(1),
  legalLastName: z.string().min(1),
  emailAddress: z.string().email(),
  phoneNumber: z.string().regex(/^\+?[\d\s\-\(\)]+$/),

  // Additional Identity
  middleName: z.string().optional(),
  suffix: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  socialSecurityLastFour: z.string().length(4).optional(),

  // Address Information
  billingAddress: z.object({
    street1: z.string().min(1),
    street2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().length(2),
    zipCode: z.string().min(5),
    country: z.string().default("US"),
  }),

  // Legal & Compliance
  kycStatus: z
    .enum(["verified", "pending", "failed", "not_required"])
    .default("pending"),
  amlStatus: z
    .enum(["clear", "flagged", "under_review", "rejected"])
    .default("clear"),
  consentToSMarketingDate: z.string().datetime().optional(),
  consentToEmail: z.boolean().default(false),
  consentToSMS: z.boolean().default(false),
  consentToAutoDialer: z.boolean().default(false),
  tcpaConsentDate: z.string().datetime().optional(),
  privacyPolicyAcceptedDate: z.string().datetime().optional(),

  // Financial Information
  estimatedAnnualIncome: z.number().optional(),
  bankAccountType: z
    .enum(["checking", "savings", "business", "unknown"])
    .optional(),
  creditScore: z.number().min(300).max(850).optional(),

  // Historical Data
  customerSince: z.string().datetime(),
  lastLoginDate: z.string().datetime().optional(),
  totalLifetimeValue: z.number().default(0),
  totalTransactions: z.number().default(0),
  lastTransactionDate: z.string().datetime().optional(),

  // Risk Assessment
  fraudScore: z.number().min(0).max(100).default(0),
  chargebackHistory: z.number().default(0),
  disputeHistory: z.number().default(0),
  riskTier: z.enum(["low", "medium", "high", "blocked"]).default("low"),

  // Account Status
  accountStatus: z
    .enum(["active", "suspended", "closed", "pending_verification"])
    .default("active"),
  suspensionReason: z.string().optional(),
  closureDate: z.string().datetime().optional(),
  closureReason: z.string().optional(),

  // Communication Preferences
  preferredLanguage: z.string().default("en"),
  timezone: z.string().default("America/New_York"),
  communicationFrequency: z
    .enum(["daily", "weekly", "monthly", "never"])
    .default("weekly"),

  // Source Tracking
  acquisitionChannel: z.string().optional(),
  referralSource: z.string().optional(),
  campaignId: z.string().optional(),

  // Data Quality
  dataQualityScore: z.number().min(0).max(100).default(50),
  lastVerificationDate: z.string().datetime().optional(),
  verificationMethod: z
    .enum(["manual", "automated", "third_party", "none"])
    .default("none"),

  // Additional Metadata
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  importSource: z.string().default("war_chest"),
  importBatch: z.string().optional(),
});

const BatchImportSchema = z.object({
  batchId: z.string().min(1),
  source: z.string().default("war_chest"),
  customers: z.array(CustomerMasterSchema),
  processingMode: z
    .enum(["validate_only", "import", "merge"])
    .default("import"),
  duplicateHandling: z
    .enum(["skip", "merge", "create_new", "error"])
    .default("merge"),
});

// Duplicate Detection Algorithm
class DuplicateDetector {
  static async findPotentialDuplicates(customer: any): Promise<any[]> {
    const potentialDupes = [];

    // Exact email match
    try {
      const emailMatches = await getConvexClient().queryRecords("customer_master", {
        emailAddress: customer.emailAddress,
      });
      potentialDupes.push(
        ...emailMatches.map((m: any) => ({
          ...m,
          matchType: "email_exact",
          confidence: 0.95,
        })),
      );
    } catch (e) {}

    // Phone number match
    try {
      const phoneMatches = await getConvexClient().queryRecords("customer_master", {
        phoneNumber: customer.phoneNumber,
      });
      potentialDupes.push(
        ...phoneMatches.map((m: any) => ({
          ...m,
          matchType: "phone_exact",
          confidence: 0.9,
        })),
      );
    } catch (e) {}

    // Name + Address fuzzy match
    try {
      const nameAddressMatches = await getConvexClient().queryRecords(
        "customer_master",
        {},
      );
      const fuzzyMatches = nameAddressMatches.filter((existing: any) => {
        const nameScore = this.calculateNameSimilarity(
          `${customer.legalFirstName} ${customer.legalLastName}`,
          `${existing.legalFirstName} ${existing.legalLastName}`,
        );
        const addressScore = this.calculateAddressSimilarity(
          customer.billingAddress,
          existing.billingAddress,
        );
        return nameScore > 0.8 && addressScore > 0.7;
      });
      potentialDupes.push(
        ...fuzzyMatches.map((m: any) => ({
          ...m,
          matchType: "name_address_fuzzy",
          confidence: 0.75,
        })),
      );
    } catch (e) {}

    // SSN Last 4 match
    if (customer.socialSecurityLastFour) {
      try {
        const ssnMatches = await getConvexClient().queryRecords("customer_master", {
          socialSecurityLastFour: customer.socialSecurityLastFour,
        });
        potentialDupes.push(
          ...ssnMatches.map((m: any) => ({
            ...m,
            matchType: "ssn_last4",
            confidence: 0.85,
          })),
        );
      } catch (e) {}
    }

    // Remove exact duplicates and sort by confidence
    const uniqueDupes = potentialDupes.filter(
      (dupe, index, self) =>
        index === self.findIndex((d) => d.customerId === dupe.customerId),
    );

    return uniqueDupes.sort((a, b) => b.confidence - a.confidence);
  }

  private static calculateNameSimilarity(name1: string, name2: string): number {
    // Simple Levenshtein distance implementation
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z]/g, "");
    const n1 = normalize(name1);
    const n2 = normalize(name2);

    if (n1 === n2) return 1.0;
    if (n1.length === 0 || n2.length === 0) return 0.0;

    const matrix = Array(n2.length + 1)
      .fill(null)
      .map(() => Array(n1.length + 1).fill(null));

    for (let i = 0; i <= n1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= n2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= n2.length; j++) {
      for (let i = 1; i <= n1.length; i++) {
        const indicator = n1[i - 1] === n2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    const distance = matrix[n2.length][n1.length];
    return 1 - distance / Math.max(n1.length, n2.length);
  }

  private static calculateAddressSimilarity(addr1: any, addr2: any): number {
    if (!addr1 || !addr2) return 0.0;

    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, "");

    const street1Score = this.calculateNameSimilarity(
      normalize(addr1.street1),
      normalize(addr2.street1),
    );
    const cityScore =
      normalize(addr1.city) === normalize(addr2.city) ? 1.0 : 0.0;
    const stateScore = addr1.state === addr2.state ? 1.0 : 0.0;
    const zipScore = addr1.zipCode === addr2.zipCode ? 1.0 : 0.0;

    return (
      street1Score * 0.4 + cityScore * 0.2 + stateScore * 0.2 + zipScore * 0.2
    );
  }
}

// Data Quality Scorer
class DataQualityScorer {
  static calculateScore(customer: any): number {
    let score = 0;
    let maxScore = 0;

    // Required fields (40 points)
    maxScore += 40;
    if (customer.legalFirstName?.length > 0) score += 10;
    if (customer.legalLastName?.length > 0) score += 10;
    if (
      customer.emailAddress?.includes("@") &&
      customer.emailAddress?.includes(".")
    )
      score += 10;
    if (customer.phoneNumber?.length >= 10) score += 10;

    // Address completeness (20 points)
    maxScore += 20;
    if (customer.billingAddress?.street1?.length > 0) score += 5;
    if (customer.billingAddress?.city?.length > 0) score += 5;
    if (customer.billingAddress?.state?.length === 2) score += 5;
    if (customer.billingAddress?.zipCode?.length >= 5) score += 5;

    // Legal compliance (20 points)
    maxScore += 20;
    if (customer.kycStatus === "verified") score += 10;
    if (customer.consentToEmail || customer.consentToSMS) score += 5;
    if (customer.privacyPolicyAcceptedDate) score += 5;

    // Historical data (10 points)
    maxScore += 10;
    if (customer.totalLifetimeValue > 0) score += 5;
    if (customer.lastTransactionDate) score += 5;

    // Risk assessment (10 points)
    maxScore += 10;
    if (customer.fraudScore <= 20) score += 5;
    if (customer.chargebackHistory === 0) score += 5;

    return Math.round((score / maxScore) * 100);
  }
}

// Data Enrichment Engine
class DataEnrichmentEngine {
  static async enrichCustomerData(customer: any): Promise<any> {
    const enriched = { ...customer };

    // Calculate data quality score
    enriched.dataQualityScore = DataQualityScorer.calculateScore(customer);

    // Infer missing data
    if (!enriched.timezone && enriched.billingAddress?.state) {
      enriched.timezone = this.inferTimezoneFromState(
        enriched.billingAddress.state,
      );
    }

    // Set risk tier based on fraud score and history
    if (enriched.fraudScore >= 70 || enriched.chargebackHistory >= 3) {
      enriched.riskTier = "high";
    } else if (enriched.fraudScore >= 40 || enriched.chargebackHistory >= 1) {
      enriched.riskTier = "medium";
    } else {
      enriched.riskTier = "low";
    }

    // Add tags based on profile
    enriched.tags = enriched.tags || [];

    if (enriched.totalLifetimeValue > 10000) {
      enriched.tags.push("high_value");
    }

    if (enriched.totalTransactions > 50) {
      enriched.tags.push("frequent_customer");
    }

    if (enriched.chargebackHistory === 0 && enriched.totalTransactions > 10) {
      enriched.tags.push("reliable");
    }

    if (enriched.kycStatus === "verified" && enriched.fraudScore < 20) {
      enriched.tags.push("verified_low_risk");
    }

    // Set verification status
    if (enriched.kycStatus === "verified" && enriched.dataQualityScore >= 80) {
      enriched.verificationMethod = "automated";
      enriched.lastVerificationDate = new Date().toISOString();
    }

    return enriched;
  }

  private static inferTimezoneFromState(state: string): string {
    const timezoneMap: Record<string, string> = {
      CA: "America/Los_Angeles",
      WA: "America/Los_Angeles",
      OR: "America/Los_Angeles",
      AZ: "America/Phoenix",
      NV: "America/Los_Angeles",
      UT: "America/Denver",
      CO: "America/Denver",
      WY: "America/Denver",
      MT: "America/Denver",
      ND: "America/Chicago",
      SD: "America/Chicago",
      NE: "America/Chicago",
      KS: "America/Chicago",
      OK: "America/Chicago",
      TX: "America/Chicago",
      MN: "America/Chicago",
      IA: "America/Chicago",
      MO: "America/Chicago",
      AR: "America/Chicago",
      LA: "America/Chicago",
      WI: "America/Chicago",
      IL: "America/Chicago",
      MS: "America/Chicago",
      AL: "America/Chicago",
      TN: "America/Chicago",
      KY: "America/New_York",
      IN: "America/New_York",
      OH: "America/New_York",
      MI: "America/New_York",
      GA: "America/New_York",
      FL: "America/New_York",
      SC: "America/New_York",
      NC: "America/New_York",
      VA: "America/New_York",
      WV: "America/New_York",
      MD: "America/New_York",
      DE: "America/New_York",
      PA: "America/New_York",
      NJ: "America/New_York",
      NY: "America/New_York",
      CT: "America/New_York",
      RI: "America/New_York",
      MA: "America/New_York",
      VT: "America/New_York",
      NH: "America/New_York",
      ME: "America/New_York",
      AK: "America/Anchorage",
      HI: "Pacific/Honolulu",
    };

    return timezoneMap[state] || "America/New_York";
  }
}

/**
 * Import single customer master record
 */
router.post("/import-customer", async (req, res) => {
  try {
    const validatedCustomer = CustomerMasterSchema.parse(req.body);

    console.log(`👤 Processing customer: ${validatedCustomer.customerId}`);

    // Check for duplicates
    const duplicates =
      await DuplicateDetector.findPotentialDuplicates(validatedCustomer);

    if (duplicates.length > 0) {
      console.log(`🔍 Found ${duplicates.length} potential duplicates`);

      const highConfidenceDupe = duplicates.find((d) => d.confidence >= 0.9);
      if (highConfidenceDupe) {
        return res.json({
          success: false,
          message: "High confidence duplicate detected",
          action: "duplicate_detected",
          customerId: validatedCustomer.customerId,
          duplicateCustomerId: highConfidenceDupe.customerId,
          confidence: highConfidenceDupe.confidence,
          matchType: highConfidenceDupe.matchType,
          requiresManualReview: true,
        });
      }
    }

    // Enrich customer data
    const enrichedCustomer =
      await DataEnrichmentEngine.enrichCustomerData(validatedCustomer);

    // Add import metadata
    (enrichedCustomer as any).importedAt = new Date().toISOString();
    (enrichedCustomer as any).lastUpdatedAt = new Date().toISOString();
    (enrichedCustomer as any).version = 1;

    // Save to Xano
    const savedCustomer = await getConvexClient().createRecord(
      "customer_master",
      enrichedCustomer,
    );

    // Log import event
    await getConvexClient().createRecord("import_audit_log", {
      entityType: "customer_master",
      entityId: savedCustomer.id,
      action: "import",
      sourceData: JSON.stringify(validatedCustomer),
      enrichedData: JSON.stringify(enrichedCustomer),
      duplicatesFound: duplicates.length,
      dataQualityScore: enrichedCustomer.dataQualityScore,
      importedAt: new Date().toISOString(),
    });

    console.log(`✅ Customer imported successfully: ${savedCustomer.id}`);

    res.json({
      success: true,
      message: "Customer imported successfully",
      customerId: savedCustomer.id,
      originalCustomerId: validatedCustomer.customerId,
      dataQualityScore: enrichedCustomer.dataQualityScore,
      riskTier: enrichedCustomer.riskTier,
      duplicatesFound: duplicates.length,
      tags: enrichedCustomer.tags,
    });
  } catch (error: any) {
    console.error("❌ Customer import error:", error.message);

    res.status(400).json({
      success: false,
      message: "Customer import failed",
      error: error.message,
      details: error.errors || null,
    });
  }
});

/**
 * Batch import customer master records
 */
router.post("/batch-import", async (req, res) => {
  try {
    const validatedBatch = BatchImportSchema.parse(req.body);

    console.log(
      `📦 Processing batch: ${validatedBatch.batchId} with ${validatedBatch.customers.length} customers`,
    );

    const results = {
      batchId: validatedBatch.batchId,
      totalCustomers: validatedBatch.customers.length,
      successful: 0,
      failed: 0,
      duplicates: 0,
      skipped: 0,
      results: [] as any[],
    };

    // Create batch record
    const batchRecord = await getConvexClient().createRecord("import_batches", {
      batchId: validatedBatch.batchId,
      source: validatedBatch.source,
      totalRecords: validatedBatch.customers.length,
      status: "processing",
      startedAt: new Date().toISOString(),
      processingMode: validatedBatch.processingMode,
    });

    // Process each customer
    for (let i = 0; i < validatedBatch.customers.length; i++) {
      const customer = validatedBatch.customers[i];

      try {
        if (validatedBatch.processingMode === "validate_only") {
          // Just validate, don't import
          const enriched =
            await DataEnrichmentEngine.enrichCustomerData(customer);
          const duplicates =
            await DuplicateDetector.findPotentialDuplicates(customer);

          results.results.push({
            customerId: customer.customerId,
            status: "validated",
            dataQualityScore: enriched.dataQualityScore,
            duplicatesFound: duplicates.length,
            riskTier: enriched.riskTier,
          });

          results.successful++;
        } else {
          // Check duplicates first
          const duplicates =
            await DuplicateDetector.findPotentialDuplicates(customer);
          const highConfidenceDupe = duplicates.find(
            (d) => d.confidence >= 0.9,
          );

          if (
            highConfidenceDupe &&
            validatedBatch.duplicateHandling === "skip"
          ) {
            results.results.push({
              customerId: customer.customerId,
              status: "skipped",
              reason: "duplicate_detected",
              duplicateCustomerId: highConfidenceDupe.customerId,
            });
            results.skipped++;
            continue;
          }

          if (
            highConfidenceDupe &&
            validatedBatch.duplicateHandling === "error"
          ) {
            results.results.push({
              customerId: customer.customerId,
              status: "failed",
              reason: "duplicate_detected",
              duplicateCustomerId: highConfidenceDupe.customerId,
            });
            results.failed++;
            continue;
          }

          // Enrich and save
          const enriched =
            await DataEnrichmentEngine.enrichCustomerData(customer);
          (enriched as any).importBatch = validatedBatch.batchId;
          (enriched as any).importedAt = new Date().toISOString();

          let savedCustomer;

          if (
            highConfidenceDupe &&
            validatedBatch.duplicateHandling === "merge"
          ) {
            // Merge with existing record
            const mergedData = { ...highConfidenceDupe, ...enriched };
            (mergedData as any).version = (highConfidenceDupe.version || 0) + 1;
            (mergedData as any).lastUpdatedAt = new Date().toISOString();

            savedCustomer = await getConvexClient().updateRecord(
              "customer_master",
              highConfidenceDupe.id,
              mergedData,
            );

            results.results.push({
              customerId: customer.customerId,
              status: "merged",
              xanoId: savedCustomer.id,
              mergedWithCustomerId: highConfidenceDupe.customerId,
              dataQualityScore: enriched.dataQualityScore,
            });
          } else {
            // Create new record
            savedCustomer = await getConvexClient().createRecord(
              "customer_master",
              enriched,
            );

            results.results.push({
              customerId: customer.customerId,
              status: "imported",
              xanoId: savedCustomer.id,
              dataQualityScore: enriched.dataQualityScore,
              duplicatesFound: duplicates.length,
            });
          }

          results.successful++;
        }

        // Progress update every 100 records
        if ((i + 1) % 100 === 0) {
          console.log(
            `📊 Progress: ${i + 1}/${validatedBatch.customers.length} customers processed`,
          );

          // Update batch progress
          await getConvexClient().updateRecord("import_batches", batchRecord.id, {
            processedRecords: i + 1,
            successfulRecords: results.successful,
            failedRecords: results.failed,
          });
        }
      } catch (error: any) {
        console.error(
          `❌ Failed to process customer ${customer.customerId}:`,
          error.message,
        );

        results.results.push({
          customerId: customer.customerId,
          status: "failed",
          error: error.message,
        });

        results.failed++;
      }
    }

    // Update batch completion
    await getConvexClient().updateRecord("import_batches", batchRecord.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
      processedRecords: validatedBatch.customers.length,
      successfulRecords: results.successful,
      failedRecords: results.failed,
      skippedRecords: results.skipped,
    });

    console.log(
      `✅ Batch completed: ${results.successful} successful, ${results.failed} failed, ${results.skipped} skipped`,
    );

    res.json({
      success: true,
      message: "Batch import completed",
      results: results,
      batchRecordId: batchRecord.id,
    });
  } catch (error: any) {
    console.error("❌ Batch import error:", error.message);

    res.status(400).json({
      success: false,
      message: "Batch import failed",
      error: error.message,
    });
  }
});

/**
 * Get customer master record with enriched data
 */
router.get("/customer/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;

    const customers = await getConvexClient().queryRecords("customer_master", {
      customerId: customerId,
    });

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = customers[0];

    // Get related data
    const [auditLogs, duplicateChecks] = await Promise.all([
      getConvexClient().queryRecords("import_audit_log", { entityId: customer.id }),
      DuplicateDetector.findPotentialDuplicates(customer),
    ]);

    res.json({
      success: true,
      customer: customer,
      auditLogs: auditLogs,
      potentialDuplicates: duplicateChecks,
      dataQuality: {
        score: customer.dataQualityScore,
        verified: customer.verificationMethod !== "none",
        lastVerified: customer.lastVerificationDate,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get import batch status and results
 */
router.get("/batch/:batchId", async (req, res) => {
  try {
    const { batchId } = req.params;

    const batches = await getConvexClient().queryRecords("import_batches", {
      batchId: batchId,
    });

    if (batches.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    const batch = batches[0];

    // Get customers from this batch
    const customers = await getConvexClient().queryRecords("customer_master", {
      importBatch: batchId,
    });

    // Get audit logs for this batch
    const auditLogs = await getConvexClient().queryRecords("import_audit_log", {
      batchId: batchId,
    });

    // Calculate quality metrics
    const qualityMetrics = {
      averageDataQuality:
        customers.length > 0
          ? customers.reduce(
              (sum: number, c: any) => sum + (c.dataQualityScore || 0),
              0,
            ) / customers.length
          : 0,
      highQualityCount: customers.filter(
        (c: any) => (c.dataQualityScore || 0) >= 80,
      ).length,
      verifiedCount: customers.filter(
        (c: any) => c.verificationMethod !== "none",
      ).length,
      highRiskCount: customers.filter((c: any) => c.riskTier === "high").length,
    };

    res.json({
      success: true,
      batch: batch,
      customers: customers,
      auditLogs: auditLogs,
      qualityMetrics: qualityMetrics,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

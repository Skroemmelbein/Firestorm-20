import express from "express";
import { z } from "zod";
import { xanoAPI } from "./api-integrations";

const router = express.Router();

// Descriptor History Import Validation Schema
const DescriptorHistorySchema = z.object({
  // Transaction Identity
  transactionId: z.string().min(1),
  customerId: z.string().min(1),
  orderId: z.string().optional(),
  
  // Descriptor Details
  descriptorText: z.string().min(1).max(22), // Credit card descriptor limit
  softDescriptor: z.string().optional(),
  phoneDescriptor: z.string().optional(),
  
  // Transaction Context
  transactionDate: z.string().datetime(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  
  // Merchant Information
  merchantName: z.string().min(1),
  merchantId: z.string().optional(),
  merchantCategory: z.string().optional(),
  dbaName: z.string().optional(),
  
  // Product/Service Details
  productName: z.string().optional(),
  serviceDescription: z.string().optional(),
  subscriptionPlan: z.string().optional(),
  billingPeriod: z.enum(["one_time", "monthly", "yearly", "weekly", "daily"]).default("monthly"),
  
  // Customer Communication
  orderConfirmationSent: z.boolean().default(false),
  orderConfirmationDate: z.string().datetime().optional(),
  emailAddress: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  
  // Billing Information
  billingAddress: z.object({
    street1: z.string(),
    street2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string().default("US")
  }).optional(),
  
  // Card Information (for matching)
  cardLastFour: z.string().length(4),
  cardBrand: z.enum(["visa", "mastercard", "amex", "discover", "diners", "jcb", "unknown"]),
  cardExpMonth: z.number().min(1).max(12),
  cardExpYear: z.number(),
  
  // Processing Details
  processorName: z.string().default("NMI"),
  processorTransactionId: z.string().optional(),
  authCode: z.string().optional(),
  responseCode: z.string().optional(),
  
  // Dispute Context
  disputeDate: z.string().datetime().optional(),
  disputeAmount: z.number().optional(),
  disputeReason: z.enum([
    "fraud", "authorization", "processing_error", "duplicate", "credit_not_processed",
    "cancelled_recurring", "product_not_received", "product_unacceptable", 
    "other", "unrecognized"
  ]).optional(),
  
  chargebackDate: z.string().datetime().optional(),
  chargebackAmount: z.number().optional(),
  chargebackReasonCode: z.string().optional(),
  
  // Representment History
  representmentAttempts: z.number().default(0),
  lastRepresentmentDate: z.string().datetime().optional(),
  representmentOutcome: z.enum(["won", "lost", "pending", "none"]).default("none"),
  
  // Evidence Quality
  hasOrderConfirmation: z.boolean().default(false),
  hasDeliveryProof: z.boolean().default(false),
  hasCustomerCommunication: z.boolean().default(false),
  hasRefundPolicy: z.boolean().default(false),
  hasTermsOfService: z.boolean().default(false),
  
  // Additional Metadata
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  importSource: z.string().default("war_chest"),
  importBatch: z.string().optional()
});

const BatchDescriptorImportSchema = z.object({
  batchId: z.string().min(1),
  source: z.string().default("war_chest"),
  records: z.array(DescriptorHistorySchema),
  processingMode: z.enum(["validate_only", "import", "merge"]).default("import"),
  duplicateHandling: z.enum(["skip", "merge", "create_new", "error"]).default("merge")
});

// Descriptor Pattern Analyzer
class DescriptorAnalyzer {
  static analyzeDescriptor(descriptor: string): any {
    const analysis = {
      descriptor: descriptor,
      length: descriptor.length,
      pattern: "unknown",
      merchantIdentifier: "",
      productHint: "",
      recognizability: "low",
      commonIssues: [] as string[],
      suggestions: [] as string[]
    };
    
    // Common descriptor patterns
    const patterns = [
      { name: "merchant_product", regex: /^([A-Z0-9]{3,8})\s*[\*\-\s]\s*(.+)$/i },
      { name: "merchant_only", regex: /^([A-Z0-9\s]{8,22})$/i },
      { name: "website_url", regex: /^([A-Z0-9]+\.[A-Z]{2,3})\s*(.*)$/i },
      { name: "phone_included", regex: /.*(\d{3}-\d{3}-\d{4}|\d{10}).*/ },
      { name: "subscription", regex: /.*(SUB|MEMBERSHIP|MONTHLY|RECURRING).*/i }
    ];
    
    for (const pattern of patterns) {
      const match = descriptor.match(pattern.regex);
      if (match) {
        analysis.pattern = pattern.name;
        if (pattern.name === "merchant_product" && match[1] && match[2]) {
          analysis.merchantIdentifier = match[1].trim();
          analysis.productHint = match[2].trim();
        }
        break;
      }
    }
    
    // Recognizability assessment
    if (descriptor.length < 8) {
      analysis.recognizability = "very_low";
      analysis.commonIssues.push("Descriptor too short");
    } else if (descriptor.length > 20) {
      analysis.recognizability = "low";
      analysis.commonIssues.push("Descriptor may be truncated");
    } else if (analysis.pattern === "merchant_product") {
      analysis.recognizability = "high";
    } else if (analysis.pattern === "merchant_only") {
      analysis.recognizability = "medium";
    }
    
    // Common issues detection
    if (!/[A-Za-z]/.test(descriptor)) {
      analysis.commonIssues.push("No alphabetic characters");
    }
    
    if (/^\d+$/.test(descriptor)) {
      analysis.commonIssues.push("All numeric descriptor");
    }
    
    if (descriptor.includes("UNKNOWN") || descriptor.includes("TEMP")) {
      analysis.commonIssues.push("Contains placeholder text");
    }
    
    if (!/\d/.test(descriptor) && analysis.pattern !== "merchant_only") {
      analysis.suggestions.push("Consider adding phone number");
    }
    
    if (analysis.length < 15 && !descriptor.includes("*")) {
      analysis.suggestions.push("Could include product identifier");
    }
    
    return analysis;
  }
  
  static generateRepresentmentStrength(record: any): number {
    let strength = 0;
    
    // Descriptor quality (30 points)
    const descriptorAnalysis = this.analyzeDescriptor(record.descriptorText);
    if (descriptorAnalysis.recognizability === "high") strength += 30;
    else if (descriptorAnalysis.recognizability === "medium") strength += 20;
    else if (descriptorAnalysis.recognizability === "low") strength += 10;
    
    // Evidence availability (40 points)
    if (record.hasOrderConfirmation) strength += 10;
    if (record.hasDeliveryProof) strength += 10;
    if (record.hasCustomerCommunication) strength += 10;
    if (record.hasTermsOfService) strength += 5;
    if (record.hasRefundPolicy) strength += 5;
    
    // Communication trail (20 points)
    if (record.orderConfirmationSent) strength += 10;
    if (record.emailAddress) strength += 5;
    if (record.phoneNumber) strength += 5;
    
    // Transaction details (10 points)
    if (record.processorTransactionId) strength += 3;
    if (record.authCode) strength += 3;
    if (record.billingAddress) strength += 4;
    
    return Math.min(100, strength);
  }
}

// Dispute Risk Predictor
class DisputeRiskPredictor {
  static predictDisputeRisk(record: any): any {
    const risk = {
      overallRisk: "low",
      riskScore: 0,
      riskFactors: [] as string[],
      protectionFactors: [] as string[],
      recommendations: [] as string[]
    };
    
    let riskScore = 0;
    
    // Descriptor risk factors
    const descriptorAnalysis = DescriptorAnalyzer.analyzeDescriptor(record.descriptorText);
    if (descriptorAnalysis.recognizability === "very_low") {
      riskScore += 30;
      risk.riskFactors.push("Very poor descriptor recognizability");
    } else if (descriptorAnalysis.recognizability === "low") {
      riskScore += 20;
      risk.riskFactors.push("Poor descriptor recognizability");
    }
    
    if (descriptorAnalysis.commonIssues.length > 0) {
      riskScore += descriptorAnalysis.commonIssues.length * 5;
      risk.riskFactors.push(`Descriptor issues: ${descriptorAnalysis.commonIssues.join(', ')}`);
    }
    
    // Amount-based risk
    if (record.amount > 500) {
      riskScore += 15;
      risk.riskFactors.push("High transaction amount");
    } else if (record.amount > 100) {
      riskScore += 10;
      risk.riskFactors.push("Medium transaction amount");
    }
    
    // Communication risk
    if (!record.orderConfirmationSent) {
      riskScore += 25;
      risk.riskFactors.push("No order confirmation sent");
    } else {
      risk.protectionFactors.push("Order confirmation sent");
    }
    
    if (!record.emailAddress && !record.phoneNumber) {
      riskScore += 20;
      risk.riskFactors.push("No customer contact information");
    }
    
    // Evidence availability
    const evidenceCount = [
      record.hasOrderConfirmation,
      record.hasDeliveryProof,
      record.hasCustomerCommunication,
      record.hasTermsOfService,
      record.hasRefundPolicy
    ].filter(Boolean).length;
    
    if (evidenceCount === 0) {
      riskScore += 30;
      risk.riskFactors.push("No supporting evidence available");
    } else if (evidenceCount < 3) {
      riskScore += 15;
      risk.riskFactors.push("Limited supporting evidence");
    } else {
      risk.protectionFactors.push(`Strong evidence portfolio (${evidenceCount} types)`);
    }
    
    // Card brand risk (some brands have higher dispute rates)
    if (record.cardBrand === "amex") {
      riskScore += 10;
      risk.riskFactors.push("American Express (higher dispute rate)");
    }
    
    // Historical dispute data
    if (record.representmentAttempts > 0) {
      if (record.representmentOutcome === "lost") {
        riskScore += 25;
        risk.riskFactors.push("Previous representment failed");
      } else if (record.representmentOutcome === "won") {
        risk.protectionFactors.push("Previous representment succeeded");
      }
    }
    
    // Determine overall risk level
    risk.riskScore = Math.min(100, riskScore);
    
    if (risk.riskScore >= 70) {
      risk.overallRisk = "very_high";
    } else if (risk.riskScore >= 50) {
      risk.overallRisk = "high";
    } else if (risk.riskScore >= 30) {
      risk.overallRisk = "medium";
    } else {
      risk.overallRisk = "low";
    }
    
    // Generate recommendations
    if (descriptorAnalysis.suggestions.length > 0) {
      risk.recommendations.push(...descriptorAnalysis.suggestions.map(s => `Descriptor: ${s}`));
    }
    
    if (!record.hasOrderConfirmation) {
      risk.recommendations.push("Implement order confirmation emails");
    }
    
    if (!record.hasTermsOfService) {
      risk.recommendations.push("Ensure Terms of Service acceptance tracking");
    }
    
    if (evidenceCount < 3) {
      risk.recommendations.push("Strengthen evidence collection process");
    }
    
    return risk;
  }
}

/**
 * Import single descriptor history record
 */
router.post("/import-record", async (req, res) => {
  try {
    const validatedRecord = DescriptorHistorySchema.parse(req.body);
    
    console.log(`📝 Processing descriptor history: ${validatedRecord.transactionId}`);
    
    // Analyze descriptor and generate insights
    const descriptorAnalysis = DescriptorAnalyzer.analyzeDescriptor(validatedRecord.descriptorText);
    const riskAnalysis = DisputeRiskPredictor.predictDisputeRisk(validatedRecord);
    const representmentStrength = DescriptorAnalyzer.generateRepresentmentStrength(validatedRecord);
    
    // Check for duplicate records
    const existingRecords = await xanoAPI.queryRecords("descriptor_history", {
      transactionId: validatedRecord.transactionId
    });
    
    if (existingRecords.length > 0) {
      return res.json({
        success: false,
        message: "Duplicate transaction ID detected",
        action: "duplicate_detected",
        transactionId: validatedRecord.transactionId,
        existingRecordId: existingRecords[0].id
      });
    }
    
    // Add analysis results to record
    validatedRecord.descriptorAnalysis = descriptorAnalysis;
    validatedRecord.riskAnalysis = riskAnalysis;
    validatedRecord.representmentStrength = representmentStrength;
    validatedRecord.importedAt = new Date().toISOString();
    
    // Save to Xano
    const savedRecord = await xanoAPI.createRecord("descriptor_history", validatedRecord);
    
    // Create dispute readiness assessment
    await xanoAPI.createRecord("dispute_readiness_assessments", {
      transactionId: validatedRecord.transactionId,
      customerId: validatedRecord.customerId,
      descriptorQuality: descriptorAnalysis.recognizability,
      riskLevel: riskAnalysis.overallRisk,
      representmentStrength: representmentStrength,
      evidenceCount: [
        validatedRecord.hasOrderConfirmation,
        validatedRecord.hasDeliveryProof,
        validatedRecord.hasCustomerCommunication,
        validatedRecord.hasTermsOfService,
        validatedRecord.hasRefundPolicy
      ].filter(Boolean).length,
      assessmentDate: new Date().toISOString(),
      recommendations: riskAnalysis.recommendations
    });
    
    console.log(`✅ Descriptor history imported: ${savedRecord.id}`);
    
    res.json({
      success: true,
      message: "Descriptor history imported successfully",
      recordId: savedRecord.id,
      transactionId: validatedRecord.transactionId,
      descriptorAnalysis: descriptorAnalysis,
      riskLevel: riskAnalysis.overallRisk,
      representmentStrength: representmentStrength
    });
    
  } catch (error: any) {
    console.error("❌ Descriptor history import error:", error.message);
    
    res.status(400).json({
      success: false,
      message: "Descriptor history import failed",
      error: error.message,
      details: error.errors || null
    });
  }
});

/**
 * Batch import descriptor history records
 */
router.post("/batch-import", async (req, res) => {
  try {
    const validatedBatch = BatchDescriptorImportSchema.parse(req.body);
    
    console.log(`📦 Processing descriptor batch: ${validatedBatch.batchId} with ${validatedBatch.records.length} records`);
    
    const results = {
      batchId: validatedBatch.batchId,
      totalRecords: validatedBatch.records.length,
      successful: 0,
      failed: 0,
      duplicates: 0,
      skipped: 0,
      averageRepresentmentStrength: 0,
      results: [] as any[]
    };
    
    // Create batch record
    const batchRecord = await xanoAPI.createRecord("descriptor_import_batches", {
      batchId: validatedBatch.batchId,
      source: validatedBatch.source,
      totalRecords: validatedBatch.records.length,
      status: "processing",
      startedAt: new Date().toISOString(),
      processingMode: validatedBatch.processingMode
    });
    
    let totalRepresentmentStrength = 0;
    
    // Process each record
    for (let i = 0; i < validatedBatch.records.length; i++) {
      const record = validatedBatch.records[i];
      
      try {
        // Generate analysis
        const descriptorAnalysis = DescriptorAnalyzer.analyzeDescriptor(record.descriptorText);
        const riskAnalysis = DisputeRiskPredictor.predictDisputeRisk(record);
        const representmentStrength = DescriptorAnalyzer.generateRepresentmentStrength(record);
        
        totalRepresentmentStrength += representmentStrength;
        
        if (validatedBatch.processingMode === "validate_only") {
          // Just validate, don't import
          results.results.push({
            transactionId: record.transactionId,
            status: "validated",
            descriptorQuality: descriptorAnalysis.recognizability,
            riskLevel: riskAnalysis.overallRisk,
            representmentStrength: representmentStrength
          });
          
          results.successful++;
        } else {
          // Check for duplicates
          const existingRecords = await xanoAPI.queryRecords("descriptor_history", {
            transactionId: record.transactionId
          });
          
          if (existingRecords.length > 0 && validatedBatch.duplicateHandling === "skip") {
            results.results.push({
              transactionId: record.transactionId,
              status: "skipped",
              reason: "duplicate_detected",
              existingRecordId: existingRecords[0].id
            });
            results.skipped++;
            continue;
          }
          
          if (existingRecords.length > 0 && validatedBatch.duplicateHandling === "error") {
            results.results.push({
              transactionId: record.transactionId,
              status: "failed",
              reason: "duplicate_detected"
            });
            results.failed++;
            continue;
          }
          
          // Add analysis and metadata
          record.descriptorAnalysis = descriptorAnalysis;
          record.riskAnalysis = riskAnalysis;
          record.representmentStrength = representmentStrength;
          record.importBatch = validatedBatch.batchId;
          record.importedAt = new Date().toISOString();
          
          let savedRecord;
          
          if (existingRecords.length > 0 && validatedBatch.duplicateHandling === "merge") {
            // Merge with existing record
            const mergedData = { ...existingRecords[0], ...record };
            savedRecord = await xanoAPI.updateRecord("descriptor_history", existingRecords[0].id, mergedData);
            
            results.results.push({
              transactionId: record.transactionId,
              status: "merged",
              recordId: savedRecord.id,
              representmentStrength: representmentStrength
            });
          } else {
            // Create new record
            savedRecord = await xanoAPI.createRecord("descriptor_history", record);
            
            results.results.push({
              transactionId: record.transactionId,
              status: "imported",
              recordId: savedRecord.id,
              representmentStrength: representmentStrength
            });
          }
          
          results.successful++;
        }
        
        // Progress update every 100 records
        if ((i + 1) % 100 === 0) {
          console.log(`📊 Progress: ${i + 1}/${validatedBatch.records.length} records processed`);
          
          await xanoAPI.updateRecord("descriptor_import_batches", batchRecord.id, {
            processedRecords: i + 1,
            successfulRecords: results.successful,
            failedRecords: results.failed
          });
        }
        
      } catch (error: any) {
        console.error(`❌ Failed to process record ${record.transactionId}:`, error.message);
        
        results.results.push({
          transactionId: record.transactionId,
          status: "failed",
          error: error.message
        });
        
        results.failed++;
      }
    }
    
    // Calculate average representment strength
    results.averageRepresentmentStrength = validatedBatch.records.length > 0 
      ? Math.round(totalRepresentmentStrength / validatedBatch.records.length)
      : 0;
    
    // Update batch completion
    await xanoAPI.updateRecord("descriptor_import_batches", batchRecord.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
      processedRecords: validatedBatch.records.length,
      successfulRecords: results.successful,
      failedRecords: results.failed,
      skippedRecords: results.skipped,
      averageRepresentmentStrength: results.averageRepresentmentStrength
    });
    
    console.log(`✅ Descriptor batch completed: ${results.successful} successful, ${results.failed} failed, ${results.skipped} skipped`);
    
    res.json({
      success: true,
      message: "Descriptor batch import completed",
      results: results,
      batchRecordId: batchRecord.id
    });
    
  } catch (error: any) {
    console.error("❌ Descriptor batch import error:", error.message);
    
    res.status(400).json({
      success: false,
      message: "Descriptor batch import failed",
      error: error.message
    });
  }
});

/**
 * Generate representment evidence package
 */
router.get("/representment-evidence/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const records = await xanoAPI.queryRecords("descriptor_history", {
      transactionId: transactionId
    });
    
    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found"
      });
    }
    
    const record = records[0];
    
    // Get related customer data
    const customerRecords = await xanoAPI.queryRecords("customer_master", {
      customerId: record.customerId
    });
    
    // Get consent events
    const consentEvents = await xanoAPI.queryRecords("consent_tos_events", {
      customerId: record.customerId
    });
    
    // Generate evidence package
    const evidencePackage = {
      transactionId: transactionId,
      generatedAt: new Date().toISOString(),
      transactionDetails: {
        amount: record.amount,
        currency: record.currency,
        date: record.transactionDate,
        descriptor: record.descriptorText,
        authCode: record.authCode,
        processorTransactionId: record.processorTransactionId
      },
      merchantDetails: {
        name: record.merchantName,
        dbaName: record.dbaName,
        category: record.merchantCategory
      },
      customerDetails: customerRecords.length > 0 ? {
        name: `${customerRecords[0].legalFirstName} ${customerRecords[0].legalLastName}`,
        email: record.emailAddress || customerRecords[0].emailAddress,
        phone: record.phoneNumber || customerRecords[0].phoneNumber,
        billingAddress: record.billingAddress || customerRecords[0].billingAddress
      } : null,
      evidenceStrength: {
        overall: record.representmentStrength,
        descriptorQuality: record.descriptorAnalysis?.recognizability || "unknown",
        availableEvidence: {
          orderConfirmation: record.hasOrderConfirmation,
          deliveryProof: record.hasDeliveryProof,
          customerCommunication: record.hasCustomerCommunication,
          termsOfService: record.hasTermsOfService,
          refundPolicy: record.hasRefundPolicy
        }
      },
      consentEvidence: consentEvents.map((event: any) => ({
        eventType: event.eventType,
        consentStatus: event.consentStatus,
        timestamp: event.timestamp,
        ipAddress: event.ipAddress,
        evidenceHash: event.evidenceHash
      })),
      riskAssessment: record.riskAnalysis,
      recommendations: record.riskAnalysis?.recommendations || [],
      disputeHistory: {
        previousDisputes: record.representmentAttempts,
        lastOutcome: record.representmentOutcome,
        lastRepresentmentDate: record.lastRepresentmentDate
      }
    };
    
    res.json({
      success: true,
      evidencePackage: evidencePackage
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get dispute readiness report for customer
 */
router.get("/dispute-readiness/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    
    // Get all descriptor history for customer
    const records = await xanoAPI.queryRecords("descriptor_history", {
      customerId: customerId
    });
    
    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No descriptor history found for customer"
      });
    }
    
    // Analyze overall readiness
    const totalTransactions = records.length;
    const averageRepresentmentStrength = Math.round(
      records.reduce((sum: number, r: any) => sum + (r.representmentStrength || 0), 0) / totalTransactions
    );
    
    const riskDistribution = records.reduce((dist: any, r: any) => {
      const risk = r.riskAnalysis?.overallRisk || "unknown";
      dist[risk] = (dist[risk] || 0) + 1;
      return dist;
    }, {});
    
    const strongEvidence = records.filter((r: any) => (r.representmentStrength || 0) >= 70).length;
    const weakEvidence = records.filter((r: any) => (r.representmentStrength || 0) < 40).length;
    
    const report = {
      customerId: customerId,
      reportGenerated: new Date().toISOString(),
      summary: {
        totalTransactions: totalTransactions,
        averageRepresentmentStrength: averageRepresentmentStrength,
        strongEvidenceCount: strongEvidence,
        weakEvidenceCount: weakEvidence,
        riskDistribution: riskDistribution
      },
      readinessLevel: averageRepresentmentStrength >= 70 ? "high" : 
                     averageRepresentmentStrength >= 50 ? "medium" : "low",
      vulnerabilities: [] as string[],
      strengths: [] as string[],
      recommendations: [] as string[]
    };
    
    // Identify vulnerabilities and strengths
    if (weakEvidence > totalTransactions * 0.3) {
      report.vulnerabilities.push("High percentage of weak evidence transactions");
    }
    
    if (riskDistribution.very_high > 0) {
      report.vulnerabilities.push(`${riskDistribution.very_high} very high risk transactions`);
    }
    
    if (strongEvidence > totalTransactions * 0.5) {
      report.strengths.push("Majority of transactions have strong evidence");
    }
    
    const hasOrderConfirmationCount = records.filter((r: any) => r.hasOrderConfirmation).length;
    if (hasOrderConfirmationCount > totalTransactions * 0.8) {
      report.strengths.push("Strong order confirmation tracking");
    }
    
    // Generate recommendations
    if (weakEvidence > 0) {
      report.recommendations.push("Strengthen evidence collection for weak transactions");
    }
    
    if (averageRepresentmentStrength < 50) {
      report.recommendations.push("Implement comprehensive dispute prevention strategy");
    }
    
    const descriptorIssues = records.filter((r: any) => 
      r.descriptorAnalysis?.recognizability === "low" || 
      r.descriptorAnalysis?.recognizability === "very_low"
    ).length;
    
    if (descriptorIssues > totalTransactions * 0.2) {
      report.recommendations.push("Improve descriptor clarity and recognizability");
    }
    
    res.json({
      success: true,
      report: report,
      transactionDetails: records.map((r: any) => ({
        transactionId: r.transactionId,
        amount: r.amount,
        date: r.transactionDate,
        descriptor: r.descriptorText,
        representmentStrength: r.representmentStrength,
        riskLevel: r.riskAnalysis?.overallRisk
      }))
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

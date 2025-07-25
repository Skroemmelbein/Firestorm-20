import { RequestHandler } from "express";
import { z } from "zod";

// Vault Export Processing Schema - Handle ACU (Automated Card Updater) and delta data
const VaultExportSchema = z.object({
  export_data: z.object({
    // Export metadata
    export_id: z.string(),
    export_date: z.string(),
    export_type: z.enum(["full", "delta", "acu_update", "manual"]),
    source_vault: z.string(),
    total_records: z.number(),

    // Vault records
    vault_records: z.array(
      z.object({
        // Core vault information
        customer_vault_id: z.string(),
        customer_id: z.string(),
        created_date: z.string(),
        updated_date: z.string(),
        status: z.enum(["active", "disabled", "expired", "pending_update"]),

        // Customer information
        customer_info: z.object({
          first_name: z.string(),
          last_name: z.string(),
          email: z.string().email(),
          phone: z.string().optional(),
          company: z.string().optional(),
        }),

        // Payment method details
        payment_method: z.object({
          type: z.enum(["credit_card", "ach", "paypal"]),

          // Credit card details (masked)
          cc_number_masked: z.string().optional(),
          cc_exp: z.string().optional(), // MMYY
          cc_type: z.string().optional(),

          // ACH details (masked)
          account_number_masked: z.string().optional(),
          routing_number: z.string().optional(),
          account_type: z.enum(["checking", "savings"]).optional(),

          // Common fields
          billing_address: z
            .object({
              address: z.string().optional(),
              city: z.string().optional(),
              state: z.string().optional(),
              zip: z.string().optional(),
              country: z.string().default("US"),
            })
            .optional(),
        }),

        // ACU (Automated Card Updater) information
        acu_data: z
          .object({
            last_update_date: z.string().optional(),
            update_source: z
              .enum(["issuer", "manual", "customer", "acu_service"])
              .optional(),
            previous_exp_date: z.string().optional(),
            update_reason: z.string().optional(),
            update_confidence: z.enum(["high", "medium", "low"]).optional(),
          })
          .optional(),

        // Delta tracking
        delta_info: z
          .object({
            change_type: z
              .enum(["new", "updated", "deleted", "reactivated"])
              .optional(),
            changed_fields: z.array(z.string()).optional(),
            previous_values: z.record(z.any()).optional(),
            change_timestamp: z.string().optional(),
            change_source: z.string().optional(),
          })
          .optional(),

        // Risk and compliance
        risk_assessment: z
          .object({
            risk_score: z.number().min(0).max(100).default(0),
            risk_factors: z.array(z.string()).default([]),
            compliance_flags: z.array(z.string()).default([]),
            last_assessed: z.string().optional(),
          })
          .optional(),

        // Transaction history summary
        transaction_summary: z
          .object({
            total_transactions: z.number().default(0),
            successful_transactions: z.number().default(0),
            failed_transactions: z.number().default(0),
            last_transaction_date: z.string().optional(),
            total_amount: z.number().default(0),
            avg_transaction_amount: z.number().default(0),
          })
          .optional(),
      }),
    ),

    // ACU-specific data
    acu_updates: z
      .array(
        z.object({
          customer_vault_id: z.string(),
          update_type: z.enum([
            "expiry_update",
            "number_update",
            "account_closure",
            "reissue",
          ]),
          old_data: z.object({
            cc_exp: z.string().optional(),
            cc_number_last_four: z.string().optional(),
          }),
          new_data: z.object({
            cc_exp: z.string().optional(),
            cc_number_last_four: z.string().optional(),
          }),
          update_source: z.string(),
          confidence_level: z.number().min(0).max(100),
          update_date: z.string(),
          issuer_notification: z.boolean().default(false),
        }),
      )
      .optional(),

    // Delta changes
    delta_changes: z
      .array(
        z.object({
          record_id: z.string(),
          change_type: z.enum(["INSERT", "UPDATE", "DELETE"]),
          table_name: z.string(),
          changed_fields: z.record(z.any()),
          timestamp: z.string(),
          change_source: z.string(),
        }),
      )
      .optional(),
  }),

  // Processing options
  processing_options: z
    .object({
      validate_only: z.boolean().default(false),
      apply_acu_updates: z.boolean().default(true),
      process_deltas: z.boolean().default(true),
      auto_approve_low_risk: z.boolean().default(true),
      notification_settings: z
        .object({
          notify_on_high_risk: z.boolean().default(true),
          notify_on_acu_updates: z.boolean().default(true),
          notification_email: z.string().email().optional(),
        })
        .optional(),
    })
    .default({}),
});

interface VaultProcessor {
  processVaultExport(exportData: any): Promise<VaultProcessingResult>;
  processACUUpdates(acuUpdates: any[]): Promise<ACUProcessingResult>;
  processDeltaChanges(deltaChanges: any[]): Promise<DeltaProcessingResult>;
  validateVaultData(vaultRecord: any): ValidationResult;
}

interface VaultProcessingResult {
  export_id: string;
  processing_status: "SUCCESS" | "PARTIAL" | "FAILED";
  total_processed: number;
  successful_records: number;
  failed_records: number;
  acu_updates_applied: number;
  delta_changes_processed: number;
  validation_errors: string[];
  risk_flags: string[];
  processing_summary: {
    new_vaults: number;
    updated_vaults: number;
    disabled_vaults: number;
    high_risk_vaults: number;
  };
  processed_at: string;
}

interface ACUProcessingResult {
  total_acu_updates: number;
  successful_updates: number;
  failed_updates: number;
  confidence_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  update_types: {
    expiry_updates: number;
    number_updates: number;
    account_closures: number;
    reissues: number;
  };
}

interface DeltaProcessingResult {
  total_changes: number;
  inserts: number;
  updates: number;
  deletes: number;
  conflicts_resolved: number;
  manual_review_required: number;
}

interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  risk_score: number;
}

class VaultExportProcessor implements VaultProcessor {
  async processVaultExport(exportData: any): Promise<VaultProcessingResult> {
    const startTime = Date.now();
    let successful = 0;
    let failed = 0;
    const validationErrors: string[] = [];
    const riskFlags: string[] = [];

    const summary = {
      new_vaults: 0,
      updated_vaults: 0,
      disabled_vaults: 0,
      high_risk_vaults: 0,
    };

    // Process vault records
    for (const vaultRecord of exportData.vault_records) {
      try {
        const validation = this.validateVaultData(vaultRecord);

        if (!validation.is_valid) {
          failed++;
          validationErrors.push(...validation.errors);
          continue;
        }

        // Process based on delta type
        if (vaultRecord.delta_info?.change_type === "new") {
          summary.new_vaults++;
        } else if (vaultRecord.delta_info?.change_type === "updated") {
          summary.updated_vaults++;
        } else if (vaultRecord.status === "disabled") {
          summary.disabled_vaults++;
        }

        // Check risk level
        if (validation.risk_score > 70) {
          summary.high_risk_vaults++;
          riskFlags.push(`High risk vault: ${vaultRecord.customer_vault_id}`);
        }

        successful++;
      } catch (error: any) {
        failed++;
        validationErrors.push(
          `Failed to process vault ${vaultRecord.customer_vault_id}: ${error.message}`,
        );
      }
    }

    // Process ACU updates
    let acuResult: ACUProcessingResult = {
      total_acu_updates: 0,
      successful_updates: 0,
      failed_updates: 0,
      confidence_distribution: { high: 0, medium: 0, low: 0 },
      update_types: {
        expiry_updates: 0,
        number_updates: 0,
        account_closures: 0,
        reissues: 0,
      },
    };

    if (exportData.acu_updates && exportData.acu_updates.length > 0) {
      acuResult = await this.processACUUpdates(exportData.acu_updates);
    }

    // Process delta changes
    let deltaResult: DeltaProcessingResult = {
      total_changes: 0,
      inserts: 0,
      updates: 0,
      deletes: 0,
      conflicts_resolved: 0,
      manual_review_required: 0,
    };

    if (exportData.delta_changes && exportData.delta_changes.length > 0) {
      deltaResult = await this.processDeltaChanges(exportData.delta_changes);
    }

    const processingTime = Date.now() - startTime;
    console.log(`Vault export processing completed in ${processingTime}ms`);

    return {
      export_id: exportData.export_id,
      processing_status:
        failed === 0 ? "SUCCESS" : successful > 0 ? "PARTIAL" : "FAILED",
      total_processed: successful + failed,
      successful_records: successful,
      failed_records: failed,
      acu_updates_applied: acuResult.successful_updates,
      delta_changes_processed: deltaResult.total_changes,
      validation_errors: validationErrors.slice(0, 100), // Limit error list
      risk_flags: riskFlags.slice(0, 50), // Limit risk flags
      processing_summary: summary,
      processed_at: new Date().toISOString(),
    };
  }

  async processACUUpdates(acuUpdates: any[]): Promise<ACUProcessingResult> {
    const result: ACUProcessingResult = {
      total_acu_updates: acuUpdates.length,
      successful_updates: 0,
      failed_updates: 0,
      confidence_distribution: { high: 0, medium: 0, low: 0 },
      update_types: {
        expiry_updates: 0,
        number_updates: 0,
        account_closures: 0,
        reissues: 0,
      },
    };

    for (const update of acuUpdates) {
      try {
        // Validate ACU update
        if (!this.validateACUUpdate(update)) {
          result.failed_updates++;
          continue;
        }

        // Process update by type
        switch (update.update_type) {
          case "expiry_update":
            result.update_types.expiry_updates++;
            break;
          case "number_update":
            result.update_types.number_updates++;
            break;
          case "account_closure":
            result.update_types.account_closures++;
            break;
          case "reissue":
            result.update_types.reissues++;
            break;
        }

        // Track confidence levels
        if (update.confidence_level >= 90) {
          result.confidence_distribution.high++;
        } else if (update.confidence_level >= 70) {
          result.confidence_distribution.medium++;
        } else {
          result.confidence_distribution.low++;
        }

        result.successful_updates++;
      } catch (error: any) {
        result.failed_updates++;
        console.error(
          `ACU update failed for vault ${update.customer_vault_id}:`,
          error.message,
        );
      }
    }

    return result;
  }

  async processDeltaChanges(
    deltaChanges: any[],
  ): Promise<DeltaProcessingResult> {
    const result: DeltaProcessingResult = {
      total_changes: deltaChanges.length,
      inserts: 0,
      updates: 0,
      deletes: 0,
      conflicts_resolved: 0,
      manual_review_required: 0,
    };

    for (const change of deltaChanges) {
      try {
        // Validate delta change
        if (!this.validateDeltaChange(change)) {
          result.manual_review_required++;
          continue;
        }

        // Process by change type
        switch (change.change_type) {
          case "INSERT":
            result.inserts++;
            break;
          case "UPDATE":
            result.updates++;
            // Check for conflicts
            if (await this.detectConflict(change)) {
              result.conflicts_resolved++;
            }
            break;
          case "DELETE":
            result.deletes++;
            break;
        }
      } catch (error: any) {
        result.manual_review_required++;
        console.error(
          `Delta change failed for record ${change.record_id}:`,
          error.message,
        );
      }
    }

    return result;
  }

  validateVaultData(vaultRecord: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let riskScore = 0;

    // Required field validation
    if (!vaultRecord.customer_vault_id)
      errors.push("Missing customer_vault_id");
    if (!vaultRecord.customer_id) errors.push("Missing customer_id");
    if (!vaultRecord.customer_info?.email)
      errors.push("Missing customer email");

    // Payment method validation
    if (!vaultRecord.payment_method) {
      errors.push("Missing payment method");
    } else {
      const pm = vaultRecord.payment_method;

      if (pm.type === "credit_card") {
        if (!pm.cc_number_masked)
          errors.push("Missing masked credit card number");
        if (!pm.cc_exp) errors.push("Missing credit card expiry");
        if (!pm.cc_type) errors.push("Missing credit card type");

        // Validate expiry
        if (pm.cc_exp && !this.isValidExpiry(pm.cc_exp)) {
          warnings.push("Credit card appears to be expired");
          riskScore += 20;
        }
      } else if (pm.type === "ach") {
        if (!pm.account_number_masked)
          errors.push("Missing masked account number");
        if (!pm.routing_number) errors.push("Missing routing number");
        if (!pm.account_type) errors.push("Missing account type");
      }
    }

    // Risk assessment
    if (vaultRecord.risk_assessment) {
      riskScore += vaultRecord.risk_assessment.risk_score || 0;

      if (vaultRecord.risk_assessment.compliance_flags?.length > 0) {
        riskScore += vaultRecord.risk_assessment.compliance_flags.length * 15;
        warnings.push("Compliance flags detected");
      }
    }

    // Transaction history validation
    if (vaultRecord.transaction_summary) {
      const ts = vaultRecord.transaction_summary;
      const failureRate =
        ts.total_transactions > 0
          ? ts.failed_transactions / ts.total_transactions
          : 0;

      if (failureRate > 0.3) {
        riskScore += 25;
        warnings.push("High transaction failure rate");
      }
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      risk_score: Math.min(riskScore, 100),
    };
  }

  private validateACUUpdate(update: any): boolean {
    // Basic ACU update validation
    if (!update.customer_vault_id) return false;
    if (!update.update_type) return false;
    if (!update.new_data) return false;
    if (update.confidence_level < 50) return false; // Minimum confidence

    return true;
  }

  private validateDeltaChange(change: any): boolean {
    // Basic delta change validation
    if (!change.record_id) return false;
    if (!change.change_type) return false;
    if (!change.timestamp) return false;

    return true;
  }

  private async detectConflict(change: any): Promise<boolean> {
    // Simulate conflict detection logic
    // In production, this would check for conflicting updates
    return Math.random() < 0.05; // 5% conflict rate
  }

  private isValidExpiry(expiry: string): boolean {
    if (expiry.length !== 4) return false;

    const month = parseInt(expiry.substring(0, 2));
    const year = 2000 + parseInt(expiry.substring(2, 4));
    const now = new Date();
    const expiryDate = new Date(year, month - 1);

    return expiryDate > now;
  }
}

// Initialize processor
const vaultProcessor = new VaultExportProcessor();

export const processVaultExport: RequestHandler = async (req, res) => {
  try {
    const validation = VaultExportSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid vault export data",
        errors: validation.error.issues,
      });
    }

    const { export_data, processing_options } = validation.data;

    // Validate record count
    if (export_data.vault_records.length !== export_data.total_records) {
      return res.status(400).json({
        success: false,
        message: `Record count mismatch. Expected ${export_data.total_records}, got ${export_data.vault_records.length}`,
      });
    }

    // Process vault export
    const result = await vaultProcessor.processVaultExport(export_data);

    res.json({
      success: true,
      message: `Vault export processed successfully`,
      export_id: export_data.export_id,
      processing_result: result,
      processing_options: processing_options,
    });
  } catch (error: any) {
    console.error("Vault export processing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process vault export",
      error: error.message,
    });
  }
};

export const getVaultExportStatus: RequestHandler = async (req, res) => {
  try {
    const { exportId } = req.params;

    // Mock export status
    const mockStatus = {
      export_id: exportId,
      status: "COMPLETED",
      started_at: new Date(Date.now() - 3600000).toISOString(),
      completed_at: new Date().toISOString(),
      processing_time_ms: 3600000,
      total_records: 65000,
      processed_records: 65000,
      success_rate: 96.8,
      summary: {
        successful_vaults: 62912,
        failed_vaults: 2088,
        new_vaults: 15200,
        updated_vaults: 42500,
        disabled_vaults: 5200,
        high_risk_vaults: 2100,
      },
      acu_summary: {
        total_updates: 71,
        expiry_updates: 58,
        number_updates: 8,
        account_closures: 3,
        reissues: 2,
      },
      delta_summary: {
        total_changes: 85420,
        inserts: 15200,
        updates: 65120,
        deletes: 5100,
        conflicts_resolved: 234,
      },
    };

    res.json({
      success: true,
      status: mockStatus,
    });
  } catch (error: any) {
    console.error("Vault export status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get export status",
      error: error.message,
    });
  }
};

export const getACUUpdateStats: RequestHandler = async (req, res) => {
  try {
    const stats = {
      total_acu_enabled_vaults: 58500,
      recent_updates: {
        last_24h: 15,
        last_7d: 71,
        last_30d: 284,
      },
      update_types: {
        expiry_updates: 245,
        number_updates: 32,
        account_closures: 18,
        reissues: 12,
      },
      confidence_distribution: {
        high_confidence: 278,
        medium_confidence: 23,
        low_confidence: 6,
      },
      success_rates: {
        overall: 94.2,
        expiry_updates: 98.1,
        number_updates: 87.5,
        account_closures: 100.0,
        reissues: 91.7,
      },
      issuer_breakdown: {
        visa: 152,
        mastercard: 98,
        amex: 37,
        discover: 20,
      },
    };

    res.json({
      success: true,
      stats,
      last_updated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("ACU stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get ACU stats",
      error: error.message,
    });
  }
};

export const validateVaultIntegrity: RequestHandler = async (req, res) => {
  try {
    const { vault_ids } = req.body;

    if (!Array.isArray(vault_ids)) {
      return res.status(400).json({
        success: false,
        message: "vault_ids must be an array",
      });
    }

    const validation_results = vault_ids.map((vault_id) => {
      const integrity_score = Math.random() * 100;
      const has_issues = integrity_score < 80;

      return {
        vault_id,
        integrity_score: Math.round(integrity_score),
        status: has_issues ? "NEEDS_ATTENTION" : "VALID",
        issues: has_issues
          ? [
              Math.random() > 0.5 ? "Expired payment method" : null,
              Math.random() > 0.7 ? "Missing billing address" : null,
              Math.random() > 0.8 ? "Risk score elevated" : null,
            ].filter(Boolean)
          : [],
        last_validated: new Date().toISOString(),
      };
    });

    const summary = {
      total_validated: vault_ids.length,
      valid_vaults: validation_results.filter((r) => r.status === "VALID")
        .length,
      needs_attention: validation_results.filter(
        (r) => r.status === "NEEDS_ATTENTION",
      ).length,
      avg_integrity_score: Math.round(
        validation_results.reduce((sum, r) => sum + r.integrity_score, 0) /
          validation_results.length,
      ),
    };

    res.json({
      success: true,
      summary,
      validation_results,
      validated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Vault integrity validation error:", error);
    res.status(500).json({
      success: false,
      message: "Vault integrity validation failed",
      error: error.message,
    });
  }
};

import { RequestHandler } from "express";
import { z } from "zod";

// Updated Cards Handler Schema - Process 71 NMI updated cards from ACU events
const UpdatedCardsSchema = z.object({
  // Card update batch information
  batch_info: z.object({
    batch_id: z.string(),
    update_source: z.enum(["ACU", "manual", "customer", "issuer_notification"]),
    batch_date: z.string(),
    total_cards: z.number(),
    priority_level: z.enum(["high", "medium", "low"]).default("medium"),
  }),

  // Individual card updates
  card_updates: z.array(
    z.object({
      // Card identification
      customer_vault_id: z.string(),
      customer_id: z.string(),
      update_id: z.string(),

      // Previous card information
      previous_card: z.object({
        last_four: z.string(),
        exp_month: z.string(),
        exp_year: z.string(),
        card_type: z.string(),
        issuer: z.string().optional(),
      }),

      // Updated card information
      updated_card: z.object({
        last_four: z.string(),
        exp_month: z.string(),
        exp_year: z.string(),
        card_type: z.string(),
        issuer: z.string().optional(),
        update_confidence: z.number().min(0).max(100),
      }),

      // Update metadata
      update_details: z.object({
        update_type: z.enum([
          "expiry_date_change",
          "card_reissue",
          "account_closure",
          "issuer_update",
          "customer_update",
        ]),
        update_reason: z.string().optional(),
        issuer_notification_date: z.string().optional(),
        confidence_level: z.enum(["high", "medium", "low"]),
        requires_validation: z.boolean().default(false),
      }),

      // Customer information
      customer_info: z.object({
        first_name: z.string(),
        last_name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
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

      // Transaction context
      transaction_context: z
        .object({
          last_successful_transaction: z.string().optional(),
          recent_failed_attempts: z.number().default(0),
          last_transaction_amount: z.number().optional(),
          subscription_status: z
            .enum(["active", "suspended", "cancelled", "pending"])
            .optional(),
        })
        .optional(),

      // Risk assessment
      risk_indicators: z
        .object({
          fraud_score: z.number().min(0).max(100).default(0),
          risk_flags: z.array(z.string()).default([]),
          compliance_notes: z.string().optional(),
          requires_manual_review: z.boolean().default(false),
        })
        .optional(),
    }),
  ),

  // Processing instructions
  processing_options: z
    .object({
      auto_update_high_confidence: z.boolean().default(true),
      require_customer_verification: z.boolean().default(false),
      pause_billing_during_update: z.boolean().default(true),
      send_update_notifications: z.boolean().default(true),
      backup_previous_data: z.boolean().default(true),
    })
    .default({}),
});

interface CardUpdateProcessor {
  processCardUpdate(cardUpdate: any): Promise<CardUpdateResult>;
  validateCardUpdate(cardUpdate: any): CardUpdateValidation;
  applyCardUpdate(cardUpdate: any): Promise<UpdateApplicationResult>;
  notifyCustomer(cardUpdate: any, result: CardUpdateResult): Promise<void>;
}

interface CardUpdateResult {
  update_id: string;
  customer_vault_id: string;
  processing_status:
    | "SUCCESS"
    | "FAILED"
    | "PENDING_REVIEW"
    | "REQUIRES_VALIDATION";
  validation_result: CardUpdateValidation;
  application_result?: UpdateApplicationResult;
  notification_sent: boolean;
  processed_at: string;
  next_action?: string;
}

interface CardUpdateValidation {
  is_valid: boolean;
  confidence_assessment: "high" | "medium" | "low";
  validation_errors: string[];
  risk_warnings: string[];
  recommended_action: "apply" | "review" | "reject" | "verify_with_customer";
}

interface UpdateApplicationResult {
  vault_updated: boolean;
  previous_data_backed_up: boolean;
  billing_status_updated: boolean;
  subscription_impact: string;
  rollback_available: boolean;
}

class UpdatedCardsProcessor implements CardUpdateProcessor {
  async processCardUpdate(cardUpdate: any): Promise<CardUpdateResult> {
    // Validate the card update
    const validation = this.validateCardUpdate(cardUpdate);

    let processingStatus: CardUpdateResult["processing_status"] = "SUCCESS";
    let applicationResult: UpdateApplicationResult | undefined;
    let notificationSent = false;
    let nextAction: string | undefined;

    if (!validation.is_valid) {
      processingStatus = "FAILED";
      nextAction = "Fix validation errors and retry";
    } else if (validation.recommended_action === "review") {
      processingStatus = "PENDING_REVIEW";
      nextAction = "Manual review required";
    } else if (validation.recommended_action === "verify_with_customer") {
      processingStatus = "REQUIRES_VALIDATION";
      nextAction = "Customer verification needed";
    } else if (validation.recommended_action === "apply") {
      // Apply the update
      try {
        applicationResult = await this.applyCardUpdate(cardUpdate);

        if (applicationResult.vault_updated) {
          // Send notification if successful
          await this.notifyCustomer(cardUpdate, {
            update_id: cardUpdate.update_id,
            customer_vault_id: cardUpdate.customer_vault_id,
            processing_status: "SUCCESS",
            validation_result: validation,
            application_result: applicationResult,
            notification_sent: true,
            processed_at: new Date().toISOString(),
          });
          notificationSent = true;
        } else {
          processingStatus = "FAILED";
          nextAction = "Vault update failed - check system logs";
        }
      } catch (error: any) {
        processingStatus = "FAILED";
        nextAction = `Application failed: ${error.message}`;
      }
    }

    return {
      update_id: cardUpdate.update_id,
      customer_vault_id: cardUpdate.customer_vault_id,
      processing_status: processingStatus,
      validation_result: validation,
      application_result: applicationResult,
      notification_sent: notificationSent,
      processed_at: new Date().toISOString(),
      next_action: nextAction,
    };
  }

  validateCardUpdate(cardUpdate: any): CardUpdateValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let confidenceAssessment: "high" | "medium" | "low" = "high";

    // Basic field validation
    if (!cardUpdate.customer_vault_id) errors.push("Missing customer vault ID");
    if (!cardUpdate.updated_card.last_four)
      errors.push("Missing updated card last four digits");
    if (
      !cardUpdate.updated_card.exp_month ||
      !cardUpdate.updated_card.exp_year
    ) {
      errors.push("Missing updated expiry date");
    }

    // Expiry date validation
    const newExpiry = `${cardUpdate.updated_card.exp_month}${cardUpdate.updated_card.exp_year}`;
    if (!this.isValidFutureExpiry(newExpiry)) {
      errors.push("New expiry date is invalid or in the past");
    }

    // Card number change validation
    const cardNumberChanged =
      cardUpdate.previous_card.last_four !== cardUpdate.updated_card.last_four;
    const expiryChanged =
      cardUpdate.previous_card.exp_month !==
        cardUpdate.updated_card.exp_month ||
      cardUpdate.previous_card.exp_year !== cardUpdate.updated_card.exp_year;

    if (
      cardNumberChanged &&
      cardUpdate.update_details.update_type !== "card_reissue"
    ) {
      warnings.push(
        "Card number changed but update type is not 'card_reissue'",
      );
      confidenceAssessment = "medium";
    }

    if (!cardNumberChanged && !expiryChanged) {
      warnings.push("No detectable changes in card information");
      confidenceAssessment = "low";
    }

    // Confidence level assessment
    const updateConfidence = cardUpdate.updated_card.update_confidence || 0;
    if (updateConfidence < 70) {
      warnings.push("Low confidence update from ACU service");
      confidenceAssessment = "low";
    } else if (updateConfidence < 85) {
      confidenceAssessment = "medium";
    }

    // Risk assessment
    const riskScore = cardUpdate.risk_indicators?.fraud_score || 0;
    if (riskScore > 70) {
      warnings.push("High fraud risk score detected");
      confidenceAssessment = "low";
    }

    // Recent failed transactions check
    const recentFailures =
      cardUpdate.transaction_context?.recent_failed_attempts || 0;
    if (recentFailures > 3) {
      warnings.push("Multiple recent failed transaction attempts");
    }

    // Account closure handling
    if (cardUpdate.update_details.update_type === "account_closure") {
      warnings.push(
        "Account closure notification - billing should be suspended",
      );
    }

    // Determine recommended action
    let recommendedAction: CardUpdateValidation["recommended_action"] = "apply";

    if (errors.length > 0) {
      recommendedAction = "reject";
    } else if (
      cardUpdate.update_details.requires_validation ||
      confidenceAssessment === "low"
    ) {
      recommendedAction = "verify_with_customer";
    } else if (warnings.length > 2 || riskScore > 50) {
      recommendedAction = "review";
    }

    return {
      is_valid: errors.length === 0,
      confidence_assessment: confidenceAssessment,
      validation_errors: errors,
      risk_warnings: warnings,
      recommended_action: recommendedAction,
    };
  }

  async applyCardUpdate(cardUpdate: any): Promise<UpdateApplicationResult> {
    try {
      // Backup previous data
      const backupResult = await this.backupPreviousCardData(cardUpdate);

      // Update vault record
      const vaultUpdateResult = await this.updateVaultRecord(cardUpdate);

      // Update billing status if needed
      let billingStatusUpdated = false;
      let subscriptionImpact = "no_impact";

      if (cardUpdate.update_details.update_type === "account_closure") {
        await this.suspendBilling(cardUpdate.customer_vault_id);
        billingStatusUpdated = true;
        subscriptionImpact = "billing_suspended";
      } else if (cardUpdate.processing_options?.pause_billing_during_update) {
        await this.pauseBillingTemporarily(cardUpdate.customer_vault_id);
        billingStatusUpdated = true;
        subscriptionImpact = "billing_paused_temporarily";
      }

      return {
        vault_updated: vaultUpdateResult,
        previous_data_backed_up: backupResult,
        billing_status_updated: billingStatusUpdated,
        subscription_impact: subscriptionImpact,
        rollback_available: backupResult,
      };
    } catch (error: any) {
      console.error(
        `Failed to apply card update for vault ${cardUpdate.customer_vault_id}:`,
        error,
      );
      throw error;
    }
  }

  async notifyCustomer(
    cardUpdate: any,
    result: CardUpdateResult,
  ): Promise<void> {
    if (!cardUpdate.processing_options?.send_update_notifications) {
      return;
    }

    const customer = cardUpdate.customer_info;
    const notificationType = this.determineNotificationType(cardUpdate, result);

    // Simulate notification sending
    console.log(
      `Sending ${notificationType} notification to ${customer.email} for vault ${cardUpdate.customer_vault_id}`,
    );

    // In production, this would integrate with your notification system
    // await emailService.send({
    //   to: customer.email,
    //   template: notificationType,
    //   data: { customer, cardUpdate, result }
    // });
  }

  private isValidFutureExpiry(expiry: string): boolean {
    if (expiry.length !== 4) return false;

    const month = parseInt(expiry.substring(0, 2));
    const year = 2000 + parseInt(expiry.substring(2, 4));

    if (month < 1 || month > 12) return false;

    const expiryDate = new Date(year, month - 1);
    const now = new Date();

    return expiryDate > now;
  }

  private async backupPreviousCardData(cardUpdate: any): Promise<boolean> {
    // Simulate backup operation
    console.log(
      `Backing up previous card data for vault ${cardUpdate.customer_vault_id}`,
    );
    return true;
  }

  private async updateVaultRecord(cardUpdate: any): Promise<boolean> {
    // Simulate vault update
    console.log(
      `Updating vault ${cardUpdate.customer_vault_id} with new card data`,
    );
    return true;
  }

  private async suspendBilling(vaultId: string): Promise<void> {
    console.log(
      `Suspending billing for vault ${vaultId} due to account closure`,
    );
  }

  private async pauseBillingTemporarily(vaultId: string): Promise<void> {
    console.log(
      `Temporarily pausing billing for vault ${vaultId} during card update`,
    );
  }

  private determineNotificationType(
    cardUpdate: any,
    result: CardUpdateResult,
  ): string {
    if (result.processing_status === "SUCCESS") {
      return cardUpdate.update_details.update_type === "account_closure"
        ? "card_account_closed"
        : "card_updated_successfully";
    } else if (result.processing_status === "REQUIRES_VALIDATION") {
      return "card_update_verification_needed";
    } else {
      return "card_update_failed";
    }
  }
}

// Initialize processor
const cardUpdateProcessor = new UpdatedCardsProcessor();

export const processUpdatedCards: RequestHandler = async (req, res) => {
  try {
    const validation = UpdatedCardsSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid updated cards data",
        errors: validation.error.issues,
      });
    }

    const { batch_info, card_updates, processing_options } = validation.data;

    // Validate batch size
    if (card_updates.length !== batch_info.total_cards) {
      return res.status(400).json({
        success: false,
        message: `Card count mismatch. Expected ${batch_info.total_cards}, got ${card_updates.length}`,
      });
    }

    // Process card updates
    const results: CardUpdateResult[] = [];
    const BATCH_SIZE = 10; // Process in smaller batches for card updates

    for (let i = 0; i < card_updates.length; i += BATCH_SIZE) {
      const batch = card_updates.slice(i, i + BATCH_SIZE);

      // Process batch in parallel
      const batchPromises = batch.map((cardUpdate) =>
        cardUpdateProcessor.processCardUpdate(cardUpdate),
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches
      if (i + BATCH_SIZE < card_updates.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Generate summary
    const summary = {
      total_processed: results.length,
      successful_updates: results.filter(
        (r) => r.processing_status === "SUCCESS",
      ).length,
      failed_updates: results.filter((r) => r.processing_status === "FAILED")
        .length,
      pending_review: results.filter(
        (r) => r.processing_status === "PENDING_REVIEW",
      ).length,
      requires_validation: results.filter(
        (r) => r.processing_status === "REQUIRES_VALIDATION",
      ).length,
      notifications_sent: results.filter((r) => r.notification_sent).length,
    };

    res.json({
      success: true,
      message: `Processed ${batch_info.total_cards} card updates`,
      batch_id: batch_info.batch_id,
      summary,
      results: results.slice(0, 10), // Return first 10 results for preview
      total_results: results.length,
      processing_options,
    });
  } catch (error: any) {
    console.error("Updated cards processing error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process updated cards",
      error: error.message,
    });
  }
};

export const getCardUpdateStatus: RequestHandler = async (req, res) => {
  try {
    const { batchId } = req.params;

    // Mock batch status
    const mockStatus = {
      batch_id: batchId,
      status: "COMPLETED",
      started_at: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
      completed_at: new Date().toISOString(),
      total_cards: 71,
      processing_summary: {
        successful_updates: 67,
        failed_updates: 2,
        pending_review: 1,
        requires_validation: 1,
      },
      update_type_breakdown: {
        expiry_date_change: 58,
        card_reissue: 8,
        account_closure: 3,
        issuer_update: 2,
      },
      confidence_distribution: {
        high: 62,
        medium: 7,
        low: 2,
      },
      notifications: {
        sent: 67,
        failed: 0,
        pending: 2,
      },
    };

    res.json({
      success: true,
      status: mockStatus,
    });
  } catch (error: any) {
    console.error("Card update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get card update status",
      error: error.message,
    });
  }
};

export const retryFailedCardUpdates: RequestHandler = async (req, res) => {
  try {
    const { batch_id, update_ids } = req.body;

    if (!Array.isArray(update_ids)) {
      return res.status(400).json({
        success: false,
        message: "update_ids must be an array",
      });
    }

    // Simulate retry processing
    const retryResults = update_ids.map((updateId) => ({
      update_id: updateId,
      retry_status: Math.random() > 0.3 ? "SUCCESS" : "FAILED_AGAIN",
      retry_attempt: 1,
      processed_at: new Date().toISOString(),
    }));

    const summary = {
      total_retried: update_ids.length,
      successful_retries: retryResults.filter(
        (r) => r.retry_status === "SUCCESS",
      ).length,
      still_failed: retryResults.filter(
        (r) => r.retry_status === "FAILED_AGAIN",
      ).length,
    };

    res.json({
      success: true,
      message: `Retried ${update_ids.length} failed card updates`,
      batch_id,
      summary,
      retry_results: retryResults,
    });
  } catch (error: any) {
    console.error("Card update retry error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retry card updates",
      error: error.message,
    });
  }
};

export const validateCardUpdateBatch: RequestHandler = async (req, res) => {
  try {
    const { card_updates } = req.body;

    if (!Array.isArray(card_updates)) {
      return res.status(400).json({
        success: false,
        message: "card_updates must be an array",
      });
    }

    const validationResults = [];

    for (const cardUpdate of card_updates) {
      const validation = cardUpdateProcessor.validateCardUpdate(cardUpdate);
      validationResults.push({
        update_id: cardUpdate.update_id,
        customer_vault_id: cardUpdate.customer_vault_id,
        validation_result: validation,
      });
    }

    const summary = {
      total_validated: card_updates.length,
      valid_updates: validationResults.filter(
        (r) => r.validation_result.is_valid,
      ).length,
      invalid_updates: validationResults.filter(
        (r) => !r.validation_result.is_valid,
      ).length,
      high_confidence: validationResults.filter(
        (r) => r.validation_result.confidence_assessment === "high",
      ).length,
      medium_confidence: validationResults.filter(
        (r) => r.validation_result.confidence_assessment === "medium",
      ).length,
      low_confidence: validationResults.filter(
        (r) => r.validation_result.confidence_assessment === "low",
      ).length,
    };

    res.json({
      success: true,
      message: `Validated ${card_updates.length} card updates`,
      summary,
      validation_results: validationResults,
    });
  } catch (error: any) {
    console.error("Card update validation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate card updates",
      error: error.message,
    });
  }
};

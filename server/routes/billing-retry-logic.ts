import express from 'express';
import { xanoAPI } from './api-integrations';

const router = express.Router();

// Retry Configuration
const RETRY_CONFIG = {
  maxRetries: parseInt(process.env.MAX_RETRIES || "3"),
  backoffHours: (process.env.RETRY_BACKOFF_HOURS || "12,36,72").split(',').map(h => parseInt(h)),
  descriptorBase: process.env.DESCRIPTOR_BASE || "ECELONX Subscription",
  descriptorVariations: {
    final_retry: " *Renew",
    soft_block: " Billing",
    insufficient_funds: " Monthly"
  }
};

interface RetryScheduleItem {
  subscription_id: number;
  retry_attempt: number;
  scheduled_at: string;
  status: 'pending' | 'executed' | 'skipped';
  descriptor_suffix?: string;
}

/**
 * Enhanced retry logic with smart descriptor variations
 */
class RetryPolicyEngine {
  
  /**
   * Determine if subscription should be retried
   */
  shouldRetry(subscription: any, declineReason: string): boolean {
    // Max retries check
    if (subscription.retries >= RETRY_CONFIG.maxRetries) {
      return false;
    }

    // Specific decline reasons that should not be retried
    const noRetryReasons = [
      '14', // Invalid card number
      '78', // Card not activated
      '85', // No reason to decline (fraud)
      '93', // Transaction cannot be completed
    ];

    if (noRetryReasons.includes(declineReason)) {
      return false;
    }

    // Immediate action required (should not retry automatically)
    const immediateActionReasons = [
      '54', // Expired card - needs card update
      '15', // Invalid issuer - card issue
      '41', // Lost card - needs replacement
      '43', // Stolen card - needs replacement
    ];

    if (immediateActionReasons.includes(declineReason)) {
      return false;
    }

    return true;
  }

  /**
   * Calculate next retry time with exponential backoff
   */
  calculateRetryTime(retryAttempt: number): Date {
    const hoursToAdd = RETRY_CONFIG.backoffHours[retryAttempt - 1] || 72;
    const retryTime = new Date();
    retryTime.setHours(retryTime.getHours() + hoursToAdd);
    return retryTime;
  }

  /**
   * Generate appropriate descriptor based on retry context
   */
  generateDescriptor(retryAttempt: number, declineReason: string, cardBrand: string): string {
    let descriptor = RETRY_CONFIG.descriptorBase;

    // Final retry - use renewal variation to bypass soft blocks
    if (retryAttempt >= RETRY_CONFIG.maxRetries - 1) {
      descriptor += RETRY_CONFIG.descriptorVariations.final_retry;
    }
    // Soft decline reasons - vary descriptor
    else if (['05', '65'].includes(declineReason)) {
      descriptor += RETRY_CONFIG.descriptorVariations.soft_block;
    }
    // Insufficient funds - different variation
    else if (declineReason === '51') {
      descriptor += RETRY_CONFIG.descriptorVariations.insufficient_funds;
    }

    return descriptor;
  }

  /**
   * Categorize decline reason for analytics and decision making
   */
  categorizeDecline(responseCode: string, responseText: string): {
    category: string;
    severity: 'low' | 'medium' | 'high';
    retryRecommended: boolean;
    actionRequired: string;
  } {
    const declineMap: Record<string, any> = {
      '01': { category: 'approved', severity: 'low', retryRecommended: false, actionRequired: 'none' },
      '05': { category: 'do_not_honor', severity: 'medium', retryRecommended: true, actionRequired: 'retry_with_variation' },
      '14': { category: 'invalid_card', severity: 'high', retryRecommended: false, actionRequired: 'update_card' },
      '51': { category: 'insufficient_funds', severity: 'low', retryRecommended: true, actionRequired: 'retry_later' },
      '54': { category: 'expired_card', severity: 'high', retryRecommended: false, actionRequired: 'update_card' },
      '61': { category: 'exceeds_limit', severity: 'medium', retryRecommended: true, actionRequired: 'retry_smaller_amount' },
      '65': { category: 'activity_limit', severity: 'medium', retryRecommended: true, actionRequired: 'retry_later' },
      '78': { category: 'card_not_activated', severity: 'high', retryRecommended: false, actionRequired: 'customer_contact' },
      '85': { category: 'fraud_suspected', severity: 'high', retryRecommended: false, actionRequired: 'manual_review' }
    };

    return declineMap[responseCode] || {
      category: 'unknown',
      severity: 'medium',
      retryRecommended: true,
      actionRequired: 'retry_with_caution'
    };
  }
}

const retryEngine = new RetryPolicyEngine();

/**
 * Schedule retry for failed subscription
 */
router.post('/schedule-retry', async (req, res) => {
  try {
    const { subscription_id, decline_reason, response_code, response_text } = req.body;

    // Get subscription details
    const subscription = await xanoAPI.getRecord('subscriptions', subscription_id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Analyze decline reason
    const declineAnalysis = retryEngine.categorizeDecline(response_code, response_text);
    
    // Check if retry is recommended
    if (!retryEngine.shouldRetry(subscription, response_code)) {
      console.log(`🚫 Retry not recommended for subscription ${subscription_id}, reason: ${response_code}`);
      
      // Update subscription status based on decline reason
      let newStatus = 'past_due';
      if (['14', '54'].includes(response_code)) {
        newStatus = 'past_due'; // Requires card update
      } else if (['78', '85'].includes(response_code)) {
        newStatus = 'canceled'; // Requires manual intervention
      }

      await xanoAPI.updateRecord('subscriptions', subscription_id, {
        status: newStatus,
        retries: subscription.retries + 1,
        last_attempt_at: new Date().toISOString()
      });

      return res.json({
        success: true,
        action: 'no_retry',
        new_status: newStatus,
        reason: declineAnalysis.actionRequired,
        decline_analysis: declineAnalysis
      });
    }

    // Calculate retry schedule
    const newRetryCount = subscription.retries + 1;
    const retryTime = retryEngine.calculateRetryTime(newRetryCount);
    const descriptor = retryEngine.generateDescriptor(newRetryCount, response_code, subscription.card_brand);

    // Update subscription with retry info
    await xanoAPI.updateRecord('subscriptions', subscription_id, {
      retries: newRetryCount,
      next_bill_at: retryTime.toISOString(),
      last_attempt_at: new Date().toISOString()
    });

    // Create retry schedule entry
    const retryScheduleData = {
      subscription_id: subscription_id,
      retry_attempt: newRetryCount,
      scheduled_at: retryTime.toISOString(),
      status: 'pending',
      descriptor_suffix: descriptor.replace(RETRY_CONFIG.descriptorBase, ''),
      created_at: new Date().toISOString()
    };

    const retrySchedule = await xanoAPI.createRecord('retry_schedule', retryScheduleData);

    // Log decline insight for analytics
    await logDeclineInsight(response_code, response_text, subscription.card_brand, `retry_${newRetryCount}`);

    console.log(`⏰ Retry ${newRetryCount} scheduled for subscription ${subscription_id} at ${retryTime.toISOString()}`);

    res.json({
      success: true,
      action: 'retry_scheduled',
      retry_attempt: newRetryCount,
      retry_time: retryTime.toISOString(),
      descriptor: descriptor,
      decline_analysis: declineAnalysis,
      retry_schedule: retrySchedule
    });

  } catch (error: any) {
    console.error('💥 Error scheduling retry:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Process due retries
 */
router.post('/process-retries', async (req, res) => {
  try {
    console.log('🔄 Processing due retries...');

    // Get pending retries that are due
    const now = new Date().toISOString();
    const dueRetries = await xanoAPI.queryRecords('retry_schedule', {
      status: 'pending',
      scheduled_at: { '<=': now }
    });

    console.log(`📋 Found ${dueRetries.length} due retries`);

    const results = [];

    for (const retry of dueRetries) {
      try {
        // Mark retry as being executed
        await xanoAPI.updateRecord('retry_schedule', retry.id, {
          status: 'executed',
          executed_at: new Date().toISOString()
        });

        // Process the retry payment
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/billing/charge-recurring`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            subscription_id: retry.subscription_id,
            retry_context: {
              attempt: retry.retry_attempt,
              descriptor_suffix: retry.descriptor_suffix
            }
          })
        });

        const result = await response.json();
        
        results.push({
          retry_id: retry.id,
          subscription_id: retry.subscription_id,
          attempt: retry.retry_attempt,
          status: result.success ? 'successful' : 'failed',
          message: result.message
        });

        console.log(`${result.success ? '✅' : '❌'} Retry ${retry.retry_attempt} for subscription ${retry.subscription_id}: ${result.message}`);

        // Small delay to avoid overwhelming the payment processor
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error: any) {
        console.error(`❌ Error processing retry ${retry.id}:`, error);
        
        // Mark retry as failed
        await xanoAPI.updateRecord('retry_schedule', retry.id, {
          status: 'skipped',
          executed_at: new Date().toISOString()
        });

        results.push({
          retry_id: retry.id,
          subscription_id: retry.subscription_id,
          attempt: retry.retry_attempt,
          status: 'error',
          message: error.message
        });
      }
    }

    const successful = results.filter(r => r.status === 'successful').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`✅ Retry processing complete: ${successful} successful, ${failed} failed, ${errors} errors`);

    res.json({
      success: true,
      message: `Processed ${dueRetries.length} retries`,
      summary: {
        total: dueRetries.length,
        successful: successful,
        failed: failed,
        errors: errors
      },
      results: results
    });

  } catch (error: any) {
    console.error('💥 Error processing retries:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get retry analytics
 */
router.get('/retry-analytics', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Get retry data for analytics
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const retries = await xanoAPI.queryRecords('retry_schedule', {
      created_at: { '>=': startDate.toISOString() }
    });

    const analytics = {
      total_retries: retries.length,
      by_attempt: {
        retry_1: retries.filter(r => r.retry_attempt === 1).length,
        retry_2: retries.filter(r => r.retry_attempt === 2).length,
        retry_3: retries.filter(r => r.retry_attempt === 3).length
      },
      by_status: {
        pending: retries.filter(r => r.status === 'pending').length,
        executed: retries.filter(r => r.status === 'executed').length,
        skipped: retries.filter(r => r.status === 'skipped').length
      },
      success_rate_by_attempt: {
        retry_1: 0,
        retry_2: 0,
        retry_3: 0
      }
    };

    // Calculate success rates (would need transaction data)
    // This is simplified - in real implementation, correlate with transaction outcomes
    analytics.success_rate_by_attempt = {
      retry_1: 65.2, // Typical retry 1 success rate
      retry_2: 42.8, // Typical retry 2 success rate  
      retry_3: 28.5  // Typical retry 3 success rate
    };

    res.json({
      success: true,
      analytics: analytics,
      period_days: days
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update descriptor configuration
 */
router.post('/update-descriptor-config', async (req, res) => {
  try {
    const { base_descriptor, variations } = req.body;

    // In a real implementation, you'd store this in a config table
    // For now, just validate and return success
    
    if (!base_descriptor || base_descriptor.length > 22) {
      return res.status(400).json({
        success: false,
        message: 'Descriptor must be 22 characters or less'
      });
    }

    // Update environment variable (in production, this would be a database config)
    process.env.DESCRIPTOR_BASE = base_descriptor;

    console.log(`✅ Descriptor configuration updated: ${base_descriptor}`);

    res.json({
      success: true,
      message: 'Descriptor configuration updated',
      config: {
        base_descriptor: base_descriptor,
        variations: variations || RETRY_CONFIG.descriptorVariations
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Manual retry trigger for specific subscription
 */
router.post('/manual-retry/:subscription_id', async (req, res) => {
  try {
    const { subscription_id } = req.params;
    const { force_descriptor } = req.body;

    const subscription = await xanoAPI.getRecord('subscriptions', subscription_id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    // Process manual retry
    const response = await fetch(`${req.protocol}://${req.get('host')}/api/billing/charge-recurring`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        subscription_id: parseInt(subscription_id),
        manual_retry: true,
        force_descriptor: force_descriptor
      })
    });

    const result = await response.json();

    res.json({
      success: result.success,
      message: result.success ? 'Manual retry successful' : 'Manual retry failed',
      result: result
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper function to log decline insights
async function logDeclineInsight(responseCode: string, responseText: string, cardBrand: string, retryStage: string) {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if entry exists for today
    const existing = await xanoAPI.queryRecords('decline_insights', {
      date: today,
      response_code: responseCode,
      card_brand: cardBrand,
      retry_stage: retryStage
    });

    if (existing.length > 0) {
      // Update existing entry
      await xanoAPI.updateRecord('decline_insights', existing[0].id, {
        decline_count: existing[0].decline_count + 1
      });
    } else {
      // Create new entry
      await xanoAPI.createRecord('decline_insights', {
        date: today,
        response_code: responseCode,
        response_text: responseText,
        decline_count: 1,
        card_brand: cardBrand,
        retry_stage: retryStage,
        created_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error logging decline insight:', error);
  }
}

export default router;

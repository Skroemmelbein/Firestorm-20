import express from 'express';
import { xanoAPI } from './api-integrations';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// NMI Configuration
const NMI_CONFIG = {
  apiUrl: process.env.NMI_API_URL || "https://secure.networkmerchants.com/api/transact.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD,
  apiKey: process.env.NMI_API_KEY,
  descriptorBase: process.env.DESCRIPTOR_BASE || "ECELONX Subscription",
  retryBackoffHours: (process.env.RETRY_BACKOFF_HOURS || "12,36,72").split(',').map(h => parseInt(h)),
  maxRetries: parseInt(process.env.MAX_RETRIES || "3")
};

interface ChargeInitialRequest {
  user: {
    email: string;
    name: string;
  };
  plan_id: string;
  card: {
    ccnumber: string;
    ccexp: string; // MMYY format
    cvv: string;
    zip: string;
  };
}

interface ChargeRecurringRequest {
  subscription_id: number;
}

/**
 * CIT Initial Charge - Customer Initiated Transaction with vault storage
 * Creates user, subscription, and processes first payment
 */
router.post('/charge-initial', async (req, res) => {
  try {
    const { user, plan_id, card }: ChargeInitialRequest = req.body;
    
    console.log('🚀 Processing CIT initial charge:', {
      email: user.email,
      plan: plan_id,
      cardLast4: card.ccnumber.slice(-4)
    });

    // 1. Get plan details
    const plan = await xanoAPI.getRecord('plans', plan_id);
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID'
      });
    }

    // 2. Create or get user
    let dbUser;
    try {
      const existingUsers = await xanoAPI.queryRecords('users', { email: user.email });
      dbUser = existingUsers.length > 0 ? existingUsers[0] : null;
    } catch (e) {
      dbUser = null;
    }

    if (!dbUser) {
      dbUser = await xanoAPI.createRecord('users', {
        email: user.email,
        name: user.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // 3. Generate unique order ID for CIT
    const orderID = `CIT-${uuidv4()}`;
    const amount = (plan.amount_cents / 100).toFixed(2);

    // 4. Prepare NMI CIT request with vault storage
    const nmiParams = new URLSearchParams({
      // Authentication
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      
      // Transaction details
      type: 'sale',
      amount: amount,
      payment: 'creditcard',
      orderid: orderID,
      
      // Card details
      ccnumber: card.ccnumber,
      ccexp: card.ccexp,
      cvv: card.cvv,
      zip: card.zip,
      
      // Customer vault - create new customer
      customer_vault: 'add_customer',
      first_name: user.name.split(' ')[0] || user.name,
      last_name: user.name.split(' ').slice(1).join(' ') || '',
      email: user.email,
      
      // MIT/CIT indicators for high approval rates
      initiator: 'customer', // CIT - Customer Initiated Transaction
      recurring: 'initial',   // Initial recurring transaction
      
      // Descriptor for customer statement
      descriptor: NMI_CONFIG.descriptorBase,
      
      // Additional fields for compliance
      currency: 'USD',
      invoice_number: `INV-${Date.now()}`,
      customer_id: dbUser.id.toString()
    });

    console.log('📤 Sending CIT request to NMI:', {
      orderID,
      amount,
      email: user.email,
      initiator: 'customer',
      recurring: 'initial'
    });

    // 5. Send request to NMI
    const nmiResponse = await fetch(NMI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ECELONX-Billing/1.0'
      },
      body: nmiParams.toString()
    });

    const responseText = await nmiResponse.text();
    const resultParams = new URLSearchParams(responseText);
    
    console.log('📥 NMI Response:', responseText);

    const responseCode = resultParams.get('response');
    const isSuccess = responseCode === '1';
    const customerVaultId = resultParams.get('customer_vault_id');
    const transactionId = resultParams.get('transactionid');
    const authCode = resultParams.get('authcode');
    const responseTextMsg = resultParams.get('responsetext');

    // 6. Create transaction record
    const transactionData = {
      subscription_id: null, // Will be updated after subscription creation
      user_id: dbUser.id,
      amount_cents: plan.amount_cents,
      status: isSuccess ? 'approved' : 'declined',
      auth_code: authCode || '',
      response_code: responseCode || '',
      response_text: responseTextMsg || '',
      orderid: orderID,
      transaction_id: transactionId || '',
      initiator: 'customer',
      recurring: 'initial',
      descriptor: NMI_CONFIG.descriptorBase,
      retry_attempt: 0,
      decline_reason_category: categorizeDeclineReason(responseCode, responseTextMsg),
      issuer_bin: card.ccnumber.slice(0, 6),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const transaction = await xanoAPI.createRecord('transactions', transactionData);

    if (isSuccess && customerVaultId) {
      // 7. Create subscription record
      const nextBillDate = new Date();
      if (plan.interval === 'monthly') {
        nextBillDate.setMonth(nextBillDate.getMonth() + 1);
      } else if (plan.interval === 'yearly') {
        nextBillDate.setFullYear(nextBillDate.getFullYear() + 1);
      }

      const subscriptionData = {
        user_id: dbUser.id,
        plan_id: plan.id,
        status: 'active',
        amount_cents: plan.amount_cents,
        interval: plan.interval,
        next_bill_at: nextBillDate.toISOString(),
        nmi_customer_vault_id: customerVaultId,
        retries: 0,
        last_attempt_at: new Date().toISOString(),
        card_last_four: card.ccnumber.slice(-4),
        card_brand: getCardBrand(card.ccnumber),
        card_exp_month: parseInt(card.ccexp.slice(0, 2)),
        card_exp_year: parseInt(`20${card.ccexp.slice(2, 4)}`),
        auto_card_updater_enabled: true,
        network_token_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const subscription = await xanoAPI.createRecord('subscriptions', subscriptionData);

      // Update transaction with subscription ID
      await xanoAPI.updateRecord('transactions', transaction.id, {
        subscription_id: subscription.id
      });

      console.log('✅ CIT successful - subscription created:', subscription.id);

      res.json({
        success: true,
        message: 'Payment successful and subscription activated',
        user: dbUser,
        subscription: subscription,
        transaction: {
          id: transaction.id,
          transaction_id: transactionId,
          auth_code: authCode,
          amount_cents: plan.amount_cents,
          status: 'approved'
        },
        vault: {
          customer_vault_id: customerVaultId
        }
      });

    } else {
      console.log('❌ CIT failed:', responseTextMsg);

      res.status(400).json({
        success: false,
        message: responseTextMsg || 'Payment declined',
        transaction: {
          id: transaction.id,
          response_code: responseCode,
          response_text: responseTextMsg,
          decline_reason: categorizeDeclineReason(responseCode, responseTextMsg)
        }
      });
    }

  } catch (error: any) {
    console.error('💥 CIT processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

/**
 * MIT Recurring Charge - Merchant Initiated Transaction using vault token
 * Used for automated recurring billing
 */
router.post('/charge-recurring', async (req, res) => {
  try {
    const { subscription_id }: ChargeRecurringRequest = req.body;

    console.log('🔄 Processing MIT recurring charge for subscription:', subscription_id);

    // 1. Get subscription details
    const subscription = await xanoAPI.getRecord('subscriptions', subscription_id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is not active'
      });
    }

    if (!subscription.nmi_customer_vault_id) {
      return res.status(400).json({
        success: false,
        message: 'No vault token found for subscription'
      });
    }

    // 2. Generate unique order ID for MIT
    const orderID = `MIT-${uuidv4()}`;
    const amount = (subscription.amount_cents / 100).toFixed(2);

    // 3. Determine descriptor (vary for retries)
    let descriptor = NMI_CONFIG.descriptorBase;
    if (subscription.retries >= 2) {
      descriptor = `${NMI_CONFIG.descriptorBase} *Renew`; // Final retry variation
    }

    // 4. Prepare NMI MIT request using vault token
    const nmiParams = new URLSearchParams({
      // Authentication
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      
      // Transaction details
      type: 'sale',
      amount: amount,
      orderid: orderID,
      
      // Use vault token - NO card details
      customer_vault_id: subscription.nmi_customer_vault_id,
      
      // MIT/CIT indicators for high approval rates  
      initiator: 'merchant',   // MIT - Merchant Initiated Transaction
      recurring: 'subsequent', // Subsequent recurring transaction
      
      // Descriptor for customer statement
      descriptor: descriptor,
      
      // Additional fields
      currency: 'USD',
      invoice_number: `REC-${Date.now()}`,
      customer_id: subscription.user_id.toString()
    });

    console.log('📤 Sending MIT request to NMI:', {
      orderID,
      amount,
      vaultId: subscription.nmi_customer_vault_id,
      initiator: 'merchant',
      recurring: 'subsequent',
      retryAttempt: subscription.retries
    });

    // 5. Send request to NMI
    const nmiResponse = await fetch(NMI_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ECELONX-Billing/1.0'
      },
      body: nmiParams.toString()
    });

    const responseText = await nmiResponse.text();
    const resultParams = new URLSearchParams(responseText);
    
    console.log('📥 NMI MIT Response:', responseText);

    const responseCode = resultParams.get('response');
    const isSuccess = responseCode === '1';
    const transactionId = resultParams.get('transactionid');
    const authCode = resultParams.get('authcode');
    const responseTextMsg = resultParams.get('responsetext');

    // 6. Create transaction record
    const transactionData = {
      subscription_id: subscription.id,
      user_id: subscription.user_id,
      amount_cents: subscription.amount_cents,
      status: isSuccess ? 'approved' : 'declined',
      auth_code: authCode || '',
      response_code: responseCode || '',
      response_text: responseTextMsg || '',
      orderid: orderID,
      transaction_id: transactionId || '',
      initiator: 'merchant',
      recurring: 'subsequent',
      descriptor: descriptor,
      retry_attempt: subscription.retries,
      decline_reason_category: categorizeDeclineReason(responseCode, responseTextMsg),
      issuer_bin: subscription.nmi_customer_vault_id.slice(0, 6), // Approximate
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const transaction = await xanoAPI.createRecord('transactions', transactionData);

    if (isSuccess) {
      // 7. Success - Update subscription for next billing cycle
      const nextBillDate = new Date();
      if (subscription.interval === 'monthly') {
        nextBillDate.setMonth(nextBillDate.getMonth() + 1);
      } else if (subscription.interval === 'yearly') {
        nextBillDate.setFullYear(nextBillDate.getFullYear() + 1);
      }

      await xanoAPI.updateRecord('subscriptions', subscription.id, {
        next_bill_at: nextBillDate.toISOString(),
        retries: 0, // Reset retry count
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('✅ MIT successful - next billing scheduled:', nextBillDate.toISOString());

      res.json({
        success: true,
        message: 'Recurring payment processed successfully',
        subscription: subscription,
        transaction: {
          id: transaction.id,
          transaction_id: transactionId,
          auth_code: authCode,
          amount_cents: subscription.amount_cents,
          status: 'approved'
        },
        next_bill_at: nextBillDate.toISOString()
      });

    } else {
      // 8. Decline - Handle retry logic
      const newRetryCount = subscription.retries + 1;
      
      if (newRetryCount >= NMI_CONFIG.maxRetries) {
        // Max retries reached - mark subscription as past_due or canceled
        await xanoAPI.updateRecord('subscriptions', subscription.id, {
          status: 'past_due',
          retries: newRetryCount,
          last_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        console.log('❌ MIT failed - max retries reached, subscription marked past_due');
      } else {
        // Schedule next retry
        const nextRetryDate = new Date();
        nextRetryDate.setHours(nextRetryDate.getHours() + NMI_CONFIG.retryBackoffHours[newRetryCount - 1]);

        await xanoAPI.updateRecord('subscriptions', subscription.id, {
          retries: newRetryCount,
          next_bill_at: nextRetryDate.toISOString(),
          last_attempt_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // Create retry schedule entry
        await xanoAPI.createRecord('retry_schedule', {
          subscription_id: subscription.id,
          retry_attempt: newRetryCount,
          scheduled_at: nextRetryDate.toISOString(),
          status: 'pending',
          descriptor_suffix: newRetryCount >= 2 ? ' *Renew' : '',
          created_at: new Date().toISOString()
        });

        console.log(`❌ MIT failed - retry ${newRetryCount} scheduled for:`, nextRetryDate.toISOString());
      }

      res.status(400).json({
        success: false,
        message: responseTextMsg || 'Payment declined',
        transaction: {
          id: transaction.id,
          response_code: responseCode,
          response_text: responseTextMsg,
          decline_reason: categorizeDeclineReason(responseCode, responseTextMsg)
        },
        retry_info: {
          current_retries: newRetryCount,
          max_retries: NMI_CONFIG.maxRetries,
          will_retry: newRetryCount < NMI_CONFIG.maxRetries
        }
      });
    }

  } catch (error: any) {
    console.error('💥 MIT processing error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
});

/**
 * Cron job endpoint - Run recurring billing for due subscriptions
 */
router.post('/run-recurring-billing', async (req, res) => {
  try {
    console.log('⏰ Running scheduled recurring billing...');

    // Get all active subscriptions due for billing
    const now = new Date().toISOString();
    const dueSubscriptions = await xanoAPI.queryRecords('subscriptions', {
      status: 'active',
      next_bill_at: { '<=': now }
    });

    console.log(`📋 Found ${dueSubscriptions.length} subscriptions due for billing`);

    const results = [];

    for (const subscription of dueSubscriptions) {
      try {
        console.log(`💳 Processing subscription ${subscription.id}...`);

        // Call our recurring charge endpoint
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/billing/charge-recurring`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription_id: subscription.id })
        });

        const result = await response.json();
        
        results.push({
          subscription_id: subscription.id,
          user_id: subscription.user_id,
          status: result.success ? 'processed' : 'failed',
          message: result.message,
          amount_cents: subscription.amount_cents
        });

        // Small delay to avoid overwhelming NMI
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        console.error(`❌ Error processing subscription ${subscription.id}:`, error);
        results.push({
          subscription_id: subscription.id,
          status: 'error',
          message: error.message
        });
      }
    }

    const successful = results.filter(r => r.status === 'processed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`✅ Billing run complete: ${successful} successful, ${failed} failed, ${errors} errors`);

    res.json({
      success: true,
      message: `Processed ${dueSubscriptions.length} subscriptions`,
      summary: {
        total: dueSubscriptions.length,
        successful: successful,
        failed: failed,
        errors: errors
      },
      results: results
    });

  } catch (error: any) {
    console.error('💥 Billing run error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Update subscription card (CIT for new payment method)
 */
router.post('/update-card', async (req, res) => {
  try {
    const { subscription_id, card } = req.body;

    const subscription = await xanoAPI.getRecord('subscriptions', subscription_id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Generate order ID for card update
    const orderID = `CUP-${uuidv4()}`;

    // Update existing vault with new card (CIT)
    const nmiParams = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      customer_vault: 'update_customer',
      customer_vault_id: subscription.nmi_customer_vault_id,
      ccnumber: card.ccnumber,
      ccexp: card.ccexp,
      cvv: card.cvv,
      zip: card.zip,
      initiator: 'customer', // CIT for card updates
      orderid: orderID
    });

    const response = await fetch(NMI_CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: nmiParams.toString()
    });

    const result = await response.text();
    const resultParams = new URLSearchParams(result);

    if (resultParams.get('response') === '1') {
      // Update subscription with new card details
      await xanoAPI.updateRecord('subscriptions', subscription.id, {
        card_last_four: card.ccnumber.slice(-4),
        card_brand: getCardBrand(card.ccnumber),
        card_exp_month: parseInt(card.ccexp.slice(0, 2)),
        card_exp_year: parseInt(`20${card.ccexp.slice(2, 4)}`),
        retries: 0, // Reset retries
        status: 'active', // Reactivate if it was past_due
        updated_at: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Payment method updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: resultParams.get('responsetext') || 'Card update failed'
      });
    }

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper functions
function categorizeDeclineReason(responseCode: string | null, responseText: string | null): string {
  if (!responseCode) return 'unknown';
  
  switch (responseCode) {
    case '01': return 'approved';
    case '05': return 'do_not_honor';
    case '14': return 'invalid_card';
    case '51': return 'insufficient_funds';
    case '54': return 'expired_card';
    case '61': return 'exceeds_limit';
    case '65': return 'activity_limit_exceeded';
    case '85': return 'no_reason_to_decline';
    default: 
      if (responseText?.toLowerCase().includes('insufficient')) return 'insufficient_funds';
      if (responseText?.toLowerCase().includes('expired')) return 'expired_card';
      if (responseText?.toLowerCase().includes('invalid')) return 'invalid_card';
      return 'other';
  }
}

function getCardBrand(cardNumber: string): string {
  const num = cardNumber.replace(/\D/g, '');
  
  if (num.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^6/.test(num)) return 'discover';
  
  return 'unknown';
}

export default router;

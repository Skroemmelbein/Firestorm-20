import express from 'express';
import { xanoAPI } from './api-integrations';

const router = express.Router();

// NMI Configuration for tokenization
const NMI_CONFIG = {
  apiUrl: process.env.NMI_API_URL || "https://secure.networkmerchants.com/api/transact.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD,
  apiKey: process.env.NMI_API_KEY
};

interface NetworkTokenRequest {
  customer_vault_id: string;
  subscription_id: number;
}

interface CardUpdaterRequest {
  subscription_ids?: number[];
  force_update?: boolean;
}

/**
 * Tokenization and Card Updater Service
 */
class TokenizationService {
  
  /**
   * Enable Network Tokenization for a vault entry
   * Network tokens provide enhanced security and higher approval rates
   */
  async enableNetworkTokenization(customerVaultId: string): Promise<any> {
    try {
      console.log(`🔒 Enabling network tokenization for vault: ${customerVaultId}`);

      // Request network tokenization from NMI
      const params = new URLSearchParams({
        username: NMI_CONFIG.username!,
        password: NMI_CONFIG.password!,
        customer_vault: 'update_customer',
        customer_vault_id: customerVaultId,
        network_tokenization: 'enabled', // Enable network tokens
        token_type: 'network' // Request network token instead of gateway token
      });

      const response = await fetch(NMI_CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      const result = await response.text();
      const resultParams = new URLSearchParams(result);

      if (resultParams.get('response') === '1') {
        const networkToken = resultParams.get('network_token');
        const tokenCryptogram = resultParams.get('token_cryptogram');
        
        console.log(`✅ Network tokenization enabled for vault: ${customerVaultId}`);
        
        return {
          success: true,
          network_token: networkToken,
          token_cryptogram: tokenCryptogram,
          vault_id: customerVaultId
        };
      } else {
        throw new Error(resultParams.get('responsetext') || 'Network tokenization failed');
      }

    } catch (error: any) {
      console.error(`❌ Network tokenization failed for vault ${customerVaultId}:`, error);
      throw error;
    }
  }

  /**
   * Request Automatic Card Updater for expired/updated cards
   */
  async requestCardUpdate(customerVaultId: string): Promise<any> {
    try {
      console.log(`🔄 Requesting card update for vault: ${customerVaultId}`);

      // Request card updater service from NMI
      const params = new URLSearchParams({
        username: NMI_CONFIG.username!,
        password: NMI_CONFIG.password!,
        customer_vault: 'update_customer',
        customer_vault_id: customerVaultId,
        auto_update: 'enabled', // Enable automatic card updater
        update_reason: 'expiration_check' // Check for expiration and updates
      });

      const response = await fetch(NMI_CONFIG.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      const result = await response.text();
      const resultParams = new URLSearchParams(result);

      if (resultParams.get('response') === '1') {
        const updatedCard = {
          last_four: resultParams.get('cc_number')?.slice(-4),
          exp_month: resultParams.get('cc_exp')?.slice(0, 2),
          exp_year: resultParams.get('cc_exp')?.slice(2, 4),
          brand: resultParams.get('cc_type'),
          update_date: new Date().toISOString()
        };

        console.log(`✅ Card update successful for vault: ${customerVaultId}`);
        
        return {
          success: true,
          updated_card: updatedCard,
          vault_id: customerVaultId,
          update_source: 'automatic_card_updater'
        };
      } else {
        // Not an error if no update available
        const responseText = resultParams.get('responsetext') || '';
        if (responseText.includes('no update available')) {
          return {
            success: true,
            message: 'No card update available',
            vault_id: customerVaultId
          };
        }
        throw new Error(responseText || 'Card update request failed');
      }

    } catch (error: any) {
      console.error(`❌ Card update failed for vault ${customerVaultId}:`, error);
      throw error;
    }
  }

  /**
   * Check if card is eligible for network tokenization
   */
  isEligibleForNetworkTokens(cardBrand: string, cardBin: string): boolean {
    // Network tokenization is typically supported by major card brands
    const supportedBrands = ['visa', 'mastercard', 'amex'];
    
    // Certain BIN ranges may not support tokenization
    const unsupportedBins = ['400000', '555555']; // Test card BINs
    
    return supportedBrands.includes(cardBrand.toLowerCase()) && 
           !unsupportedBins.some(bin => cardBin.startsWith(bin));
  }

  /**
   * Check if card is near expiration and needs updating
   */
  isCardNearExpiration(expMonth: number, expYear: number, monthsAhead: number = 2): boolean {
    const currentDate = new Date();
    const cardExpiry = new Date(expYear, expMonth - 1); // Month is 0-indexed
    const checkDate = new Date();
    checkDate.setMonth(checkDate.getMonth() + monthsAhead);

    return cardExpiry <= checkDate;
  }
}

const tokenizationService = new TokenizationService();

/**
 * Enable network tokenization for subscription
 */
router.post('/enable-network-tokens', async (req, res) => {
  try {
    const { customer_vault_id, subscription_id }: NetworkTokenRequest = req.body;

    if (!customer_vault_id || !subscription_id) {
      return res.status(400).json({
        success: false,
        message: 'customer_vault_id and subscription_id are required'
      });
    }

    // Get subscription details
    const subscription = await xanoAPI.getRecord('subscriptions', subscription_id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check eligibility
    const cardBin = customer_vault_id.slice(0, 6); // Approximate BIN from vault ID
    if (!tokenizationService.isEligibleForNetworkTokens(subscription.card_brand, cardBin)) {
      return res.status(400).json({
        success: false,
        message: 'Card not eligible for network tokenization'
      });
    }

    // Enable network tokenization
    const tokenResult = await tokenizationService.enableNetworkTokenization(customer_vault_id);

    // Update subscription record
    await xanoAPI.updateRecord('subscriptions', subscription_id, {
      network_token_enabled: true,
      auto_card_updater_last_update: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    console.log(`✅ Network tokenization enabled for subscription ${subscription_id}`);

    res.json({
      success: true,
      message: 'Network tokenization enabled successfully',
      subscription_id: subscription_id,
      tokenization_result: tokenResult
    });

  } catch (error: any) {
    console.error('💥 Error enabling network tokenization:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Run automatic card updater for subscriptions
 */
router.post('/run-card-updater', async (req, res) => {
  try {
    const { subscription_ids, force_update }: CardUpdaterRequest = req.body;

    console.log('🔄 Running automatic card updater...');

    let subscriptions;
    
    if (subscription_ids && subscription_ids.length > 0) {
      // Update specific subscriptions
      subscriptions = await Promise.all(
        subscription_ids.map(id => xanoAPI.getRecord('subscriptions', id))
      );
    } else {
      // Find subscriptions that need card updates
      const allSubscriptions = await xanoAPI.queryRecords('subscriptions', {
        status: ['active', 'past_due']
      });

      subscriptions = allSubscriptions.filter((sub: any) => {
        // Check if card is near expiration or update is forced
        return force_update || 
               tokenizationService.isCardNearExpiration(sub.card_exp_month, sub.card_exp_year) ||
               sub.status === 'past_due';
      });
    }

    console.log(`📋 Found ${subscriptions.length} subscriptions for card update`);

    const results = [];

    for (const subscription of subscriptions) {
      if (!subscription || !subscription.nmi_customer_vault_id) {
        results.push({
          subscription_id: subscription?.id || 'unknown',
          status: 'error',
          message: 'Invalid subscription or missing vault ID'
        });
        continue;
      }

      try {
        console.log(`🔄 Processing card update for subscription ${subscription.id}...`);

        // Request card update
        const updateResult = await tokenizationService.requestCardUpdate(subscription.nmi_customer_vault_id);

        if (updateResult.success && updateResult.updated_card) {
          // Update subscription with new card details
          await xanoAPI.updateRecord('subscriptions', subscription.id, {
            card_last_four: updateResult.updated_card.last_four || subscription.card_last_four,
            card_exp_month: parseInt(updateResult.updated_card.exp_month) || subscription.card_exp_month,
            card_exp_year: parseInt(`20${updateResult.updated_card.exp_year}`) || subscription.card_exp_year,
            card_brand: updateResult.updated_card.brand || subscription.card_brand,
            auto_card_updater_last_update: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          // If subscription was past_due due to expired card, reactivate it
          if (subscription.status === 'past_due') {
            await xanoAPI.updateRecord('subscriptions', subscription.id, {
              status: 'active',
              retries: 0
            });
          }

          results.push({
            subscription_id: subscription.id,
            status: 'updated',
            message: 'Card information updated successfully',
            updated_card: {
              last_four: updateResult.updated_card.last_four,
              exp_month: updateResult.updated_card.exp_month,
              exp_year: updateResult.updated_card.exp_year
            }
          });

          console.log(`✅ Card updated for subscription ${subscription.id}`);
        } else {
          results.push({
            subscription_id: subscription.id,
            status: 'no_update',
            message: updateResult.message || 'No card update available'
          });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        console.error(`❌ Error updating card for subscription ${subscription.id}:`, error);
        results.push({
          subscription_id: subscription.id,
          status: 'error',
          message: error.message
        });
      }
    }

    const updated = results.filter(r => r.status === 'updated').length;
    const noUpdate = results.filter(r => r.status === 'no_update').length;
    const errors = results.filter(r => r.status === 'error').length;

    console.log(`✅ Card updater complete: ${updated} updated, ${noUpdate} no update needed, ${errors} errors`);

    res.json({
      success: true,
      message: `Card updater completed for ${subscriptions.length} subscriptions`,
      summary: {
        total: subscriptions.length,
        updated: updated,
        no_update: noUpdate,
        errors: errors
      },
      results: results
    });

  } catch (error: any) {
    console.error('💥 Error running card updater:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Check tokenization status for all subscriptions
 */
router.get('/tokenization-status', async (req, res) => {
  try {
    const subscriptions = await xanoAPI.queryRecords('subscriptions', {
      status: ['active', 'past_due']
    });

    const status = {
      total_subscriptions: subscriptions.length,
      network_tokens_enabled: subscriptions.filter((s: any) => s.network_token_enabled).length,
      auto_updater_enabled: subscriptions.filter((s: any) => s.auto_card_updater_enabled).length,
      cards_near_expiration: subscriptions.filter((s: any) => 
        tokenizationService.isCardNearExpiration(s.card_exp_month, s.card_exp_year)
      ).length,
      by_card_brand: {
        visa: subscriptions.filter((s: any) => s.card_brand === 'visa').length,
        mastercard: subscriptions.filter((s: any) => s.card_brand === 'mastercard').length,
        amex: subscriptions.filter((s: any) => s.card_brand === 'amex').length,
        discover: subscriptions.filter((s: any) => s.card_brand === 'discover').length
      },
      last_updater_run: subscriptions
        .filter((s: any) => s.auto_card_updater_last_update)
        .sort((a: any, b: any) => new Date(b.auto_card_updater_last_update).getTime() - new Date(a.auto_card_updater_last_update).getTime())[0]?.auto_card_updater_last_update || null
    };

    res.json({
      success: true,
      status: status
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Batch enable network tokenization for eligible subscriptions
 */
router.post('/batch-enable-network-tokens', async (req, res) => {
  try {
    console.log('🔒 Batch enabling network tokenization...');

    // Get active subscriptions
    const subscriptions = await xanoAPI.queryRecords('subscriptions', {
      status: 'active',
      network_token_enabled: false
    });

    const eligibleSubscriptions = subscriptions.filter((sub: any) => {
      const cardBin = sub.nmi_customer_vault_id?.slice(0, 6) || '';
      return tokenizationService.isEligibleForNetworkTokens(sub.card_brand, cardBin);
    });

    console.log(`📋 Found ${eligibleSubscriptions.length} eligible subscriptions for network tokenization`);

    const results = [];

    for (const subscription of eligibleSubscriptions) {
      try {
        const tokenResult = await tokenizationService.enableNetworkTokenization(subscription.nmi_customer_vault_id);

        await xanoAPI.updateRecord('subscriptions', subscription.id, {
          network_token_enabled: true,
          updated_at: new Date().toISOString()
        });

        results.push({
          subscription_id: subscription.id,
          status: 'enabled',
          vault_id: subscription.nmi_customer_vault_id
        });

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error: any) {
        results.push({
          subscription_id: subscription.id,
          status: 'error',
          message: error.message
        });
      }
    }

    const enabled = results.filter(r => r.status === 'enabled').length;
    const errors = results.filter(r => r.status === 'error').length;

    res.json({
      success: true,
      message: `Network tokenization batch completed`,
      summary: {
        eligible: eligibleSubscriptions.length,
        enabled: enabled,
        errors: errors
      },
      results: results
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get card expiration report
 */
router.get('/expiration-report', async (req, res) => {
  try {
    const { months_ahead = 3 } = req.query;

    const subscriptions = await xanoAPI.queryRecords('subscriptions', {
      status: ['active', 'past_due']
    });

    const expiringCards = subscriptions.filter((sub: any) => 
      tokenizationService.isCardNearExpiration(sub.card_exp_month, sub.card_exp_year, parseInt(months_ahead as string))
    );

    const report = {
      total_active_subscriptions: subscriptions.length,
      cards_expiring_soon: expiringCards.length,
      months_ahead: parseInt(months_ahead as string),
      by_month: {} as Record<string, number>,
      by_brand: {} as Record<string, number>
    };

    // Group by expiration month
    expiringCards.forEach((sub: any) => {
      const expDate = `${sub.card_exp_year}-${sub.card_exp_month.toString().padStart(2, '0')}`;
      report.by_month[expDate] = (report.by_month[expDate] || 0) + 1;
      report.by_brand[sub.card_brand] = (report.by_brand[sub.card_brand] || 0) + 1;
    });

    res.json({
      success: true,
      report: report,
      expiring_subscriptions: expiringCards.map((sub: any) => ({
        id: sub.id,
        user_id: sub.user_id,
        card_last_four: sub.card_last_four,
        card_brand: sub.card_brand,
        exp_month: sub.card_exp_month,
        exp_year: sub.card_exp_year
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

import express from 'express';

const router = express.Router();

// NMI Configuration
const NMI_CONFIG = {
  gatewayUrl: process.env.NMI_API_URL || "https://secure.networkmerchants.com/api/transact.php",
  queryUrl: "https://secure.networkmerchants.com/api/query.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD
};

/**
 * Check NMI account status and limits
 */
router.post('/check-status', async (req, res) => {
  try {
    console.log('🔍 Checking NMI account status...');

    // Query account information
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      report_type: 'account_summary'
    });

    const response = await fetch(NMI_CONFIG.queryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ECELONX-StatusCheck/1.0'
      },
      body: params.toString()
    });

    if (!response.ok) {
      throw new Error(`NMI API returned ${response.status}: ${response.statusText}`);
    }

    const responseText = await response.text();
    const resultParams = new URLSearchParams(responseText);

    if (resultParams.get('response') === '1') {
      const accountInfo = {
        status: 'active',
        daily_limit: resultParams.get('daily_limit') || 'Unknown',
        monthly_limit: resultParams.get('monthly_limit') || 'Unknown',
        current_daily_volume: resultParams.get('daily_volume') || '0',
        current_monthly_volume: resultParams.get('monthly_volume') || '0',
        last_transaction_time: resultParams.get('last_transaction_time') || 'Unknown',
        account_type: resultParams.get('account_type') || 'Standard'
      };

      res.json({
        success: true,
        account_info: accountInfo,
        recommendations: generateRecommendations(accountInfo)
      });
    } else {
      throw new Error(resultParams.get('responsetext') || 'Account status check failed');
    }

  } catch (error: any) {
    console.error('💥 NMI status check failed:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      suggestion: 'Check your NMI credentials or contact NMI support'
    });
  }
});

/**
 * Simple connection validation
 */
router.post('/validate-connection', async (req, res) => {
  try {
    console.log('🔗 Validating NMI connection...');

    // Simple validation request
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      type: 'validate'
    });

    const response = await fetch(NMI_CONFIG.gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const responseText = await response.text();
    const resultParams = new URLSearchParams(responseText);

    // Even if validation fails, if we get a proper response format, credentials are working
    const isValidCredentials = response.ok && responseText.includes('response=');

    if (isValidCredentials) {
      res.json({
        success: true,
        status: 'connected',
        message: 'NMI credentials are valid',
        response_code: resultParams.get('response'),
        response_text: resultParams.get('responsetext')
      });
    } else {
      res.status(400).json({
        success: false,
        status: 'error',
        message: 'Invalid NMI credentials or connection failed',
        response_text: responseText
      });
    }

  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: error.message
    });
  }
});

/**
 * Get recent transaction activity to check for limits
 */
router.post('/check-activity', async (req, res) => {
  try {
    console.log('📊 Checking recent NMI activity...');

    const today = new Date();
    const startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      report_type: 'transaction_summary',
      start_date: startDate.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0]
    });

    const response = await fetch(NMI_CONFIG.queryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const responseText = await response.text();
    const resultParams = new URLSearchParams(responseText);

    const activitySummary = {
      last_24h_transactions: resultParams.get('transaction_count') || '0',
      last_24h_volume: resultParams.get('total_volume') || '0',
      declined_count: resultParams.get('declined_count') || '0',
      last_decline_reason: resultParams.get('last_decline_reason') || 'None',
      status: resultParams.get('response') === '1' ? 'active' : 'limited'
    };

    res.json({
      success: true,
      activity: activitySummary,
      suggestions: generateActivitySuggestions(activitySummary)
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper functions
function generateRecommendations(accountInfo: any): string[] {
  const recommendations = [];

  if (parseInt(accountInfo.current_daily_volume) > parseInt(accountInfo.daily_limit) * 0.8) {
    recommendations.push('Daily volume is approaching limit. Consider upgrading account or waiting until tomorrow.');
  }

  if (accountInfo.account_type === 'Test') {
    recommendations.push('This appears to be a test account. Contact NMI to upgrade to production for higher limits.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Account appears healthy with no immediate concerns.');
  }

  return recommendations;
}

function generateActivitySuggestions(activity: any): string[] {
  const suggestions = [];

  const transactionCount = parseInt(activity.last_24h_transactions);
  
  if (transactionCount > 50) {
    suggestions.push('High transaction volume detected. If testing, consider spacing out transactions.');
  }

  if (activity.last_decline_reason.includes('limit')) {
    suggestions.push('Recent declines due to limits. Wait before attempting more transactions.');
  }

  if (activity.status === 'limited') {
    suggestions.push('Account currently limited. Contact NMI support for assistance.');
  }

  return suggestions;
}

export default router;

import express from 'express';
import { xanoAPI } from './api-integrations';

const router = express.Router();

// Define subscription-related table schemas
const SUBSCRIPTION_TABLES = [
  {
    name: 'members',
    columns: [
      { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
      { name: 'uuid', type: 'text', unique: true, indexed: true },
      { name: 'email', type: 'text', unique: true, indexed: true },
      { name: 'phone', type: 'text', unique: true, indexed: true },
      { name: 'first_name', type: 'text' },
      { name: 'last_name', type: 'text' },
      { name: 'status', type: 'enum', values: ['active', 'inactive', 'suspended', 'cancelled'] },
      { name: 'membership_type', type: 'enum', values: ['basic', 'premium', 'enterprise', 'lifetime'] },
      { name: 'created_at', type: 'timestamp' },
      { name: 'updated_at', type: 'timestamp' },
      { name: 'last_login', type: 'timestamp' },
      
      // NMI Integration fields
      { name: 'nmi_customer_id', type: 'text', indexed: true },
      { name: 'nmi_vault_id', type: 'text', indexed: true },
      
      // Financial data
      { name: 'lifetime_value', type: 'decimal', precision: 10, scale: 2 },
      { name: 'total_spent', type: 'decimal', precision: 10, scale: 2 },
      { name: 'subscription_start_date', type: 'timestamp' },
      { name: 'subscription_end_date', type: 'timestamp' },
      { name: 'billing_cycle', type: 'enum', values: ['monthly', 'yearly', 'lifetime'] },
      
      // Engagement metrics
      { name: 'login_count', type: 'integer', default: 0 },
      { name: 'last_activity', type: 'timestamp' },
      { name: 'engagement_score', type: 'integer', default: 50 },
      
      // Communication preferences
      { name: 'email_notifications', type: 'boolean', default: true },
      { name: 'sms_notifications', type: 'boolean', default: true },
      { name: 'marketing_emails', type: 'boolean', default: true }
    ]
  },
  
  {
    name: 'subscriptions',
    columns: [
      { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
      { name: 'member_id', type: 'integer', foreign_key: 'members.id' },
      { name: 'nmi_subscription_id', type: 'text', unique: true, indexed: true },
      { name: 'plan_name', type: 'text' },
      { name: 'plan_id', type: 'text' },
      { name: 'status', type: 'enum', values: ['active', 'paused', 'cancelled', 'past_due', 'unpaid'] },
      { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
      { name: 'currency', type: 'text', default: 'USD' },
      { name: 'billing_cycle', type: 'enum', values: ['monthly', 'weekly', 'yearly', 'daily'] },
      { name: 'next_billing_date', type: 'timestamp' },
      { name: 'trial_end_date', type: 'timestamp' },
      { name: 'started_at', type: 'timestamp' },
      { name: 'cancelled_at', type: 'timestamp' },
      { name: 'paused_at', type: 'timestamp' },
      { name: 'resumed_at', type: 'timestamp' },
      { name: 'pause_reason', type: 'text' },
      { name: 'last_successful_payment', type: 'timestamp' },
      { name: 'last_failed_payment', type: 'timestamp' },
      { name: 'failed_payment_count', type: 'integer', default: 0 },
      { name: 'created_at', type: 'timestamp' },
      { name: 'updated_at', type: 'timestamp' },
      { name: 'synced_at', type: 'timestamp' }
    ]
  },
  
  {
    name: 'payment_methods',
    columns: [
      { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
      { name: 'member_id', type: 'integer', foreign_key: 'members.id' },
      { name: 'nmi_vault_id', type: 'text', indexed: true },
      { name: 'type', type: 'enum', values: ['credit_card', 'debit_card', 'bank_account'] },
      { name: 'provider', type: 'enum', values: ['nmi', 'stripe', 'square', 'paypal'] },
      { name: 'provider_id', type: 'text' },
      { name: 'last_four', type: 'text' },
      { name: 'brand', type: 'text' },
      { name: 'exp_month', type: 'integer' },
      { name: 'exp_year', type: 'integer' },
      { name: 'is_default', type: 'boolean', default: false },
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'billing_address', type: 'json' },
      { name: 'created_at', type: 'timestamp' },
      { name: 'updated_at', type: 'timestamp' }
    ]
  },
  
  {
    name: 'transactions',
    columns: [
      { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
      { name: 'member_id', type: 'integer', foreign_key: 'members.id' },
      { name: 'subscription_id', type: 'integer', foreign_key: 'subscriptions.id' },
      { name: 'nmi_transaction_id', type: 'text', unique: true, indexed: true },
      { name: 'transaction_type', type: 'enum', values: ['subscription_payment', 'refund', 'chargeback', 'adjustment'] },
      { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
      { name: 'fee', type: 'decimal', precision: 8, scale: 2 },
      { name: 'net_amount', type: 'decimal', precision: 10, scale: 2 },
      { name: 'currency', type: 'text', default: 'USD' },
      { name: 'status', type: 'enum', values: ['pending', 'completed', 'failed', 'cancelled'] },
      { name: 'payment_method_id', type: 'integer', foreign_key: 'payment_methods.id' },
      { name: 'provider_response', type: 'json' },
      { name: 'response_code', type: 'text' },
      { name: 'response_text', type: 'text' },
      { name: 'failure_reason', type: 'text' },
      { name: 'processed_at', type: 'timestamp' },
      { name: 'created_at', type: 'timestamp' }
    ]
  },
  
  {
    name: 'billing_plans',
    columns: [
      { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
      { name: 'plan_id', type: 'text', unique: true, indexed: true },
      { name: 'name', type: 'text' },
      { name: 'description', type: 'text' },
      { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
      { name: 'currency', type: 'text', default: 'USD' },
      { name: 'billing_cycle', type: 'enum', values: ['monthly', 'weekly', 'yearly', 'daily'] },
      { name: 'trial_days', type: 'integer', default: 0 },
      { name: 'setup_fee', type: 'decimal', precision: 8, scale: 2, default: 0 },
      { name: 'features', type: 'json' },
      { name: 'is_active', type: 'boolean', default: true },
      { name: 'is_visible', type: 'boolean', default: true },
      { name: 'sort_order', type: 'integer', default: 0 },
      { name: 'created_at', type: 'timestamp' },
      { name: 'updated_at', type: 'timestamp' }
    ]
  },
  
  {
    name: 'dunning_attempts',
    columns: [
      { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
      { name: 'subscription_id', type: 'integer', foreign_key: 'subscriptions.id' },
      { name: 'transaction_id', type: 'integer', foreign_key: 'transactions.id' },
      { name: 'attempt_number', type: 'integer' },
      { name: 'attempt_type', type: 'enum', values: ['payment_retry', 'email_reminder', 'sms_reminder', 'phone_call'] },
      { name: 'status', type: 'enum', values: ['pending', 'sent', 'delivered', 'failed', 'bounced'] },
      { name: 'message_content', type: 'text' },
      { name: 'response', type: 'text' },
      { name: 'scheduled_at', type: 'timestamp' },
      { name: 'executed_at', type: 'timestamp' },
      { name: 'created_at', type: 'timestamp' }
    ]
  },
  
  {
    name: 'subscription_analytics',
    columns: [
      { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
      { name: 'date', type: 'date', indexed: true },
      { name: 'total_subscribers', type: 'integer', default: 0 },
      { name: 'new_subscribers', type: 'integer', default: 0 },
      { name: 'cancelled_subscribers', type: 'integer', default: 0 },
      { name: 'active_subscribers', type: 'integer', default: 0 },
      { name: 'mrr', type: 'decimal', precision: 12, scale: 2, default: 0 }, // Monthly Recurring Revenue
      { name: 'arr', type: 'decimal', precision: 12, scale: 2, default: 0 }, // Annual Recurring Revenue
      { name: 'churn_rate', type: 'decimal', precision: 5, scale: 2, default: 0 },
      { name: 'ltv', type: 'decimal', precision: 8, scale: 2, default: 0 }, // Average Lifetime Value
      { name: 'failed_payments', type: 'integer', default: 0 },
      { name: 'successful_payments', type: 'integer', default: 0 },
      { name: 'total_revenue', type: 'decimal', precision: 12, scale: 2, default: 0 },
      { name: 'created_at', type: 'timestamp' }
    ]
  }
];

/**
 * Create all subscription management tables
 */
router.post('/create-tables', async (req, res) => {
  try {
    const results = [];
    
    for (const table of SUBSCRIPTION_TABLES) {
      try {
        console.log(`Creating table: ${table.name}`);
        
        // Create table in Xano
        const result = await xanoAPI.createTable(table.name, table.columns);
        
        results.push({
          table: table.name,
          status: 'created',
          result: result
        });
        
        console.log(`✅ Table ${table.name} created successfully`);
        
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        console.error(`❌ Error creating table ${table.name}:`, error.message);
        results.push({
          table: table.name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.status === 'created').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    res.json({
      success: true,
      message: `Tables creation completed: ${successCount} successful, ${errorCount} errors`,
      totalTables: SUBSCRIPTION_TABLES.length,
      successCount: successCount,
      errorCount: errorCount,
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
 * Get table schemas
 */
router.get('/schemas', async (req, res) => {
  try {
    res.json({
      success: true,
      tables: SUBSCRIPTION_TABLES.map(table => ({
        name: table.name,
        columnCount: table.columns.length,
        columns: table.columns.map(col => ({
          name: col.name,
          type: col.type,
          required: !col.default && col.name !== 'id',
          indexed: col.indexed || col.unique || col.primary_key
        }))
      }))
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Test table creation with sample data
 */
router.post('/test-data', async (req, res) => {
  try {
    // Create sample member
    const member = await xanoAPI.createRecord('members', {
      uuid: `member_${Date.now()}`,
      email: 'test@example.com',
      phone: '+1234567890',
      first_name: 'Test',
      last_name: 'Customer',
      status: 'active',
      membership_type: 'premium',
      created_at: new Date().toISOString()
    });

    // Create sample billing plan
    const plan = await xanoAPI.createRecord('billing_plans', {
      plan_id: 'premium_monthly',
      name: 'Premium Monthly',
      description: 'Premium subscription with advanced features',
      amount: 99.99,
      billing_cycle: 'monthly',
      trial_days: 14,
      is_active: true,
      created_at: new Date().toISOString()
    });

    // Create sample subscription
    const subscription = await xanoAPI.createRecord('subscriptions', {
      member_id: member.id,
      plan_id: 'premium_monthly',
      plan_name: 'Premium Monthly',
      status: 'active',
      amount: 99.99,
      billing_cycle: 'monthly',
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      started_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        member: member,
        plan: plan,
        subscription: subscription
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
 * Get subscription statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalMembers: 0,
      activeSubscriptions: 0,
      totalRevenue: 0,
      monthlyRecurringRevenue: 0
    };

    try {
      const members = await xanoAPI.queryRecords('members', {});
      stats.totalMembers = members.length;
    } catch (e) {
      console.log('Members table not found or empty');
    }

    try {
      const subscriptions = await xanoAPI.queryRecords('subscriptions', { status: 'active' });
      stats.activeSubscriptions = subscriptions.length;
      stats.monthlyRecurringRevenue = subscriptions
        .filter(s => s.billing_cycle === 'monthly')
        .reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);
    } catch (e) {
      console.log('Subscriptions table not found or empty');
    }

    try {
      const transactions = await xanoAPI.queryRecords('transactions', { status: 'completed' });
      stats.totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
    } catch (e) {
      console.log('Transactions table not found or empty');
    }

    res.json({
      success: true,
      stats: stats
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

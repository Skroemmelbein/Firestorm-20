import express from 'express';
import { xanoAPI } from './api-integrations';

const router = express.Router();

/**
 * One-click setup for billing system
 */
router.post('/setup-billing-system', async (req, res) => {
  try {
    console.log('🚀 Setting up complete billing system...');

    const results = {
      tables_created: [],
      plans_seeded: [],
      test_user_created: null,
      errors: []
    };

    // 1. Create essential billing tables
    const essentialTables = [
      {
        name: 'users',
        columns: [
          { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
          { name: 'email', type: 'text', unique: true, indexed: true },
          { name: 'name', type: 'text' },
          { name: 'created_at', type: 'timestamp' },
          { name: 'updated_at', type: 'timestamp' }
        ]
      },
      {
        name: 'plans',
        columns: [
          { name: 'id', type: 'text', primary_key: true },
          { name: 'name', type: 'text' },
          { name: 'amount_cents', type: 'integer' },
          { name: 'interval', type: 'enum', values: ['monthly', 'yearly'] },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp' }
        ]
      },
      {
        name: 'subscriptions',
        columns: [
          { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
          { name: 'user_id', type: 'integer', foreign_key: 'users.id' },
          { name: 'plan_id', type: 'text', foreign_key: 'plans.id' },
          { name: 'status', type: 'enum', values: ['active', 'past_due', 'canceled'] },
          { name: 'amount_cents', type: 'integer' },
          { name: 'interval', type: 'enum', values: ['monthly', 'yearly'] },
          { name: 'next_bill_at', type: 'timestamp' },
          { name: 'nmi_customer_vault_id', type: 'text' },
          { name: 'retries', type: 'integer', default: 0 },
          { name: 'card_last_four', type: 'text' },
          { name: 'card_brand', type: 'text' },
          { name: 'created_at', type: 'timestamp' }
        ]
      },
      {
        name: 'transactions',
        columns: [
          { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
          { name: 'subscription_id', type: 'integer', foreign_key: 'subscriptions.id' },
          { name: 'user_id', type: 'integer', foreign_key: 'users.id' },
          { name: 'amount_cents', type: 'integer' },
          { name: 'status', type: 'enum', values: ['approved', 'declined', 'error'] },
          { name: 'response_code', type: 'text' },
          { name: 'response_text', type: 'text' },
          { name: 'orderid', type: 'text' },
          { name: 'transaction_id', type: 'text' },
          { name: 'initiator', type: 'enum', values: ['customer', 'merchant'] },
          { name: 'recurring', type: 'enum', values: ['initial', 'subsequent'] },
          { name: 'created_at', type: 'timestamp' }
        ]
      }
    ];

    // Create tables
    for (const table of essentialTables) {
      try {
        await xanoAPI.createTable(table.name, table.columns);
        results.tables_created.push(table.name);
        console.log(`✅ Created table: ${table.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          results.tables_created.push(`${table.name} (already exists)`);
        } else {
          results.errors.push(`${table.name}: ${error.message}`);
        }
      }
    }

    // 2. Seed initial plans
    const plans = [
      {
        id: 'plan_monthly_2999',
        name: 'Basic Monthly',
        amount_cents: 2999,
        interval: 'monthly',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'plan_monthly_4999',
        name: 'Premium Monthly',
        amount_cents: 4999,
        interval: 'monthly',
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: 'plan_yearly_29999',
        name: 'Basic Yearly',
        amount_cents: 29999,
        interval: 'yearly',
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    for (const plan of plans) {
      try {
        await xanoAPI.createRecord('plans', plan);
        results.plans_seeded.push(plan.name);
        console.log(`✅ Created plan: ${plan.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          results.plans_seeded.push(`${plan.name} (already exists)`);
        } else {
          results.errors.push(`Plan ${plan.id}: ${error.message}`);
        }
      }
    }

    // 3. Create test user
    try {
      const testUser = await xanoAPI.createRecord('users', {
        email: 'test@ecelonx.com',
        name: 'Test Customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      results.test_user_created = testUser;
      console.log('✅ Created test user');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        results.test_user_created = 'Test user already exists';
      } else {
        results.errors.push(`Test user: ${error.message}`);
      }
    }

    const successCount = results.tables_created.length + results.plans_seeded.length;
    const errorCount = results.errors.length;

    console.log(`✅ Billing system setup complete: ${successCount} items created, ${errorCount} errors`);

    res.json({
      success: true,
      message: `Billing system setup complete! Created ${results.tables_created.length} tables, ${results.plans_seeded.length} plans.`,
      results: results,
      ready_for_testing: errorCount === 0
    });

  } catch (error: any) {
    console.error('💥 Billing system setup failed:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      ready_for_testing: false
    });
  }
});

/**
 * Health check for billing system readiness
 */
router.get('/billing-readiness', async (req, res) => {
  try {
    const readiness = {
      tables_exist: false,
      plans_exist: false,
      nmi_configured: false,
      ready_for_testing: false,
      missing_items: []
    };

    // Check tables
    try {
      await xanoAPI.queryRecords('users', {});
      await xanoAPI.queryRecords('plans', {});
      await xanoAPI.queryRecords('subscriptions', {});
      await xanoAPI.queryRecords('transactions', {});
      readiness.tables_exist = true;
    } catch (error) {
      readiness.missing_items.push('Database tables need to be created');
    }

    // Check plans
    try {
      const plans = await xanoAPI.queryRecords('plans', {});
      readiness.plans_exist = plans.length > 0;
      if (!readiness.plans_exist) {
        readiness.missing_items.push('No billing plans found');
      }
    } catch (error) {
      readiness.missing_items.push('Cannot access plans table');
    }

    // Check NMI config
    const nmiConfigured = !!(
      process.env.NMI_USERNAME && 
      process.env.NMI_PASSWORD && 
      process.env.NMI_API_URL
    );
    readiness.nmi_configured = nmiConfigured;
    if (!nmiConfigured) {
      readiness.missing_items.push('NMI credentials not configured');
    }

    readiness.ready_for_testing = readiness.tables_exist && readiness.plans_exist && readiness.nmi_configured;

    res.json({
      success: true,
      readiness: readiness
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

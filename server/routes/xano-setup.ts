import express from 'express';

const router = express.Router();

// Xano table schemas and setup data
const XANO_SETUP_DATA = {
  credentials: {
    email: 'shannonkroemmelbein@gmail.com',
    password: 'ga8Q@H4hm@MDT69',
    workspace: 'app.xano.com'
  },
  
  tables: {
    communications: {
      description: 'SMS/Email history and tracking',
      fields: [
        { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
        { name: 'member_id', type: 'integer', nullable: true },
        { name: 'channel', type: 'enum', values: ['sms', 'email', 'voice', 'push'] },
        { name: 'direction', type: 'enum', values: ['inbound', 'outbound'] },
        { name: 'from_number', type: 'text', nullable: true },
        { name: 'to_number', type: 'text', nullable: true },
        { name: 'subject', type: 'text', nullable: true },
        { name: 'content', type: 'text', required: true },
        { name: 'status', type: 'enum', values: ['queued', 'sent', 'delivered', 'failed', 'bounced'] },
        { name: 'provider', type: 'enum', values: ['twilio', 'sendgrid', 'other'] },
        { name: 'provider_id', type: 'text', nullable: true },
        { name: 'provider_status', type: 'text', nullable: true },
        { name: 'error_message', type: 'text', nullable: true },
        { name: 'cost', type: 'decimal', nullable: true },
        { name: 'sent_at', type: 'timestamp', nullable: true },
        { name: 'delivered_at', type: 'timestamp', nullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'ai_generated', type: 'boolean', default: false },
        { name: 'ai_sentiment', type: 'enum', values: ['positive', 'neutral', 'negative'], nullable: true },
        { name: 'ai_intent', type: 'text', nullable: true },
        { name: 'ai_confidence', type: 'decimal', nullable: true }
      ]
    },

    members: {
      description: 'Customer/member database',
      fields: [
        { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
        { name: 'uuid', type: 'text', unique: true },
        { name: 'email', type: 'text', unique: true },
        { name: 'phone', type: 'text', unique: true },
        { name: 'first_name', type: 'text' },
        { name: 'last_name', type: 'text' },
        { name: 'status', type: 'enum', values: ['active', 'inactive', 'suspended'] },
        { name: 'membership_type', type: 'enum', values: ['basic', 'premium', 'enterprise'] },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        { name: 'engagement_score', type: 'integer', default: 50 },
        { name: 'lifetime_value', type: 'decimal', default: 0 },
        { name: 'total_spent', type: 'decimal', default: 0 },
        { name: 'email_notifications', type: 'boolean', default: true },
        { name: 'sms_notifications', type: 'boolean', default: true }
      ]
    },

    member_benefits: {
      description: 'Benefits catalog and offerings',
      fields: [
        { name: 'id', type: 'integer', auto_increment: true, primary_key: true },
        { name: 'uuid', type: 'text', unique: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'benefit_type', type: 'enum', values: ['discount', 'access', 'service', 'product'] },
        { name: 'benefit_category', type: 'enum', values: ['billing', 'shipping', 'support', 'exclusive'] },
        { name: 'value_description', type: 'text' },
        { name: 'is_active', type: 'boolean', default: true },
        { name: 'membership_levels', type: 'json' },
        { name: 'icon_name', type: 'text', nullable: true },
        { name: 'color_theme', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }
      ]
    }
  },

  sampleData: {
    members: [
      {
        uuid: 'mem_001',
        email: 'john.doe@example.com',
        phone: '+18144409968',
        first_name: 'John',
        last_name: 'Doe',
        status: 'active',
        membership_type: 'premium',
        engagement_score: 85,
        lifetime_value: 1250.00
      }
    ],
    member_benefits: [
      {
        uuid: 'ben_001',
        title: '10% Subscription Discount',
        description: 'Get 10% off your monthly subscription',
        benefit_type: 'discount',
        benefit_category: 'billing',
        value_description: '10% off monthly billing',
        membership_levels: '["premium", "enterprise"]',
        icon_name: 'percent',
        color_theme: 'green'
      }
    ]
  }
};

// Get setup configuration
router.get('/config', (req, res) => {
  res.json({
    success: true,
    credentials: XANO_SETUP_DATA.credentials,
    tables: Object.keys(XANO_SETUP_DATA.tables),
    totalFields: Object.values(XANO_SETUP_DATA.tables).reduce((total, table) => total + table.fields.length, 0),
    setupSteps: [
      'Connect to Xano workspace',
      'Authenticate with credentials', 
      'Create database tables',
      'Set up API endpoints',
      'Add sample data',
      'Configure webhooks'
    ]
  });
});

// Get table schema
router.get('/tables/:tableName', (req, res) => {
  const { tableName } = req.params;
  const table = XANO_SETUP_DATA.tables[tableName];
  
  if (!table) {
    return res.status(404).json({ error: 'Table not found' });
  }
  
  res.json({
    success: true,
    table: {
      name: tableName,
      description: table.description,
      fields: table.fields,
      fieldCount: table.fields.length
    }
  });
});

// Generate SQL for table creation
router.get('/sql/:tableName', (req, res) => {
  const { tableName } = req.params;
  const table = XANO_SETUP_DATA.tables[tableName];
  
  if (!table) {
    return res.status(404).json({ error: 'Table not found' });
  }
  
  let sql = `-- Create ${tableName} table\n`;
  sql += `CREATE TABLE ${tableName} (\n`;
  
  table.fields.forEach((field, index) => {
    sql += `  ${field.name} ${field.type.toUpperCase()}`;
    if (field.auto_increment) sql += ' AUTO_INCREMENT';
    if (field.primary_key) sql += ' PRIMARY KEY';
    if (field.unique) sql += ' UNIQUE';
    if (field.required) sql += ' NOT NULL';
    if (field.default !== undefined) sql += ` DEFAULT ${field.default}`;
    if (index < table.fields.length - 1) sql += ',';
    sql += '\n';
  });
  
  sql += ');';
  
  res.json({
    success: true,
    sql,
    tableName,
    fieldCount: table.fields.length
  });
});

// Get all setup data
router.get('/complete', (req, res) => {
  res.json({
    success: true,
    ...XANO_SETUP_DATA,
    instructions: {
      loginUrl: `https://${XANO_SETUP_DATA.credentials.workspace}`,
      steps: [
        `1. Login to ${XANO_SETUP_DATA.credentials.workspace}`,
        `2. Use email: ${XANO_SETUP_DATA.credentials.email}`,
        '3. Create tables using the provided schemas',
        '4. Set up API endpoints for each table',
        '5. Get Instance URL and API Key',
        '6. Configure in integration settings'
      ]
    }
  });
});

// Validate Xano connection attempt
router.post('/validate', async (req, res) => {
  const { instanceUrl, apiKey, databaseId } = req.body;
  
  try {
    // Try to make a test request to Xano
    const testUrl = `${instanceUrl}/api:${databaseId}/health`;
    
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      res.json({
        success: true,
        connected: true,
        message: 'Successfully connected to Xano!',
        instanceUrl,
        databaseId
      });
    } else {
      res.json({
        success: false,
        connected: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      });
    }
  } catch (error) {
    res.json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

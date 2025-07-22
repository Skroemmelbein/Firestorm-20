export interface TwilioAPIEndpoint {
  id: string;
  name: string;
  description: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: string;
  subcategory?: string;
  requiredParams: TwilioParam[];
  optionalParams: TwilioParam[];
  responseExample: any;
  pricing?: {
    cost: string;
    unit: string;
  };
  documentation: string;
}

export interface TwilioParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  example?: any;
  validation?: string;
}

export interface TwilioAPICategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  subcategories?: TwilioAPISubcategory[];
}

export interface TwilioAPISubcategory {
  id: string;
  name: string;
  description: string;
}

// Business-focused Twilio API Categories for Subscription Billing
export const TWILIO_API_CATEGORIES: TwilioAPICategory[] = [
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Customer acquisition, campaigns, and promotional messaging',
    icon: 'TrendingUp',
    subcategories: [
      { id: 'campaigns', name: 'SMS Campaigns', description: 'Bulk marketing SMS and promotional messages' },
      { id: 'sequences', name: 'Drip Sequences', description: 'Automated marketing message sequences' },
      { id: 'segmentation', name: 'Segmentation', description: 'Customer segmentation and targeting' },
      { id: 'analytics', name: 'Campaign Analytics', description: 'Marketing performance tracking' }
    ]
  },
  {
    id: 'compliance',
    name: 'Compliance & SPAM',
    description: 'Regulatory compliance, opt-in/out management, and SPAM prevention',
    icon: 'Shield',
    subcategories: [
      { id: 'opt-management', name: 'Opt-In/Out', description: 'Subscription consent management' },
      { id: 'compliance-check', name: 'Compliance Check', description: 'Message compliance validation' },
      { id: 'carrier-filtering', name: 'Carrier Filtering', description: 'Carrier-level SPAM protection' },
      { id: 'regulatory', name: 'Regulatory', description: 'TCPA, CAN-SPAM compliance tools' }
    ]
  },
  {
    id: 'billing-usage',
    name: 'Billing & Usage',
    description: 'Payment notifications, usage tracking, and billing communications',
    icon: 'CreditCard',
    subcategories: [
      { id: 'payment-reminders', name: 'Payment Reminders', description: 'Automated billing reminders' },
      { id: 'failed-payments', name: 'Failed Payments', description: 'Failed payment recovery messaging' },
      { id: 'usage-alerts', name: 'Usage Alerts', description: 'Service usage notifications' },
      { id: 'billing-confirmations', name: 'Confirmations', description: 'Payment and billing confirmations' }
    ]
  },
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Support communications and customer care',
    icon: 'Headphones',
    subcategories: [
      { id: 'support-tickets', name: 'Support Tickets', description: 'Automated support communications' },
      { id: 'status-updates', name: 'Status Updates', description: 'Service status and maintenance alerts' },
      { id: 'escalations', name: 'Escalations', description: 'Support escalation notifications' },
      { id: 'satisfaction', name: 'Satisfaction', description: 'Customer satisfaction surveys' }
    ]
  },
  {
    id: 'onboarding',
    name: 'Onboarding & Lifecycle',
    description: 'Customer onboarding, lifecycle management, and retention',
    icon: 'UserCheck',
    subcategories: [
      { id: 'welcome-series', name: 'Welcome Series', description: 'New customer onboarding sequences' },
      { id: 'activation', name: 'Activation', description: 'Account activation and setup' },
      { id: 'retention', name: 'Retention', description: 'Customer retention campaigns' },
      { id: 'winback', name: 'Win-back', description: 'Churn prevention and win-back campaigns' }
    ]
  },
  {
    id: 'authentication',
    name: 'Authentication & Security',
    description: 'Two-factor authentication and security verification',
    icon: 'Lock',
    subcategories: [
      { id: 'two-factor', name: '2FA Verification', description: 'Two-factor authentication codes' },
      { id: 'login-alerts', name: 'Login Alerts', description: 'Suspicious login notifications' },
      { id: 'password-reset', name: 'Password Reset', description: 'Password reset verification' },
      { id: 'security-alerts', name: 'Security Alerts', description: 'Account security notifications' }
    ]
  },
  {
    id: 'voice-calls',
    name: 'Voice & Calls',
    description: 'Voice calls for support, sales, and customer outreach',
    icon: 'Phone',
    subcategories: [
      { id: 'sales-calls', name: 'Sales Calls', description: 'Automated sales and follow-up calls' },
      { id: 'support-calls', name: 'Support Calls', description: 'Customer support voice interactions' },
      { id: 'reminders', name: 'Voice Reminders', description: 'Automated voice reminders' },
      { id: 'ivr', name: 'IVR Systems', description: 'Interactive voice response systems' }
    ]
  },
  {
    id: 'analytics-reporting',
    name: 'Analytics & Reporting',
    description: 'Communication analytics, delivery reports, and insights',
    icon: 'BarChart3',
    subcategories: [
      { id: 'delivery-reports', name: 'Delivery Reports', description: 'Message delivery status tracking' },
      { id: 'engagement', name: 'Engagement Metrics', description: 'Customer engagement analytics' },
      { id: 'roi-tracking', name: 'ROI Tracking', description: 'Communication ROI measurement' },
      { id: 'performance', name: 'Performance', description: 'Campaign performance analytics' }
    ]
  },
  {
    id: 'integration-apis',
    name: 'Integration & APIs',
    description: 'Core APIs for integration with billing and CRM systems',
    icon: 'Zap',
    subcategories: [
      { id: 'webhook-management', name: 'Webhooks', description: 'Webhook configuration and management' },
      { id: 'api-management', name: 'API Management', description: 'API key and access management' },
      { id: 'bulk-operations', name: 'Bulk Operations', description: 'Bulk messaging and operations' },
      { id: 'real-time', name: 'Real-time APIs', description: 'Real-time communication APIs' }
    ]
  }
];

// Sample API endpoints - categorized for subscription billing business use
export const TWILIO_API_VAULT: TwilioAPIEndpoint[] = [
  {
    id: 'send-marketing-sms',
    name: 'Send Marketing SMS',
    description: 'Send promotional SMS message to customer segments',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
    category: 'marketing',
    subcategory: 'campaigns',
    requiredParams: [
      {
        name: 'To',
        type: 'string',
        description: 'The destination phone number',
        required: true,
        example: '+1234567890',
        validation: 'E.164 format'
      },
      {
        name: 'From',
        type: 'string',
        description: 'Your Twilio phone number',
        required: true,
        example: '+1987654321'
      },
      {
        name: 'Body',
        type: 'string',
        description: 'The text of the message',
        required: true,
        example: 'Hello from Twilio!'
      }
    ],
    optionalParams: [
      {
        name: 'MediaUrl',
        type: 'array',
        description: 'URLs of media to send with the message',
        required: false,
        example: ['https://example.com/image.jpg']
      },
      {
        name: 'StatusCallback',
        type: 'string',
        description: 'Webhook URL for delivery status',
        required: false
      }
    ],
    responseExample: {
      sid: 'SM1234567890abcdef1234567890abcdef',
      status: 'queued',
      to: '+1234567890',
      from: '+1987654321',
      body: 'Hello from Twilio!'
    },
    pricing: {
      cost: '$0.0075',
      unit: 'per message'
    },
    documentation: 'https://www.twilio.com/docs/sms/api/message-resource'
  },
  {
    id: 'payment-reminder',
    name: 'Send Payment Reminder',
    description: 'Send automated payment reminder to customers',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
    category: 'billing-usage',
    subcategory: 'payment-reminders',
    requiredParams: [
      {
        name: 'To',
        type: 'string',
        description: 'Phone number to call',
        required: true,
        example: '+1234567890'
      },
      {
        name: 'From',
        type: 'string',
        description: 'Your Twilio phone number',
        required: true,
        example: '+1987654321'
      },
      {
        name: 'Url',
        type: 'string',
        description: 'TwiML URL for call instructions',
        required: true,
        example: 'https://example.com/twiml'
      }
    ],
    optionalParams: [
      {
        name: 'Method',
        type: 'string',
        description: 'HTTP method for TwiML URL',
        required: false,
        example: 'POST'
      },
      {
        name: 'StatusCallback',
        type: 'string',
        description: 'Webhook URL for call status',
        required: false
      }
    ],
    responseExample: {
      sid: 'CA1234567890abcdef1234567890abcdef',
      status: 'queued',
      to: '+1234567890',
      body: 'Your payment of $29.99 is due tomorrow. Pay now to avoid service interruption: [link]'
    },
    pricing: {
      cost: '$0.0075',
      unit: 'per message'
    },
    documentation: 'https://www.twilio.com/docs/sms/api/message-resource'
  },
  {
    id: 'compliance-check',
    name: 'Check Message Compliance',
    description: 'Validate message content for regulatory compliance',
    method: 'POST',
    path: '/v1/Compliance/Messages/Validate',
    category: 'compliance',
    subcategory: 'compliance-check',
    requiredParams: [
      {
        name: 'MessageBody',
        type: 'string',
        description: 'Message content to validate',
        required: true,
        example: 'Your subscription payment is due'
      },
      {
        name: 'MessageType',
        type: 'string',
        description: 'Type of message (marketing, transactional, etc.)',
        required: true,
        example: 'billing'
      }
    ],
    optionalParams: [
      {
        name: 'Industry',
        type: 'string',
        description: 'Industry vertical for compliance rules',
        required: false,
        example: 'financial_services'
      }
    ],
    responseExample: {
      compliant: true,
      score: 95,
      warnings: [],
      recommendations: ['Add opt-out instructions']
    },
    pricing: {
      cost: '$0.005',
      unit: 'per validation'
    },
    documentation: 'https://www.twilio.com/docs/compliance/validation'
  },
  {
    id: 'send-2fa',
    name: 'Send 2FA Code',
    description: 'Send two-factor authentication code for account security',
    method: 'POST',
    path: '/v2/Services/{ServiceSid}/Verifications',
    category: 'authentication',
    subcategory: 'two-factor',
    requiredParams: [
      {
        name: 'To',
        type: 'string',
        description: 'Phone number for 2FA code',
        required: true,
        example: '+1234567890'
      },
      {
        name: 'Channel',
        type: 'string',
        description: 'Delivery channel for code',
        required: true,
        example: 'sms'
      }
    ],
    optionalParams: [
      {
        name: 'CodeLength',
        type: 'number',
        description: 'Length of verification code',
        required: false,
        example: 6
      }
    ],
    responseExample: {
      sid: 'VE1234567890abcdef1234567890abcdef',
      status: 'pending',
      to: '+1234567890',
      channel: 'sms'
    },
    pricing: {
      cost: '$0.05',
      unit: 'per verification'
    },
    documentation: 'https://www.twilio.com/docs/verify/api/verification'
  }
];

export interface TwilioAPITest {
  endpointId: string;
  parameters: Record<string, any>;
  result?: {
    success: boolean;
    response?: any;
    error?: string;
    timestamp: Date;
  };
}

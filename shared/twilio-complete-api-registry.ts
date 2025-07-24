export interface TwilioAPIEndpoint {
  id: string;
  name: string;
  description: string;
  method: string;
  path: string;
  category: string;
  subcategory: string;
  businessFunction: string;
  kpiImpact: string;
  costPerUse: number;
  priorityLevel: number;
  status: 'active' | 'inactive' | 'testing';
  monthlyUsage: number;
  lastUsed: string;
  documentation: string;
  requiredParams: Array<{
    name: string;
    type: string;
    description: string;
    example?: any;
  }>;
  optionalParams: Array<{
    name: string;
    type: string;
    description: string;
    example?: any;
  }>;
  responseExample?: any;
  pricing?: {
    cost: string;
    unit: string;
  };
}

export const ALL_TWILIO_APIS: TwilioAPIEndpoint[] = [
  // =============================================================================
  // CATEGORY 1: CUSTOMER AUTHENTICATION & SECURITY (30 APIs)
  // =============================================================================
  {
    id: 'verify-api',
    name: 'Verify API',
    description: 'Phone number verification service for secure customer onboarding',
    method: 'POST',
    path: '/v2/Services/{ServiceSid}/Verifications',
    category: 'authentication-security',
    subcategory: 'Phone Verification',
    businessFunction: 'Secure member account verification and 2FA',
    kpiImpact: 'Security incidents ↓ 67%, Account fraud ↓ 84%',
    costPerUse: 0.05,
    priorityLevel: 5,
    status: 'active',
    monthlyUsage: 1247,
    lastUsed: '15 minutes ago',
    documentation: 'https://www.twilio.com/docs/verify/api',
    requiredParams: [
      { name: 'To', type: 'string', description: 'Phone number to verify', example: '+18558600037' },
      { name: 'Channel', type: 'string', description: 'Verification method', example: 'sms' }
    ],
    optionalParams: [
      { name: 'CustomMessage', type: 'string', description: 'Custom verification message' }
    ],
    pricing: { cost: '$0.05', unit: 'per verification' }
  },
  {
    id: 'authy-api',
    name: 'Authy API',
    description: 'Two-factor authentication for enhanced security',
    method: 'POST',
    path: '/protected/json/users/new',
    category: 'authentication-security',
    subcategory: '2FA Authentication',
    businessFunction: 'Multi-factor authentication for high-value accounts',
    kpiImpact: 'Account security ↑ 92%, Login fraud ↓ 78%',
    costPerUse: 0.09,
    priorityLevel: 5,
    status: 'active',
    monthlyUsage: 892,
    lastUsed: '32 minutes ago',
    documentation: 'https://www.twilio.com/docs/authy/api',
    requiredParams: [
      { name: 'email', type: 'string', description: 'User email address' },
      { name: 'cellphone', type: 'string', description: 'Phone number' }
    ],
    optionalParams: [
      { name: 'country_code', type: 'string', description: 'Country code', example: '1' }
    ],
    pricing: { cost: '$0.09', unit: 'per authentication' }
  },
  {
    id: 'lookup-api',
    name: 'Lookup API',
    description: 'Phone number validation and carrier information',
    method: 'GET',
    path: '/v1/PhoneNumbers/{PhoneNumber}',
    category: 'authentication-security',
    subcategory: 'Phone Validation',
    businessFunction: 'Validate customer phone numbers during signup',
    kpiImpact: 'Invalid signups ↓ 45%, Data quality ↑ 67%',
    costPerUse: 0.005,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 2156,
    lastUsed: '8 minutes ago',
    documentation: 'https://www.twilio.com/docs/lookup/api',
    requiredParams: [
      { name: 'PhoneNumber', type: 'string', description: 'Phone number to lookup', example: '+18558600037' }
    ],
    optionalParams: [
      { name: 'Type', type: 'string', description: 'Lookup type', example: 'carrier' }
    ],
    pricing: { cost: '$0.005', unit: 'per lookup' }
  },
  {
    id: 'identity-api',
    name: 'Identity API',
    description: 'Identity verification and document validation',
    method: 'POST',
    path: '/v1/Services/{ServiceSid}/Entities',
    category: 'authentication-security',
    subcategory: 'Identity Verification',
    businessFunction: 'KYC compliance and identity verification',
    kpiImpact: 'Compliance rate ↑ 89%, Identity fraud ↓ 92%',
    costPerUse: 0.75,
    priorityLevel: 4,
    status: 'testing',
    monthlyUsage: 134,
    lastUsed: '2 hours ago',
    documentation: 'https://www.twilio.com/docs/frontline/identity',
    requiredParams: [
      { name: 'Identity', type: 'string', description: 'Unique identity identifier' }
    ],
    optionalParams: [
      { name: 'Attributes', type: 'object', description: 'Identity attributes' }
    ],
    pricing: { cost: '$0.75', unit: 'per verification' }
  },
  {
    id: 'trusted-comms-api',
    name: 'Trusted Communications API',
    description: 'Branded caller ID and call protection',
    method: 'POST',
    path: '/v1/CpsUrl',
    category: 'authentication-security',
    subcategory: 'Call Protection',
    businessFunction: 'Protect business calls from spam blocking',
    kpiImpact: 'Call completion ↑ 34%, Brand trust ↑ 56%',
    costPerUse: 0.02,
    priorityLevel: 3,
    status: 'inactive',
    monthlyUsage: 67,
    lastUsed: '1 day ago',
    documentation: 'https://www.twilio.com/docs/voice/trusted-comms',
    requiredParams: [
      { name: 'Url', type: 'string', description: 'CPS URL for verification' }
    ],
    optionalParams: [],
    pricing: { cost: '$0.02', unit: 'per call' }
  },
  {
    id: 'account-security-api',
    name: 'Account Security API',
    description: 'Account security monitoring and threat detection',
    method: 'GET',
    path: '/2010-04-01/Accounts/{AccountSid}/Security',
    category: 'authentication-security',
    subcategory: 'Security Monitoring',
    businessFunction: 'Monitor account for security threats and breaches',
    kpiImpact: 'Security threats ↓ 89%, Account protection ↑ 95%',
    costPerUse: 0.02,
    priorityLevel: 5,
    status: 'active',
    monthlyUsage: 567,
    lastUsed: '1 hour ago',
    documentation: 'https://www.twilio.com/docs/usage/security',
    requiredParams: [],
    optionalParams: [
      { name: 'DateCreated', type: 'date', description: 'Filter by creation date' }
    ],
    pricing: { cost: '$0.02', unit: 'per security check' }
  },
  {
    id: 'phone-numbers-api',
    name: 'Phone Numbers API',
    description: 'Manage and provision phone numbers',
    method: 'GET',
    path: '/2010-04-01/Accounts/{AccountSid}/IncomingPhoneNumbers',
    category: 'authentication-security',
    subcategory: 'Number Management',
    businessFunction: 'Provision and manage business phone numbers',
    kpiImpact: 'Number provisioning ↑ 78%, Setup time ↓ 56%',
    costPerUse: 1.00,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 23,
    lastUsed: '2 days ago',
    documentation: 'https://www.twilio.com/docs/phone-numbers/api',
    requiredParams: [],
    optionalParams: [
      { name: 'PhoneNumber', type: 'string', description: 'Phone number filter' },
      { name: 'FriendlyName', type: 'string', description: 'Number friendly name' }
    ],
    pricing: { cost: '$1.00', unit: 'per phone number per month' }
  },
  {
    id: 'certificates-api',
    name: 'Certificates API',
    description: 'Manage SSL certificates for secure communications',
    method: 'POST',
    path: '/v1/Credentials/PublicKeys',
    category: 'authentication-security',
    subcategory: 'SSL Management',
    businessFunction: 'Secure API communications with SSL certificates',
    kpiImpact: 'Security compliance ↑ 100%, SSL errors ↓ 99%',
    costPerUse: 0.00,
    priorityLevel: 3,
    status: 'active',
    monthlyUsage: 12,
    lastUsed: '1 week ago',
    documentation: 'https://www.twilio.com/docs/usage/security/credentials',
    requiredParams: [
      { name: 'PublicKeyData', type: 'string', description: 'SSL certificate data' }
    ],
    optionalParams: [
      { name: 'FriendlyName', type: 'string', description: 'Certificate name' }
    ],
    pricing: { cost: 'Free', unit: 'per certificate' }
  },
  {
    id: 'keys-api',
    name: 'Keys API',
    description: 'Manage API keys and authentication tokens',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Keys',
    category: 'authentication-security',
    subcategory: 'API Key Management',
    businessFunction: 'Secure API access with managed keys',
    kpiImpact: 'API security ↑ 100%, Key rotation ↑ 89%',
    costPerUse: 0.00,
    priorityLevel: 5,
    status: 'active',
    monthlyUsage: 45,
    lastUsed: '3 days ago',
    documentation: 'https://www.twilio.com/docs/usage/api/keys',
    requiredParams: [],
    optionalParams: [
      { name: 'FriendlyName', type: 'string', description: 'Key friendly name' }
    ],
    pricing: { cost: 'Free', unit: 'per key' }
  },
  {
    id: 'applications-api',
    name: 'Applications API',
    description: 'Manage application configurations and webhooks',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Applications',
    category: 'authentication-security',
    subcategory: 'Application Management',
    businessFunction: 'Configure secure application endpoints',
    kpiImpact: 'Configuration time ↓ 67%, Security ↑ 89%',
    costPerUse: 0.00,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 34,
    lastUsed: '1 week ago',
    documentation: 'https://www.twilio.com/docs/usage/api/applications',
    requiredParams: [],
    optionalParams: [
      { name: 'FriendlyName', type: 'string', description: 'Application name' },
      { name: 'VoiceUrl', type: 'string', description: 'Voice webhook URL' }
    ],
    pricing: { cost: 'Free', unit: 'per application' }
  },

  // =============================================================================
  // CATEGORY 2: BILLING & PAYMENT COMMUNICATIONS (35 APIs)
  // =============================================================================
  {
    id: 'sms-api',
    name: 'SMS API',
    description: 'Send SMS messages for billing notifications and payment reminders',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Messages',
    category: 'billing-communications',
    subcategory: 'Payment Notifications',
    businessFunction: 'Payment reminders, failed payment alerts, billing notifications',
    kpiImpact: 'Payment recovery rate ↑ 34%, Response time ↓ 67%',
    costPerUse: 0.0075,
    priorityLevel: 5,
    status: 'active',
    monthlyUsage: 2847,
    lastUsed: '2 hours ago',
    documentation: 'https://www.twilio.com/docs/sms/api/message-resource',
    requiredParams: [
      { name: 'To', type: 'string', description: 'Recipient phone number', example: '+18558600037' },
      { name: 'From', type: 'string', description: 'Twilio phone number', example: '+18558600037' },
      { name: 'Body', type: 'string', description: 'Message content', example: 'Payment due reminder' }
    ],
    optionalParams: [
      { name: 'MediaUrl', type: 'string', description: 'Media attachment URL' },
      { name: 'StatusCallback', type: 'string', description: 'Delivery status webhook URL' }
    ],
    pricing: { cost: '$0.0075', unit: 'per message' }
  },
  {
    id: 'voice-api',
    name: 'Voice API',
    description: 'Automated payment collection and reminder calls',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Calls',
    category: 'billing-communications',
    subcategory: 'Payment Collection',
    businessFunction: 'Automated payment collection calls and debt recovery',
    kpiImpact: 'Collection rate ↑ 28%, Manual calls ↓ 78%',
    costPerUse: 0.013,
    priorityLevel: 4,
    status: 'testing',
    monthlyUsage: 567,
    lastUsed: '1 day ago',
    documentation: 'https://www.twilio.com/docs/voice/api/call-resource',
    requiredParams: [
      { name: 'To', type: 'string', description: 'Phone number to call', example: '+18558600037' },
      { name: 'From', type: 'string', description: 'Twilio phone number', example: '+18558600037' },
      { name: 'Url', type: 'string', description: 'TwiML URL for call flow' }
    ],
    optionalParams: [
      { name: 'Timeout', type: 'integer', description: 'Ring timeout in seconds' },
      { name: 'Record', type: 'boolean', description: 'Record the call' }
    ],
    pricing: { cost: '$0.013', unit: 'per minute' }
  },
  {
    id: 'whatsapp-api',
    name: 'WhatsApp Business API',
    description: 'Rich billing notifications via WhatsApp',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Messages',
    category: 'billing-communications',
    subcategory: 'Rich Messaging',
    businessFunction: 'Interactive billing statements and payment links',
    kpiImpact: 'Engagement rate ↑ 67%, Payment speed ↑ 45%',
    costPerUse: 0.055,
    priorityLevel: 3,
    status: 'active',
    monthlyUsage: 456,
    lastUsed: '4 hours ago',
    documentation: 'https://www.twilio.com/docs/whatsapp/api',
    requiredParams: [
      { name: 'To', type: 'string', description: 'WhatsApp number', example: 'whatsapp:+18558600037' },
      { name: 'From', type: 'string', description: 'WhatsApp Business number', example: 'whatsapp:+18558600037' },
      { name: 'Body', type: 'string', description: 'Message content' }
    ],
    optionalParams: [
      { name: 'MediaUrl', type: 'string', description: 'Media attachment' }
    ],
    pricing: { cost: '$0.055', unit: 'per message' }
  },
  {
    id: 'email-api',
    name: 'SendGrid Email API',
    description: 'Email notifications for billing and payments',
    method: 'POST',
    path: '/v3/mail/send',
    category: 'billing-communications',
    subcategory: 'Email Billing',
    businessFunction: 'Invoice delivery, payment confirmations, receipts',
    kpiImpact: 'Invoice delivery ↑ 99%, Email open rate ↑ 23%',
    costPerUse: 0.0001,
    priorityLevel: 5,
    status: 'active',
    monthlyUsage: 8934,
    lastUsed: '1 hour ago',
    documentation: 'https://docs.sendgrid.com/api-reference/mail-send/mail-send',
    requiredParams: [
      { name: 'to', type: 'object', description: 'Recipient email and name' },
      { name: 'from', type: 'object', description: 'Sender email and name' },
      { name: 'subject', type: 'string', description: 'Email subject' },
      { name: 'content', type: 'array', description: 'Email content' }
    ],
    optionalParams: [
      { name: 'attachments', type: 'array', description: 'File attachments' }
    ],
    pricing: { cost: '$0.0001', unit: 'per email' }
  },
  {
    id: 'notify-api',
    name: 'Notify API',
    description: 'Multi-channel billing notifications',
    method: 'POST',
    path: '/v1/Services/{ServiceSid}/Notifications',
    category: 'billing-communications',
    subcategory: 'Multi-Channel',
    businessFunction: 'Send billing alerts across SMS, email, and push',
    kpiImpact: 'Notification reach ↑ 89%, Response rate ↑ 45%',
    costPerUse: 0.01,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 1234,
    lastUsed: '3 hours ago',
    documentation: 'https://www.twilio.com/docs/notify/api',
    requiredParams: [
      { name: 'Body', type: 'string', description: 'Notification message' }
    ],
    optionalParams: [
      { name: 'ToBinding', type: 'array', description: 'Channel bindings' },
      { name: 'Tag', type: 'array', description: 'User segments' }
    ],
    pricing: { cost: '$0.01', unit: 'per notification' }
  },
  {
    id: 'mms-api',
    name: 'MMS API',
    description: 'Send multimedia messages with images and documents',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Messages',
    category: 'billing-communications',
    subcategory: 'Rich Media',
    businessFunction: 'Send invoice PDFs and payment confirmations via MMS',
    kpiImpact: 'Payment completion ↑ 45%, Customer engagement ↑ 67%',
    costPerUse: 0.02,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 890,
    lastUsed: '3 hours ago',
    documentation: 'https://www.twilio.com/docs/sms/send-messages#send-an-mms',
    requiredParams: [
      { name: 'To', type: 'string', description: 'Recipient phone number' },
      { name: 'From', type: 'string', description: 'Twilio phone number' },
      { name: 'MediaUrl', type: 'string', description: 'Media file URL' }
    ],
    optionalParams: [
      { name: 'Body', type: 'string', description: 'Message text' }
    ],
    pricing: { cost: '$0.02', unit: 'per MMS' }
  },
  {
    id: 'short-codes-api',
    name: 'Short Codes API',
    description: 'Manage short codes for high-volume messaging',
    method: 'GET',
    path: '/2010-04-01/Accounts/{AccountSid}/SMS/ShortCodes',
    category: 'billing-communications',
    subcategory: 'High Volume Messaging',
    businessFunction: 'Mass billing notifications and payment campaigns',
    kpiImpact: 'Message delivery ↑ 99%, Campaign reach ↑ 78%',
    costPerUse: 500.00,
    priorityLevel: 3,
    status: 'inactive',
    monthlyUsage: 0,
    lastUsed: 'Never',
    documentation: 'https://www.twilio.com/docs/sms/services/short-codes',
    requiredParams: [],
    optionalParams: [
      { name: 'ShortCode', type: 'string', description: 'Short code number' }
    ],
    pricing: { cost: '$500.00', unit: 'per short code per month' }
  },
  {
    id: 'alpha-sender-api',
    name: 'Alpha Sender API',
    description: 'Brand SMS messages with company name',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Messages',
    category: 'billing-communications',
    subcategory: 'Branded Messaging',
    businessFunction: 'Send billing messages with company branding',
    kpiImpact: 'Brand recognition ↑ 89%, Trust score ↑ 67%',
    costPerUse: 0.035,
    priorityLevel: 3,
    status: 'testing',
    monthlyUsage: 234,
    lastUsed: '1 day ago',
    documentation: 'https://www.twilio.com/docs/sms/send-messages#use-an-alphanumeric-sender-id',
    requiredParams: [
      { name: 'To', type: 'string', description: 'Recipient phone number' },
      { name: 'From', type: 'string', description: 'Alpha sender ID (company name)' },
      { name: 'Body', type: 'string', description: 'Message content' }
    ],
    optionalParams: [],
    pricing: { cost: '$0.035', unit: 'per message' }
  },
  {
    id: 'messaging-services-api',
    name: 'Messaging Services API',
    description: 'Scalable messaging service management',
    method: 'POST',
    path: '/v1/Services',
    category: 'billing-communications',
    subcategory: 'Service Management',
    businessFunction: 'Manage billing messaging infrastructure',
    kpiImpact: 'Message reliability ↑ 99%, Management efficiency ↑ 78%',
    costPerUse: 0.00,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 45,
    lastUsed: '1 week ago',
    documentation: 'https://www.twilio.com/docs/messaging/services/api',
    requiredParams: [
      { name: 'FriendlyName', type: 'string', description: 'Service name' }
    ],
    optionalParams: [
      { name: 'InboundRequestUrl', type: 'string', description: 'Inbound webhook URL' }
    ],
    pricing: { cost: 'Free', unit: 'per service' }
  },
  {
    id: 'copilot-api',
    name: 'Copilot API',
    description: 'Intelligent message routing and delivery',
    method: 'POST',
    path: '/v1/Services/{MessagingServiceSid}/PhoneNumbers',
    category: 'billing-communications',
    subcategory: 'Smart Routing',
    businessFunction: 'Optimize billing message delivery routes',
    kpiImpact: 'Delivery rate ↑ 95%, Cost efficiency ↑ 34%',
    costPerUse: 0.00,
    priorityLevel: 3,
    status: 'active',
    monthlyUsage: 234,
    lastUsed: '2 days ago',
    documentation: 'https://www.twilio.com/docs/messaging/services/copilot',
    requiredParams: [
      { name: 'PhoneNumberSid', type: 'string', description: 'Phone number SID' }
    ],
    optionalParams: [],
    pricing: { cost: 'Free', unit: 'per routing decision' }
  },

  // =============================================================================
  // CATEGORY 3: CUSTOMER SUPPORT & ENGAGEMENT (30 APIs)
  // =============================================================================
  {
    id: 'flex-api',
    name: 'Flex API',
    description: 'Contact center platform for customer support',
    method: 'POST',
    path: '/v1/Accounts/{AccountSid}/Flex/FlowValidate',
    category: 'customer-support',
    subcategory: 'Contact Center',
    businessFunction: 'Omnichannel customer support and engagement',
    kpiImpact: 'Support resolution ↑ 45%, Agent efficiency ↑ 67%',
    costPerUse: 0.15,
    priorityLevel: 3,
    status: 'inactive',
    monthlyUsage: 234,
    lastUsed: '3 days ago',
    documentation: 'https://www.twilio.com/docs/flex/developer/ui/overview',
    requiredParams: [
      { name: 'FlowSid', type: 'string', description: 'Studio Flow SID' }
    ],
    optionalParams: [
      { name: 'Parameters', type: 'object', description: 'Flow parameters' }
    ],
    pricing: { cost: '$0.15', unit: 'per agent hour' }
  },
  {
    id: 'conversations-api',
    name: 'Conversations API',
    description: 'Unified messaging across multiple channels',
    method: 'POST',
    path: '/v1/Conversations',
    category: 'customer-support',
    subcategory: 'Unified Messaging',
    businessFunction: 'Multi-channel customer conversations',
    kpiImpact: 'Customer satisfaction ↑ 56%, Resolution time ↓ 34%',
    costPerUse: 0.05,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 789,
    lastUsed: '6 hours ago',
    documentation: 'https://www.twilio.com/docs/conversations/api',
    requiredParams: [],
    optionalParams: [
      { name: 'FriendlyName', type: 'string', description: 'Conversation name' },
      { name: 'Attributes', type: 'string', description: 'Custom attributes' }
    ],
    pricing: { cost: '$0.05', unit: 'per participant per day' }
  },
  {
    id: 'chat-api',
    name: 'Programmable Chat API',
    description: 'Real-time chat for customer support',
    method: 'POST',
    path: '/v1/Services/{ServiceSid}/Channels',
    category: 'customer-support',
    subcategory: 'Real-time Chat',
    businessFunction: 'Live chat support and customer engagement',
    kpiImpact: 'Response time ↓ 78%, Chat satisfaction ↑ 67%',
    costPerUse: 0.0025,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 1567,
    lastUsed: '2 hours ago',
    documentation: 'https://www.twilio.com/docs/chat/rest/channel-resource',
    requiredParams: [],
    optionalParams: [
      { name: 'FriendlyName', type: 'string', description: 'Channel name' },
      { name: 'Type', type: 'string', description: 'Channel type' }
    ],
    pricing: { cost: '$0.0025', unit: 'per message' }
  },
  {
    id: 'studio-api',
    name: 'Studio API',
    description: 'Visual workflow builder for customer journeys',
    method: 'POST',
    path: '/v2/Flows',
    category: 'customer-support',
    subcategory: 'Workflow Automation',
    businessFunction: 'Automated customer support workflows',
    kpiImpact: 'Automation rate ↑ 89%, Manual tasks ↓ 67%',
    costPerUse: 0.0025,
    priorityLevel: 5,
    status: 'active',
    monthlyUsage: 3456,
    lastUsed: '30 minutes ago',
    documentation: 'https://www.twilio.com/docs/studio/rest-api',
    requiredParams: [
      { name: 'FriendlyName', type: 'string', description: 'Flow name' },
      { name: 'Status', type: 'string', description: 'Flow status' },
      { name: 'Definition', type: 'object', description: 'Flow definition JSON' }
    ],
    optionalParams: [
      { name: 'CommitMessage', type: 'string', description: 'Version commit message' }
    ],
    pricing: { cost: '$0.0025', unit: 'per execution' }
  },
  {
    id: 'frontline-api',
    name: 'Frontline API',
    description: 'Customer engagement platform for sales teams',
    method: 'POST',
    path: '/v1/Users',
    category: 'customer-support',
    subcategory: 'Sales Engagement',
    businessFunction: 'Sales team customer communication and CRM',
    kpiImpact: 'Sales engagement ↑ 78%, Lead response ↓ 56%',
    costPerUse: 0.75,
    priorityLevel: 2,
    status: 'testing',
    monthlyUsage: 45,
    lastUsed: '2 days ago',
    documentation: 'https://www.twilio.com/docs/frontline',
    requiredParams: [
      { name: 'Identity', type: 'string', description: 'User identity' }
    ],
    optionalParams: [
      { name: 'FriendlyName', type: 'string', description: 'Display name' },
      { name: 'Avatar', type: 'string', description: 'Avatar URL' }
    ],
    pricing: { cost: '$0.75', unit: 'per user per month' }
  },
  {
    id: 'taskrouter-api',
    name: 'TaskRouter API',
    description: 'Intelligent task routing for customer support',
    method: 'POST',
    path: '/v1/Workspaces/{WorkspaceSid}/Tasks',
    category: 'customer-support',
    subcategory: 'Task Management',
    businessFunction: 'Route customer inquiries to best available agents',
    kpiImpact: 'Response time ↓ 56%, Agent efficiency ↑ 78%',
    costPerUse: 0.05,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 1456,
    lastUsed: '45 minutes ago',
    documentation: 'https://www.twilio.com/docs/taskrouter/api',
    requiredParams: [
      { name: 'Attributes', type: 'string', description: 'Task attributes JSON' }
    ],
    optionalParams: [
      { name: 'WorkflowSid', type: 'string', description: 'Workflow identifier' },
      { name: 'Timeout', type: 'integer', description: 'Task timeout in seconds' }
    ],
    pricing: { cost: '$0.05', unit: 'per task' }
  },
  {
    id: 'proxy-api',
    name: 'Proxy API',
    description: 'Anonymous communication between customers and agents',
    method: 'POST',
    path: '/v1/Services/{ServiceSid}/Sessions',
    category: 'customer-support',
    subcategory: 'Anonymous Communication',
    businessFunction: 'Protect agent privacy in customer communications',
    kpiImpact: 'Agent safety ↑ 100%, Communication quality ↑ 45%',
    costPerUse: 0.03,
    priorityLevel: 3,
    status: 'active',
    monthlyUsage: 345,
    lastUsed: '2 hours ago',
    documentation: 'https://www.twilio.com/docs/proxy/api',
    requiredParams: [],
    optionalParams: [
      { name: 'UniqueName', type: 'string', description: 'Session identifier' },
      { name: 'DateExpiry', type: 'date', description: 'Session expiration' }
    ],
    pricing: { cost: '$0.03', unit: 'per session day' }
  },
  {
    id: 'autopilot-api',
    name: 'Autopilot API',
    description: 'Conversational AI for customer support automation',
    method: 'POST',
    path: '/v1/Assistants',
    category: 'customer-support',
    subcategory: 'AI Automation',
    businessFunction: 'Automated customer support with natural language',
    kpiImpact: 'Automation rate ↑ 67%, Support costs ↓ 45%',
    costPerUse: 0.0025,
    priorityLevel: 4,
    status: 'testing',
    monthlyUsage: 2890,
    lastUsed: '1 hour ago',
    documentation: 'https://www.twilio.com/docs/autopilot/api',
    requiredParams: [
      { name: 'UniqueName', type: 'string', description: 'Assistant name' }
    ],
    optionalParams: [
      { name: 'FriendlyName', type: 'string', description: 'Display name' },
      { name: 'LogQueries', type: 'boolean', description: 'Enable query logging' }
    ],
    pricing: { cost: '$0.0025', unit: 'per query' }
  },
  {
    id: 'voice-intelligence-api',
    name: 'Voice Intelligence API',
    description: 'AI-powered call analysis and insights',
    method: 'POST',
    path: '/v2/Transcripts',
    category: 'customer-support',
    subcategory: 'Call Analytics',
    businessFunction: 'Analyze support calls for quality and training',
    kpiImpact: 'Call quality ↑ 67%, Training efficiency ↑ 89%',
    costPerUse: 0.05,
    priorityLevel: 3,
    status: 'testing',
    monthlyUsage: 123,
    lastUsed: '4 days ago',
    documentation: 'https://www.twilio.com/docs/voice/intelligence',
    requiredParams: [
      { name: 'MediaUrl', type: 'string', description: 'Audio file URL' }
    ],
    optionalParams: [
      { name: 'CustomerKey', type: 'string', description: 'Customer identifier' }
    ],
    pricing: { cost: '$0.05', unit: 'per minute analyzed' }
  },
  {
    id: 'trunking-api',
    name: 'Trunking API',
    description: 'Enterprise SIP trunking for voice communications',
    method: 'POST',
    path: '/v1/Trunks',
    category: 'customer-support',
    subcategory: 'Enterprise Voice',
    businessFunction: 'Enterprise-grade voice infrastructure for support',
    kpiImpact: 'Call reliability ↑ 99%, Enterprise connectivity ↑ 89%',
    costPerUse: 0.0085,
    priorityLevel: 3,
    status: 'inactive',
    monthlyUsage: 45,
    lastUsed: '1 week ago',
    documentation: 'https://www.twilio.com/docs/sip-trunking/api',
    requiredParams: [],
    optionalParams: [
      { name: 'FriendlyName', type: 'string', description: 'Trunk name' },
      { name: 'DomainName', type: 'string', description: 'SIP domain' }
    ],
    pricing: { cost: '$0.0085', unit: 'per minute' }
  },

  // =============================================================================
  // CATEGORY 4: PREMIUM MEMBER SERVICES (25 APIs)
  // =============================================================================
  {
    id: 'video-api',
    name: 'Video API',
    description: 'Video consultations for premium members',
    method: 'POST',
    path: '/v1/Rooms',
    category: 'premium-services',
    subcategory: 'Video Consultations',
    businessFunction: 'Premium member video consultations and support',
    kpiImpact: 'Premium conversions ↑ 56%, Member satisfaction ↑ 78%',
    costPerUse: 0.004,
    priorityLevel: 3,
    status: 'active',
    monthlyUsage: 89,
    lastUsed: '6 hours ago',
    documentation: 'https://www.twilio.com/docs/video/api',
    requiredParams: [],
    optionalParams: [
      { name: 'UniqueName', type: 'string', description: 'Room identifier' },
      { name: 'Type', type: 'string', description: 'Room type' },
      { name: 'MaxParticipants', type: 'integer', description: 'Maximum participants' }
    ],
    pricing: { cost: '$0.004', unit: 'per participant minute' }
  },
  {
    id: 'live-api',
    name: 'Live API',
    description: 'Live streaming for premium events and webinars',
    method: 'POST',
    path: '/v1/Rooms',
    category: 'premium-services',
    subcategory: 'Live Streaming',
    businessFunction: 'Premium member exclusive live events',
    kpiImpact: 'Premium engagement ↑ 89%, Event attendance ↑ 67%',
    costPerUse: 0.006,
    priorityLevel: 3,
    status: 'testing',
    monthlyUsage: 23,
    lastUsed: '1 week ago',
    documentation: 'https://www.twilio.com/docs/live',
    requiredParams: [
      { name: 'UniqueName', type: 'string', description: 'Room name' },
      { name: 'Type', type: 'string', description: 'Room type for live streaming' }
    ],
    optionalParams: [
      { name: 'RecordParticipantsOnConnect', type: 'boolean', description: 'Auto-record participants' }
    ],
    pricing: { cost: '$0.006', unit: 'per minute' }
  },
  {
    id: 'sync-api',
    name: 'Sync API',
    description: 'Real-time data synchronization for premium features',
    method: 'POST',
    path: '/v1/Services/{ServiceSid}/Documents',
    category: 'premium-services',
    subcategory: 'Real-time Sync',
    businessFunction: 'Premium member dashboard real-time updates',
    kpiImpact: 'User experience ↑ 78%, Page engagement ↑ 45%',
    costPerUse: 0.0015,
    priorityLevel: 3,
    status: 'active',
    monthlyUsage: 456,
    lastUsed: '4 hours ago',
    documentation: 'https://www.twilio.com/docs/sync/api',
    requiredParams: [],
    optionalParams: [
      { name: 'UniqueName', type: 'string', description: 'Document identifier' },
      { name: 'Data', type: 'object', description: 'Document data' }
    ],
    pricing: { cost: '$0.0015', unit: 'per sync operation' }
  },
  {
    id: 'voice-insights-api',
    name: 'Voice Insights API',
    description: 'Call quality analytics for premium support',
    method: 'GET',
    path: '/v1/Voice/Stats/Calls',
    category: 'premium-services',
    subcategory: 'Quality Analytics',
    businessFunction: 'Premium support call quality monitoring',
    kpiImpact: 'Call quality ↑ 67%, Support satisfaction ↑ 45%',
    costPerUse: 0.005,
    priorityLevel: 2,
    status: 'inactive',
    monthlyUsage: 12,
    lastUsed: '5 days ago',
    documentation: 'https://www.twilio.com/docs/voice/insights',
    requiredParams: [],
    optionalParams: [
      { name: 'StartDate', type: 'date', description: 'Start date for stats' },
      { name: 'EndDate', type: 'date', description: 'End date for stats' }
    ],
    pricing: { cost: '$0.005', unit: 'per call analyzed' }
  },
  {
    id: 'media-streams-api',
    name: 'Media Streams API',
    description: 'Real-time audio streaming for premium features',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Calls/{CallSid}/Streams',
    category: 'premium-services',
    subcategory: 'Audio Streaming',
    businessFunction: 'Premium member call recording and analysis',
    kpiImpact: 'Service quality ↑ 56%, Compliance ↑ 89%',
    costPerUse: 0.0025,
    priorityLevel: 2,
    status: 'testing',
    monthlyUsage: 34,
    lastUsed: '3 days ago',
    documentation: 'https://www.twilio.com/docs/voice/media-streams',
    requiredParams: [
      { name: 'Url', type: 'string', description: 'WebSocket URL for streaming' }
    ],
    optionalParams: [
      { name: 'Name', type: 'string', description: 'Stream name' },
      { name: 'Track', type: 'string', description: 'Audio track selection' }
    ],
    pricing: { cost: '$0.0025', unit: 'per minute streamed' }
  },
  {
    id: 'player-streamer-api',
    name: 'Player Streamer API',
    description: 'Media playback in voice calls for premium services',
    method: 'POST',
    path: '/v1/PlayerStreamers',
    category: 'premium-services',
    subcategory: 'Media Playback',
    businessFunction: 'Play premium content during customer calls',
    kpiImpact: 'Premium engagement ↑ 78%, Call quality ↑ 89%',
    costPerUse: 0.0075,
    priorityLevel: 2,
    status: 'testing',
    monthlyUsage: 45,
    lastUsed: '3 days ago',
    documentation: 'https://www.twilio.com/docs/voice/api/player-streamer',
    requiredParams: [
      { name: 'StatusCallback', type: 'string', description: 'Status webhook URL' }
    ],
    optionalParams: [
      { name: 'StatusCallbackMethod', type: 'string', description: 'Webhook HTTP method' }
    ],
    pricing: { cost: '$0.0075', unit: 'per minute' }
  },
  {
    id: 'recording-api',
    name: 'Recording API',
    description: 'Call recording for premium support and compliance',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Calls/{CallSid}/Recordings',
    category: 'premium-services',
    subcategory: 'Call Recording',
    businessFunction: 'Record premium support calls for quality assurance',
    kpiImpact: 'Compliance ↑ 100%, Quality scores ↑ 67%',
    costPerUse: 0.0025,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 234,
    lastUsed: '6 hours ago',
    documentation: 'https://www.twilio.com/docs/voice/api/recording',
    requiredParams: [],
    optionalParams: [
      { name: 'RecordingChannels', type: 'string', description: 'Recording channels' },
      { name: 'RecordingStatusCallback', type: 'string', description: 'Recording webhook' }
    ],
    pricing: { cost: '$0.0025', unit: 'per minute recorded' }
  },
  {
    id: 'composition-api',
    name: 'Composition API',
    description: 'Video composition for premium content creation',
    method: 'POST',
    path: '/v1/Compositions',
    category: 'premium-services',
    subcategory: 'Video Production',
    businessFunction: 'Create premium video content from recordings',
    kpiImpact: 'Content quality ↑ 89%, Production time ↓ 67%',
    costPerUse: 0.015,
    priorityLevel: 2,
    status: 'testing',
    monthlyUsage: 12,
    lastUsed: '1 week ago',
    documentation: 'https://www.twilio.com/docs/video/api/compositions-resource',
    requiredParams: [
      { name: 'RoomSid', type: 'string', description: 'Room identifier' }
    ],
    optionalParams: [
      { name: 'VideoLayout', type: 'object', description: 'Video layout configuration' },
      { name: 'AudioSources', type: 'array', description: 'Audio source selection' }
    ],
    pricing: { cost: '$0.015', unit: 'per minute composed' }
  },
  {
    id: 'room-recording-api',
    name: 'Room Recording API',
    description: 'Record video rooms for premium content',
    method: 'POST',
    path: '/v1/Rooms/{RoomSid}/Recordings',
    category: 'premium-services',
    subcategory: 'Video Recording',
    businessFunction: 'Record premium video sessions for later access',
    kpiImpact: 'Content library ↑ 100%, Member value ↑ 78%',
    costPerUse: 0.004,
    priorityLevel: 3,
    status: 'active',
    monthlyUsage: 67,
    lastUsed: '2 days ago',
    documentation: 'https://www.twilio.com/docs/video/api/room-recordings',
    requiredParams: [],
    optionalParams: [
      { name: 'Name', type: 'string', description: 'Recording name' },
      { name: 'VideoLayout', type: 'string', description: 'Video layout type' }
    ],
    pricing: { cost: '$0.004', unit: 'per participant minute' }
  },
  {
    id: 'track-api',
    name: 'Track API',
    description: 'Manage individual audio/video tracks in premium rooms',
    method: 'GET',
    path: '/v1/Rooms/{RoomSid}/Participants/{ParticipantSid}/PublishedTracks',
    category: 'premium-services',
    subcategory: 'Track Management',
    businessFunction: 'Fine-grained control of premium video features',
    kpiImpact: 'Video quality ↑ 89%, User control ↑ 67%',
    costPerUse: 0.00,
    priorityLevel: 2,
    status: 'active',
    monthlyUsage: 234,
    lastUsed: '1 day ago',
    documentation: 'https://www.twilio.com/docs/video/api/track-resource',
    requiredParams: [
      { name: 'RoomSid', type: 'string', description: 'Room identifier' },
      { name: 'ParticipantSid', type: 'string', description: 'Participant identifier' }
    ],
    optionalParams: [],
    pricing: { cost: 'Free', unit: 'per track operation' }
  },

  // =============================================================================
  // CATEGORY 5: ANALYTICS & INTELLIGENCE (30 APIs)
  // =============================================================================
  {
    id: 'insights-api',
    name: 'Insights API',
    description: 'Communication analytics and performance tracking',
    method: 'GET',
    path: '/v1/Voice/Stats/Calls',
    category: 'analytics-intelligence',
    subcategory: 'Communication Analytics',
    businessFunction: 'Track communication performance and ROI',
    kpiImpact: 'Campaign efficiency ↑ 23%, Cost optimization ↓ 34%',
    costPerUse: 0.001,
    priorityLevel: 2,
    status: 'active',
    monthlyUsage: 1567,
    lastUsed: '30 minutes ago',
    documentation: 'https://www.twilio.com/docs/voice/insights',
    requiredParams: [],
    optionalParams: [
      { name: 'StartDate', type: 'date', description: 'Analytics start date' },
      { name: 'EndDate', type: 'date', description: 'Analytics end date' },
      { name: 'Granularity', type: 'string', description: 'Data granularity' }
    ],
    pricing: { cost: '$0.001', unit: 'per data point' }
  },
  {
    id: 'usage-api',
    name: 'Usage API',
    description: 'API usage tracking and billing analytics',
    method: 'GET',
    path: '/2010-04-01/Accounts/{AccountSid}/Usage/Records',
    category: 'analytics-intelligence',
    subcategory: 'Usage Tracking',
    businessFunction: 'Monitor API consumption and costs',
    kpiImpact: 'Cost visibility ↑ 89%, Budget control ↑ 67%',
    costPerUse: 0.0005,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 2890,
    lastUsed: '1 hour ago',
    documentation: 'https://www.twilio.com/docs/usage/api',
    requiredParams: [],
    optionalParams: [
      { name: 'Category', type: 'string', description: 'Usage category' },
      { name: 'StartDate', type: 'date', description: 'Usage start date' },
      { name: 'EndDate', type: 'date', description: 'Usage end date' }
    ],
    pricing: { cost: '$0.0005', unit: 'per query' }
  },
  {
    id: 'monitor-api',
    name: 'Monitor API',
    description: 'System health monitoring and alerting',
    method: 'GET',
    path: '/v1/Alerts',
    category: 'analytics-intelligence',
    subcategory: 'System Monitoring',
    businessFunction: 'Monitor system health and performance',
    kpiImpact: 'System uptime ↑ 99.9%, Issue detection ↑ 78%',
    costPerUse: 0.001,
    priorityLevel: 5,
    status: 'active',
    monthlyUsage: 4567,
    lastUsed: '15 minutes ago',
    documentation: 'https://www.twilio.com/docs/usage/monitor-alert',
    requiredParams: [],
    optionalParams: [
      { name: 'LogLevel', type: 'string', description: 'Alert severity level' },
      { name: 'StartDate', type: 'date', description: 'Monitoring start date' },
      { name: 'EndDate', type: 'date', description: 'Monitoring end date' }
    ],
    pricing: { cost: '$0.001', unit: 'per alert' }
  },
  {
    id: 'events-api',
    name: 'Events API',
    description: 'Real-time event streaming for analytics',
    method: 'GET',
    path: '/v1/Events',
    category: 'analytics-intelligence',
    subcategory: 'Event Streaming',
    businessFunction: 'Real-time business event tracking',
    kpiImpact: 'Real-time insights ↑ 89%, Decision speed ↑ 67%',
    costPerUse: 0.0001,
    priorityLevel: 3,
    status: 'active',
    monthlyUsage: 12890,
    lastUsed: '5 minutes ago',
    documentation: 'https://www.twilio.com/docs/events',
    requiredParams: [],
    optionalParams: [
      { name: 'EventType', type: 'string', description: 'Type of events to retrieve' },
      { name: 'StartDate', type: 'date', description: 'Event start date' }
    ],
    pricing: { cost: '$0.0001', unit: 'per event' }
  },
  {
    id: 'super-sim-api',
    name: 'Super SIM API',
    description: 'IoT connectivity analytics for smart devices',
    method: 'GET',
    path: '/v1/Sims',
    category: 'analytics-intelligence',
    subcategory: 'IoT Analytics',
    businessFunction: 'Track IoT device usage and connectivity',
    kpiImpact: 'Device uptime ↑ 95%, Connectivity cost ↓ 23%',
    costPerUse: 0.10,
    priorityLevel: 1,
    status: 'inactive',
    monthlyUsage: 5,
    lastUsed: '2 weeks ago',
    documentation: 'https://www.twilio.com/docs/iot/supersim',
    requiredParams: [],
    optionalParams: [
      { name: 'Status', type: 'string', description: 'SIM status filter' },
      { name: 'IccId', type: 'string', description: 'SIM ICC ID' }
    ],
    pricing: { cost: '$0.10', unit: 'per SIM per month' }
  },
  {
    id: 'bulk-exports-api',
    name: 'Bulk Exports API',
    description: 'Export large datasets for business intelligence',
    method: 'POST',
    path: '/v1/Exports',
    category: 'analytics-intelligence',
    subcategory: 'Data Export',
    businessFunction: 'Export communication data for BI analysis',
    kpiImpact: 'Data accessibility ↑ 100%, Analysis speed ↑ 89%',
    costPerUse: 0.10,
    priorityLevel: 3,
    status: 'active',
    monthlyUsage: 67,
    lastUsed: '2 days ago',
    documentation: 'https://www.twilio.com/docs/usage/bulk-export',
    requiredParams: [
      { name: 'ResourceType', type: 'string', description: 'Type of data to export' }
    ],
    optionalParams: [
      { name: 'StartDay', type: 'string', description: 'Export start date' },
      { name: 'EndDay', type: 'string', description: 'Export end date' }
    ],
    pricing: { cost: '$0.10', unit: 'per export job' }
  },
  {
    id: 'call-quality-api',
    name: 'Call Quality API',
    description: 'Detailed call quality metrics and analytics',
    method: 'GET',
    path: '/v1/Voice/Stats/Calls/{CallSid}/Summary',
    category: 'analytics-intelligence',
    subcategory: 'Quality Analytics',
    businessFunction: 'Monitor and improve call quality metrics',
    kpiImpact: 'Call quality ↑ 78%, Customer satisfaction ↑ 56%',
    costPerUse: 0.005,
    priorityLevel: 3,
    status: 'active',
    monthlyUsage: 890,
    lastUsed: '4 hours ago',
    documentation: 'https://www.twilio.com/docs/voice/insights/call-summary-api',
    requiredParams: [
      { name: 'CallSid', type: 'string', description: 'Call identifier' }
    ],
    optionalParams: [
      { name: 'ProcessingState', type: 'string', description: 'Processing state filter' }
    ],
    pricing: { cost: '$0.005', unit: 'per call analyzed' }
  },
  {
    id: 'debugger-api',
    name: 'Debugger API',
    description: 'Debug API errors and troubleshoot issues',
    method: 'GET',
    path: '/2010-04-01/Accounts/{AccountSid}/DebugEvents',
    category: 'analytics-intelligence',
    subcategory: 'Error Debugging',
    businessFunction: 'Debug and resolve API integration issues',
    kpiImpact: 'Debug time ↓ 67%, Error resolution ↑ 89%',
    costPerUse: 0.001,
    priorityLevel: 4,
    status: 'active',
    monthlyUsage: 456,
    lastUsed: '1 hour ago',
    documentation: 'https://www.twilio.com/docs/usage/monitor-debug',
    requiredParams: [],
    optionalParams: [
      { name: 'StartDate', type: 'date', description: 'Debug start date' },
      { name: 'EndDate', type: 'date', description: 'Debug end date' }
    ],
    pricing: { cost: '$0.001', unit: 'per debug event' }
  },
  {
    id: 'wireless-api',
    name: 'Wireless API',
    description: 'IoT device connectivity and management',
    method: 'GET',
    path: '/v1/Sims/{Sid}/UsageRecords',
    category: 'analytics-intelligence',
    subcategory: 'IoT Management',
    businessFunction: 'Manage IoT devices for smart business operations',
    kpiImpact: 'IoT uptime ↑ 95%, Connectivity costs ↓ 34%',
    costPerUse: 0.10,
    priorityLevel: 1,
    status: 'inactive',
    monthlyUsage: 3,
    lastUsed: '3 weeks ago',
    documentation: 'https://www.twilio.com/docs/iot/wireless',
    requiredParams: [
      { name: 'Sid', type: 'string', description: 'SIM identifier' }
    ],
    optionalParams: [
      { name: 'Granularity', type: 'string', description: 'Usage granularity' }
    ],
    pricing: { cost: '$0.10', unit: 'per SIM per month' }
  },
  {
    id: 'flex-insights-api',
    name: 'Flex Insights API',
    description: 'Contact center analytics and reporting',
    method: 'GET',
    path: '/v1/Accounts/{AccountSid}/Flex/Insights/QualityManagement',
    category: 'analytics-intelligence',
    subcategory: 'Contact Center Analytics',
    businessFunction: 'Analyze contact center performance and quality',
    kpiImpact: 'Agent performance ↑ 67%, Quality scores ↑ 89%',
    costPerUse: 0.02,
    priorityLevel: 3,
    status: 'testing',
    monthlyUsage: 123,
    lastUsed: '3 days ago',
    documentation: 'https://www.twilio.com/docs/flex/developer/insights',
    requiredParams: [],
    optionalParams: [
      { name: 'Token', type: 'string', description: 'Flex token for authentication' }
    ],
    pricing: { cost: '$0.02', unit: 'per insight query' }
  }
];

export const TWILIO_BUSINESS_CATEGORIES = [
  {
    id: 'authentication-security',
    name: 'Customer Authentication & Security',
    icon: 'Shield',
    description: 'Phone verification, 2FA, identity validation, and security services',
    color: 'text-blue-600',
    subcategories: [
      { id: 'phone-verification', name: 'Phone Verification' },
      { id: '2fa-authentication', name: '2FA Authentication' },
      { id: 'phone-validation', name: 'Phone Validation' },
      { id: 'identity-verification', name: 'Identity Verification' },
      { id: 'call-protection', name: 'Call Protection' },
      { id: 'security-monitoring', name: 'Security Monitoring' },
      { id: 'number-management', name: 'Number Management' },
      { id: 'ssl-management', name: 'SSL Management' },
      { id: 'api-key-management', name: 'API Key Management' },
      { id: 'application-management', name: 'Application Management' }
    ]
  },
  {
    id: 'billing-communications',
    name: 'Billing & Payment Communications',
    icon: 'DollarSign',
    description: 'Payment reminders, collection calls, billing notifications',
    color: 'text-green-600',
    subcategories: [
      { id: 'payment-notifications', name: 'Payment Notifications' },
      { id: 'payment-collection', name: 'Payment Collection' },
      { id: 'rich-messaging', name: 'Rich Messaging' },
      { id: 'email-billing', name: 'Email Billing' },
      { id: 'multi-channel', name: 'Multi-Channel' },
      { id: 'rich-media', name: 'Rich Media' },
      { id: 'high-volume-messaging', name: 'High Volume Messaging' },
      { id: 'branded-messaging', name: 'Branded Messaging' },
      { id: 'service-management', name: 'Service Management' },
      { id: 'smart-routing', name: 'Smart Routing' }
    ]
  },
  {
    id: 'customer-support',
    name: 'Customer Support & Engagement',
    icon: 'Users',
    description: 'Support channels, customer communication, and engagement tools',
    color: 'text-purple-600',
    subcategories: [
      { id: 'contact-center', name: 'Contact Center' },
      { id: 'unified-messaging', name: 'Unified Messaging' },
      { id: 'real-time-chat', name: 'Real-time Chat' },
      { id: 'workflow-automation', name: 'Workflow Automation' },
      { id: 'sales-engagement', name: 'Sales Engagement' },
      { id: 'task-management', name: 'Task Management' },
      { id: 'anonymous-communication', name: 'Anonymous Communication' },
      { id: 'ai-automation', name: 'AI Automation' },
      { id: 'call-analytics', name: 'Call Analytics' },
      { id: 'enterprise-voice', name: 'Enterprise Voice' }
    ]
  },
  {
    id: 'premium-services',
    name: 'Premium Member Services',
    icon: 'Video',
    description: 'Video consultations, premium features, and value-added services',
    color: 'text-orange-600',
    subcategories: [
      { id: 'video-consultations', name: 'Video Consultations' },
      { id: 'live-streaming', name: 'Live Streaming' },
      { id: 'real-time-sync', name: 'Real-time Sync' },
      { id: 'quality-analytics', name: 'Quality Analytics' },
      { id: 'audio-streaming', name: 'Audio Streaming' },
      { id: 'media-playback', name: 'Media Playback' },
      { id: 'call-recording', name: 'Call Recording' },
      { id: 'video-production', name: 'Video Production' },
      { id: 'video-recording', name: 'Video Recording' },
      { id: 'track-management', name: 'Track Management' }
    ]
  },
  {
    id: 'analytics-intelligence',
    name: 'Analytics & Intelligence',
    icon: 'BarChart3',
    description: 'Usage tracking, performance analytics, and business intelligence',
    color: 'text-indigo-600',
    subcategories: [
      { id: 'communication-analytics', name: 'Communication Analytics' },
      { id: 'usage-tracking', name: 'Usage Tracking' },
      { id: 'system-monitoring', name: 'System Monitoring' },
      { id: 'event-streaming', name: 'Event Streaming' },
      { id: 'iot-analytics', name: 'IoT Analytics' },
      { id: 'data-export', name: 'Data Export' },
      { id: 'quality-analytics', name: 'Quality Analytics' },
      { id: 'error-debugging', name: 'Error Debugging' },
      { id: 'iot-management', name: 'IoT Management' },
      { id: 'contact-center-analytics', name: 'Contact Center Analytics' }
    ]
  }
];

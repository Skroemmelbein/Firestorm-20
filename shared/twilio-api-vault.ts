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

// Comprehensive Twilio API Categories
export const TWILIO_API_CATEGORIES: TwilioAPICategory[] = [
  {
    id: 'messaging',
    name: 'Messaging',
    description: 'SMS, MMS, WhatsApp, and other messaging services',
    icon: 'MessageSquare',
    subcategories: [
      { id: 'sms', name: 'SMS', description: 'Send and manage SMS messages' },
      { id: 'mms', name: 'MMS', description: 'Send and manage MMS messages' },
      { id: 'whatsapp', name: 'WhatsApp', description: 'WhatsApp Business API' },
      { id: 'conversations', name: 'Conversations', description: 'Unified messaging conversations' }
    ]
  },
  {
    id: 'voice',
    name: 'Voice & Calls',
    description: 'Voice calls, recordings, and call management',
    icon: 'Phone',
    subcategories: [
      { id: 'calls', name: 'Calls', description: 'Make and manage voice calls' },
      { id: 'recordings', name: 'Recordings', description: 'Call recordings and transcriptions' },
      { id: 'conferences', name: 'Conferences', description: 'Conference calling' },
      { id: 'twiml', name: 'TwiML', description: 'Twilio Markup Language' }
    ]
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Video calling and streaming services',
    icon: 'Video',
    subcategories: [
      { id: 'rooms', name: 'Video Rooms', description: 'Video calling rooms' },
      { id: 'compositions', name: 'Compositions', description: 'Video compositions and recordings' },
      { id: 'media', name: 'Media', description: 'Media processing and storage' }
    ]
  },
  {
    id: 'verify',
    name: 'Verify',
    description: 'Phone number verification and 2FA',
    icon: 'Shield',
    subcategories: [
      { id: 'verifications', name: 'Verifications', description: 'Phone verification services' },
      { id: 'services', name: 'Services', description: 'Verification service management' }
    ]
  },
  {
    id: 'lookup',
    name: 'Lookup',
    description: 'Phone number information and validation',
    icon: 'Search',
    subcategories: [
      { id: 'phone-numbers', name: 'Phone Numbers', description: 'Phone number information lookup' },
      { id: 'carrier', name: 'Carrier', description: 'Carrier information lookup' }
    ]
  },
  {
    id: 'notify',
    name: 'Notify',
    description: 'Push notifications and multi-channel messaging',
    icon: 'Bell',
    subcategories: [
      { id: 'services', name: 'Services', description: 'Notification services' },
      { id: 'bindings', name: 'Bindings', description: 'Device bindings for push notifications' }
    ]
  },
  {
    id: 'chat',
    name: 'Chat',
    description: 'In-app chat and messaging',
    icon: 'MessageCircle',
    subcategories: [
      { id: 'services', name: 'Services', description: 'Chat service management' },
      { id: 'channels', name: 'Channels', description: 'Chat channels' },
      { id: 'users', name: 'Users', description: 'Chat users management' }
    ]
  },
  {
    id: 'sync',
    name: 'Sync',
    description: 'Real-time data synchronization',
    icon: 'RefreshCw',
    subcategories: [
      { id: 'services', name: 'Services', description: 'Sync services' },
      { id: 'documents', name: 'Documents', description: 'Sync documents' },
      { id: 'lists', name: 'Sync Lists', description: 'Synchronized lists' }
    ]
  },
  {
    id: 'numbers',
    name: 'Phone Numbers',
    description: 'Phone number management and provisioning',
    icon: 'Hash',
    subcategories: [
      { id: 'incoming', name: 'Incoming Numbers', description: 'Manage your Twilio phone numbers' },
      { id: 'available', name: 'Available Numbers', description: 'Search for available phone numbers' }
    ]
  },
  {
    id: 'accounts',
    name: 'Accounts',
    description: 'Account management and subaccounts',
    icon: 'Users',
    subcategories: [
      { id: 'main', name: 'Main Account', description: 'Main account management' },
      { id: 'subaccounts', name: 'Subaccounts', description: 'Subaccount management' }
    ]
  }
];

// Sample API endpoints - this would be populated with the full Twilio API
export const TWILIO_API_VAULT: TwilioAPIEndpoint[] = [
  {
    id: 'send-sms',
    name: 'Send SMS Message',
    description: 'Send an SMS message to a phone number',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Messages.json',
    category: 'messaging',
    subcategory: 'sms',
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
    id: 'make-call',
    name: 'Make Voice Call',
    description: 'Initiate an outbound voice call',
    method: 'POST',
    path: '/2010-04-01/Accounts/{AccountSid}/Calls.json',
    category: 'voice',
    subcategory: 'calls',
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
      from: '+1987654321'
    },
    pricing: {
      cost: '$0.013',
      unit: 'per minute'
    },
    documentation: 'https://www.twilio.com/docs/voice/api/call-resource'
  },
  {
    id: 'verify-phone',
    name: 'Start Phone Verification',
    description: 'Send a verification code to a phone number',
    method: 'POST',
    path: '/v2/Services/{ServiceSid}/Verifications',
    category: 'verify',
    subcategory: 'verifications',
    requiredParams: [
      {
        name: 'To',
        type: 'string',
        description: 'Phone number to verify',
        required: true,
        example: '+1234567890'
      },
      {
        name: 'Channel',
        type: 'string',
        description: 'Verification channel (sms, call, email)',
        required: true,
        example: 'sms'
      }
    ],
    optionalParams: [
      {
        name: 'CustomFriendlyName',
        type: 'string',
        description: 'Custom name for the verification',
        required: false
      },
      {
        name: 'CustomMessage',
        type: 'string',
        description: 'Custom verification message',
        required: false
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
      unit: 'per verification attempt'
    },
    documentation: 'https://www.twilio.com/docs/verify/api/verification'
  },
  {
    id: 'lookup-phone',
    name: 'Lookup Phone Number',
    description: 'Get information about a phone number',
    method: 'GET',
    path: '/v1/PhoneNumbers/{PhoneNumber}',
    category: 'lookup',
    subcategory: 'phone-numbers',
    requiredParams: [
      {
        name: 'PhoneNumber',
        type: 'string',
        description: 'Phone number to lookup',
        required: true,
        example: '+1234567890'
      }
    ],
    optionalParams: [
      {
        name: 'Type',
        type: 'array',
        description: 'Additional information to include',
        required: false,
        example: ['carrier', 'caller-name']
      }
    ],
    responseExample: {
      phone_number: '+1234567890',
      country_code: 'US',
      carrier: {
        name: 'Verizon',
        type: 'mobile'
      }
    },
    pricing: {
      cost: '$0.005',
      unit: 'per lookup'
    },
    documentation: 'https://www.twilio.com/docs/lookup/api'
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

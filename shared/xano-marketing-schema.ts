// FORTUNE 10 XANO DATABASE SCHEMA FOR MARKETING AUTOMATION
// Each table is designed for enterprise-level performance and scalability

export interface XanoMarketingSchema {
  // CORE CUSTOMER DATA
  customers: {
    id: number; // Primary key
    uuid: string; // Public identifier
    first_name: string;
    last_name: string;
    email: string; // Unique index
    phone: string; // E.164 format, unique index
    status: "active" | "inactive" | "opted_out" | "bounced" | "blocked";
    created_at: string; // ISO timestamp
    updated_at: string;

    // Engagement metrics
    engagement_score: number; // 0-100 calculated score
    lifetime_value: number; // Total revenue from customer
    total_orders: number;
    last_order_date: string;
    avg_order_value: number;

    // Communication preferences
    sms_opt_in: boolean;
    email_opt_in: boolean;
    voice_opt_in: boolean;
    preferred_contact_time: string; // JSON: {"start": "09:00", "end": "17:00", "timezone": "UTC"}
    preferred_language: string; // ISO language code

    // Segmentation
    tags: string; // JSON array of tags
    segment_ids: string; // JSON array of segment IDs
    source: string; // How they were acquired
    acquisition_date: string;

    // AI insights
    ai_personality_profile: string; // JSON AI analysis
    ai_communication_style: string; // formal, casual, friendly, etc.
    ai_purchase_intent: number; // 0-100 score
    ai_churn_risk: number; // 0-100 score
  };

  // MARKETING CAMPAIGNS
  campaigns: {
    id: number;
    uuid: string;
    name: string;
    description: string;
    type: "sms" | "voice" | "email" | "multi_channel" | "sequence";
    status:
      | "draft"
      | "scheduled"
      | "active"
      | "paused"
      | "completed"
      | "cancelled";

    // Targeting
    audience_type: "all" | "segment" | "custom_filter";
    audience_segments: string; // JSON array of segment IDs
    audience_filters: string; // JSON query filters
    estimated_reach: number;

    // Content
    content_template_id: number; // FK to message_templates
    ai_personalization_enabled: boolean;
    ai_optimization_enabled: boolean;

    // Scheduling
    schedule_type: "immediate" | "scheduled" | "triggered" | "recurring";
    schedule_datetime: string;
    schedule_timezone: string;
    recurring_pattern: string; // JSON for recurring campaigns

    // Performance tracking
    sent_count: number;
    delivered_count: number;
    opened_count: number;
    clicked_count: number;
    replied_count: number;
    unsubscribed_count: number;
    conversion_count: number;
    revenue_generated: number;

    // Metadata
    created_by: number; // FK to users
    created_at: string;
    updated_at: string;
    launched_at: string;
    completed_at: string;
  };

  // MESSAGE TEMPLATES
  message_templates: {
    id: number;
    uuid: string;
    name: string;
    type: "sms" | "voice" | "email";
    category:
      | "promotional"
      | "transactional"
      | "abandoned_cart"
      | "welcome"
      | "retention";

    // Content
    subject: string; // For email
    content: string; // Message content with placeholders
    voice_script: string; // For voice campaigns
    media_urls: string; // JSON array of media files

    // AI features
    ai_generated: boolean;
    ai_tone: "professional" | "friendly" | "casual" | "urgent" | "persuasive";
    ai_goal:
      | "awareness"
      | "consideration"
      | "conversion"
      | "retention"
      | "support";

    // Performance
    usage_count: number;
    avg_open_rate: number;
    avg_click_rate: number;
    avg_conversion_rate: number;

    created_at: string;
    updated_at: string;
  };

  // CUSTOMER SEGMENTS
  customer_segments: {
    id: number;
    uuid: string;
    name: string;
    description: string;
    type: "static" | "dynamic";

    // Criteria
    criteria: string; // JSON query for dynamic segments
    customer_count: number;
    last_updated: string;

    // Performance
    avg_engagement_rate: number;
    avg_conversion_rate: number;
    avg_lifetime_value: number;

    created_at: string;
    updated_at: string;
  };

  // CONVERSATION HISTORY
  conversations: {
    id: number;
    uuid: string;
    customer_id: number; // FK to customers
    campaign_id: number; // FK to campaigns (nullable)
    channel: "sms" | "voice" | "email" | "web_chat";

    // Message details
    direction: "inbound" | "outbound";
    content: string;
    media_urls: string; // JSON array

    // AI features
    ai_generated: boolean;
    ai_response_id: number; // FK to ai_responses (nullable)
    ai_sentiment: "positive" | "neutral" | "negative";
    ai_intent: string; // purchase, support, complaint, etc.
    ai_confidence: number; // 0-100

    // Twilio data
    twilio_sid: string;
    twilio_status: string;
    twilio_error_code: string;

    // Tracking
    delivered_at: string;
    read_at: string;
    replied_at: string;

    created_at: string;
  };

  // AI AUTO-RESPONSES
  ai_responses: {
    id: number;
    uuid: string;
    name: string;
    trigger_type:
      | "keyword"
      | "intent"
      | "sentiment"
      | "time_based"
      | "behavioral";
    trigger_value: string; // The actual trigger (keyword, intent, etc.)

    // Response content
    response_template: string; // Template with AI placeholders
    response_tone: string;
    response_goal: "information" | "qualification" | "conversion" | "retention";

    // AI configuration
    ai_model: string; // gpt-4, gpt-3.5-turbo, etc.
    ai_temperature: number; // 0-1 for response creativity
    ai_max_tokens: number;
    ai_system_prompt: string;

    // Performance metrics
    usage_count: number;
    success_rate: number; // % of responses that achieved their goal
    avg_response_time: number; // Seconds
    customer_satisfaction: number; // 1-5 rating

    // Status
    is_active: boolean;
    priority: number; // 1-10 for conflict resolution

    created_at: string;
    updated_at: string;
  };

  // CAMPAIGN PERFORMANCE
  campaign_analytics: {
    id: number;
    campaign_id: number; // FK to campaigns
    date: string; // YYYY-MM-DD for daily aggregation

    // Delivery metrics
    sent: number;
    delivered: number;
    failed: number;
    bounced: number;

    // Engagement metrics
    opened: number;
    clicked: number;
    replied: number;
    unsubscribed: number;
    complained: number;

    // Conversion metrics
    conversions: number;
    revenue: number;
    orders: number;

    // AI metrics
    ai_responses_triggered: number;
    ai_conversations_started: number;
    ai_sales_completed: number;

    created_at: string;
  };

  // TWILIO WEBHOOKS LOG
  twilio_webhooks: {
    id: number;
    webhook_type: string; // message_status, incoming_message, etc.
    twilio_sid: string;
    customer_id: number; // FK to customers (nullable)
    campaign_id: number; // FK to campaigns (nullable)

    // Webhook data
    status: string;
    error_code: string;
    error_message: string;
    raw_data: string; // JSON of full webhook payload

    // Processing
    processed: boolean;
    processed_at: string;

    created_at: string;
  };

  // MARKETING AUTOMATION FLOWS
  automation_flows: {
    id: number;
    uuid: string;
    name: string;
    description: string;
    trigger_type:
      | "signup"
      | "purchase"
      | "abandoned_cart"
      | "birthday"
      | "anniversary"
      | "custom";
    trigger_conditions: string; // JSON conditions

    // Flow configuration
    is_active: boolean;
    flow_steps: string; // JSON array of steps
    delay_between_steps: number; // Minutes

    // Performance
    enrollments: number;
    completions: number;
    conversion_rate: number;
    avg_completion_time: number; // Hours

    created_at: string;
    updated_at: string;
  };

  // CONTACT IMPORTS/EXPORTS
  contact_imports: {
    id: number;
    filename: string;
    file_size: number;
    status: "pending" | "processing" | "completed" | "failed";

    // Results
    total_rows: number;
    processed_rows: number;
    successful_imports: number;
    failed_imports: number;
    duplicate_emails: number;
    invalid_phones: number;

    // Validation
    validation_errors: string; // JSON array of errors
    mapping_config: string; // JSON field mapping

    created_at: string;
    completed_at: string;
  };

  // COMPLIANCE & GDPR
  compliance_logs: {
    id: number;
    customer_id: number; // FK to customers
    action_type:
      | "opt_in"
      | "opt_out"
      | "data_request"
      | "data_deletion"
      | "consent_update";
    action_details: string; // JSON details

    // Legal tracking
    ip_address: string;
    user_agent: string;
    consent_method: "double_opt_in" | "checkbox" | "api" | "import";
    legal_basis: string; // GDPR legal basis

    created_at: string;
  };
}

// TABLE RELATIONSHIPS AND INDEXES FOR OPTIMAL PERFORMANCE
export const XanoIndexes = {
  customers: [
    "email (unique)",
    "phone (unique)",
    "status",
    "engagement_score",
    "created_at",
    "segment_ids (JSON index)",
  ],
  campaigns: [
    "status",
    "type",
    "created_at",
    "launched_at",
    "audience_segments (JSON index)",
  ],
  conversations: [
    "customer_id",
    "campaign_id",
    "channel",
    "direction",
    "created_at",
    "ai_intent",
  ],
  ai_responses: [
    "trigger_type",
    "trigger_value",
    "is_active",
    "priority",
    "usage_count",
  ],
  campaign_analytics: ["campaign_id", "date", "created_at"],
};

// API ENDPOINTS NEEDED FOR MARKETING SYSTEM
export const RequiredXanoEndpoints = [
  // Customer management
  "GET /customers",
  "POST /customers",
  "PATCH /customers/{id}",
  "DELETE /customers/{id}",
  "GET /customers/{id}/conversations",
  "GET /customers/{id}/analytics",

  // Campaign management
  "GET /campaigns",
  "POST /campaigns",
  "PATCH /campaigns/{id}",
  "DELETE /campaigns/{id}",
  "POST /campaigns/{id}/launch",
  "POST /campaigns/{id}/pause",
  "GET /campaigns/{id}/analytics",

  // AI responses
  "GET /ai-responses",
  "POST /ai-responses",
  "PATCH /ai-responses/{id}",
  "POST /ai-responses/trigger",
  "GET /ai-responses/performance",

  // Conversations
  "GET /conversations",
  "POST /conversations",
  "GET /conversations/search",
  "POST /conversations/{id}/ai-response",

  // Analytics
  "GET /analytics/dashboard",
  "GET /analytics/campaigns",
  "GET /analytics/customers",
  "GET /analytics/ai-performance",

  // Webhooks
  "POST /webhooks/twilio/status",
  "POST /webhooks/twilio/incoming",
  "POST /webhooks/twilio/delivery",

  // Automation
  "GET /automation-flows",
  "POST /automation-flows",
  "POST /automation-flows/{id}/trigger",
];

// XANO FUNCTIONS NEEDED
export const RequiredXanoFunctions = [
  "calculateEngagementScore(customer_id)",
  "updateCustomerMetrics(customer_id)",
  "processAIResponse(conversation_id, trigger)",
  "segmentCustomers(criteria)",
  "campaignPerformanceReport(campaign_id)",
  "predictChurnRisk(customer_id)",
  "generateAIPersonality(customer_id)",
  "processWebhook(webhook_data)",
  "triggerAutomationFlow(customer_id, trigger_type)",
  "bulkImportContacts(file_data)",
];

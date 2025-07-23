# Complete Xano Database Schema for RecurFlow Enterprise

## **CORE BUSINESS TABLES**

### 1. **members** (Primary customer table)
```sql
id (integer, auto-increment, primary key)
uuid (text, unique, indexed) 
email (text, unique, indexed)
phone (text, unique, indexed)
first_name (text)
last_name (text)
status (enum: active, inactive, suspended, cancelled)
membership_type (enum: basic, premium, enterprise, lifetime)
created_at (timestamp)
updated_at (timestamp)
last_login (timestamp)
profile_picture_url (text)
timezone (text)
language (text, default: "en")

# Financial data
lifetime_value (decimal(10,2))
total_spent (decimal(10,2))
subscription_start_date (timestamp)
subscription_end_date (timestamp)
billing_cycle (enum: monthly, yearly, lifetime)

# Engagement metrics
login_count (integer, default: 0)
last_activity (timestamp)
engagement_score (integer, default: 50) # 0-100

# Communication preferences
email_notifications (boolean, default: true)
sms_notifications (boolean, default: true)
marketing_emails (boolean, default: true)
```

### 2. **member_benefits** (Benefits catalog)
```sql
id (integer, auto-increment, primary key)
uuid (text, unique, indexed)
title (text, required)
description (text)
benefit_type (enum: discount, access, service, product, support)
benefit_category (enum: billing, shipping, support, exclusive, partner)
value_description (text) # "10% off", "Free shipping", "Priority support"
conditions (text) # Requirements to access this benefit
is_active (boolean, default: true)
membership_levels (json) # ["basic", "premium", "enterprise"] - who can access
sort_order (integer, default: 0)
icon_name (text) # For UI icons
color_theme (text) # For UI styling
created_at (timestamp)
updated_at (timestamp)
expires_at (timestamp, nullable) # For time-limited benefits
usage_limit (integer, nullable) # Max uses per member
```

### 3. **member_benefit_usage** (Track benefit usage)
```sql
id (integer, auto-increment, primary key)
member_id (integer, foreign key: members.id)
benefit_id (integer, foreign key: member_benefits.id)
used_at (timestamp)
usage_details (json) # Store specific usage data
discount_amount (decimal(8,2), nullable)
order_id (text, nullable) # If related to an order
status (enum: active, used, expired)
created_at (timestamp)
```

### 4. **subscriptions** (Member subscription details)
```sql
id (integer, auto-increment, primary key)
member_id (integer, foreign key: members.id)
plan_name (text)
plan_id (text)
status (enum: active, paused, cancelled, past_due, unpaid)
amount (decimal(10,2))
currency (text, default: "USD")
billing_cycle (enum: monthly, yearly, lifetime)
next_billing_date (timestamp)
trial_end_date (timestamp, nullable)
started_at (timestamp)
cancelled_at (timestamp, nullable)
pause_reason (text, nullable)
payment_method_id (text)
```

### 5. **orders** (Purchase history)
```sql
id (integer, auto-increment, primary key)
member_id (integer, foreign key: members.id)
order_number (text, unique, indexed)
status (enum: pending, processing, shipped, delivered, cancelled, refunded)
total_amount (decimal(10,2))
tax_amount (decimal(8,2))
shipping_amount (decimal(8,2))
discount_amount (decimal(8,2))
currency (text, default: "USD")
payment_status (enum: pending, paid, failed, refunded)
payment_method (text)
shipping_address (json)
billing_address (json)
created_at (timestamp)
updated_at (timestamp)
shipped_at (timestamp, nullable)
delivered_at (timestamp, nullable)
```

### 6. **communications** (SMS/Email history)
```sql
id (integer, auto-increment, primary key)
member_id (integer, foreign key: members.id, nullable)
channel (enum: sms, email, voice, push)
direction (enum: inbound, outbound)
from_number (text, nullable)
to_number (text, nullable)
subject (text, nullable) # For emails
content (text)
status (enum: queued, sent, delivered, failed, bounced)
provider (enum: twilio, sendgrid, other)
provider_id (text) # Twilio SID, etc.
provider_status (text)
error_message (text, nullable)
cost (decimal(6,4), nullable)
sent_at (timestamp)
delivered_at (timestamp, nullable)
read_at (timestamp, nullable)
replied_at (timestamp, nullable)
created_at (timestamp)

# AI features
ai_generated (boolean, default: false)
ai_sentiment (enum: positive, neutral, negative, nullable)
ai_intent (text, nullable) # support, sales, complaint, etc.
ai_confidence (decimal(3,2), nullable) # 0.00-1.00
```

### 7. **support_tickets** (Customer support)
```sql
id (integer, auto-increment, primary key)
member_id (integer, foreign key: members.id)
ticket_number (text, unique)
subject (text)
description (text)
priority (enum: low, medium, high, urgent)
status (enum: open, in_progress, waiting_customer, resolved, closed)
category (enum: billing, technical, account, general)
assigned_to (text, nullable) # Staff member
resolution (text, nullable)
satisfaction_rating (integer, nullable) # 1-5
created_at (timestamp)
updated_at (timestamp)
resolved_at (timestamp, nullable)
```

### 8. **api_logs** (API usage tracking)
```sql
id (integer, auto-increment, primary key)
endpoint (text)
method (enum: GET, POST, PUT, DELETE, PATCH)
status_code (integer)
response_time (integer) # milliseconds
ip_address (text)
user_agent (text)
member_id (integer, foreign key: members.id, nullable)
request_body (json, nullable)
response_body (json, nullable)
error_message (text, nullable)
created_at (timestamp)
```

## **MARKETING & AUTOMATION TABLES**

### 9. **campaigns** (Marketing campaigns)
```sql
id (integer, auto-increment, primary key)
uuid (text, unique)
name (text)
description (text)
type (enum: sms, email, voice, multi_channel)
status (enum: draft, scheduled, active, paused, completed, cancelled)
target_audience (json) # Filtering criteria
estimated_reach (integer)
actual_reach (integer)
content_template (text)
send_time (timestamp, nullable)
created_by (text)
created_at (timestamp)
launched_at (timestamp, nullable)
completed_at (timestamp, nullable)

# Performance metrics
sent_count (integer, default: 0)
delivered_count (integer, default: 0)
opened_count (integer, default: 0)
clicked_count (integer, default: 0)
conversion_count (integer, default: 0)
revenue_generated (decimal(10,2), default: 0)
```

### 10. **automation_rules** (Workflow automation)
```sql
id (integer, auto-increment, primary key)
name (text)
description (text)
trigger_type (enum: signup, purchase, anniversary, inactivity, support_ticket)
trigger_conditions (json)
actions (json) # Array of actions to take
is_active (boolean, default: true)
priority (integer, default: 1)
created_at (timestamp)
last_triggered (timestamp, nullable)
execution_count (integer, default: 0)
```

## **PAYMENT & BILLING TABLES**

### 11. **payment_methods** (Stored payment info)
```sql
id (integer, auto-increment, primary key)
member_id (integer, foreign key: members.id)
type (enum: credit_card, debit_card, bank_account, paypal, crypto)
provider (enum: stripe, square, paypal, nmi)
provider_id (text) # External payment method ID
last_four (text)
brand (text) # visa, mastercard, etc.
exp_month (integer)
exp_year (integer)
is_default (boolean, default: false)
is_active (boolean, default: true)
created_at (timestamp)
updated_at (timestamp)
```

### 12. **transactions** (Payment transactions)
```sql
id (integer, auto-increment, primary key)
member_id (integer, foreign key: members.id)
order_id (integer, foreign key: orders.id, nullable)
subscription_id (integer, foreign key: subscriptions.id, nullable)
transaction_type (enum: charge, refund, chargeback, adjustment)
amount (decimal(10,2))
fee (decimal(8,2))
net_amount (decimal(10,2))
currency (text, default: "USD")
status (enum: pending, completed, failed, cancelled)
payment_method_id (integer, foreign key: payment_methods.id)
provider_transaction_id (text)
provider_response (json)
failure_reason (text, nullable)
processed_at (timestamp)
created_at (timestamp)
```

## **ANALYTICS & REPORTING TABLES**

### 13. **member_analytics** (Daily member metrics)
```sql
id (integer, auto-increment, primary key)
date (date, indexed)
total_members (integer)
new_members (integer)
cancelled_members (integer)
active_members (integer)
revenue (decimal(12,2))
mrr (decimal(12,2)) # Monthly Recurring Revenue
churn_rate (decimal(5,2))
ltv (decimal(8,2)) # Average Lifetime Value
engagement_score (decimal(5,2))
support_tickets (integer)
created_at (timestamp)
```

### 14. **system_health** (System monitoring)
```sql
id (integer, auto-increment, primary key)
service_name (text)
status (enum: healthy, warning, critical, down)
response_time (integer) # milliseconds
error_rate (decimal(5,2))
cpu_usage (decimal(5,2))
memory_usage (decimal(5,2))
disk_usage (decimal(5,2))
last_check (timestamp)
created_at (timestamp)
```

## **REQUIRED XANO API ENDPOINTS**

```
# Members
GET /api/members
GET /api/members/{id}
POST /api/members
PATCH /api/members/{id}
DELETE /api/members/{id}
GET /api/members/{id}/benefits
GET /api/members/{id}/usage-history

# Benefits
GET /api/benefits
GET /api/benefits/{id}
POST /api/benefits
PATCH /api/benefits/{id}
DELETE /api/benefits/{id}
POST /api/benefits/{id}/use # Track benefit usage

# Communications
GET /api/communications
POST /api/communications/sms
POST /api/communications/email
GET /api/communications/{id}
PATCH /api/communications/{id}/status

# Subscriptions
GET /api/subscriptions
GET /api/subscriptions/{id}
POST /api/subscriptions
PATCH /api/subscriptions/{id}
DELETE /api/subscriptions/{id}

# Orders
GET /api/orders
GET /api/orders/{id}
POST /api/orders
PATCH /api/orders/{id}

# Support
GET /api/support-tickets
GET /api/support-tickets/{id}
POST /api/support-tickets
PATCH /api/support-tickets/{id}

# Analytics
GET /api/analytics/dashboard
GET /api/analytics/members
GET /api/analytics/revenue
GET /api/analytics/engagement

# Webhooks (for external services)
POST /api/webhooks/twilio/status
POST /api/webhooks/twilio/incoming
POST /api/webhooks/stripe/payment
POST /api/webhooks/stripe/subscription
```

## **SAMPLE DATA FOR TESTING**

### member_benefits sample data:
```json
[
  {
    "title": "10% Subscription Discount",
    "description": "Get 10% off your monthly subscription renewal",
    "benefit_type": "discount",
    "benefit_category": "billing",
    "value_description": "10% off monthly billing",
    "membership_levels": ["premium", "enterprise"],
    "icon_name": "percent",
    "color_theme": "green"
  },
  {
    "title": "Priority Support",
    "description": "Get priority customer support with faster response times",
    "benefit_type": "service",
    "benefit_category": "support", 
    "value_description": "24/7 priority support access",
    "membership_levels": ["premium", "enterprise"],
    "icon_name": "headphones",
    "color_theme": "blue"
  },
  {
    "title": "Free Shipping",
    "description": "Free shipping on all orders over $25",
    "benefit_type": "service",
    "benefit_category": "shipping",
    "value_description": "Free shipping (orders $25+)",
    "membership_levels": ["basic", "premium", "enterprise"],
    "icon_name": "truck",
    "color_theme": "purple"
  }
]
```

**Next: I need your Xano instance URL and API key to implement the real connections. What are your credentials?**

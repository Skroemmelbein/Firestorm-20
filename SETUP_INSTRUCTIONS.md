# 🚀 Supabase + Twilio Integration Setup (Vercel)

This guide sets up real connections to your Supabase Postgres database and Twilio account, deployed on Vercel.

## 📋 Prerequisites

1. **Supabase Project**: Postgres + Service Role key
2. **Twilio Account**: With phone number and credits
3. **Environment Variables**: Real credentials (no test/mock data)

## 🔧 Step 1: Environment Variables

Create `.env` file in project root:

```bash
# Supabase (Server)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Supabase (Client/UI)
SUPABASE_ANON_KEY=your_anon_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_real_auth_token_here
TWILIO_PHONE_NUMBER=+18558600037

# Application
NODE_ENV=development
PORT=8080
```

## 🗃️ Step 2: Create Supabase Tables

In your Supabase project (SQL Editor), create these tables with the exact fields:

### **members** table:

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
lifetime_value (decimal(10,2))
total_spent (decimal(10,2))
subscription_start_date (timestamp)
subscription_end_date (timestamp)
billing_cycle (enum: monthly, yearly, lifetime)
login_count (integer, default: 0)
last_activity (timestamp)
engagement_score (integer, default: 50)
email_notifications (boolean, default: true)
sms_notifications (boolean, default: true)
marketing_emails (boolean, default: true)
```

### **member_benefits** table:

```sql
id (integer, auto-increment, primary key)
uuid (text, unique, indexed)
title (text, required)
description (text)
benefit_type (enum: discount, access, service, product, support)
benefit_category (enum: billing, shipping, support, exclusive, partner)
value_description (text)
conditions (text)
is_active (boolean, default: true)
membership_levels (json)
sort_order (integer, default: 0)
icon_name (text)
color_theme (text)
created_at (timestamp)
updated_at (timestamp)
expires_at (timestamp, nullable)
usage_limit (integer, nullable)
```

### **member_benefit_usage** table:

```sql
id (integer, auto-increment, primary key)
member_id (integer, foreign key: members.id)
benefit_id (integer, foreign key: member_benefits.id)
used_at (timestamp)
usage_details (json)
discount_amount (decimal(8,2), nullable)
order_id (text, nullable)
status (enum: active, used, expired)
created_at (timestamp)
```

### **communications** table:

```sql
id (integer, auto-increment, primary key)
member_id (integer, foreign key: members.id, nullable)
channel (enum: sms, email, voice, push)
direction (enum: inbound, outbound)
from_number (text, nullable)
to_number (text, nullable)
subject (text, nullable)
content (text)
status (enum: queued, sent, delivered, failed, bounced)
provider (enum: twilio, sendgrid, other)
provider_id (text)
provider_status (text)
error_message (text, nullable)
cost (decimal(6,4), nullable)
sent_at (timestamp)
delivered_at (timestamp, nullable)
read_at (timestamp, nullable)
replied_at (timestamp, nullable)
created_at (timestamp)
ai_generated (boolean, default: false)
ai_sentiment (enum: positive, neutral, negative, nullable)
ai_intent (text, nullable)
ai_confidence (decimal(3,2), nullable)
```

## 🔌 Step 3: Server Endpoints (Express)

Expose these server endpoints (already in code under `server/routes`) and ensure they log to Supabase using the server-side Supabase client:

### **GET** `/members`

- Returns paginated list of members
- Query params: `page`, `per_page`, `search`, `status`, `membership_type`

### **GET** `/members/{id}`

- Returns single member by ID

### **POST** `/members`

- Creates new member
- Body: member data object

### **PATCH** `/members/{id}`

- Updates member
- Body: partial member data

### **GET** `/member_benefits`

- Returns list of benefits
- Query params: `membership_level`, `is_active`

### **GET** `/members/{id}/benefits`

- Returns benefits available to specific member

### **POST** `/member_benefits`

- Creates new benefit

### **POST** `/communications`

- Logs communication record

### **GET** `/analytics/dashboard`

- Returns dashboard stats

### **GET** `/health`

- Health check endpoint

## 📱 Step 4: Twilio Webhook Configuration

In your Twilio Console:

1. **Go to Phone Numbers** → Select your number
2. **Set Webhook URL** for incoming messages:

   ```
   https://yourdomain.com/api/real/webhooks/twilio/incoming
   ```

3. **Set Status Webhook URL**:

   ```
   https://yourdomain.com/api/real/webhooks/twilio/status
   ```

4. **HTTP Method**: POST
5. **Save Configuration**

## 🧪 Step 5: Test Everything

1. **Start the server**:

   ```bash
   npm run dev
   ```

2. **Check console for**:

   ```
   ✅ Supabase client initialized (server)
   ✅ Twilio client initialized
   ```

3. **Test Supabase connection**: insert a row via `/api/real/sms/send` then verify in `communications` table.

4. **Test Twilio connection**:

   ```bash
   curl -X POST http://localhost:8080/api/real/test/twilio
   ```

5. **Send test SMS**:
   ```bash
   curl -X POST http://localhost:8080/api/real/sms/send \
     -H "Content-Type: application/json" \
     -d '{"to": "+18558600037", "body": "Hello from real integration!"}'
   ```

## 🎯 Step 6: Populate Sample Data

Add some test data to your Xano tables:

### Sample Members:

```json
[
  {
    "uuid": "mem_001",
    "email": "john@example.com",
    "phone": "+18558600037",
    "first_name": "John",
    "last_name": "Doe",
    "status": "active",
    "membership_type": "premium",
    "engagement_score": 85,
    "lifetime_value": 1200.0
  }
]
```

### Sample Benefits:

```json
[
  {
    "uuid": "ben_001",
    "title": "10% Subscription Discount",
    "description": "Get 10% off your monthly subscription renewal",
    "benefit_type": "discount",
    "benefit_category": "billing",
    "value_description": "10% off monthly billing",
    "membership_levels": ["premium", "enterprise"],
    "icon_name": "percent",
    "color_theme": "green",
    "is_active": true
  },
  {
    "uuid": "ben_002",
    "title": "Priority Support",
    "description": "Get priority customer support with faster response times",
    "benefit_type": "service",
    "benefit_category": "support",
    "value_description": "24/7 priority support access",
    "membership_levels": ["premium", "enterprise"],
    "icon_name": "headphones",
    "color_theme": "blue",
    "is_active": true
  }
]
```

## 🎉 Step 7: Access the Member Portal

1. **Navigate to**: `http://localhost:8080/members`
2. **You should see**:
   - Real member count from Supabase
   - Active benefits from your database
   - Member directory with actual data
   - Benefits cards with your configured benefits

## 🔍 Troubleshooting

### Xano Connection Issues:

- Verify instance URL format: `https://x8ki-letl-twmt.xano.io`
- Check API key has proper permissions
- Ensure database ID is correct

### Twilio Connection Issues:

- Verify Account SID starts with "AC"
- Check Auth Token is valid
- Ensure phone number format: `+18558600037`

### Webhook Issues:

- Use ngrok for local development: `ngrok http 8080`
- Update Twilio webhook URLs to ngrok URL
- Check webhook logs in Twilio console

## 🚀 Production Deployment (Vercel)

1. **Set environment variables** in Vercel Project Settings (Environment Variables)
2. **Update Twilio webhooks** to production URLs
3. **Configure CORS** for your domain
4. **Enable HTTPS** for webhook security

Deploy with:

```bash
npm run build && vercel --prod
```

**SUCCESS!** Your system now has Supabase + Twilio integrated and deploys on Vercel.

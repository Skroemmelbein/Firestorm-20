# 🗺️ SMS System Architecture Map

## 📱 **1. TWILIO MESSAGE API LOCATIONS**

### **Frontend API Endpoints:**

```
POST /api/real/sms/send          ← Send single SMS
POST /api/real/sms/bulk          ← Send bulk SMS
POST /api/real/test/twilio       ← Test Twilio connection
POST /api/real/voice/call        ← Make voice calls
```

### **Backend Files:**

```
📁 server/routes/real-api.ts     ← Main SMS API endpoints
📁 shared/twilio-client.ts       ← Twilio SDK wrapper
📁 shared/ai-customer-service.ts ← AI auto-responses
```

### **Key API Code:**

```javascript
// Send SMS endpoint
router.post("/sms/send", async (req, res) => {
  const twilio = getTwilioClientSafe();
  const { to, body, from, mediaUrl } = req.body;

  const result = await twilio.sendSMS({
    to,
    body,
    from,
    mediaUrl,
  });

  res.json(result);
});
```

### **Your Working Credentials:**

```
Account SID: ACf1f39d9f653df3669fa99343e88b2074
Phone Number: +1 (855) 860-0037
Auth Token: [Stored in environment]
```

---

## 🗃️ **2. SUPABASE COMMUNICATIONS TABLE**

### **Table Name:** `communications`

### **Required Fields:**

```sql
create table if not exists communications (
  id bigint generated always as identity primary key,
  member_id bigint,
  channel text check (channel in ('sms','email','voice','push')),
  direction text check (direction in ('inbound','outbound')),
  from_number text,
  to_number text,
  subject text,
  content text not null,
  status text check (status in ('queued','sent','delivered','failed','bounced')),
  provider text,
  provider_id text,
  provider_status text,
  error_message text,
  cost numeric(10,4),
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  replied_at timestamptz,
  created_at timestamptz default now(),
  ai_generated boolean default false,
  ai_sentiment text check (ai_sentiment in ('positive','neutral','negative')),
  ai_intent text,
  ai_confidence numeric(3,2)
);
create index if not exists idx_comm_provider_id on communications(provider_id);
create index if not exists idx_comm_member_id on communications(member_id);
```

### **Sample Data:**

```json
{
  "id": 1,
  "member_id": 123,
  "channel": "sms",
  "direction": "outbound",
  "from_number": "+18558600037",
  "to_number": "+18558600037",
  "content": "Test SMS from RecurFlow!",
  "status": "delivered",
  "provider": "twilio",
  "provider_id": "SM1234567890abcdef",
  "sent_at": "2024-01-15T10:30:00Z",
  "delivered_at": "2024-01-15T10:30:05Z",
  "ai_generated": false,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### **Create in Supabase:**

1. **Open** Supabase → SQL Editor
2. **Run** the SQL above to create the table and indexes
3. (Optional) Add RLS policies; server uses Service Role key

---

## ⚡ **3. SMS TRIGGERS & WEBHOOKS**

### **Outbound SMS Triggers:**

```
1. Manual Send      → User clicks "Send SMS" button
2. API Call         → POST to /api/real/sms/send
3. Auto-Response    → AI responds to incoming message
4. Marketing        → Bulk campaign sends
5. System Alert     → Error notifications, etc.
```

### **Inbound SMS Triggers (Webhooks):**

```
📱 Customer sends SMS
    ↓
🔗 Twilio webhook: POST /api/real/webhooks/twilio/incoming
    ↓
🤖 AI analyzes message (sentiment, intent)
    ↓
📝 Logs to communications table
    ↓
🎯 Triggers auto-response if needed
    ↓
📨 Sends reply SMS (if auto-response enabled)
```

### **Webhook Setup in Twilio:**

```
1. Login to Twilio Console
2. Go to Phone Numbers → Manage → Active Numbers
3. Click your number: +1 (855) 860-0037
4. Set Webhook URL:
   https://yourdomain.com/api/real/webhooks/twilio/incoming
5. HTTP Method: POST
6. Save configuration
```

### **Webhook Handlers:**

```javascript
// Incoming SMS webhook
router.post("/webhooks/twilio/incoming", async (req, res) => {
  const twilio = getTwilioClientSafe();
  await twilio.handleIncomingSMS(req.body);
  res.status(200).send("OK");
});

// Message status webhook
router.post("/webhooks/twilio/status", async (req, res) => {
  const twilio = getTwilioClientSafe();
  await twilio.handleStatusWebhook(req.body);
  res.status(200).send("OK");
});
```

---

## 🔄 **4. COMPLETE MESSAGE FLOW**

### **Sending SMS:**

```
Frontend Component
    ↓ POST /api/real/sms/send
Backend API Route
    ↓ twilioClient.sendSMS()
Twilio Client
    ↓ fetch('https://api.twilio.com/2010-04-01/Accounts/...')
Twilio API
    ↓ SMS delivered to phone
Phone receives message
    ↓ Status webhook
Backend logs status
    ↓ Updates communications table
Supabase (Postgres)
```

### **Receiving SMS:**

```
Phone sends SMS
    ↓ Webhook to your server
POST /webhooks/twilio/incoming
    ↓ AI Customer Service
Analyzes sentiment + intent
    ↓ Logs to communications table
Supabase (Postgres)
    ↓ Generate auto-response?
AI generates reply
    ↓ Send via Twilio
Reply SMS delivered
```

---

## 🎯 **5. CURRENT STATUS**

### **✅ Working:**

- Twilio SMS sending API
- Environment credentials
- Frontend test interfaces
- AI auto-response system
- Webhook handlers (code ready)

### **⚠️ Needs Setup:**

- Supabase communications table creation
- Twilio webhook URLs configuration
- Production environment variables

### **🔧 Next Steps:**

1. **Create `communications` table in your Supabase project**
2. **Set up webhook URLs in Twilio console**
3. **Test end-to-end message flow**
4. **Configure production environment**

**Your SMS API is at `/api/real/sms/send` and ready to use! The Xano table schema is defined above - just create it in your workspace.**

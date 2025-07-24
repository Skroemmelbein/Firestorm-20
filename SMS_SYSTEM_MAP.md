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
Account SID: ACf19a39d865d43659b94a3a2074
Phone Number: +1 (855) 800-0037
Auth Token: [Stored in environment]
```

---

## 🗃️ **2. XANO COMMUNICATIONS TABLE**

### **Table Name:** `communications`

### **Required Fields:**

```sql
CREATE TABLE communications (
  id                INTEGER PRIMARY KEY AUTO_INCREMENT,
  member_id         INTEGER NULL,                    -- FK to members table
  channel           ENUM('sms','email','voice','push'),
  direction         ENUM('inbound','outbound'),
  from_number       TEXT NULL,
  to_number         TEXT NULL,
  subject           TEXT NULL,                       -- For emails
  content           TEXT NOT NULL,
  status            ENUM('queued','sent','delivered','failed','bounced'),
  provider          ENUM('twilio','sendgrid','other'),
  provider_id       TEXT NULL,                       -- Twilio SID
  provider_status   TEXT NULL,
  error_message     TEXT NULL,
  cost              DECIMAL(6,4) NULL,
  sent_at           TIMESTAMP NULL,
  delivered_at      TIMESTAMP NULL,
  read_at           TIMESTAMP NULL,
  replied_at        TIMESTAMP NULL,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- AI Features
  ai_generated      BOOLEAN DEFAULT FALSE,
  ai_sentiment      ENUM('positive','neutral','negative') NULL,
  ai_intent         TEXT NULL,                       -- support, sales, complaint
  ai_confidence     DECIMAL(3,2) NULL,              -- 0.00-1.00

  -- Indexes
  INDEX idx_member_id (member_id),
  INDEX idx_channel (channel),
  INDEX idx_direction (direction),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_provider_id (provider_id)
);
```

### **Sample Data:**

```json
{
  "id": 1,
  "member_id": 123,
  "channel": "sms",
  "direction": "outbound",
  "from_number": "+18558000037",
  "to_number": "+18144409968",
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

### **Create in Xano:**

1. **Login** to your Xano workspace
2. **Go to Database** section
3. **Add Table** → Name it `communications`
4. **Add each field** with the exact types above
5. **Set up indexes** for performance

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
3. Click your number: +1 (855) 800-0037
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
Xano Database
```

### **Receiving SMS:**

```
Phone sends SMS
    ↓ Webhook to your server
POST /webhooks/twilio/incoming
    ↓ AI Customer Service
Analyzes sentiment + intent
    ↓ Logs to communications table
Xano Database
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

- Xano communications table creation
- Twilio webhook URLs configuration
- Production environment variables

### **🔧 Next Steps:**

1. **Create `communications` table in your Xano workspace**
2. **Set up webhook URLs in Twilio console**
3. **Test end-to-end message flow**
4. **Configure production environment**

**Your SMS API is at `/api/real/sms/send` and ready to use! The Xano table schema is defined above - just create it in your workspace.**

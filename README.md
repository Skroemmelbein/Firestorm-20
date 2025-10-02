# ECHELONX Multi-Channel Messaging & Payment System

A comprehensive full-stack application integrating multiple messaging channels (SMS, MMS, RCS, Email, WhatsApp) with payment processing capabilities through NMI gateway and Xano database management.

## 🚀 Features

### Message War Machine (Phases 1-5)
- **Phase 1 - Ignition**: SMS/MMS/RCS + Email + unified webhook system
- **Phase 2 - Asset Reactor**: Auto-generated images/GIFs (Unsplash/Pexels/Cloudinary)
- **Phase 3 - Polyglot Polish**: Multi-language support (DeepL translation + LanguageTool)
- **Phase 4 - Template Command**: Unified templates (Twilio Content API)
- **Phase 5 - Redundancy & Intel**: Failover messaging + analytics + Slack alerts

### Payment Integration
- NMI Payment Gateway with customer vault management
- Subscription billing and recurring payments
- Comprehensive transaction logging to Xano

### Communication Channels
- **Twilio**: SMS, MMS, RCS, Voice, WhatsApp
- **SendGrid**: Transactional emails with templates
- **Fallback Services**: Sinch, Vonage for redundancy

## 🛠 Technology Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: Supabase (Postgres with Auth & RLS)
- **Payment**: NMI Gateway
- **Messaging**: Twilio, SendGrid
- **AI**: OpenAI GPT-4o integration
- **Containerization**: Docker + Docker Compose

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Skroemmelbein/Firestorm-20.git
   cd Firestorm-20
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API credentials
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:5001
   - API: http://localhost:5001/api

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start development servers**
   ```bash
   # Frontend (port 8080)
   npm run dev

   # API Server (port 5001)
   cd server && npm start
   ```

## 🔧 Configuration

### Required Environment Variables

```env
# Supabase (Server)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Supabase (Client/UI)
SUPABASE_ANON_KEY=your_anon_key

# Twilio Messaging
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# SendGrid Email
SENDGRID_API_KEY=SG.your_sendgrid_api_key

# NMI Payment Gateway
NMI_USERNAME=your_nmi_username
NMI_PASSWORD=your_nmi_password

# OpenAI
OPENAI_API_KEY=sk-proj-your_openai_key
```

## 📡 API Endpoints

### Testing Endpoints
- `POST /api/real/test/sms-mms-rcs` - Test SMS/MMS/RCS messaging
- `POST /api/real/test/email` - Test SendGrid email
- `POST /api/real/test/nmi/one-time-payment` - Test $1 NMI charge

### Core Functionality
- `POST /api/messaging/send` - Send multi-channel messages
- `POST /api/payments/process` - Process payments via NMI
- `POST /api/webhooks/events` - Unified webhook handler

## 🏗 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌───────────────────────┐
│   React Client  │────│  Express API    │────│       Supabase         │
│   (Port 8080)   │    │  (Port 5001)    │    │  Postgres + Auth/RLS  │
└─────────────────┘    └─────────────────┘    └───────────────────────┘
                              │
                    ┌─────────┼─────────┐
                    │         │         │
            ┌───────▼───┐ ┌───▼───┐ ┌───▼───┐
            │  Twilio   │ │SendGrid│ │  NMI  │
            │Messaging  │ │ Email  │ │Payment│
            └───────────┘ └────────┘ └───────┘
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Manual Testing
1. Start the development server
2. Navigate to the Test Module in the UI
3. Use the provided test endpoints with sample data

## 🚢 Deployment

### Docker Production
```bash
docker-compose --profile production up -d
```

### Environment Setup
- Ensure all API credentials are properly configured
- Set `NODE_ENV=production` for production deployments
- Deployment target: Vercel (this project is Vercel-first; Cloudflare/Netlify are not used)

## 📊 Monitoring

- Health check endpoint: `/api/health`
- Slack alerts for bounce rates > 3%
- QuickChart integration for analytics graphs
- Comprehensive logging to Supabase (Postgres)

## 🔐 Security

- Webhook signature verification
- API key validation
- Environment variable protection
- Docker container isolation

## 📝 License

This project is proprietary software developed for ECHELONX.

## 🤝 Contributing

This is a private repository. Contact the development team for contribution guidelines.

---

**Link to Devin run**: https://app.devin.ai/sessions/2ef3bfe254cf45559d417527562daf05  
**Requested by**: Shannon Kroemmelbein (@Skroemmelbein)

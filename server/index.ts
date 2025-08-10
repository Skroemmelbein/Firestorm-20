import express from 'express';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(process.cwd(), '.env') });

export async function createServer() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Automatically load all route files in server/routes/
  const routes = {
    './routes/api-integrations.ts': await import('./routes/api-integrations.js'),
    './routes/billing-analytics.ts': await import('./routes/billing-analytics.js'),
    './routes/billing-payments.ts': await import('./routes/billing-payments.js'),
    './routes/billing-retry-logic.ts': await import('./routes/billing-retry-logic.js'),
    './routes/billing-tokenization.ts': await import('./routes/billing-tokenization.js'),
    './routes/billing-xano-models.ts': await import('./routes/billing-xano-models.js'),
    './routes/consent-tos-import.ts': await import('./routes/consent-tos-import.js'),
    './routes/consent-tos-xano-tables.ts': await import('./routes/consent-tos-xano-tables.js'),
    './routes/conversations-api.ts': await import('./routes/conversations-api.js'),
    './routes/customer-master-import.ts': await import('./routes/customer-master-import.js'),
    './routes/customer-master-xano-tables.ts': await import('./routes/customer-master-xano-tables.js'),
    './routes/demo.ts': await import('./routes/demo.js'),
    './routes/descriptor-history-import.ts': await import('./routes/descriptor-history-import.js'),
    './routes/environment-scanner.ts': await import('./routes/environment-scanner.js'),
    './routes/integrations-config.ts': await import('./routes/integrations-config.js'),
    './routes/nmi-enhanced.ts': await import('./routes/nmi-enhanced.js'),
    './routes/nmi-integration.ts': await import('./routes/nmi-integration.js'),
    './routes/nmi-legacy-integration.ts': await import('./routes/nmi-legacy-integration.js'),
    './routes/nmi-status-check.ts': await import('./routes/nmi-status-check.js'),
    './routes/nmi-test-payment.ts': await import('./routes/nmi-test-payment.js'),
    './routes/nmi-transaction-logs.ts': await import('./routes/nmi-transaction-logs.js'),
    './routes/phases-3-5-integration.ts': await import('./routes/phases-3-5-integration.js'),
    './routes/progress-notifier.ts': await import('./routes/progress-notifier.js'),
    './routes/quick-setup.ts': await import('./routes/quick-setup.js'),
    './routes/rcs-api.ts': await import('./routes/rcs-api.js'),
    './routes/real-api.ts': await import('./routes/real-api.js'),
    './routes/sms-api.ts': await import('./routes/sms-api.js'),
    './routes/status-classification.ts': await import('./routes/status-classification.js'),
        './routes/studio-flows.ts': await import('./routes/studio-flows.js'),
    './routes/sendgrid-api.ts': await import('./routes/sendgrid-api.js'),
    './routes/email-webhooks.ts': await import('./routes/email-webhooks.js'),
    './routes/segment-audience.ts': await import('./routes/segment-audience.js'),
    './routes/voice-bot.ts': await import('./routes/voice-bot.js'),
     './routes/subscription-management.ts': await import('./routes/subscription-management.js'),
     './routes/test-sendgrid.ts': await import('./routes/test-sendgrid.js'),
    './routes/test-sms.ts': await import('./routes/test-sms.js'),
    './routes/test-twilio.ts': await import('./routes/test-twilio.js'),
    './routes/test-xano.ts': await import('./routes/test-xano.js'),
    './routes/transaction-log-migration.ts': await import('./routes/transaction-log-migration.js'),
    './routes/twilio-sid-discovery.ts': await import('./routes/twilio-sid-discovery.js'),
    './routes/twilio-vault.ts': await import('./routes/twilio-vault.js'),
    './routes/updated-cards-handler.ts': await import('./routes/updated-cards-handler.js'),
    './routes/vault-export-processing.ts': await import('./routes/vault-export-processing.js'),
    './routes/war-chest-import.ts': await import('./routes/war-chest-import.js'),
    './routes/xano-setup.ts': await import('./routes/xano-setup.js'),
    './routes/xano-subscription-tables.ts': await import('./routes/xano-subscription-tables.js'),
    './routes/xano-table-setup.ts': await import('./routes/xano-table-setup.js'),
    './routes/auto-notify.ts': await import('./routes/auto-notify.js'),
    './routes/campaign-scheduler.ts': await import('./routes/campaign-scheduler.js')
  };

  for (const [routePath, routeModule] of Object.entries(routes)) {
    const route = (routeModule as any).default;
    if (route) {
      console.log(`Loaded route: ${routePath}`);
      if (routePath.includes('conversations-api')) {
        app.use('/api', route);
      } else if (routePath.includes('sms-api')) {
        console.log(`⚠️ Skipping duplicate SMS route: ${routePath} to avoid 405 conflicts`);
      } else if (routePath.includes('api-integrations')) {
        console.log(`⚠️ Mounting api-integrations under /api to avoid SMS conflicts`);
        app.use('/api', route);
      } else if (routePath.includes('campaign-scheduler')) {
        console.log(`📅 Mounting campaign-scheduler under /api/campaign-scheduler`);
        app.use('/api/campaign-scheduler', route);
            } else {
        app.use('/api/real', route);
      }
    }
  }

  return app;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await createServer();
    app(req, res);
  } catch (error) {
    console.error('Serverless handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const app = await createServer();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })();
}

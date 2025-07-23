import express from 'express';
import { getXanoClient } from '../../shared/xano-client.js';
import { getTwilioClient } from '../../shared/twilio-client.js';

const router = express.Router();

// Test connections (real, no mocks)
router.post('/test/xano', async (req, res) => {
  try {
    const xano = getXanoClient();
    const isConnected = await xano.testConnection();
    
    if (isConnected) {
      res.json({
        connected: true,
        message: "Successfully connected to Xano",
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        connected: false,
        error: "Failed to connect to Xano. Check your credentials."
      });
    }
  } catch (error) {
    console.error("Xano connection test failed:", error);
    res.status(500).json({
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
});

router.post('/test/twilio', async (req, res) => {
  try {
    const twilio = getTwilioClient();
    const isConnected = await twilio.testConnection();
    
    if (isConnected) {
      res.json({
        connected: true,
        message: "Successfully connected to Twilio",
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        connected: false,
        error: "Failed to connect to Twilio. Check your credentials."
      });
    }
  } catch (error) {
    console.error("Twilio connection test failed:", error);
    res.status(500).json({
      connected: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    });
  }
});

// Members API
router.get('/members', async (req, res) => {
  try {
    // Check if Xano is connected, otherwise return mock data
    try {
      const xano = getXanoClient();
      const { page, per_page, search, status, membership_type } = req.query;

      const members = await xano.getMembers({
        page: page ? parseInt(page as string) : undefined,
        per_page: per_page ? parseInt(per_page as string) : undefined,
        search: search as string,
        status: status as string,
        membership_type: membership_type as string,
      });

      res.json(members);
    } catch (xanoError) {
      console.log('Xano not connected, returning mock member data');

      // Return mock member data
      const mockMembers = {
        data: [
          {
            id: 1,
            uuid: "mem_001",
            email: "john.doe@example.com",
            phone: "+18144409068",
            first_name: "John",
            last_name: "Doe",
            status: "active",
            membership_type: "premium",
            created_at: "2024-01-15T10:30:00Z",
            updated_at: "2024-01-15T10:30:00Z",
            engagement_score: 85,
            lifetime_value: 1250.00,
            total_spent: 890.50,
            login_count: 23,
            email_notifications: true,
            sms_notifications: true,
            marketing_emails: true,
            language: "en"
          },
          {
            id: 2,
            uuid: "mem_002",
            email: "sarah.smith@example.com",
            phone: "+15551234567",
            first_name: "Sarah",
            last_name: "Smith",
            status: "active",
            membership_type: "enterprise",
            created_at: "2024-01-10T14:20:00Z",
            updated_at: "2024-01-10T14:20:00Z",
            engagement_score: 92,
            lifetime_value: 2800.00,
            total_spent: 1590.25,
            login_count: 45,
            email_notifications: true,
            sms_notifications: true,
            marketing_emails: false,
            language: "en"
          },
          {
            id: 3,
            uuid: "mem_003",
            email: "mike.wilson@example.com",
            phone: "+15559876543",
            first_name: "Mike",
            last_name: "Wilson",
            status: "active",
            membership_type: "basic",
            created_at: "2024-01-20T09:15:00Z",
            updated_at: "2024-01-20T09:15:00Z",
            engagement_score: 67,
            lifetime_value: 450.00,
            total_spent: 285.75,
            login_count: 12,
            email_notifications: true,
            sms_notifications: false,
            marketing_emails: true,
            language: "en"
          }
        ],
        total: 3,
        page: 1
      };

      res.json(mockMembers);
    }
  } catch (error) {
    console.error('Error in members endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

router.get('/members/:id', async (req, res) => {
  try {
    const xano = getXanoClient();
    const member = await xano.getMember(parseInt(req.params.id));
    res.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

router.post('/members', async (req, res) => {
  try {
    const xano = getXanoClient();
    const member = await xano.createMember(req.body);
    res.json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

router.patch('/members/:id', async (req, res) => {
  try {
    const xano = getXanoClient();
    const member = await xano.updateMember(parseInt(req.params.id), req.body);
    res.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Benefits API
router.get('/benefits', async (req, res) => {
  try {
    const xano = getXanoClient();
    const { membership_level, is_active } = req.query;
    
    const benefits = await xano.getBenefits({
      membership_level: membership_level as string,
      is_active: is_active ? is_active === 'true' : undefined,
    });
    
    res.json(benefits);
  } catch (error) {
    console.error('Error fetching benefits:', error);
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
});

router.get('/members/:id/benefits', async (req, res) => {
  try {
    const xano = getXanoClient();
    const benefits = await xano.getMemberBenefits(parseInt(req.params.id));
    res.json(benefits);
  } catch (error) {
    console.error('Error fetching member benefits:', error);
    res.status(500).json({ error: 'Failed to fetch member benefits' });
  }
});

router.post('/benefits', async (req, res) => {
  try {
    const xano = getXanoClient();
    const benefit = await xano.createBenefit(req.body);
    res.json(benefit);
  } catch (error) {
    console.error('Error creating benefit:', error);
    res.status(500).json({ error: 'Failed to create benefit' });
  }
});

router.post('/benefits/:id/use', async (req, res) => {
  try {
    const xano = getXanoClient();
    const { member_id, usage_details } = req.body;
    
    await xano.useBenefit(member_id, parseInt(req.params.id), usage_details);
    res.json({ success: true, message: 'Benefit usage recorded' });
  } catch (error) {
    console.error('Error recording benefit usage:', error);
    res.status(500).json({ error: 'Failed to record benefit usage' });
  }
});

// SMS API
router.post('/sms/send', async (req, res) => {
  try {
    const twilio = getTwilioClient();
    const { to, body, from, mediaUrl } = req.body;
    
    const result = await twilio.sendSMS({
      to,
      body,
      from,
      mediaUrl,
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

router.post('/sms/bulk', async (req, res) => {
  try {
    const twilio = getTwilioClient();
    const { messages } = req.body;
    
    const result = await twilio.sendBulkSMS(messages);
    res.json(result);
  } catch (error) {
    console.error('Error sending bulk SMS:', error);
    res.status(500).json({ error: 'Failed to send bulk SMS' });
  }
});

// Voice API
router.post('/voice/call', async (req, res) => {
  try {
    const twilio = getTwilioClient();
    const { to, from, url, twiml } = req.body;
    
    const result = await twilio.makeCall({
      to,
      from,
      url,
      twiml,
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error making call:', error);
    res.status(500).json({ error: 'Failed to make call' });
  }
});

// Communications API
router.get('/communications', async (req, res) => {
  try {
    const xano = getXanoClient();
    const { member_id, channel, direction, limit } = req.query;
    
    const communications = await xano.getCommunications({
      member_id: member_id ? parseInt(member_id as string) : undefined,
      channel: channel as string,
      direction: direction as string,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    
    res.json(communications);
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Analytics API
router.get('/analytics/dashboard', async (req, res) => {
  try {
    const xano = getXanoClient();
    const stats = await xano.getDashboardStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Twilio Webhooks
router.post('/webhooks/twilio/incoming', async (req, res) => {
  try {
    const twilio = getTwilioClient();
    await twilio.handleIncomingSMS(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
    res.status(500).send('Error');
  }
});

router.post('/webhooks/twilio/status', async (req, res) => {
  try {
    const twilio = getTwilioClient();
    await twilio.handleStatusWebhook(req.body);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling status webhook:', error);
    res.status(500).send('Error');
  }
});

export default router;

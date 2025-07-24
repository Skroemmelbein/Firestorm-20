import { RequestHandler } from "express";
import crypto from "crypto";

interface RCSAgentConfig {
  agentId: string;
  businessName: string;
  webhookUrl: string;
  capabilities: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

interface RCSMessage {
  agentId: string;
  recipient: string;
  type: 'text' | 'image' | 'card' | 'carousel';
  content: string;
  richContent?: any;
}

// In-memory storage for demo (use database in production)
let rcsAgents: Map<string, RCSAgentConfig> = new Map();
let rcsMessages: Map<string, any[]> = new Map();

// Configure RCS Agent
export const configureAgent: RequestHandler = async (req, res) => {
  try {
    const { agentId, businessName, webhookUrl, capabilities }: RCSAgentConfig = req.body;

    if (!agentId || !businessName) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "agentId and businessName are required"
      });
    }

    // Store agent configuration
    const agentConfig: RCSAgentConfig = {
      agentId,
      businessName,
      webhookUrl: webhookUrl || `${process.env.BASE_URL || 'https://your-domain.com'}/api/rcs/webhook`,
      capabilities: capabilities || ['TEXT', 'RICH_CARD', 'SUGGESTED_ACTIONS'],
      verificationStatus: 'pending'
    };

    rcsAgents.set(agentId, agentConfig);

    // Initialize message storage for this agent
    if (!rcsMessages.has(agentId)) {
      rcsMessages.set(agentId, []);
    }

    console.log(`🤖 RCS Agent configured: ${agentId} (${businessName})`);

    // Simulate Google RBM API call
    const mockResponse = {
      agentId,
      displayName: businessName,
      rcsBusinessMessaging: {
        state: "PENDING_VERIFICATION"
      },
      webhookConfiguration: {
        webhook: {
          url: webhookUrl
        }
      }
    };

    res.json({
      success: true,
      message: "RCS Agent configuration initiated",
      agent: mockResponse,
      status: "pending",
      nextSteps: [
        "Agent verification pending with Google",
        "Webhook endpoint configured",
        "Business verification in progress"
      ]
    });

  } catch (error) {
    console.error("RCS Agent configuration error:", error);
    res.status(500).json({
      error: "Failed to configure RCS Agent",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Verify RCS Agent
export const verifyAgent: RequestHandler = async (req, res) => {
  try {
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        error: "Missing agentId",
        message: "agentId is required for verification"
      });
    }

    const agent = rcsAgents.get(agentId);
    if (!agent) {
      return res.status(404).json({
        error: "Agent not found",
        message: "RCS Agent not configured"
      });
    }

    // Simulate verification process
    // In production, this would call Google RBM API to check verification status
    const mockVerificationStatuses = ['verified', 'pending', 'rejected'];
    const randomStatus = mockVerificationStatuses[Math.floor(Math.random() * mockVerificationStatuses.length)];
    
    // For demo purposes, let's make it verified most of the time
    const verificationStatus = Math.random() > 0.3 ? 'verified' : 'pending';
    
    agent.verificationStatus = verificationStatus as any;
    rcsAgents.set(agentId, agent);

    console.log(`🔍 RCS Agent verification: ${agentId} -> ${verificationStatus}`);

    res.json({
      success: true,
      status: verificationStatus,
      message: verificationStatus === 'verified' 
        ? "RCS Agent successfully verified!"
        : "RCS Agent verification still pending",
      agent: {
        agentId,
        verificationStatus,
        lastChecked: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("RCS Agent verification error:", error);
    res.status(500).json({
      error: "Failed to verify RCS Agent",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Send RCS Message
export const sendMessage: RequestHandler = async (req, res) => {
  try {
    const { agentId, recipient, type, content, richContent }: RCSMessage = req.body;

    if (!agentId || !recipient || !content) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "agentId, recipient, and content are required"
      });
    }

    const agent = rcsAgents.get(agentId);
    if (!agent) {
      return res.status(404).json({
        error: "Agent not found",
        message: "RCS Agent not configured"
      });
    }

    if (agent.verificationStatus !== 'verified') {
      return res.status(400).json({
        error: "Agent not verified",
        message: "RCS Agent must be verified before sending messages"
      });
    }

    // Create message object
    const message = {
      messageId: `rcs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentId,
      recipient,
      type: type || 'text',
      content,
      richContent,
      status: 'sent',
      timestamp: new Date().toISOString(),
      direction: 'outbound'
    };

    // Store message
    const agentMessages = rcsMessages.get(agentId) || [];
    agentMessages.unshift(message);
    rcsMessages.set(agentId, agentMessages.slice(0, 100)); // Keep last 100 messages

    console.log(`📱 RCS Message sent: ${agentId} -> ${recipient}`);

    // Simulate message delivery
    setTimeout(() => {
      message.status = 'delivered';
      console.log(`✅ RCS Message delivered: ${message.messageId}`);
    }, 2000);

    // In production, this would call Google RBM API
    const mockRBMResponse = {
      messageId: message.messageId,
      state: "SENT"
    };

    res.json({
      success: true,
      message: "RCS message sent successfully",
      messageId: message.messageId,
      rbmResponse: mockRBMResponse,
      details: {
        agentId,
        recipient,
        type,
        contentLength: content.length,
        timestamp: message.timestamp
      }
    });

  } catch (error) {
    console.error("RCS Message send error:", error);
    res.status(500).json({
      error: "Failed to send RCS message",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get RCS Messages
export const getMessages: RequestHandler = async (req, res) => {
  try {
    const { agentId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    if (!agentId) {
      return res.status(400).json({
        error: "Missing agentId",
        message: "agentId parameter is required"
      });
    }

    const agent = rcsAgents.get(agentId);
    if (!agent) {
      return res.status(404).json({
        error: "Agent not found",
        message: "RCS Agent not configured"
      });
    }

    const allMessages = rcsMessages.get(agentId) || [];
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const messages = allMessages.slice(startIndex, startIndex + limitNum);

    res.json({
      success: true,
      messages,
      pagination: {
        total: allMessages.length,
        offset: startIndex,
        limit: limitNum,
        hasMore: startIndex + limitNum < allMessages.length
      },
      agent: {
        agentId,
        businessName: agent.businessName,
        verificationStatus: agent.verificationStatus
      }
    });

  } catch (error) {
    console.error("RCS Messages retrieval error:", error);
    res.status(500).json({
      error: "Failed to retrieve RCS messages",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// RCS Webhook Handler
export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers['x-goog-signature'] as string;
    const timestamp = req.headers['x-goog-request-timestamp'] as string;
    
    // Log incoming webhook
    console.log('📥 RCS Webhook received:', {
      headers: req.headers,
      body: req.body,
      timestamp: new Date().toISOString()
    });

    // Verify webhook signature (in production)
    // const webhookSecret = process.env.RCS_WEBHOOK_SECRET;
    // if (webhookSecret && signature) {
    //   const expectedSignature = crypto
    //     .createHmac('sha256', webhookSecret)
    //     .update(JSON.stringify(req.body))
    //     .digest('hex');
    //   
    //   if (signature !== expectedSignature) {
    //     return res.status(401).json({ error: 'Invalid signature' });
    //   }
    // }

    const { message, agent, eventType } = req.body;

    // Handle different event types
    switch (eventType) {
      case 'MESSAGE':
        await handleIncomingMessage(message, agent);
        break;
      case 'DELIVERY_RECEIPT':
        await handleDeliveryReceipt(message, agent);
        break;
      case 'READ_RECEIPT':
        await handleReadReceipt(message, agent);
        break;
      case 'IS_TYPING':
        await handleTypingIndicator(message, agent);
        break;
      default:
        console.log(`🤷 Unknown RCS event type: ${eventType}`);
    }

    // Respond to Google RBM
    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      eventType,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("RCS Webhook error:", error);
    res.status(500).json({
      error: "Webhook processing failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Handle incoming RCS message
async function handleIncomingMessage(message: any, agent: any) {
  try {
    const agentId = agent?.agentId || 'unknown';
    
    const incomingMessage = {
      messageId: message.messageId || `incoming_${Date.now()}`,
      agentId,
      sender: message.senderPhoneNumber,
      type: message.text ? 'text' : 'unknown',
      content: message.text || 'Non-text message',
      status: 'received',
      timestamp: new Date().toISOString(),
      direction: 'inbound',
      originalMessage: message
    };

    // Store incoming message
    const agentMessages = rcsMessages.get(agentId) || [];
    agentMessages.unshift(incomingMessage);
    rcsMessages.set(agentId, agentMessages.slice(0, 100));

    console.log(`📨 RCS Message received: ${agentId} <- ${incomingMessage.sender}`);

    // Here you could trigger automated responses, integrate with AI, etc.
    // Example: Auto-reply for certain keywords
    if (message.text?.toLowerCase().includes('help')) {
      // Send auto-reply (would call sendMessage function)
      console.log('🤖 Auto-reply triggered for help request');
    }

  } catch (error) {
    console.error('Error handling incoming RCS message:', error);
  }
}

// Handle delivery receipt
async function handleDeliveryReceipt(message: any, agent: any) {
  try {
    const messageId = message.messageId;
    const agentId = agent?.agentId || 'unknown';
    
    // Update message status to delivered
    const agentMessages = rcsMessages.get(agentId) || [];
    const messageIndex = agentMessages.findIndex(msg => msg.messageId === messageId);
    
    if (messageIndex !== -1) {
      agentMessages[messageIndex].status = 'delivered';
      agentMessages[messageIndex].deliveredAt = new Date().toISOString();
      rcsMessages.set(agentId, agentMessages);
    }

    console.log(`✅ RCS Message delivered: ${messageId}`);
  } catch (error) {
    console.error('Error handling delivery receipt:', error);
  }
}

// Handle read receipt
async function handleReadReceipt(message: any, agent: any) {
  try {
    const messageId = message.messageId;
    const agentId = agent?.agentId || 'unknown';
    
    // Update message status to read
    const agentMessages = rcsMessages.get(agentId) || [];
    const messageIndex = agentMessages.findIndex(msg => msg.messageId === messageId);
    
    if (messageIndex !== -1) {
      agentMessages[messageIndex].status = 'read';
      agentMessages[messageIndex].readAt = new Date().toISOString();
      rcsMessages.set(agentId, agentMessages);
    }

    console.log(`👁️ RCS Message read: ${messageId}`);
  } catch (error) {
    console.error('Error handling read receipt:', error);
  }
}

// Handle typing indicator
async function handleTypingIndicator(message: any, agent: any) {
  try {
    const agentId = agent?.agentId || 'unknown';
    const sender = message.senderPhoneNumber;
    
    console.log(`⌨️ User typing: ${sender} in conversation with ${agentId}`);
    
    // Here you could emit real-time typing indicators to connected clients
  } catch (error) {
    console.error('Error handling typing indicator:', error);
  }
}

// Get Agent Status
export const getAgentStatus: RequestHandler = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({
        error: "Missing agentId",
        message: "agentId parameter is required"
      });
    }

    const agent = rcsAgents.get(agentId);
    if (!agent) {
      return res.status(404).json({
        error: "Agent not found",
        message: "RCS Agent not configured"
      });
    }

    const agentMessages = rcsMessages.get(agentId) || [];
    const sentMessages = agentMessages.filter(msg => msg.direction === 'outbound').length;
    const receivedMessages = agentMessages.filter(msg => msg.direction === 'inbound').length;

    res.json({
      success: true,
      agent: {
        ...agent,
        messagesSent: sentMessages,
        messagesReceived: receivedMessages,
        lastActivity: agentMessages.length > 0 ? agentMessages[0].timestamp : null,
        status: agent.verificationStatus === 'verified' ? 'active' : 'pending'
      },
      stats: {
        totalMessages: agentMessages.length,
        sentMessages,
        receivedMessages,
        responseRate: sentMessages > 0 ? Math.round((receivedMessages / sentMessages) * 100) : 0
      }
    });

  } catch (error) {
    console.error("RCS Agent status error:", error);
    res.status(500).json({
      error: "Failed to get agent status",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

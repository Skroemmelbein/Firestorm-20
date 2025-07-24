import { RequestHandler } from "express";

interface CreateConversationRequest {
  friendlyName: string;
  participantPhone: string;
  initialMessage?: string;
}

interface SendMessageRequest {
  body: string;
  author?: string;
  mediaUrl?: string;
}

export const getConversations: RequestHandler = async (req, res) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return res.status(400).json({
        error: "Missing Twilio credentials",
        message: "Please configure Twilio Account SID and Auth Token"
      });
    }

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch('https://conversations.twilio.com/v1/Conversations', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
      }
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Twilio Conversations API Error:', response.status, responseText);
      return res.status(response.status).json({
        error: `Twilio Conversations API Error ${response.status}`,
        message: responseText
      });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to parse Twilio response",
        message: responseText
      });
    }

    res.json({
      success: true,
      conversations: result.conversations || [],
      message: "Conversations retrieved successfully"
    });

  } catch (error) {
    console.error("Conversations retrieval error:", error);
    res.status(500).json({
      error: "Failed to retrieve conversations",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const createConversation: RequestHandler = async (req, res) => {
  try {
    const { friendlyName, participantPhone, initialMessage }: CreateConversationRequest = req.body;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+18559600037";

    if (!accountSid || !authToken) {
      return res.status(400).json({
        error: "Missing Twilio credentials",
        message: "Please configure Twilio Account SID and Auth Token"
      });
    }

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    // Step 1: Create the conversation
    const conversationData = new URLSearchParams();
    conversationData.append('FriendlyName', friendlyName);
    conversationData.append('UniqueName', `conv_${Date.now()}`);

    const conversationResponse = await fetch('https://conversations.twilio.com/v1/Conversations', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: conversationData.toString()
    });

    const conversationText = await conversationResponse.text();

    if (!conversationResponse.ok) {
      return res.status(conversationResponse.status).json({
        error: `Failed to create conversation`,
        message: conversationText
      });
    }

    let conversation;
    try {
      conversation = JSON.parse(conversationText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to parse conversation response",
        message: conversationText
      });
    }

    // Step 2: Add SMS participant
    const participantData = new URLSearchParams();
    participantData.append('MessagingBinding.Address', participantPhone);
    participantData.append('MessagingBinding.ProxyAddress', twilioPhoneNumber);

    const participantResponse = await fetch(
      `https://conversations.twilio.com/v1/Conversations/${conversation.sid}/Participants`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: participantData.toString()
      }
    );

    const participantText = await participantResponse.text();

    if (!participantResponse.ok) {
      console.error('Failed to add participant:', participantText);
      // Continue anyway, conversation was created
    }

    // Step 3: Send initial message if provided
    if (initialMessage) {
      const messageData = new URLSearchParams();
      messageData.append('Body', initialMessage);
      messageData.append('Author', 'system');

      const messageResponse = await fetch(
        `https://conversations.twilio.com/v1/Conversations/${conversation.sid}/Messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: messageData.toString()
        }
      );

      const messageText = await messageResponse.text();

      if (!messageResponse.ok) {
        console.error('Failed to send initial message:', messageText);
        // Continue anyway
      }
    }

    res.json({
      success: true,
      conversation: conversation,
      message: `Conversation "${friendlyName}" created successfully`,
      participantPhone: participantPhone,
      twilioNumber: twilioPhoneNumber
    });

  } catch (error) {
    console.error("Conversation creation error:", error);
    res.status(500).json({
      error: "Failed to create conversation",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const getConversationMessages: RequestHandler = async (req, res) => {
  try {
    const { conversationSid } = req.params;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return res.status(400).json({
        error: "Missing Twilio credentials",
        message: "Please configure Twilio Account SID and Auth Token"
      });
    }

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(
      `https://conversations.twilio.com/v1/Conversations/${conversationSid}/Messages?Order=asc`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
        }
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to get messages`,
        message: responseText
      });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to parse messages response",
        message: responseText
      });
    }

    res.json({
      success: true,
      messages: result.messages || [],
      message: "Messages retrieved successfully"
    });

  } catch (error) {
    console.error("Messages retrieval error:", error);
    res.status(500).json({
      error: "Failed to retrieve messages",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const sendConversationMessage: RequestHandler = async (req, res) => {
  try {
    const { conversationSid } = req.params;
    const { body, author, mediaUrl }: SendMessageRequest = req.body;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return res.status(400).json({
        error: "Missing Twilio credentials",
        message: "Please configure Twilio Account SID and Auth Token"
      });
    }

    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const messageData = new URLSearchParams();
    messageData.append('Body', body);
    if (author) messageData.append('Author', author);
    if (mediaUrl) messageData.append('MediaUrl', mediaUrl);

    const response = await fetch(
      `https://conversations.twilio.com/v1/Conversations/${conversationSid}/Messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: messageData.toString()
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to send message`,
        message: responseText
      });
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to parse message response",
        message: responseText
      });
    }

    res.json({
      success: true,
      message: result,
      messageText: "Message sent successfully"
    });

  } catch (error) {
    console.error("Message send error:", error);
    res.status(500).json({
      error: "Failed to send message",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const handleConversationWebhook: RequestHandler = async (req, res) => {
  try {
    console.log('📨 Conversation webhook received:', {
      body: req.body,
      headers: req.headers,
      method: req.method
    });

    // Process the webhook payload
    const {
      EventType,
      ConversationSid,
      MessageSid,
      Body,
      Author,
      ParticipantSid,
      Source
    } = req.body;

    // Log incoming message events
    if (EventType === 'onMessageAdded') {
      console.log('💬 New message in conversation:', {
        conversationSid: ConversationSid,
        messageSid: MessageSid,
        body: Body,
        author: Author,
        source: Source
      });

      // Here you could:
      // 1. Store the message in your database
      // 2. Send notifications
      // 3. Trigger automated responses
      // 4. Update conversation state
    }

    // Respond to Twilio to acknowledge receipt
    res.status(200).json({
      success: true,
      eventType: EventType,
      processed: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Conversation webhook error:', error);
    res.status(500).json({
      error: "Webhook processing failed",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

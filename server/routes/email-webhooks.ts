import express from "express";

const router = express.Router();

async function analyzeAndApplyJourney(fromEmail: string, text: string) {
  try {
    const { getOpenAIService } = await import("../../shared/openai-service.js");
    const ai = getOpenAIService();
    const analysis = await ai.analyzeText?.(text);

    const { getConvexClient } = await import("../../shared/convex-client.js");
    const convex = getConvexClient();

    // Find member by email and update engagement/journey-ish fields
    try {
      const member = await convex.getMemberByEmail(fromEmail);
      if (member?.id) {
        const engagementBump = analysis?.sentiment === "positive" ? 10 : analysis?.sentiment === "negative" ? -10 : 0;
        await convex.updateMember(member.id, {
          last_activity: new Date().toISOString(),
          engagement_score: (member.engagement_score || 50) + engagementBump,
        });
      }
    } catch {}

    return analysis;
  } catch (e) {
    return null;
  }
}

// SendGrid Event Webhook (opens/clicks/delivered/bounce)
router.post("/email/sendgrid/webhook", async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    const { getConvexClient } = await import("../../shared/convex-client.js");
    const convex = getConvexClient();

    for (const evt of events) {
      const channel = "email";
      const status = evt.event || evt.event_type || "event";
      const toEmail = evt.email || evt.to;
      await convex.createCommunication({
        channel,
        direction: "inbound",
        to_email: toEmail,
        content: `SendGrid event: ${status}`,
        status,
        provider: "sendgrid",
        provider_id: evt.sg_event_id || evt['smtp-id'] || undefined,
        delivered_at: evt.timestamp ? new Date(evt.timestamp * 1000).toISOString() : new Date().toISOString(),
        created_at: new Date().toISOString(),
      });
    }

    res.status(200).json({ success: true, processed: events.length });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inbound email (SendGrid Inbound Parse or JSON)
router.post("/email/sendgrid/inbound", async (req, res) => {
  try {
    const from = req.body.from || req.body.envelope?.from || req.body.sender || "unknown@unknown";
    const subject = req.body.subject || "";
    const text = req.body.text || req.body.html || "";

    const { getConvexClient } = await import("../../shared/convex-client.js");
    const convex = getConvexClient();

    // Log inbound email
    const comm = await convex.createCommunication({
      channel: "email",
      direction: "inbound",
      from_email: from,
      subject,
      content: typeof text === 'string' ? text.slice(0, 2000) : "",
      status: "received",
      provider: "sendgrid",
      created_at: new Date().toISOString(),
    });

    // Analyze and update journey-ish fields
    const analysis = await analyzeAndApplyJourney(from, typeof text === 'string' ? text : "");

    // Update the communication with AI fields if available
    if (analysis) {
      await convex.updateCommunicationStatus(comm.id, {
        ai_sentiment: analysis.sentiment,
        ai_intent: analysis.intent,
        ai_confidence: analysis.confidence,
      });
    }

    res.status(200).json({ success: true, commId: comm.id, analyzed: !!analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

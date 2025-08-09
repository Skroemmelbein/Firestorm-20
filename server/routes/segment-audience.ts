import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Environment configuration
const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY || process.env.TWILIO_SEGMENT_WRITE_KEY;
const SEGMENT_TOKEN = process.env.SEGMENT_TOKEN || process.env.TWILIO_SEGMENT_TOKEN; // for admin APIs

// Helpers
async function segmentAdminRequest(path: string, method: "GET" | "POST" = "GET", body?: any) {
  if (!SEGMENT_TOKEN) {
    throw new Error("Segment admin token missing (SEGMENT_TOKEN)");
  }
  const url = `https://platform.segmentapis.com${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${SEGMENT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const err: any = new Error(`Segment API ${res.status}`);
    err.details = json;
    throw err;
  }
  return json;
}

router.get("/twilio/segment/status", async (req, res) => {
  try {
    const hasWriteKey = !!SEGMENT_WRITE_KEY;
    const hasToken = !!SEGMENT_TOKEN;
    let workspaces: any[] = [];
    if (hasToken) {
      try {
        const resp = await segmentAdminRequest("/v1beta/workspaces");
        workspaces = resp.workspaces || [];
      } catch (e) {
        // ignore admin API failure, still report partial status
      }
    }
    res.json({
      connected: hasWriteKey || hasToken,
      hasWriteKey,
      hasAdminToken: hasToken,
      workspaceCount: workspaces.length,
    });
  } catch (error: any) {
    res.status(500).json({ connected: false, error: error.message });
  }
});

// List dynamic segments (mock + real when available)
router.get("/journeys/segments", async (req, res) => {
  try {
    // If admin token present, attempt to query segments via Public API (placeholder path)
    if (SEGMENT_TOKEN) {
      try {
        const data = await segmentAdminRequest("/v1beta/segments");
        return res.json({ source: "segment", segments: data.segments || [] });
      } catch (e: any) {
        // fall through to mock
      }
    }
    // Fallback mock
    res.json({
      source: "mock",
      segments: [
        {
          id: "SEG-PETS-ACTIVE",
          name: "Active Pet Leads",
          description: "Recently engaged pet leads",
          audienceSize: 125_000,
          criteria: ["industry = pets", "engagement_score > 60"],
        },
        {
          id: "SEG-PETS-LAPSED",
          name: "Lapsed Pet Leads",
          description: "No engagement in 30 days",
          audienceSize: 189_000,
          criteria: ["industry = pets", "last_seen > 30d"],
        },
        {
          id: "SEG-PETS-VIP",
          name: "VIP Pet Buyers",
          description: "High-intent buyers",
          audienceSize: 117_000,
          criteria: ["industry = pets", "intent = high"],
        },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List audiences
router.get("/journeys/audiences", async (req, res) => {
  try {
    if (SEGMENT_TOKEN) {
      try {
        const data = await segmentAdminRequest("/v1beta/audiences");
        return res.json({ source: "segment", audiences: data.audiences || [] });
      } catch (e: any) {
        // fallback
      }
    }
    res.json({
      source: "mock",
      audiences: [
        {
          id: "AUD-PETS-ONBOARD",
          name: "Pet Onboarding Sequence",
          status: "active",
          totalContacts: 431000,
          reachableContacts: 389000,
          destinations: ["Twilio SMS", "Email"],
          segments: ["SEG-PETS-ACTIVE"],
        },
      ],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll a contact into an audience by emitting identify/track to Segment
router.post("/journeys/audiences/enroll", async (req, res) => {
  try {
    const { phone, traits, audienceId } = req.body || {};
    if (!SEGMENT_WRITE_KEY) {
      return res.status(400).json({ error: "Missing SEGMENT_WRITE_KEY" });
    }
    if (!phone) {
      return res.status(400).json({ error: "Missing phone" });
    }
    // Identify call
    const identifyRes = await fetch("https://api.segment.io/v1/identify", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(SEGMENT_WRITE_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: phone,
        traits: traits || {},
      }),
    });
    if (!identifyRes.ok) {
      const t = await identifyRes.text();
      return res.status(identifyRes.status).json({ error: t });
    }
    // Optional: track enrollment event
    const trackRes = await fetch("https://api.segment.io/v1/track", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(SEGMENT_WRITE_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: phone,
        event: "Audience Enrollment",
        properties: { audienceId },
      }),
    });
    if (!trackRes.ok) {
      const t = await trackRes.text();
      return res.status(trackRes.status).json({ error: t });
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
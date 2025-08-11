import express from "express";
import { config } from "dotenv";

config();

const router = express.Router();

function twimlResponse(innerXml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Response>${innerXml}</Response>`;
}

router.post("/voice/ivr", async (req, res) => {
  // Welcome + gather speech
  const say = "Welcome to EchelonX. Please tell me how I can help you.";
  const gather = `<Gather input="speech dtmf" speechTimeout="auto" action="/api/real/voice/ivr/handle" method="POST"><Say>${say}</Say></Gather><Say>Sorry, I didn't get that.</Say><Redirect method="POST">/api/real/voice/ivr</Redirect>`;
  res.type("text/xml").send(twimlResponse(gather));
});

router.post("/voice/ivr/handle", async (req, res) => {
  try {
    const speech = (req.body?.SpeechResult as string) || (req.body?.Digits as string) || "";
    let answer = "Thanks. Our automated system will follow up by text.";
    try {
      const { getOpenAIService } = await import("../../shared/openai-service.js");
      const ai = getOpenAIService();
      const completion = await ai.generateSupportReply({
        channel: "voice",
        from: req.body?.From || "unknown",
        content: speech,
      });
      answer = completion?.reply || answer;
    } catch (e) {
      // fallback
    }
    const xml = `<Say>${answer}</Say><Pause length="1"/><Say>Is there anything else?</Say><Redirect method="POST">/api/real/voice/ivr</Redirect>`;
    res.type("text/xml").send(twimlResponse(xml));
  } catch (error) {
    const xml = `<Say>Sorry, something went wrong.</Say>`;
    res.type("text/xml").send(twimlResponse(xml));
  }
});

export default router;
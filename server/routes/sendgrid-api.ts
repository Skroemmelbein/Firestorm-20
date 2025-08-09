import express from "express";

const router = express.Router();

router.get("/sendgrid/templates", async (req, res) => {
  try {
    const { getSendGridClient } = await import("../../shared/sendgrid-client");
    const sg = getSendGridClient();
    const templates = await sg.listTemplates();
    res.json({ success: true, templates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/sendgrid/templates/:templateId", async (req, res) => {
  try {
    const { getSendGridClient } = await import("../../shared/sendgrid-client");
    const sg = getSendGridClient();
    const template = await sg.getTemplateById(req.params.templateId);
    res.json({ success: true, template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/sendgrid/send-template", async (req, res) => {
  try {
    const { to, templateId, dynamicData, subject } = req.body || {};
    if (!to || !templateId) {
      return res.status(400).json({ success: false, error: "Missing to or templateId" });
    }
    const { getSendGridClient } = await import("../../shared/sendgrid-client");
    const sg = getSendGridClient();
    const result = await sg.sendTemplateEmail({ to, templateId, dynamicData, subject });
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
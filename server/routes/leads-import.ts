import express from "express";
import Busboy from "busboy";
import { parse } from "csv-parse";
import { z } from "zod";

const router = express.Router();

// In-memory import job tracking for simplicity; swap to persistent store in production
interface ImportJob {
  id: string;
  filename?: string;
  total?: number;
  processed: number;
  success: number;
  failed: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  startedAt: number;
  completedAt?: number;
  errors: Array<{ index: number; reason: string; row?: any }>;
  seenKeys?: Set<string>;
}

const jobs = new Map<string, ImportJob>();

const StartImportSchema = z.object({
  jobId: z.string().min(3),
  total: z.number().int().positive().optional(),
  filename: z.string().optional(),
});

const LeadRecordSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  // Accept arbitrary additional fields
}).passthrough();

const IngestBatchSchema = z.object({
  jobId: z.string().min(3),
  batchIndex: z.number().int().nonnegative(),
  rows: z.array(LeadRecordSchema),
  options: z
    .object({
      dedupe: z.enum(["skip", "merge", "create"]).default("merge"),
      segment: z.object({ identify: z.boolean().default(true), audienceKey: z.string().optional() }).default({ identify: true }),
    })
    .default({ dedupe: "merge", segment: { identify: true } }),
});

router.post("/leads/import/start", async (req, res) => {
  const parsed = StartImportSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
  }
  const { jobId, total, filename } = parsed.data;
  const job: ImportJob = {
    id: jobId,
    filename,
    total,
    processed: 0,
    success: 0,
    failed: 0,
    status: "PENDING",
    startedAt: Date.now(),
    errors: [],
  };
  jobs.set(jobId, job);
  return res.json({ ok: true, job });
});

router.get("/leads/import/progress/:jobId", async (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const completion = job.total ? Math.min(100, Math.round((job.processed / job.total) * 100)) : undefined;
  return res.json({ ok: true, job: { ...job, completion } });
});

router.get("/leads/import/status", async (_req, res) => {
  const list = Array.from(jobs.values())
    .sort((a, b) => b.startedAt - a.startedAt)
    .map((j) => ({
      id: j.id,
      filename: j.filename,
      status: j.status,
      processed: j.processed,
      success: j.success,
      failed: j.failed,
      startedAt: j.startedAt,
      completedAt: j.completedAt,
    }));
  return res.json({ ok: true, jobs: list });
});

async function upsertLeadIntoConvex(record: any) {
  try {
    const { getConvexClient } = await import("../../shared/convex-client");
    const convex = getConvexClient();
    // Placeholder: Use a dedicated leads table or members upsert
    return await convex.mutation("leads.upsertLead", { ...record, imported_at: Date.now() });
  } catch (e) {
    return { error: (e as Error).message };
  }
}

async function identifyInSegment(record: any, audienceKey?: string) {
  const writeKey = process.env.SEGMENT_WRITE_KEY || process.env.TWILIO_SEGMENT_WRITE_KEY;
  if (!writeKey) return { skipped: true, reason: "SEGMENT_WRITE_KEY missing" };
  const userId = record.email || record.phone || record.id || undefined;
  if (!userId) return { skipped: true, reason: "no userId (email/phone/id)" };

  const traits = { ...record };

  const auth = Buffer.from(writeKey + ":").toString("base64");
  const identifyRes = await fetch("https://api.segment.io/v1/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({ userId, traits }),
  });

  if (!identifyRes.ok) {
    const text = await identifyRes.text();
    return { error: `Segment identify ${identifyRes.status}: ${text}` };
  }

  if (audienceKey) {
    await fetch("https://api.segment.io/v1/track", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
      body: JSON.stringify({ userId, event: "Audience Enrollment", properties: { audienceKey } }),
    });
  }

  return { ok: true };
}

router.post("/leads/import/ingest-batch", async (req, res) => {
  const parsed = IngestBatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload", details: parsed.error.issues });
  }
  const { jobId, rows, options } = parsed.data;
  const job = jobs.get(jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });

  job.status = "PROCESSING";

  const results = [] as Array<{ ok?: boolean; error?: string }>;

  job.seenKeys ||= new Set<string>();
  const mkKey = (r: any) => (r.email || "") + "|" + (r.phone || "");

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      // Basic normalization
      if (row.phone) row.phone = String(row.phone).replace(/[^\d+]/g, "");

      const key = mkKey(row);
      if (options.dedupe === "skip" && job.seenKeys.has(key)) {
        // skip duplicate within same job
        job.success++;
        results.push({ ok: true });
        continue;
      }

      // Convex upsert
      const convexRes: any = await upsertLeadIntoConvex(row);
      if (convexRes?.error) throw new Error(convexRes.error);

      // Segment identify (Contacts)
      if (options.segment?.identify) {
        const segRes: any = await identifyInSegment(row, options.segment.audienceKey);
        if (segRes?.error) throw new Error(segRes.error);
      }

      job.success++;
      job.seenKeys.add(key);
      results.push({ ok: true });
    } catch (e: any) {
      job.failed++;
      job.errors.push({ index: job.processed + i, reason: e.message, row });
      results.push({ error: e.message });
    }
  }

  job.processed += rows.length;
  if (job.total && job.processed >= job.total) {
    job.status = "COMPLETED";
    job.completedAt = Date.now();
  }

  return res.json({ ok: true, processed: rows.length, results, job });
});

router.post("/leads/import/upload", async (req, res) => {
  const jobId = (req.query.jobId as string) || `job_${Date.now()}`;
  const audienceKey = (req.query.audienceKey as string) || undefined;
  const dedupe = ((req.query.dedupe as string) || "merge") as "skip" | "merge" | "create";
  const batchSize = Math.max(1000, Math.min(10000, parseInt((req.query.batchSize as string) || "5000")));

  const job: ImportJob = jobs.get(jobId) || {
    id: jobId,
    processed: 0,
    success: 0,
    failed: 0,
    status: "PENDING",
    startedAt: Date.now(),
    errors: [],
  };
  jobs.set(jobId, job);

  const bb = Busboy({ headers: req.headers });
  let responded = false;

  bb.on("file", (_name, file, info) => {
    job.filename = info.filename;
    job.status = "PROCESSING";

    const csvParser = parse({ columns: true, skip_empty_lines: true, relax_column_count: true });
    const buffer: any[] = [];

    const flushBatch = async () => {
      if (buffer.length === 0) return;
      const rows = buffer.splice(0, buffer.length);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        try {
          if (row.phone) row.phone = String(row.phone).replace(/[^\d+]/g, "");
          const convexRes: any = await upsertLeadIntoConvex(row);
          if (convexRes?.error) throw new Error(convexRes.error);
          const segRes: any = await identifyInSegment(row, audienceKey);
          if (segRes?.error) throw new Error(segRes.error);
          job.success++;
        } catch (e: any) {
          job.failed++;
          job.errors.push({ index: job.processed, reason: e.message, row });
        }
        job.processed++;
      }
    };

    csvParser.on("readable", async () => {
      let record;
      // eslint-disable-next-line no-cond-assign
      while ((record = csvParser.read())) {
        buffer.push(record);
        if (buffer.length >= batchSize) {
          csvParser.pause();
          await flushBatch();
          csvParser.resume();
        }
      }
    });

    csvParser.on("error", (err) => {
      job.status = "FAILED";
      job.errors.push({ index: job.processed, reason: `CSV parse error: ${err.message}` });
    });

    csvParser.on("end", async () => {
      await flushBatch();
      job.status = "COMPLETED";
      job.completedAt = Date.now();
      if (!responded) {
        responded = true;
        res.json({ ok: true, jobId: job.id, message: "Upload accepted", job });
      }
    });

    file.pipe(csvParser);
  });

  bb.on("finish", () => {
    if (!responded) {
      responded = true;
      res.json({ ok: true, jobId: job.id, job });
    }
  });

  req.pipe(bb);
});

export default router;


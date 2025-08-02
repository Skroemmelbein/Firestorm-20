import { Router } from "express";
import { getConvexClient } from "../../shared/convex-client";
import { getTwilioClient } from "../../shared/twilio-client";

const router = Router();

router.post("/run-scheduled-campaigns", async (req, res) => {
  try {
    console.log("⏰ Running scheduled campaign execution...");
    
    const now = Date.now();
    const convex = getConvexClient();
    
    const dueJobs = await convex.query("scheduled_jobs.getDueJobs", {
      before_timestamp: now,
      limit: 100
    });
    
    console.log(`📋 Found ${dueJobs.length} due jobs to execute`);
    
    const results = [];
    
    for (const job of dueJobs) {
      try {
        await convex.mutation("scheduled_jobs.updateJobStatus", {
          id: job._id,
          status: "running",
          executed_at: now
        });
        
        let result;
        switch (job.job_type) {
          case "send_message":
            result = await executeSendMessageJob(job);
            break;
          case "delay":
            result = await executeDelayJob(job);
            break;
          case "trigger_event":
            result = await executeTriggerEventJob(job);
            break;
          default:
            throw new Error(`Unknown job type: ${job.job_type}`);
        }
        
        await convex.mutation("scheduled_jobs.updateJobStatus", {
          id: job._id,
          status: "completed"
        });
        
        results.push({
          job_id: job._id,
          campaign_id: job.campaign_id,
          status: "completed",
          result
        });
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error: any) {
        console.error(`❌ Error executing job ${job._id}:`, error);
        
        const newRetryCount = (job.retry_count || 0) + 1;
        const shouldRetry = newRetryCount < (job.max_retries || 3);
        
        await convex.mutation("scheduled_jobs.updateJobStatus", {
          id: job._id,
          status: shouldRetry ? "pending" : "failed",
          error_message: error.message,
          retry_count: newRetryCount
        });
        
        if (shouldRetry) {
          await convex.mutation("scheduled_jobs.createScheduledJob", {
            campaign_id: job.campaign_id,
            job_type: job.job_type,
            scheduled_at: now + (5 * 60 * 1000),
            payload: job.payload,
            max_retries: job.max_retries
          });
        }
        
        results.push({
          job_id: job._id,
          campaign_id: job.campaign_id,
          status: shouldRetry ? "retrying" : "failed",
          error: error.message
        });
      }
    }
    
    const successful = results.filter(r => r.status === "completed").length;
    const failed = results.filter(r => r.status === "failed").length;
    const retrying = results.filter(r => r.status === "retrying").length;
    
    console.log(`✅ Campaign execution complete: ${successful} successful, ${failed} failed, ${retrying} retrying`);
    
    res.json({
      success: true,
      message: `Processed ${dueJobs.length} scheduled jobs`,
      summary: { total: dueJobs.length, successful, failed, retrying },
      results
    });
    
  } catch (error: any) {
    console.error("💥 Campaign scheduler error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

async function executeSendMessageJob(job: any) {
  const convex = getConvexClient();
  const twilio = getTwilioClient();
  
  const campaign = await convex.getCampaignById(job.campaign_id);
  if (!campaign) {
    throw new Error(`Campaign ${job.campaign_id} not found`);
  }
  
  const execution = await convex.mutation("campaign_executions.createExecution", {
    campaign_id: job.campaign_id,
    execution_type: campaign.schedule_type,
    target_count: job.payload?.target_count || 0
  });
  
  const targets = job.payload?.targets || [];
  
  let sentCount = 0;
  let failedCount = 0;
  
  for (const target of targets) {
    try {
      await twilio.sendSMS({
        to: target.phone || target,
        body: campaign.message_template || "Test message from ECHELONX Marketing Scheduler"
      });
      sentCount++;
    } catch (error) {
      console.error(`Failed to send to ${target.phone || target}:`, error);
      failedCount++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  await convex.mutation("campaign_executions.updateExecutionProgress", {
    id: execution,
    sent_count: sentCount,
    failed_count: failedCount,
    status: failedCount === 0 ? "completed" : "failed"
  });
  
  if (sentCount > 0) {
    await convex.updateCampaign(job.campaign_id, { status: "completed" });
  }
  
  return { sentCount, failedCount, targets: targets.length };
}

async function executeDelayJob(job: any) {
  const delayMs = job.payload?.delay_ms || 60000;
  const nextJob = job.payload?.next_job;
  
  if (nextJob) {
    await getConvexClient().mutation("scheduled_jobs.createScheduledJob", {
      campaign_id: job.campaign_id,
      job_type: nextJob.type,
      scheduled_at: Date.now() + delayMs,
      payload: nextJob.payload
    });
  }
  
  return { delayed_ms: delayMs, next_job: nextJob?.type };
}

async function executeTriggerEventJob(job: any) {
  console.log(`🎯 Trigger event executed: ${job.payload?.event_type}`);
  return { event_type: job.payload?.event_type };
}

router.get("/jobs", async (req, res) => {
  try {
    const convex = getConvexClient();
    const stats = await convex.query("scheduled_jobs.getJobStats", {});
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/executions", async (req, res) => {
  try {
    const convex = getConvexClient();
    const executions = await convex.query("campaign_executions.getRecentExecutions", { limit: 50 });
    res.json({ success: true, executions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

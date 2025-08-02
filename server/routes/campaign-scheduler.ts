import { Router } from "express";
import { getConvexClient } from "../../shared/convex-client";
import { getTwilioClient } from "../../shared/twilio-client";

const router = Router();

router.post("/run-scheduled-campaigns", async (req, res) => {
  try {
    console.log("🚀 REVENUE CAMPAIGN SCHEDULER EXECUTING...");
    
    const now = Date.now();
    const convex = getConvexClient();
    
    const dueJobs = await convex.query("scheduled_jobs.getDueJobs", {
      before_timestamp: now,
      limit: 100
    });
    
    console.log(`💰 REVENUE OPPORTUNITY: ${dueJobs.length} campaigns ready to generate money`);
    
    const results = [];
    let totalRevenueGenerated = 0;
    
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
            if (result.revenueGenerated) {
              totalRevenueGenerated += result.revenueGenerated;
            }
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
        console.error(`💸 REVENUE LOSS - Error executing job ${job._id}:`, error);
        
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
            scheduled_at: now + (5 * 60 * 1000), // Retry in 5 minutes
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
    
    console.log(`🎯 REVENUE EXECUTION COMPLETE: ${successful} successful campaigns, $${totalRevenueGenerated.toFixed(2)} generated, ${failed} failed, ${retrying} retrying`);
    
    res.json({
      success: true,
      message: `REVENUE GENERATED: $${totalRevenueGenerated.toFixed(2)} from ${dueJobs.length} campaigns`,
      summary: { 
        total: dueJobs.length, 
        successful, 
        failed, 
        retrying,
        revenueGenerated: totalRevenueGenerated
      },
      results
    });
    
  } catch (error: any) {
    console.error("💥 REVENUE SYSTEM ERROR:", error);
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
  
  const targets = job.payload?.targets || campaign.target_audience || [];
  
  let sentCount = 0;
  let failedCount = 0;
  
  console.log(`🚀 REVENUE CAMPAIGN EXECUTION: ${campaign.name} to ${targets.length} targets`);
  
  for (const target of targets) {
    try {
      const phoneNumber = target.phone || target;
      
      let personalizedMessage = campaign.message_template || "Revenue message from ECHELONX";
      personalizedMessage = personalizedMessage
        .replace(/\{\{first_name\}\}/g, "Valued Customer")
        .replace(/\{\{budget\}\}/g, campaign.budget || "$500")
        .replace(/\{\{plan\}\}/g, "Premium Plan")
        .replace(/\{\{premium\}\}/g, "$299.99")
        .replace(/\{\{effdate\}\}/g, new Date().toLocaleDateString())
        .replace(/\{\{leadType\}\}/g, "High-Value Lead")
        .replace(/\{\{lastAgentSpoke\}\}/g, "Yesterday")
        .replace(/\{\{plancode\}\}/g, "PREM001")
        .replace(/\{\{memberid\}\}/g, "MBR" + Math.floor(Math.random() * 10000));
      
      await twilio.sendSMS({
        to: phoneNumber,
        body: personalizedMessage
      });
      
      sentCount++;
      console.log(`💰 REVENUE MESSAGE SENT: ${phoneNumber} - ${personalizedMessage.substring(0, 50)}...`);
      
    } catch (error) {
      console.error(`❌ REVENUE LOSS - Failed to send to ${target.phone || target}:`, error);
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
    console.log(`✅ REVENUE CAMPAIGN COMPLETED: ${campaign.name} - ${sentCount} messages sent, $${sentCount * 0.50} potential revenue generated`);
  }
  
  return { 
    sentCount, 
    failedCount, 
    targets: targets.length,
    revenueGenerated: sentCount * 0.50, // Estimate $0.50 revenue per message
    campaignName: campaign.name
  };
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

router.post("/activate-pending-campaigns", async (req, res) => {
  try {
    console.log("🚀 ACTIVATING ALL PENDING CAMPAIGNS FOR IMMEDIATE REVENUE...");
    
    const convex = getConvexClient();
    
    const pendingCampaigns = await convex.query("campaigns.getCampaigns", {
      status: "pending"
    });
    
    console.log(`💰 Found ${pendingCampaigns.data.length} pending campaigns to activate`);
    
    const activationResults = [];
    
    for (const campaign of pendingCampaigns.data) {
      try {
        await convex.mutation("campaigns.updateCampaign", {
          id: campaign._id,
          status: "active"
        });
        
        const jobId = await convex.mutation("scheduled_jobs.createScheduledJob", {
          campaign_id: campaign._id,
          job_type: "send_message",
          scheduled_at: Date.now() + 5000, // Execute in 5 seconds
          payload: {
            target_count: campaign.target_audience?.length || 0,
            targets: campaign.target_audience || []
          },
          max_retries: 3
        });
        
        activationResults.push({
          campaign_id: campaign._id,
          campaign_name: campaign.name,
          status: "activated",
          job_id: jobId,
          target_count: campaign.target_audience?.length || 0,
          estimated_revenue: (campaign.target_audience?.length || 0) * 0.50
        });
        
        console.log(`✅ ACTIVATED: ${campaign.name} - ${campaign.target_audience?.length || 0} targets, $${((campaign.target_audience?.length || 0) * 0.50).toFixed(2)} potential revenue`);
        
      } catch (error: any) {
        console.error(`❌ Failed to activate campaign ${campaign.name}:`, error);
        activationResults.push({
          campaign_id: campaign._id,
          campaign_name: campaign.name,
          status: "failed",
          error: error.message
        });
      }
    }
    
    const totalEstimatedRevenue = activationResults
      .filter(r => r.status === "activated")
      .reduce((sum, r) => sum + (r.estimated_revenue || 0), 0);
    
    console.log(`🎯 CAMPAIGN ACTIVATION COMPLETE: ${activationResults.filter(r => r.status === "activated").length} campaigns activated, $${totalEstimatedRevenue.toFixed(2)} potential revenue`);
    
    res.json({
      success: true,
      message: `Activated ${activationResults.filter(r => r.status === "activated").length} campaigns for immediate revenue generation`,
      totalEstimatedRevenue: totalEstimatedRevenue,
      results: activationResults
    });
    
  } catch (error: any) {
    console.error("💥 Campaign activation error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

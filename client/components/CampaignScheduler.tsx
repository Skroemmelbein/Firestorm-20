import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RevenuePriorities from "./RevenuePriorities";
import { 
  Clock, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  MessageSquare,
  Users,
  BarChart3,
  Timer,
  Zap
} from "lucide-react";

interface ScheduledJob {
  _id: string;
  campaign_id: string;
  job_type: string;
  scheduled_at: number;
  status: string;
  retry_count?: number;
  error_message?: string;
  created_at: number;
}

interface CampaignExecution {
  _id: string;
  campaign_id: string;
  execution_type: string;
  target_count?: number;
  sent_count?: number;
  failed_count?: number;
  status: string;
  started_at?: number;
  completed_at?: number;
}

interface JobStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  send_message: number;
  delay: number;
  trigger_event: number;
}


export default function CampaignScheduler() {
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [executions, setExecutions] = useState<CampaignExecution[]>([]);
  const [jobStats, setJobStats] = useState<JobStats | null>(null);
  const [isRunningScheduler, setIsRunningScheduler] = useState(false);
  const [isActivatingCampaigns, setIsActivatingCampaigns] = useState(false);
  const [revenueGenerated, setRevenueGenerated] = useState(0);
  const [lastRunResult, setLastRunResult] = useState<any>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [jobsResponse, executionsResponse] = await Promise.all([
        fetch("/api/campaign-scheduler/jobs"),
        fetch("/api/campaign-scheduler/executions")
      ]);

      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setJobStats(jobsData.stats);
      }

      if (executionsResponse.ok) {
        const executionsData = await executionsResponse.json();
        setExecutions(executionsData.executions || []);
      }
    } catch (error) {
      console.error("Failed to load scheduler data:", error);
    }
  };

  const runScheduler = async () => {
    setIsRunningScheduler(true);
    try {
      const response = await fetch("/api/campaign-scheduler/run-scheduled-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const result = await response.json();
      setLastRunResult(result);
      console.log("Scheduler result:", result);
      
      if (result.summary?.revenueGenerated) {
        setRevenueGenerated(prev => prev + result.summary.revenueGenerated);
      }
      
      setTimeout(loadData, 1000);
      
    } catch (error) {
      console.error("Failed to run scheduler:", error);
      setLastRunResult({ success: false, message: "Failed to run scheduler" });
    } finally {
      setIsRunningScheduler(false);
    }
  };

  const activatePendingCampaigns = async () => {
    setIsActivatingCampaigns(true);
    try {
      const response = await fetch("/api/campaign-scheduler/activate-pending-campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const result = await response.json();
      console.log("Campaign activation result:", result);
      setLastRunResult(result);
      
      if (result.totalEstimatedRevenue) {
        setRevenueGenerated(prev => prev + result.totalEstimatedRevenue);
      }
      
      setTimeout(loadData, 1000);
      
    } catch (error) {
      console.error("Failed to activate campaigns:", error);
      setLastRunResult({ success: false, message: "Failed to activate campaigns" });
    } finally {
      setIsActivatingCampaigns(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#10B981";
      case "running": return "#F59E0B";
      case "failed": return "#EF4444";
      case "pending": return "#8B5CF6";
      case "queued": return "#6366F1";
      default: return "#6B7280";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "running": return Play;
      case "failed": return AlertCircle;
      case "pending": return Clock;
      case "queued": return Timer;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">🚀 Revenue Campaign Scheduler</h2>
          <p className="text-[#FF6A00] font-semibold">Revenue Generated: ${revenueGenerated.toFixed(2)}</p>
          <p className="text-[#737373] text-sm">Automated Twilio marketing campaign execution</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={activatePendingCampaigns}
            disabled={isActivatingCampaigns}
            className="f10-btn bg-[#10B981] text-white hover:bg-[#059669]"
          >
            {isActivatingCampaigns ? (
              <>
                <Play className="w-4 h-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Activate Pending
              </>
            )}
          </Button>
          <Button
            onClick={runScheduler}
            disabled={isRunningScheduler}
            className="f10-btn accent-bg text-black"
          >
            {isRunningScheduler ? (
              <>
                <Play className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Run Scheduler
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Revenue Priorities Component */}
      <RevenuePriorities />

      {lastRunResult && (
        <Card className="f10-card">
          <CardContent className="pt-6">
            <div className={`p-4 rounded-lg ${lastRunResult.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
              <div className="flex items-center gap-2 mb-2">
                {lastRunResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-medium ${lastRunResult.success ? 'text-green-400' : 'text-red-400'}`}>
                  Last Run Result
                </span>
              </div>
              <p className="text-white text-sm">{lastRunResult.message}</p>
              {lastRunResult.summary && (
                <div className="mt-2 text-xs text-[#737373]">
                  Total: {lastRunResult.summary.total} | 
                  Successful: {lastRunResult.summary.successful} | 
                  Failed: {lastRunResult.summary.failed} | 
                  Retrying: {lastRunResult.summary.retrying}
                  {lastRunResult.summary.revenueGenerated && (
                    <span className="text-[#10B981]"> | Revenue: ${lastRunResult.summary.revenueGenerated.toFixed(2)}</span>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {jobStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="f10-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#737373] text-sm">Total Jobs</p>
                  <p className="text-2xl font-bold text-white">{jobStats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-[#FF6A00]" />
              </div>
            </CardContent>
          </Card>

          <Card className="f10-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#737373] text-sm">Pending</p>
                  <p className="text-2xl font-bold text-purple-400">{jobStats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="f10-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#737373] text-sm">Completed</p>
                  <p className="text-2xl font-bold text-green-400">{jobStats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="f10-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#737373] text-sm">Failed</p>
                  <p className="text-2xl font-bold text-red-400">{jobStats.failed}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="f10-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Recent Campaign Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {executions.length === 0 ? (
              <div className="text-center text-[#737373] py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#FF6A00]" />
                <p>No campaign executions found</p>
                <p className="text-sm mt-2">Launch a campaign to see executions here</p>
              </div>
            ) : (
              executions.map((execution) => {
                const StatusIcon = getStatusIcon(execution.status);
                const successRate = execution.target_count ? 
                  ((execution.sent_count || 0) / execution.target_count * 100).toFixed(1) : 
                  "0.0";
                
                return (
                  <div
                    key={execution._id}
                    className="flex items-center justify-between p-4 bg-[#0a0a0a] border border-[#333333] rounded-lg hover:border-[#FF6A00]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon 
                        className="w-5 h-5" 
                        style={{ color: getStatusColor(execution.status) }}
                      />
                      <div>
                        <div className="text-white font-medium">
                          {execution.execution_type.toUpperCase()} Campaign
                        </div>
                        <div className="text-xs text-[#737373]">
                          Campaign ID: {execution.campaign_id}
                        </div>
                        {execution.started_at && (
                          <div className="text-xs text-[#737373]">
                            Started: {new Date(execution.started_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        style={{
                          backgroundColor: `${getStatusColor(execution.status)}20`,
                          color: getStatusColor(execution.status),
                          borderColor: `${getStatusColor(execution.status)}40`,
                        }}
                        className="uppercase text-xs mb-2"
                      >
                        {execution.status}
                      </Badge>
                      <div className="text-white font-medium">
                        {execution.sent_count || 0} / {execution.target_count || 0}
                      </div>
                      <div className="text-xs text-[#10B981]">
                        {successRate}% success
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {jobStats && (
        <Card className="f10-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Job Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-[#0a0a0a] border border-[#333333] rounded-lg">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-2xl font-bold text-white">{jobStats.send_message}</div>
                <div className="text-sm text-[#737373]">Send Message</div>
              </div>
              <div className="text-center p-4 bg-[#0a0a0a] border border-[#333333] rounded-lg">
                <Timer className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-2xl font-bold text-white">{jobStats.delay}</div>
                <div className="text-sm text-[#737373]">Delay Timer</div>
              </div>
              <div className="text-center p-4 bg-[#0a0a0a] border border-[#333333] rounded-lg">
                <Zap className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-2xl font-bold text-white">{jobStats.trigger_event}</div>
                <div className="text-sm text-[#737373]">Trigger Event</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

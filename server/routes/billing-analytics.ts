import express from "express";
import { getConvexClient } from "../../shared/convex-client";

const router = express.Router();

interface AnalyticsFilter {
  start_date?: string;
  end_date?: string;
  card_brand?: string;
  response_code?: string;
  retry_stage?: string;
  issuer_bin?: string;
}

/**
 * Billing Analytics Engine
 */
class BillingAnalyticsEngine {
  /**
   * Calculate approval rate with various filters
   */
  async getApprovalRate(filter: AnalyticsFilter = {}): Promise<number> {
    const transactions = await this.getFilteredTransactions(filter);

    if (transactions.length === 0) return 0;

    const approved = transactions.filter(
      (t: any) => t.status === "approved",
    ).length;
    return Math.round((approved / transactions.length) * 10000) / 100; // 2 decimal places
  }

  /**
   * Get decline reason distribution
   */
  async getDeclineReasonDistribution(
    filter: AnalyticsFilter = {},
  ): Promise<any[]> {
    const declinedTransactions = await this.getFilteredTransactions({
      ...filter,
      status: "declined",
    });

    const distribution = new Map();

    declinedTransactions.forEach((transaction: any) => {
      const key = `${transaction.response_code}-${transaction.response_text}`;
      const existing = distribution.get(key) || {
        response_code: transaction.response_code,
        response_text: transaction.response_text,
        count: 0,
        percentage: 0,
      };
      existing.count++;
      distribution.set(key, existing);
    });

    const total = declinedTransactions.length;
    const results = Array.from(distribution.values()).map((item: any) => ({
      ...item,
      percentage: Math.round((item.count / total) * 10000) / 100,
    }));

    return results.sort((a, b) => b.count - a.count);
  }

  /**
   * Get retry success rates by attempt
   */
  async getRetrySuccessRates(filter: AnalyticsFilter = {}): Promise<any> {
    const retryTransactions = await this.getFilteredTransactions({
      ...filter,
      retry_attempt: { ">": 0 },
    });

    const rates = {
      retry_1: { total: 0, successful: 0, rate: 0 },
      retry_2: { total: 0, successful: 0, rate: 0 },
      retry_3: { total: 0, successful: 0, rate: 0 },
    };

    retryTransactions.forEach((transaction: any) => {
      const attempt =
        `retry_${transaction.retry_attempt}` as keyof typeof rates;
      if (rates[attempt]) {
        rates[attempt].total++;
        if (transaction.status === "approved") {
          rates[attempt].successful++;
        }
      }
    });

    // Calculate rates
    Object.keys(rates).forEach((key) => {
      const attempt = rates[key as keyof typeof rates];
      attempt.rate =
        attempt.total > 0
          ? Math.round((attempt.successful / attempt.total) * 10000) / 100
          : 0;
    });

    return rates;
  }

  /**
   * Get card brand performance analysis
   */
  async getCardBrandAnalysis(filter: AnalyticsFilter = {}): Promise<any[]> {
    const transactions = await this.getFilteredTransactions(filter);
    const brandStats = new Map();

    transactions.forEach((transaction: any) => {
      const brand =
        transaction.issuer_bin?.slice(0, 1) === "4"
          ? "visa"
          : transaction.issuer_bin?.slice(0, 1) === "5"
            ? "mastercard"
            : transaction.issuer_bin?.slice(0, 2) === "34" ||
                transaction.issuer_bin?.slice(0, 2) === "37"
              ? "amex"
              : transaction.issuer_bin?.slice(0, 1) === "6"
                ? "discover"
                : "other";

      const existing = brandStats.get(brand) || {
        brand,
        total_transactions: 0,
        approved_transactions: 0,
        declined_transactions: 0,
        approval_rate: 0,
        revenue_cents: 0,
      };

      existing.total_transactions++;
      if (transaction.status === "approved") {
        existing.approved_transactions++;
        existing.revenue_cents += transaction.amount_cents || 0;
      } else {
        existing.declined_transactions++;
      }

      brandStats.set(brand, existing);
    });

    return Array.from(brandStats.values())
      .map((stats: any) => ({
        ...stats,
        approval_rate:
          stats.total_transactions > 0
            ? Math.round(
                (stats.approved_transactions / stats.total_transactions) *
                  10000,
              ) / 100
            : 0,
      }))
      .sort((a, b) => b.total_transactions - a.total_transactions);
  }

  /**
   * Get time-based analytics (hourly, daily, weekly patterns)
   */
  async getTimeBasedAnalytics(filter: AnalyticsFilter = {}): Promise<any> {
    const transactions = await this.getFilteredTransactions(filter);

    const hourlyStats = new Array(24).fill(0).map((_, hour) => ({
      hour,
      total: 0,
      approved: 0,
      approval_rate: 0,
    }));

    const dailyStats = new Map();

    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.created_at);
      const hour = date.getHours();
      const day = date.toISOString().split("T")[0];

      // Hourly stats
      hourlyStats[hour].total++;
      if (transaction.status === "approved") {
        hourlyStats[hour].approved++;
      }

      // Daily stats
      const dayStats = dailyStats.get(day) || {
        date: day,
        total: 0,
        approved: 0,
        revenue_cents: 0,
      };
      dayStats.total++;
      if (transaction.status === "approved") {
        dayStats.approved++;
        dayStats.revenue_cents += transaction.amount_cents || 0;
      }
      dailyStats.set(day, dayStats);
    });

    // Calculate approval rates
    hourlyStats.forEach((stat) => {
      stat.approval_rate =
        stat.total > 0
          ? Math.round((stat.approved / stat.total) * 10000) / 100
          : 0;
    });

    const dailyStatsArray = Array.from(dailyStats.values())
      .map((stat: any) => ({
        ...stat,
        approval_rate:
          stat.total > 0
            ? Math.round((stat.approved / stat.total) * 10000) / 100
            : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      hourly: hourlyStats,
      daily: dailyStatsArray,
    };
  }

  /**
   * Get descriptor performance analysis
   */
  async getDescriptorAnalysis(filter: AnalyticsFilter = {}): Promise<any[]> {
    const transactions = await this.getFilteredTransactions(filter);
    const descriptorStats = new Map();

    transactions.forEach((transaction: any) => {
      const descriptor = transaction.descriptor || "Unknown";
      const existing = descriptorStats.get(descriptor) || {
        descriptor,
        total_transactions: 0,
        approved_transactions: 0,
        approval_rate: 0,
        avg_retry_attempt: 0,
        total_retry_attempts: 0,
      };

      existing.total_transactions++;
      existing.total_retry_attempts += transaction.retry_attempt || 0;

      if (transaction.status === "approved") {
        existing.approved_transactions++;
      }

      descriptorStats.set(descriptor, existing);
    });

    return Array.from(descriptorStats.values())
      .map((stats: any) => ({
        ...stats,
        approval_rate:
          stats.total_transactions > 0
            ? Math.round(
                (stats.approved_transactions / stats.total_transactions) *
                  10000,
              ) / 100
            : 0,
        avg_retry_attempt:
          stats.total_transactions > 0
            ? Math.round(
                (stats.total_retry_attempts / stats.total_transactions) * 100,
              ) / 100
            : 0,
      }))
      .sort((a, b) => b.total_transactions - a.total_transactions);
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(filter: AnalyticsFilter = {}): Promise<any> {
    const approvedTransactions = await this.getFilteredTransactions({
      ...filter,
      status: "approved",
    });

    const totalRevenue = approvedTransactions.reduce(
      (sum: number, t: any) => sum + (t.amount_cents || 0),
      0,
    );

    const subscriptions = await getConvexClient().queryRecords("subscriptions", {
      status: "active",
    });

    const mrr = subscriptions
      .filter((s: any) => s.interval === "monthly")
      .reduce((sum: number, s: any) => sum + (s.amount_cents || 0), 0);

    const arr = subscriptions
      .filter((s: any) => s.interval === "yearly")
      .reduce((sum: number, s: any) => sum + (s.amount_cents || 0), 0);

    return {
      total_revenue_cents: totalRevenue,
      mrr_cents: mrr,
      arr_cents: arr,
      average_transaction_cents:
        approvedTransactions.length > 0
          ? Math.round(totalRevenue / approvedTransactions.length)
          : 0,
      transaction_count: approvedTransactions.length,
      active_subscriptions: subscriptions.length,
    };
  }

  /**
   * Helper method to get filtered transactions
   */
  private async getFilteredTransactions(filter: any = {}): Promise<any[]> {
    try {
      // Build query based on filter
      const query: any = {};

      if (filter.start_date) {
        query.created_at = query.created_at || {};
        query.created_at[">="] = filter.start_date;
      }

      if (filter.end_date) {
        query.created_at = query.created_at || {};
        query.created_at["<="] = filter.end_date;
      }

      if (filter.status) {
        query.status = filter.status;
      }

      if (filter.response_code) {
        query.response_code = filter.response_code;
      }

      if (filter.retry_attempt !== undefined) {
        query.retry_attempt = filter.retry_attempt;
      }

      return await getConvexClient().queryRecords("transactions", query);
    } catch (error) {
      console.error("Error fetching filtered transactions:", error);
      return [];
    }
  }
}

const analyticsEngine = new BillingAnalyticsEngine();

/**
 * Get comprehensive billing dashboard analytics
 */
router.get("/dashboard", async (req, res) => {
  try {
    const { start_date, end_date, card_brand, response_code } =
      req.query as AnalyticsFilter;

    const filter: AnalyticsFilter = {
      start_date:
        start_date ||
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end_date: end_date || new Date().toISOString(),
      card_brand,
      response_code,
    };

    console.log("📊 Generating billing dashboard analytics...", filter);

    const [
      approvalRate,
      declineDistribution,
      retryRates,
      cardBrandAnalysis,
      revenueAnalytics,
      timeAnalytics,
    ] = await Promise.all([
      analyticsEngine.getApprovalRate(filter),
      analyticsEngine.getDeclineReasonDistribution(filter),
      analyticsEngine.getRetrySuccessRates(filter),
      analyticsEngine.getCardBrandAnalysis(filter),
      analyticsEngine.getRevenueAnalytics(filter),
      analyticsEngine.getTimeBasedAnalytics(filter),
    ]);

    const dashboard = {
      period: {
        start_date: filter.start_date,
        end_date: filter.end_date,
      },
      kpis: {
        approval_rate: approvalRate,
        mrr_cents: revenueAnalytics.mrr_cents,
        total_revenue_cents: revenueAnalytics.total_revenue_cents,
        active_subscriptions: revenueAnalytics.active_subscriptions,
        transaction_count: revenueAnalytics.transaction_count,
      },
      decline_insights: {
        distribution: declineDistribution.slice(0, 10), // Top 10 decline reasons
        retry_success_rates: retryRates,
      },
      performance: {
        by_card_brand: cardBrandAnalysis,
        by_time: timeAnalytics,
      },
    };

    console.log("✅ Dashboard analytics generated successfully");

    res.json({
      success: true,
      dashboard: dashboard,
    });
  } catch (error: any) {
    console.error("💥 Error generating dashboard analytics:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get detailed decline insights with filtering
 */
router.get("/decline-insights", async (req, res) => {
  try {
    const filter = req.query as AnalyticsFilter;

    const [declineDistribution, cardBrandAnalysis, descriptorAnalysis] =
      await Promise.all([
        analyticsEngine.getDeclineReasonDistribution(filter),
        analyticsEngine.getCardBrandAnalysis(filter),
        analyticsEngine.getDescriptorAnalysis(filter),
      ]);

    // Get decline trends over time
    const declineInsights = await getConvexClient().queryRecords("decline_insights", {
      date: {
        ">=":
          filter.start_date ||
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        "<=": filter.end_date || new Date().toISOString(),
      },
    });

    res.json({
      success: true,
      insights: {
        decline_distribution: declineDistribution,
        card_brand_performance: cardBrandAnalysis.filter(
          (brand) => brand.declined_transactions > 0,
        ),
        descriptor_performance: descriptorAnalysis,
        historical_trends: declineInsights,
        recommendations: generateDeclineRecommendations(
          declineDistribution,
          cardBrandAnalysis,
        ),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get retry analytics and optimization insights
 */
router.get("/retry-analytics", async (req, res) => {
  try {
    const filter = req.query as AnalyticsFilter;

    const retrySuccessRates =
      await analyticsEngine.getRetrySuccessRates(filter);
    const retrySchedules = await getConvexClient().queryRecords("retry_schedule", {
      created_at: {
        ">=":
          filter.start_date ||
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    // Analyze retry timing effectiveness
    const retryTimingAnalysis = analyzeRetryTiming(retrySchedules);

    res.json({
      success: true,
      retry_analytics: {
        success_rates: retrySuccessRates,
        timing_analysis: retryTimingAnalysis,
        total_retries: retrySchedules.length,
        pending_retries: retrySchedules.filter(
          (r: any) => r.status === "pending",
        ).length,
        retry_recommendations: generateRetryRecommendations(
          retrySuccessRates,
          retryTimingAnalysis,
        ),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get real-time monitoring data
 */
router.get("/real-time", async (req, res) => {
  try {
    const last24Hours = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const recentTransactions = await getConvexClient().queryRecords("transactions", {
      created_at: { ">=": last24Hours },
    });

    const currentStats = {
      last_24h: {
        total_transactions: recentTransactions.length,
        approval_rate:
          recentTransactions.length > 0
            ? Math.round(
                (recentTransactions.filter((t: any) => t.status === "approved")
                  .length /
                  recentTransactions.length) *
                  10000,
              ) / 100
            : 0,
        revenue_cents: recentTransactions
          .filter((t: any) => t.status === "approved")
          .reduce((sum: number, t: any) => sum + (t.amount_cents || 0), 0),
      },
      recent_activity: recentTransactions
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 10)
        .map((t: any) => ({
          id: t.id,
          status: t.status,
          amount_cents: t.amount_cents,
          response_text: t.response_text,
          created_at: t.created_at,
        })),
    };

    res.json({
      success: true,
      real_time: currentStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Helper functions
function generateDeclineRecommendations(
  declineDistribution: any[],
  cardBrandAnalysis: any[],
): string[] {
  const recommendations = [];

  // High "Do Not Honor" rates
  const doNotHonor = declineDistribution.find((d) => d.response_code === "05");
  if (doNotHonor && doNotHonor.percentage > 20) {
    recommendations.push(
      'Consider implementing descriptor variation for "Do Not Honor" declines to reduce issuer soft blocks',
    );
  }

  // High insufficient funds
  const insufficientFunds = declineDistribution.find(
    (d) => d.response_code === "51",
  );
  if (insufficientFunds && insufficientFunds.percentage > 15) {
    recommendations.push(
      "Implement intelligent retry timing for insufficient funds - retry during different times of day",
    );
  }

  // Expired card issues
  const expiredCard = declineDistribution.find((d) => d.response_code === "54");
  if (expiredCard && expiredCard.percentage > 5) {
    recommendations.push(
      "Enable Automatic Card Updater to reduce expired card declines",
    );
  }

  // Card brand specific issues
  const visaPerformance = cardBrandAnalysis.find((b) => b.brand === "visa");
  if (visaPerformance && visaPerformance.approval_rate < 90) {
    recommendations.push(
      "Consider Network Tokenization for Visa cards to improve approval rates",
    );
  }

  return recommendations;
}

function generateRetryRecommendations(
  retryRates: any,
  timingAnalysis: any,
): string[] {
  const recommendations = [];

  if (retryRates.retry_1.rate < 60) {
    recommendations.push(
      "First retry success rate is low - consider adjusting initial retry timing",
    );
  }

  if (retryRates.retry_3.rate < 30) {
    recommendations.push(
      "Final retry success rate is low - implement descriptor variation for last attempt",
    );
  }

  if (timingAnalysis.avg_hours_to_first_retry > 24) {
    recommendations.push(
      "Consider shorter initial retry timing for better recovery rates",
    );
  }

  return recommendations;
}

function analyzeRetryTiming(retrySchedules: any[]): any {
  // Analyze timing patterns in retry schedules
  const timingData = {
    avg_hours_to_first_retry: 0,
    retry_distribution_by_hour: new Array(24).fill(0),
    success_rate_by_timing: {},
  };

  // This would involve more complex analysis in a real implementation
  // For now, return mock data
  timingData.avg_hours_to_first_retry = 18.5;

  return timingData;
}

export default router;

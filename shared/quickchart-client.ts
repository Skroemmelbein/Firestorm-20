interface QuickChartConfig {
  baseUrl: string;
  apiKey?: string;
}

export interface ChartConfig {
  type: "line" | "bar" | "pie" | "doughnut" | "radar" | "polarArea" | "scatter";
  data: {
    labels?: string[];
    datasets: Array<{
      label?: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      fill?: boolean;
    }>;
  };
  options?: {
    responsive?: boolean;
    plugins?: {
      title?: {
        display: boolean;
        text: string;
      };
      legend?: {
        display: boolean;
        position?: "top" | "bottom" | "left" | "right";
      };
    };
    scales?: {
      x?: {
        display: boolean;
        title?: {
          display: boolean;
          text: string;
        };
      };
      y?: {
        display: boolean;
        title?: {
          display: boolean;
          text: string;
        };
      };
    };
  };
}

export class QuickChartClient {
  private config: QuickChartConfig;

  constructor(config: QuickChartConfig) {
    this.config = config;
  }

  generateChartUrl(chartConfig: ChartConfig, width: number = 500, height: number = 300): string {
    const params = new URLSearchParams({
      chart: JSON.stringify(chartConfig),
      width: width.toString(),
      height: height.toString(),
      format: "png",
    });

    if (this.config.apiKey) {
      params.append("key", this.config.apiKey);
    }

    return `${this.config.baseUrl}/chart?${params.toString()}`;
  }

  async generateChart(
    chartConfig: ChartConfig,
    width: number = 500,
    height: number = 300
  ): Promise<Buffer> {
    const url = this.generateChartUrl(chartConfig, width, height);
    
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`QuickChart API Error ${response.status}: ${await response.text()}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  createAnalyticsChart(
    title: string,
    labels: string[],
    datasets: Array<{
      label: string;
      data: number[];
      color: string;
    }>
  ): ChartConfig {
    return {
      type: "line",
      data: {
        labels,
        datasets: datasets.map((dataset) => ({
          label: dataset.label,
          data: dataset.data,
          borderColor: dataset.color,
          backgroundColor: dataset.color + "20",
          borderWidth: 2,
          fill: false,
        })),
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title,
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Time",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Value",
            },
          },
        },
      },
    };
  }

  createBounceRateChart(
    bounceRates: Array<{ date: string; rate: number }>
  ): ChartConfig {
    return this.createAnalyticsChart(
      "Email Bounce Rate Over Time",
      bounceRates.map((br) => br.date),
      [
        {
          label: "Bounce Rate (%)",
          data: bounceRates.map((br) => br.rate),
          color: "#ff6384",
        },
      ]
    );
  }

  createDeliveryChart(
    deliveryStats: Array<{ date: string; delivered: number; failed: number }>
  ): ChartConfig {
    return {
      type: "bar",
      data: {
        labels: deliveryStats.map((ds) => ds.date),
        datasets: [
          {
            label: "Delivered",
            data: deliveryStats.map((ds) => ds.delivered),
            backgroundColor: "#36a2eb",
          },
          {
            label: "Failed",
            data: deliveryStats.map((ds) => ds.failed),
            backgroundColor: "#ff6384",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: "Message Delivery Statistics",
          },
          legend: {
            display: true,
            position: "top",
          },
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "Count",
            },
          },
        },
      },
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      const testChart: ChartConfig = {
        type: "bar",
        data: {
          labels: ["Test"],
          datasets: [
            {
              label: "Test Data",
              data: [1],
              backgroundColor: "#36a2eb",
            },
          ],
        },
      };

      const url = this.generateChartUrl(testChart, 100, 100);
      const fetch = (await import("node-fetch")).default;
      const response = await fetch(url);
      return response.ok;
    } catch (error) {
      console.error("QuickChart health check failed:", error);
      return false;
    }
  }
}

let quickChartClient: QuickChartClient | null = null;

export function initializeQuickChart(config: QuickChartConfig): QuickChartClient {
  quickChartClient = new QuickChartClient(config);
  return quickChartClient;
}

export function getQuickChartClient(): QuickChartClient {
  if (!quickChartClient) {
    throw new Error(
      "QuickChart client not initialized. Please configure QuickChart credentials first."
    );
  }
  return quickChartClient;
}

export default QuickChartClient;

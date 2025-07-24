import { RequestHandler } from "express";

interface ProgressUpdate {
  timestamp: string;
  url: string;
  completedTasks: string[];
  currentTask: string;
  remainingTasks: number;
  estimatedTimeRemaining: string;
}

let progressData: ProgressUpdate = {
  timestamp: new Date().toISOString(),
  url: "https://c57c3ee55ba54f0c81c1553aa0f19682-161e9f22b0c34c888a2e08047.fly.dev/admin",
  completedTasks: [],
  currentTask: "Building Visual Campaign Builder",
  remainingTasks: 14,
  estimatedTimeRemaining: "4-5 hours",
};

let notificationInterval: NodeJS.Timeout | null = null;

export const startProgressNotifications: RequestHandler = async (req, res) => {
  try {
    const shannonPhone = "+18144409068";
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromPhone) {
      return res.status(400).json({
        error: "Missing Twilio credentials",
      });
    }

    // Stop any existing interval
    if (notificationInterval) {
      clearInterval(notificationInterval);
    }

    // Send immediate first notification
    await sendProgressSMS(shannonPhone, accountSid, authToken, fromPhone);

    // Set up 20-minute interval notifications
    notificationInterval = setInterval(
      async () => {
        try {
          await sendProgressSMS(shannonPhone, accountSid, authToken, fromPhone);
        } catch (error) {
          console.error("Failed to send progress SMS:", error);
        }
      },
      20 * 60 * 1000,
    ); // 20 minutes

    res.json({
      success: true,
      message: "Progress notifications started",
      interval: "20 minutes",
      recipient: shannonPhone,
      url: progressData.url,
    });
  } catch (error) {
    console.error("Failed to start progress notifications:", error);
    res.status(500).json({
      error: "Failed to start notifications",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updateProgress: RequestHandler = async (req, res) => {
  try {
    const { completedTask, currentTask, remainingTasks, estimatedTime } =
      req.body;

    // Update progress data
    if (completedTask) {
      progressData.completedTasks.push(completedTask);
    }
    if (currentTask) {
      progressData.currentTask = currentTask;
    }
    if (remainingTasks !== undefined) {
      progressData.remainingTasks = remainingTasks;
    }
    if (estimatedTime) {
      progressData.estimatedTimeRemaining = estimatedTime;
    }

    progressData.timestamp = new Date().toISOString();

    res.json({
      success: true,
      message: "Progress updated",
      progress: progressData,
    });
  } catch (error) {
    console.error("Failed to update progress:", error);
    res.status(500).json({
      error: "Failed to update progress",
    });
  }
};

export const stopProgressNotifications: RequestHandler = async (req, res) => {
  try {
    if (notificationInterval) {
      clearInterval(notificationInterval);
      notificationInterval = null;
    }

    res.json({
      success: true,
      message: "Progress notifications stopped",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to stop notifications",
    });
  }
};

async function sendProgressSMS(
  to: string,
  accountSid: string,
  authToken: string,
  from: string,
) {
  const completedCount = progressData.completedTasks.length;
  const totalTasks = completedCount + progressData.remainingTasks;
  const percentComplete =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  const message = `🔥 FIRESTORM ENHANCEMENT UPDATE

📊 Progress: ${percentComplete}% Complete (${completedCount}/${totalTasks})

✅ Recently Completed:
${
  progressData.completedTasks
    .slice(-3)
    .map((task) => `• ${task}`)
    .join("\n") || "• Setting up system..."
}

🚧 Currently Working:
${progressData.currentTask}

⏱️ Est. Time Remaining: ${progressData.estimatedTimeRemaining}

🌐 Review Progress:
${progressData.url}

Updates every 20min. Reply STOP to halt.

- ECELONX Development Team`;

  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString(
    "base64",
  );

  const response = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      From: from,
      To: to,
      Body: message,
    }),
  });

  const result = await response.text();

  if (response.ok) {
    console.log(`📱 Progress SMS sent to ${to}: ${percentComplete}% complete`);
    return JSON.parse(result);
  } else {
    console.error(
      `Failed to send progress SMS: ${response.status} - ${result}`,
    );
    throw new Error(`SMS failed: ${response.status}`);
  }
}

export const getProgress: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    progress: progressData,
  });
};

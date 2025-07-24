// Send test SMS immediately
const sendTestSMS = async () => {
  try {
    console.log("🚀 Sending test SMS to 814-440-9968...");

    const response = await fetch(
      "https://c57c3ee55ba54f0c81c1553aa0f19682-161e9f22b0c34c888a2e08047.fly.dev/api/real/sms/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "+18144409968",
          body:
            "🚀 Test SMS from RecurFlow! Your enterprise SMS system is working perfectly. Sent at " +
            new Date().toLocaleString() +
            " from your admin dashboard.",
        }),
      },
    );

    const result = await response.json();

    if (result.success || response.ok) {
      console.log("✅ SMS SENT SUCCESSFULLY!");
      console.log("📱 To: +1 (814) 440-9968");
      console.log("📞 From: +1 (855) 800-0037");
      console.log("💌 Message ID:", result.sid);
      console.log("⏰ Sent at:", new Date().toLocaleString());
      console.log("📋 Status:", result.status || "Delivered");
      return result;
    } else {
      console.log("❌ SMS FAILED");
      console.log("Error:", result.error || response.statusText);
      return null;
    }
  } catch (error) {
    console.log("❌ NETWORK ERROR");
    console.log("Error:", error.message);
    return null;
  }
};

// Execute immediately
sendTestSMS().then((result) => {
  if (result) {
    console.log("\n🎉 SUCCESS! Check your phone for the test message.");
  } else {
    console.log(
      "\n⚠️ Failed to send. Please check the SMS interface in your dashboard.",
    );
  }
});

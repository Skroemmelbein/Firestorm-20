// Send test SMS immediately
const sendTestSMS = async () => {
  try {
    console.log("🚀 Sending test SMS to 1-814-440-9068...");

    const response = await fetch(
      "http://localhost:5000/api/real/sms/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "+18144409068",
          body:
            "🚀 Test SMS from ECHELONX! System check at " +
            new Date().toLocaleString() +
            " from your admin dashboard.",
        }),
      },
    );

    const result = await response.json();

    if (result.success || response.ok) {
      console.log("✅ SMS SENT SUCCESSFULLY!");
      console.log("📱 To: +1 (814) 440-9068");
      console.log("💌 Message ID:", result.sid);
      console.log("⏰ Sent at:", new Date().toLocaleString());
      console.log("📋 Status:", result.status || "Sent");
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

// Quick SMS test to 8144409968
const testSMS = async () => {
  try {
    const response = await fetch("http://localhost:8080/api/real/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "+18144409968",
        body:
          "🚀 Test SMS from RecurFlow! Your marketing automation system is working perfectly. Sent at " +
          new Date().toLocaleTimeString(),
      }),
    });

    const result = await response.json();
    console.log("SMS Result:", result);

    if (result.success) {
      console.log("✅ SMS sent successfully!");
      console.log("Message ID:", result.sid);
      console.log("From:", result.from);
      console.log("To:", result.to);
    } else {
      console.log("❌ SMS failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }
};

// Run the test
testSMS();

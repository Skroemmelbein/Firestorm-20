// Quick SMS test to 1-814-440-9068
const testSMS = async () => {
  try {
    const response = await fetch("http://localhost:5000/api/real/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "+18144409068",
        body:
          "🚀 Test SMS from ECHELONX! System check at " +
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

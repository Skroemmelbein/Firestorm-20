import express from "express";

const router = express.Router();

// Rate limiting for NMI requests
const rateLimiter = {
  lastRequest: 0,
  minInterval: 10000, // 10 seconds between requests
  failureCount: 0,
  backoffTime: 0,

  canMakeRequest(): { allowed: boolean; waitTime: number } {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;

    // If we have failures, implement exponential backoff
    if (this.failureCount > 0) {
      const backoffMinutes = Math.min(this.failureCount * 5, 30); // Max 30 minutes
      this.backoffTime = backoffMinutes * 60 * 1000;

      if (timeSinceLastRequest < this.backoffTime) {
        return {
          allowed: false,
          waitTime: this.backoffTime - timeSinceLastRequest,
        };
      }
    }

    // Standard rate limiting
    if (timeSinceLastRequest < this.minInterval) {
      return {
        allowed: false,
        waitTime: this.minInterval - timeSinceLastRequest,
      };
    }

    return { allowed: true, waitTime: 0 };
  },

  recordRequest() {
    this.lastRequest = Date.now();
  },

  recordFailure() {
    this.failureCount++;
  },

  recordSuccess() {
    this.failureCount = Math.max(0, this.failureCount - 1);
  },
};

// NMI Configuration
const NMI_CONFIG = {
  gatewayUrl:
    process.env.NMI_GATEWAY_URL || "https://secure.nmi.com/api/transact.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD,
  apiKey: process.env.NMI_API_KEY,
};

interface TestPaymentRequest {
  amount: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentMethod: {
    type: "credit_card" | "bank_account";
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
  };
}

/**
 * Validate NMI connection without processing a transaction
 */
router.post("/test-connection", async (req, res) => {
  try {
    const { username, password, gatewayUrl } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    // Check rate limiting
    const rateLimitCheck = rateLimiter.canMakeRequest();
    if (!rateLimitCheck.allowed) {
      const waitMinutes = Math.ceil(rateLimitCheck.waitTime / 60000);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please wait ${waitMinutes} minute(s) before trying again.`,
        waitTime: rateLimitCheck.waitTime,
        retryAfter: new Date(
          Date.now() + rateLimitCheck.waitTime,
        ).toISOString(),
      });
    }

    // Prepare minimal validation request
    const params = new URLSearchParams({
      username: username,
      password: password,
      type: "validate",
      amount: "0.00",
    });

    console.log("🔍 Testing NMI connection validation...");
    rateLimiter.recordRequest();

    const response = await fetch(gatewayUrl || NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ECELONX-Validation/1.0",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      rateLimiter.recordFailure();
      throw new Error(
        `NMI API returned ${response.status}: ${response.statusText}`,
      );
    }

    const responseText = await response.text();
    const resultParams = new URLSearchParams(responseText);
    const responseCode = resultParams.get("response");
    const responseTextValue = resultParams.get("responsetext") || "";

    console.log("📝 NMI Connection Response:", responseText);

    // Check for specific error conditions
    if (
      responseTextValue.toLowerCase().includes("activity limit exceeded") ||
      responseCode === "203"
    ) {
      rateLimiter.recordFailure();
      return res.status(429).json({
        success: false,
        message: "NMI Activity Limit Exceeded",
        suggestion:
          "Your NMI account has reached its activity limit. Please wait 30 minutes or contact NMI support to increase limits.",
        waitTime: 30 * 60 * 1000, // 30 minutes
        nmi_response: {
          code: responseCode,
          text: responseTextValue,
        },
      });
    }

    if (
      responseTextValue.toLowerCase().includes("invalid") &&
      responseTextValue.toLowerCase().includes("login")
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid NMI Credentials",
        suggestion: "Please check your NMI username and password.",
        nmi_response: {
          code: responseCode,
          text: responseTextValue,
        },
      });
    }

    // Connection successful
    rateLimiter.recordSuccess();
    res.json({
      success: true,
      message: "NMI connection validated successfully",
      nmi_response: {
        code: responseCode,
        text: responseTextValue,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("💥 NMI connection test error:", error);
    rateLimiter.recordFailure();

    res.status(500).json({
      success: false,
      message: error.message || "Connection test failed",
      error: error.toString(),
    });
  }
});

/**
 * Process a test payment transaction
 */
router.post("/test-payment", async (req, res) => {
  try {
    const { amount, customer, paymentMethod }: TestPaymentRequest = req.body;

    // Check rate limiting first
    const rateLimitCheck = rateLimiter.canMakeRequest();
    if (!rateLimitCheck.allowed) {
      const waitMinutes = Math.ceil(rateLimitCheck.waitTime / 60000);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please wait ${waitMinutes} minute(s) before trying again.`,
        suggestion:
          "Too many requests to NMI. This helps prevent activity limit errors.",
        waitTime: rateLimitCheck.waitTime,
        retryAfter: new Date(
          Date.now() + rateLimitCheck.waitTime,
        ).toISOString(),
      });
    }

    // Validate request
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    if (!customer.email || !paymentMethod.cardNumber) {
      return res.status(400).json({
        success: false,
        message: "Missing required customer or payment information",
      });
    }

    // Prepare NMI transaction parameters
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      type: "sale",
      amount: amount.toFixed(2),

      // Customer information
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email,
      phone: customer.phone,

      // Payment method
      ccnumber: paymentMethod.cardNumber!,
      ccexp: `${paymentMethod.expiryMonth}${paymentMethod.expiryYear}`,
      cvv: paymentMethod.cvv!,

      // Test transaction markers
      orderid: `TEST_${Date.now()}`,
      orderdescription: `NMI Test Transaction - $${amount}`,

      // Additional settings
      currency: "USD",
      test_mode: "1", // Enable test mode
    });

    console.log("🧪 Processing NMI test payment:", {
      amount: amount,
      customer: customer.email,
      cardLast4: paymentMethod.cardNumber?.slice(-4),
    });

    // Record the request for rate limiting
    rateLimiter.recordRequest();

    // Send request to NMI
    const response = await fetch(NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ECELONX-Test/1.0",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      rateLimiter.recordFailure();
      throw new Error(
        `NMI API returned ${response.status}: ${response.statusText}`,
      );
    }

    const responseText = await response.text();
    const resultParams = new URLSearchParams(responseText);

    console.log("📝 NMI Response:", responseText);

    // Parse NMI response
    const responseCode = resultParams.get("response");
    const isSuccess = responseCode === "1";

    const result = {
      success: isSuccess,
      transactionId: resultParams.get("transactionid"),
      authCode: resultParams.get("authcode"),
      responseCode: responseCode,
      responseText: resultParams.get("responsetext"),
      avsResponse: resultParams.get("avsresponse"),
      cvvResponse: resultParams.get("cvvresponse"),
      amount: amount,
      currency: "USD",
      timestamp: new Date().toISOString(),
      testMode: true,

      // Raw response for debugging
      rawResponse: responseText,
    };

    if (isSuccess) {
      console.log("✅ Test payment successful:", result.transactionId);
      rateLimiter.recordSuccess();

      // Log successful test transaction
      res.json({
        success: true,
        message: "Test payment processed successfully",
        transaction: result,
      });
    } else {
      console.log("❌ Test payment failed:", result.responseText);

      // Handle specific NMI error cases
      let errorMessage = result.responseText || "Payment declined";
      let suggestion = "";
      let statusCode = 400;

      if (
        result.responseText
          ?.toLowerCase()
          .includes("activity limit exceeded") ||
        result.responseCode === "203"
      ) {
        rateLimiter.recordFailure();
        errorMessage = "NMI Activity Limit Exceeded";
        suggestion =
          "Your NMI account has reached its activity limit. Please wait 30 minutes or contact NMI support to increase limits.";
        statusCode = 429;
      } else if (
        result.responseText?.toLowerCase().includes("invalid credentials") ||
        result.responseText?.toLowerCase().includes("invalid login")
      ) {
        errorMessage = "Invalid NMI Credentials";
        suggestion =
          "Check your NMI username and password in the configuration.";
        statusCode = 401;
      } else if (result.responseText?.toLowerCase().includes("invalid card")) {
        errorMessage = "Invalid Test Card";
        suggestion =
          "The test card number may not be valid for your NMI configuration.";
      } else {
        // Other failures might be temporary, so record for backoff
        rateLimiter.recordFailure();
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        suggestion: suggestion,
        transaction: result,
        nmi_response: {
          code: result.responseCode,
          text: result.responseText,
          transaction_id: result.transactionId,
        },
      });
    }
  } catch (error: any) {
    console.error("💥 NMI test payment error:", error);
    rateLimiter.recordFailure();

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error processing test payment",
      error: error.toString(),
    });
  }
});

/**
 * Get rate limiter status
 */
router.get("/rate-limit-status", (req, res) => {
  const rateLimitCheck = rateLimiter.canMakeRequest();

  res.json({
    success: true,
    canMakeRequest: rateLimitCheck.allowed,
    waitTime: rateLimitCheck.waitTime,
    failureCount: rateLimiter.failureCount,
    nextAvailableTime: rateLimitCheck.allowed
      ? null
      : new Date(Date.now() + rateLimitCheck.waitTime).toISOString(),
    minInterval: rateLimiter.minInterval,
  });
});

/**
 * Validate test card numbers
 */
router.post("/validate-test-card", async (req, res) => {
  try {
    const { cardNumber } = req.body;

    // Common test card numbers for different scenarios
    const testCards = {
      "4111111111111111": { type: "Visa", result: "Approved" },
      "4000000000000002": { type: "Visa", result: "Declined" },
      "4000000000000069": { type: "Visa", result: "CVV Fail" },
      "4000000000000127": { type: "Visa", result: "AVS Fail" },
      "5555555555554444": { type: "MasterCard", result: "Approved" },
      "5105105105105100": { type: "MasterCard", result: "Approved" },
      "378282246310005": { type: "American Express", result: "Approved" },
      "6011111111111117": { type: "Discover", result: "Approved" },
    };

    const cardInfo = testCards[cardNumber as keyof typeof testCards];

    if (cardInfo) {
      res.json({
        success: true,
        isTestCard: true,
        cardType: cardInfo.type,
        expectedResult: cardInfo.result,
      });
    } else {
      res.json({
        success: true,
        isTestCard: false,
        message:
          "This appears to be a real card number - use test cards for testing",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get test transaction history
 */
router.get("/test-transactions", async (req, res) => {
  try {
    // In a real implementation, this would query a database
    // For now, return mock test transaction data
    const testTransactions = [
      {
        id: "TEST_001",
        amount: 1.0,
        status: "approved",
        timestamp: new Date().toISOString(),
        cardLast4: "1111",
        customer: "test@ecelonx.com",
      },
    ];

    res.json({
      success: true,
      transactions: testTransactions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;

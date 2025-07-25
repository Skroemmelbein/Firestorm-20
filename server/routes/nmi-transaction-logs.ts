import express from "express";

const router = express.Router();

// NMI Configuration
const NMI_CONFIG = {
  gatewayUrl:
    process.env.NMI_API_URL ||
    "https://secure.networkmerchants.com/api/transact.php",
  queryUrl: "https://secure.networkmerchants.com/api/query.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD,
  apiKey: process.env.NMI_API_KEY,
};

interface TransactionQuery {
  start_date?: string;
  end_date?: string;
  transaction_id?: string;
  customer_vault_id?: string;
  order_id?: string;
  amount?: string;
  limit?: number;
}

/**
 * Get transaction logs from NMI
 */
router.post("/get-transaction-logs", async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      transaction_id,
      customer_vault_id,
      order_id,
      amount,
      limit = 100,
    }: TransactionQuery = req.body;

    console.log("📋 Fetching NMI transaction logs...", req.body);

    // Build NMI query parameters
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      report_type: "transaction_log",
    });

    // Add optional filters
    if (start_date) params.append("start_date", start_date);
    if (end_date) params.append("end_date", end_date);
    if (transaction_id) params.append("transaction_id", transaction_id);
    if (customer_vault_id)
      params.append("customer_vault_id", customer_vault_id);
    if (order_id) params.append("order_id", order_id);
    if (amount) params.append("amount", amount);

    // Set response format
    params.append("format", "json");
    params.append("limit", limit.toString());

    console.log("📤 Sending NMI query request...");

    const response = await fetch(NMI_CONFIG.queryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "ECELONX-TransactionQuery/1.0",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(
        `NMI API returned ${response.status}: ${response.statusText}`,
      );
    }

    const responseText = await response.text();
    console.log(
      "📥 NMI Response received:",
      responseText.substring(0, 200) + "...",
    );

    // Try to parse as JSON first, then fall back to URL params
    let transactions = [];
    try {
      const jsonResponse = JSON.parse(responseText);
      transactions = jsonResponse.transactions || jsonResponse;
    } catch (jsonError) {
      // Parse as URL-encoded response
      const resultParams = new URLSearchParams(responseText);

      if (resultParams.get("response") === "1") {
        // Parse transaction data from response
        transactions = parseNMITransactionResponse(resultParams);
      } else {
        throw new Error(resultParams.get("responsetext") || "Query failed");
      }
    }

    console.log(`✅ Retrieved ${transactions.length} transactions from NMI`);

    // Enhanced transaction data
    const enhancedTransactions = transactions.map((transaction: any) => ({
      ...transaction,
      // Standardize field names
      transaction_id: transaction.transactionid || transaction.transaction_id,
      order_id: transaction.orderid || transaction.order_id,
      amount_cents: Math.round(parseFloat(transaction.amount || "0") * 100),
      formatted_amount: `$${parseFloat(transaction.amount || "0").toFixed(2)}`,
      formatted_date: transaction.time
        ? new Date(transaction.time).toLocaleString()
        : "Unknown",

      // Add response categorization
      response_category: categorizeNMIResponse(
        transaction.response || transaction.response_code,
      ),
      is_approved: (transaction.response || transaction.response_code) === "1",

      // Add card info if available
      card_type:
        transaction.cc_type || getCardTypeFromNumber(transaction.cc_number),
      card_last_four: transaction.cc_number
        ? transaction.cc_number.slice(-4)
        : null,

      // Add processing info
      processor: "NMI",
      gateway_response: {
        response_code: transaction.response || transaction.response_code,
        response_text: transaction.responsetext || transaction.response_text,
        auth_code: transaction.authcode || transaction.auth_code,
        avs_response: transaction.avsresponse || transaction.avs_response,
        cvv_response: transaction.cvvresponse || transaction.cvv_response,
      },
    }));

    res.json({
      success: true,
      message: `Retrieved ${enhancedTransactions.length} transactions`,
      count: enhancedTransactions.length,
      transactions: enhancedTransactions,
      query_params: {
        start_date,
        end_date,
        transaction_id,
        customer_vault_id,
        order_id,
        amount,
        limit,
      },
    });
  } catch (error: any) {
    console.error("💥 Error fetching NMI transaction logs:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch transaction logs",
    });
  }
});

/**
 * Get specific transaction details
 */
router.get("/transaction/:transaction_id", async (req, res) => {
  try {
    const { transaction_id } = req.params;

    console.log(`🔍 Fetching details for transaction: ${transaction_id}`);

    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      transaction_id: transaction_id,
      report_type: "transaction_detail",
    });

    const response = await fetch(NMI_CONFIG.queryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const responseText = await response.text();
    const resultParams = new URLSearchParams(responseText);

    if (resultParams.get("response") === "1") {
      const transactionDetail = {
        transaction_id: resultParams.get("transactionid"),
        order_id: resultParams.get("orderid"),
        amount: resultParams.get("amount"),
        response_code: resultParams.get("response"),
        response_text: resultParams.get("responsetext"),
        auth_code: resultParams.get("authcode"),
        avs_response: resultParams.get("avsresponse"),
        cvv_response: resultParams.get("cvvresponse"),
        time: resultParams.get("time"),
        type: resultParams.get("type"),
        customer_vault_id: resultParams.get("customer_vault_id"),
        cc_number: resultParams.get("cc_number"),
        cc_exp: resultParams.get("cc_exp"),
        processor_id: resultParams.get("processor_id"),
        customer_info: {
          first_name: resultParams.get("first_name"),
          last_name: resultParams.get("last_name"),
          email: resultParams.get("email"),
          phone: resultParams.get("phone"),
          address: resultParams.get("address1"),
          city: resultParams.get("city"),
          state: resultParams.get("state"),
          zip: resultParams.get("zip"),
        },
      };

      res.json({
        success: true,
        transaction: transactionDetail,
      });
    } else {
      throw new Error(
        resultParams.get("responsetext") || "Transaction not found",
      );
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get transaction summary/statistics
 */
router.post("/transaction-summary", async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    // Get transactions for the period
    const transactionResponse = await fetch(
      `${req.protocol}://${req.get("host")}/api/nmi-logs/get-transaction-logs`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_date,
          end_date,
          limit: 1000, // Get more data for accurate summary
        }),
      },
    );

    const transactionData = await transactionResponse.json();

    if (!transactionData.success) {
      throw new Error("Failed to fetch transactions");
    }

    const transactions = transactionData.transactions;

    // Calculate summary statistics
    const summary = {
      total_transactions: transactions.length,
      approved_transactions: transactions.filter((t: any) => t.is_approved)
        .length,
      declined_transactions: transactions.filter((t: any) => !t.is_approved)
        .length,
      total_amount_cents: transactions
        .filter((t: any) => t.is_approved)
        .reduce((sum: number, t: any) => sum + t.amount_cents, 0),

      approval_rate: 0,
      average_transaction_cents: 0,

      // Breakdown by response code
      response_codes: {},

      // Breakdown by card type
      card_types: {},

      // Time distribution
      hourly_distribution: new Array(24).fill(0),
    };

    // Calculate rates
    if (summary.total_transactions > 0) {
      summary.approval_rate =
        Math.round(
          (summary.approved_transactions / summary.total_transactions) * 10000,
        ) / 100;
    }

    if (summary.approved_transactions > 0) {
      summary.average_transaction_cents = Math.round(
        summary.total_amount_cents / summary.approved_transactions,
      );
    }

    // Analyze response codes
    const responseCodes: Record<string, number> = {};
    const cardTypes: Record<string, number> = {};

    transactions.forEach((transaction: any) => {
      // Response codes
      const responseCode =
        transaction.gateway_response.response_code || "unknown";
      responseCodes[responseCode] = (responseCodes[responseCode] || 0) + 1;

      // Card types
      const cardType = transaction.card_type || "unknown";
      cardTypes[cardType] = (cardTypes[cardType] || 0) + 1;

      // Hourly distribution
      if (transaction.time) {
        const hour = new Date(transaction.time).getHours();
        summary.hourly_distribution[hour]++;
      }
    });

    summary.response_codes = responseCodes;
    summary.card_types = cardTypes;

    res.json({
      success: true,
      summary: summary,
      period: { start_date, end_date },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Helper functions
function parseNMITransactionResponse(params: URLSearchParams): any[] {
  const transactions = [];

  // NMI sometimes returns multiple transactions in a single response
  // Parse them by looking for numbered parameters (transaction1, transaction2, etc.)
  let i = 1;
  while (params.has(`transaction${i}_id`) || params.has(`transactionid${i}`)) {
    const transaction = {
      transactionid:
        params.get(`transaction${i}_id`) || params.get(`transactionid${i}`),
      orderid: params.get(`order${i}_id`) || params.get(`orderid${i}`),
      amount: params.get(`amount${i}`),
      response: params.get(`response${i}`),
      responsetext: params.get(`responsetext${i}`),
      authcode: params.get(`authcode${i}`),
      time: params.get(`time${i}`),
      type: params.get(`type${i}`),
    };

    transactions.push(transaction);
    i++;
  }

  // If no numbered transactions found, try to parse a single transaction
  if (transactions.length === 0 && params.get("transactionid")) {
    transactions.push({
      transactionid: params.get("transactionid"),
      orderid: params.get("orderid"),
      amount: params.get("amount"),
      response: params.get("response"),
      responsetext: params.get("responsetext"),
      authcode: params.get("authcode"),
      time: params.get("time"),
      type: params.get("type"),
    });
  }

  return transactions;
}

function categorizeNMIResponse(responseCode: string): string {
  const categories: Record<string, string> = {
    "1": "Approved",
    "2": "Declined",
    "3": "Error",
    "4": "Held for Review",
  };

  return categories[responseCode] || "Unknown";
}

function getCardTypeFromNumber(cardNumber: string): string {
  if (!cardNumber) return "unknown";

  const num = cardNumber.replace(/\D/g, "");

  if (num.startsWith("4")) return "visa";
  if (/^5[1-5]/.test(num)) return "mastercard";
  if (/^3[47]/.test(num)) return "amex";
  if (/^6/.test(num)) return "discover";

  return "unknown";
}

export default router;

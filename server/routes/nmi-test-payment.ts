import express from 'express';

const router = express.Router();

// NMI Configuration
const NMI_CONFIG = {
  gatewayUrl: process.env.NMI_GATEWAY_URL || "https://secure.nmi.com/api/transact.php",
  username: process.env.NMI_USERNAME,
  password: process.env.NMI_PASSWORD,
  apiKey: process.env.NMI_API_KEY
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
    type: 'credit_card' | 'bank_account';
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
  };
}

/**
 * Process a test payment transaction
 */
router.post('/test-payment', async (req, res) => {
  try {
    const { amount, customer, paymentMethod }: TestPaymentRequest = req.body;

    // Validate request
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    if (!customer.email || !paymentMethod.cardNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required customer or payment information'
      });
    }

    // Prepare NMI transaction parameters
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      type: 'sale',
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
      currency: 'USD',
      test_mode: '1' // Enable test mode
    });

    console.log('🧪 Processing NMI test payment:', {
      amount: amount,
      customer: customer.email,
      cardLast4: paymentMethod.cardNumber?.slice(-4)
    });

    // Send request to NMI
    const response = await fetch(NMI_CONFIG.gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'ECELONX-Test/1.0'
      },
      body: params.toString()
    });

    const responseText = await response.text();
    const resultParams = new URLSearchParams(responseText);
    
    console.log('📝 NMI Response:', responseText);

    // Parse NMI response
    const responseCode = resultParams.get('response');
    const isSuccess = responseCode === '1';
    
    const result = {
      success: isSuccess,
      transactionId: resultParams.get('transactionid'),
      authCode: resultParams.get('authcode'),
      responseCode: responseCode,
      responseText: resultParams.get('responsetext'),
      avsResponse: resultParams.get('avsresponse'),
      cvvResponse: resultParams.get('cvvresponse'),
      amount: amount,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      testMode: true,
      
      // Raw response for debugging
      rawResponse: responseText
    };

    if (isSuccess) {
      console.log('✅ Test payment successful:', result.transactionId);
      
      // Log successful test transaction
      res.json({
        success: true,
        message: 'Test payment processed successfully',
        transaction: result
      });
    } else {
      console.log('❌ Test payment failed:', result.responseText);
      
      res.status(400).json({
        success: false,
        message: result.responseText || 'Payment declined',
        transaction: result
      });
    }

  } catch (error: any) {
    console.error('💥 NMI test payment error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error processing test payment',
      error: error.toString()
    });
  }
});

/**
 * Validate test card numbers
 */
router.post('/validate-test-card', async (req, res) => {
  try {
    const { cardNumber } = req.body;
    
    // Common test card numbers for different scenarios
    const testCards = {
      '4111111111111111': { type: 'Visa', result: 'Approved' },
      '4000000000000002': { type: 'Visa', result: 'Declined' },
      '4000000000000069': { type: 'Visa', result: 'CVV Fail' },
      '4000000000000127': { type: 'Visa', result: 'AVS Fail' },
      '5555555555554444': { type: 'MasterCard', result: 'Approved' },
      '5105105105105100': { type: 'MasterCard', result: 'Approved' },
      '378282246310005': { type: 'American Express', result: 'Approved' },
      '6011111111111117': { type: 'Discover', result: 'Approved' }
    };
    
    const cardInfo = testCards[cardNumber as keyof typeof testCards];
    
    if (cardInfo) {
      res.json({
        success: true,
        isTestCard: true,
        cardType: cardInfo.type,
        expectedResult: cardInfo.result
      });
    } else {
      res.json({
        success: true,
        isTestCard: false,
        message: 'This appears to be a real card number - use test cards for testing'
      });
    }

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/**
 * Get test transaction history
 */
router.get('/test-transactions', async (req, res) => {
  try {
    // In a real implementation, this would query a database
    // For now, return mock test transaction data
    const testTransactions = [
      {
        id: 'TEST_001',
        amount: 1.00,
        status: 'approved',
        timestamp: new Date().toISOString(),
        cardLast4: '1111',
        customer: 'test@ecelonx.com'
      }
    ];

    res.json({
      success: true,
      transactions: testTransactions
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

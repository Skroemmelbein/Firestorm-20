import { VercelRequest, VercelResponse } from '@vercel/node';

const NMI_CONFIG = {
  username: process.env.NMI_USERNAME || 'wwwdpcyeahcom',
  password: process.env.NMI_PASSWORD || '!SNR96rQ9qsHdd4',
  gatewayUrl: 'https://secure.networkmerchants.com/api/transact.php'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const params = new URLSearchParams({
      username: NMI_CONFIG.username!,
      password: NMI_CONFIG.password!,
      type: "validate",
    });

    console.log("🔍 Testing NMI connection with params:", {
      username: NMI_CONFIG.username,
      gatewayUrl: NMI_CONFIG.gatewayUrl,
      type: "validate"
    });

    const response = await fetch(NMI_CONFIG.gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const result = await response.text();
    console.log("🔍 NMI Raw Response:", result);
    
    if (result.startsWith('<?xml')) {
      console.error("❌ NMI returned XML response instead of URL-encoded");
      return res.status(400).json({
        success: false,
        status: "error",
        message: "NMI returned XML response - check credentials and endpoint configuration",
        rawResponse: result.substring(0, 200)
      });
    }
    
    const resultParams = new URLSearchParams(result);
    const responseCode = resultParams.get("response");
    const responseText = resultParams.get("responsetext");
    const authCode = resultParams.get("authcode");

    console.log("🔍 Parsed NMI Response:", {
      responseCode,
      responseText,
      authCode
    });

    if (responseCode === "1") {
      console.log("✅ NMI connection successful");
      res.json({
        success: true,
        status: "connected",
        message: "NMI connection successful",
        nmiResponse: {
          code: responseCode,
          text: responseText,
          authCode: authCode
        }
      });
    } else {
      console.log("❌ NMI connection failed:", responseText);
      res.status(400).json({
        success: false,
        status: "error",
        message: responseText || "NMI connection failed",
        nmiResponse: {
          code: responseCode,
          text: responseText
        }
      });
    }
  } catch (error: any) {
    console.error("🔍 NMI Connection Error:", error);
    res.status(500).json({
      success: false,
      status: "error",
      message: error.message,
      errorType: error.constructor.name
    });
  }
}

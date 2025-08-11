import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(301).json({
    success: false,
    error: "This endpoint has been moved. Please use /api/real/sms/send instead.",
    redirect: "/api/real/sms/send",
    code: "ENDPOINT_MOVED"
  });
}

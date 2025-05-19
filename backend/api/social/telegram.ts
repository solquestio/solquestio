import { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import UserModel from '../../lib/models/User';
import { connectDB } from '../../lib/database';

// Helper to check Telegram login signature
function checkTelegramAuth(data: any, botToken: string) {
  const authData = { ...data };
  const hash = authData.hash;
  delete authData.hash;
  const dataCheckString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n');
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  return hmac === hash;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await connectDB();
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) return res.status(500).json({ error: 'Telegram bot token not set' });
  const { telegramData, userId } = req.body;
  if (!telegramData || !userId) return res.status(400).json({ error: 'Missing telegramData or userId' });
  if (!checkTelegramAuth(telegramData, botToken)) return res.status(401).json({ error: 'Invalid Telegram login signature' });
  // Store Telegram info in user profile
  const user = await UserModel.findByIdAndUpdate(userId, { telegram: telegramData }, { new: true });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.status(200).json({ success: true, telegram: telegramData });
} 
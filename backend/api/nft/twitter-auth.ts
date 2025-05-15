import { VercelRequest, VercelResponse } from '@vercel/node';
import { getCollection } from '../../lib/mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { wallet } = req.query;

  if (!wallet || typeof wallet !== 'string') {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    // In a real implementation, this would redirect to Twitter OAuth
    // and verify the user follows the account
    
    // For demonstration purposes, we'll simulate a successful verification
    // and immediately redirect back to the frontend
    
    // Record the verification in the database
    const collection = await getCollection('og_nft_claims');
    
    await collection.updateOne(
      { wallet, type: 'verification' },
      { 
        $set: { 
          wallet,
          type: 'verification',
          twitterVerified: true,
          twitterVerificationTime: new Date()
        } 
      },
      { upsert: true }
    );
    
    // Redirect back to frontend with success
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitter Verification</title>
          <script>
            window.onload = function() {
              window.opener.postMessage({ type: 'twitter-verified', success: true }, '*');
              setTimeout(function() {
                window.close();
              }, 1000);
            }
          </script>
        </head>
        <body>
          <h3>Twitter Verification Successful!</h3>
          <p>This window will close automatically...</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error verifying Twitter:', err);
    res.setHeader('Content-Type', 'text/html');
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitter Verification Failed</title>
          <script>
            window.onload = function() {
              window.opener.postMessage({ type: 'twitter-verified', success: false }, '*');
              setTimeout(function() {
                window.close();
              }, 3000);
            }
          </script>
        </head>
        <body>
          <h3>Twitter Verification Failed!</h3>
          <p>Please try again later. This window will close automatically...</p>
        </body>
      </html>
    `);
  }
} 
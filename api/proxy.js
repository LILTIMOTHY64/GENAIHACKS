// Vercel serverless function to handle API proxy
// This replaces the proxy-server.cjs for production deployment

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      // Get the target host from environment variable
      const TARGET_HOST = process.env.SARVAM_API_HOST || '446d219732b2.ngrok-free.app';
      
      const targetUrl = `https://${TARGET_HOST}/chat`;
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Proxy request error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
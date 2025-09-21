// Simple CORS proxy server for development
// Run this with: node proxy-server.js

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 3001;
const TARGET_HOST = '446d219732b2.ngrok-free.app';

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/chat') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // Forward the request to ngrok
      const options = {
        hostname: TARGET_HOST,
        path: '/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });

      proxyReq.on('error', (err) => {
        console.error('Proxy request error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
      });

      proxyReq.write(body);
      proxyReq.end();
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Simple CORS proxy running on http://localhost:${PORT}`);
  console.log(`Forwarding /api/chat to https://${TARGET_HOST}/chat`);
});
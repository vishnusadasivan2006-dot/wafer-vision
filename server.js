const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

// ===== SECURITY MIDDLEWARE =====

// Helmet for secure HTTP headers (relaxed CSP for inline scripts/styles)
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for inline scripts in index.html
  crossOriginEmbedderPolicy: false,
}));

// CORS — only allow same-origin and localhost
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

// Rate limiter — prevent API abuse (max 30 chat requests per minute per IP)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parser with size limit (prevent large payload attacks)
app.use(express.json({ limit: '10kb' }));

// Block direct access to sensitive files BEFORE static serving
app.get('/.env', (req, res) => res.status(403).send('Forbidden'));
app.get('/server.js', (req, res) => res.status(403).send('Forbidden'));
app.get('/package.json', (req, res) => res.status(403).send('Forbidden'));
app.get('/package-lock.json', (req, res) => res.status(403).send('Forbidden'));

// Serve static files (HTML, CSS, JS, assets)
app.use(express.static(path.join(__dirname), {
  dotfiles: 'deny', // Block access to .env and other dotfiles
}));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GROK_API_KEY || process.env.EagleSpark_API_KEY || process.env.OPENAI_API_KEY;
const DEFAULT_GROK_MODEL = process.env.GROK_MODEL || 'llama-3.3-70b-versatile';
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// ===== CHAT PROXY ENDPOINT =====
app.post('/api/chat', chatLimiter, async (req, res) => {
  console.log('[CHAT] Request received:', JSON.stringify(req.body).substring(0, 200));

  if (!API_KEY) {
    console.log('[CHAT] No API key!');
    return res.status(500).json({ error: 'Grok API key not configured on server' });
  }

  // Input validation
  const { messages, max_tokens, temperature } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid request: messages array is required' });
  }
  if (messages.length > 20) {
    return res.status(400).json({ error: 'Too many messages in request' });
  }

  try {
    let endpoint;
    let body = {
      messages,
      max_tokens: Math.min(max_tokens || 500, 1000), // Cap token usage
      temperature: Math.min(Math.max(temperature || 0.7, 0), 1),
    };

    if (API_KEY.startsWith('gsk_')) {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      body.model = DEFAULT_GROK_MODEL;
    } else if (API_KEY.startsWith('sk-')) {
      endpoint = 'https://api.openai.com/v1/chat/completions';
      body.model = DEFAULT_OPENAI_MODEL;
    } else {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      body.model = DEFAULT_GROK_MODEL;
    }

    console.log('[CHAT] Sending to:', endpoint, 'model:', body.model);

    let response;
    const attempts = 3;
    for (let i = 0; i < attempts; i++) {
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
          },
          body: JSON.stringify(body)
        });
        
        console.log(`[CHAT] API response status (attempt ${i + 1}):`, response.status);
        if (response.ok || response.status < 500) {
          break;
        }
      } catch (error) {
        console.error(`[CHAT] Fetch error on attempt ${i + 1}:`, error.message);
        if (i === attempts - 1) {
          throw error;
        }
      }
      // Wait 500ms before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CHAT] API Error:', response.status, errorText);
      // Don't expose raw API errors to the client
      return res.status(502).json({ error: 'AI service temporarily unavailable. Please try again.' });
    }

    const data = await response.json();
    // Only return the essential response data (strip sensitive metadata)
    res.json({
      choices: data.choices?.map(c => ({
        message: { content: c.message?.content || '' }
      })) || []
    });
  } catch (error) {
    console.error('[CHAT] Proxy error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to communicate with AI service' });
  }
});
// ===== HEALTH CHECK ENDPOINT =====
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKey: API_KEY ? 'configured' : 'missing',
    uptime: Math.floor(process.uptime()) + 's'
  });
});

// ===== 404 HANDLER =====
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`WaferVision Proxy Server running securely on http://localhost:${PORT}`);
  console.log(`API Key: ${API_KEY ? '✅ Loaded' : '❌ Missing'}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

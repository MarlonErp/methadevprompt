/**
 * Minimal Gemini proxy for local/dev usage.
 * - Exposes POST /api/gemini
 * - Reads GOOGLE_APPLICATION_CREDENTIALS env var (service account JSON)
 * - Exchanges credentials for an access token and forwards the request
 *
 * Usage: node server/gemini-proxy.js
 * Make sure to set: GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
 */
import express from 'express';
import fetch from 'node-fetch';
import { GoogleAuth } from 'google-auth-library';

const PORT = process.env.PORT || 3001;
const app = express();
app.use(express.json());

const DEFAULT_BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function getAccessToken() {
  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/cloud-platform'] });
  const client = await auth.getClient();
  const res = await client.getAccessToken();
  // getAccessToken() may return string or object
  return res && res.token ? res.token : res;
}

app.post('/api/gemini', async (req, res) => {
  try {
    const { model, request } = req.body || {};
    if (!model || !request) return res.status(400).send('Missing model or request in body');

    const token = await getAccessToken();

    const url = `${DEFAULT_BASE}/${model}:generateContent`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text);

    // Try to parse JSON response and extract text; otherwise forward raw text
    try {
      const json = JSON.parse(text);
      // The SDK returns generateContent result where .response.text() is the chosen way
      // In raw API the structure can vary; try common fields
      const generated = json?.candidates?.[0]?.output || json?.output?.[0]?.content || json;
      // If generated is an object, stringify sensible field
      const generatedText = typeof generated === 'string' ? generated : JSON.stringify(generated);
      return res.json({ generatedText });
    } catch (e) {
      return res.json({ generatedText: text });
    }
  } catch (err) {
    console.error('Proxy error', err);
    return res.status(500).send(String(err.message || err));
  }
});

app.listen(PORT, () => console.log(`Gemini proxy listening on http://localhost:${PORT}`));

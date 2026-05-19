/**
 * /api/proxy.js — Vercel Serverless Function
 * 
 * Cara setup:
 * 1. Buat file ini di folder /api/ project Vercel kamu
 * 2. Di Vercel dashboard → Settings → Environment Variables, tambahkan:
 *    - APPS_SCRIPT_URL = https://script.google.com/macros/s/...../exec
 *    - API_TOKEN = RAHASIA_123 (atau token baru yang lebih kuat)
 * 3. Deploy ulang
 * 
 * Token tidak akan pernah terekspos ke browser.
 */

export default async function handler(req, res) {
  // CORS — izinkan hanya dari domain kamu sendiri
  const allowedOrigins = [
    process.env.ALLOWED_ORIGIN || '', // set di env: https://your-app.vercel.app
    'http://localhost:3000',
  ].filter(Boolean);

  const origin = req.headers.origin || '';
  if (allowedOrigins.length && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origin tidak diizinkan' });
  }

  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
  const API_TOKEN = process.env.API_TOKEN;

  if (!APPS_SCRIPT_URL || !API_TOKEN) {
    return res.status(500).json({ error: 'Server belum dikonfigurasi (env vars kosong)' });
  }

  try {
    // Forward query params + tambahkan token
    const params = new URLSearchParams(req.query);
    params.set('token', API_TOKEN);
    const targetUrl = `${APPS_SCRIPT_URL}?${params}`;

    let body = null;
    if (req.method === 'POST') {
      // Inject token ke body juga
      body = JSON.stringify({ ...req.body, token: API_TOKEN });
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Proxy error: ' + err.message });
  }
}

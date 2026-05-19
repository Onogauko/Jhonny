export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
  const API_TOKEN = process.env.API_TOKEN;

  if (!APPS_SCRIPT_URL || !API_TOKEN) {
    return res.status(500).json({ error: 'Env vars belum diset di Vercel' });
  }

  try {
    const params = new URLSearchParams(req.query);
    params.set('token', API_TOKEN);
    const targetUrl = `${APPS_SCRIPT_URL}?${params}`;

    const fetchOptions = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' },
    };

    if (req.method === 'POST' && req.body) {
      fetchOptions.body = JSON.stringify({ ...req.body, token: API_TOKEN });
    }

    const response = await fetch(targetUrl, fetchOptions);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error: ' + err.message });
  }
}

// Vercel Serverless Function — keeps GITHUB_CLIENT_SECRET off the frontend
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'DELETE') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const { access_token: accessToken } = body;
    if (!accessToken) return res.status(400).json({ error: 'Access token required' });

    try {
      const credentials = Buffer.from(`${process.env.GITHUB_CLIENT_ID}:${process.env.GITHUB_CLIENT_SECRET}`).toString('base64');
      const r = await fetch(`https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/token`, {
        method: 'DELETE',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });

      if (!r.ok && r.status !== 404) {
        const data = await r.json().catch(() => ({}));
        return res.status(r.status).json(data);
      }

      return res.status(204).end();
    } catch {
      return res.status(500).json({ error: 'Token revocation failed' });
    }
  }

  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Authorization code required' });

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await r.json();
    if (data.error) return res.status(400).json(data);
    return res.status(200).json(data);
  } catch {
    return res.status(500).json({ error: 'Token exchange failed' });
  }
}

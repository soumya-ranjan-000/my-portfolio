import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(({ mode }) => {
  // Load environment variables including Node-specific secret tokens
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: 'public/_redirects',
            dest: '.' // Copy to `dist/`
          }
        ]
      }),
      // Custom Dev Middleware to intercept '/api/github-oauth' locally during npm run dev
      {
        name: 'github-oauth-local-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url.startsWith('/api/github-oauth')) {
              const url = new URL(req.url, `http://${req.headers.host}`);

              if (req.method === 'DELETE') {
                let rawBody = '';
                req.on('data', chunk => {
                  rawBody += chunk;
                });
                req.on('end', async () => {
                  let accessToken = '';
                  try {
                    const body = rawBody ? JSON.parse(rawBody) : {};
                    accessToken = body.access_token;
                  } catch {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                    return;
                  }

                  if (!accessToken) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Access token required' }));
                    return;
                  }

                  const clientId = env.VITE_GITHUB_CLIENT_ID;
                  const clientSecret = env.GITHUB_CLIENT_SECRET || env.client_secret;

                  try {
                    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
                    const response = await fetch(`https://api.github.com/applications/${clientId}/token`, {
                      method: 'DELETE',
                      headers: {
                        'Accept': 'application/vnd.github+json',
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/json',
                        'X-GitHub-Api-Version': '2022-11-28',
                      },
                      body: JSON.stringify({ access_token: accessToken }),
                    });

                    res.statusCode = response.ok || response.status === 404 ? 204 : response.status;
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.end();
                  } catch (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Token revocation failed', details: err.message }));
                  }
                });
                return;
              }

              const code = url.searchParams.get('code');

              if (!code) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Authorization code required' }));
                return;
              }

              const clientId = env.VITE_GITHUB_CLIENT_ID;
              const clientSecret = env.GITHUB_CLIENT_SECRET || env.client_secret;

              try {
                const response = await fetch('https://github.com/login/oauth/access_token', {
                  method: 'POST',
                  headers: { 
                    'Content-Type': 'application/json', 
                    'Accept': 'application/json' 
                  },
                  body: JSON.stringify({
                    client_id: clientId,
                    client_secret: clientSecret,
                    code,
                  }),
                });
                const data = await response.json();

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(JSON.stringify(data));
              } catch (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Token exchange failed', details: err.message }));
              }
              return;
            }
            next();
          });
        }
      }
    ]
  };
});

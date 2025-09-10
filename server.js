import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const distDir = path.join(__dirname, 'dist');

// Block indexing by search engines (defense-in-depth alongside robots.txt and meta tags)
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  next();
});

// Runtime config from env (used by tag loaders)
const runtimeConfig = {
  GTM_ID: process.env.GTM_ID || '',
  GA4_ID: process.env.GA4_ID || '',
  // Optional Server-side GTM custom domain, e.g., https://gtm.example.com
  GTM_SERVER_CONTAINER_URL: process.env.GTM_SERVER_CONTAINER_URL || '',
  MATOMO_TAG_MANAGER_CONTAINER_URL: process.env.MATOMO_TAG_MANAGER_CONTAINER_URL || '',
  OPTIMIZELY_WEB_SNIPPET_URL: process.env.OPTIMIZELY_WEB_SNIPPET_URL || '',
  ODP_SDK_URL: process.env.ODP_SDK_URL || ''
};

app.get('/config.json', (_req, res) => res.json(runtimeConfig));

app.use(express.static(distDir, { index: false }));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Shop404 running on http://0.0.0.0:${port}`);
});

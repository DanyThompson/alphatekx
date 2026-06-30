import express from 'express';
import net from 'net';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { runDeploymentPipeline } from './deployment_engine/pipeline.js';
import { generateSecurityReport, loadAuditLog } from './guardian_engine/analytics.js';
import { loadPlugins } from './guardian_engine/pluginManager.js';
import { handleUploadScan } from './server_upload_scan_route.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const AUDIT_LOG_PATH = path.join(__dirname, 'audit-log.json');
const API_KEY_FILE = path.join(__dirname, 'api-keys.json');
const DEFAULT_API_KEY = process.env.ALPHATekX_API_KEY || 'alpha-tekx-enterprise-key';

async function loadApiKeyStore() {
  const apiKeys = [
    { key: DEFAULT_API_KEY, owner: 'default-service', role: 'admin', createdAt: new Date().toISOString() },
  ];

  try {
    const fileContents = await fs.readFile(API_KEY_FILE, 'utf8');
    const store = JSON.parse(fileContents);
    if (store?.keys && Array.isArray(store.keys)) {
      store.keys.forEach((entry) => {
        if (entry?.key && !apiKeys.some((item) => item.key === entry.key)) {
          apiKeys.push({
            key: entry.key,
            owner: entry.owner ?? 'unknown',
            role: entry.role ?? 'developer',
            createdAt: entry.createdAt ?? new Date().toISOString(),
          });
        }
      });
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('[server] Unable to load API key store:', error.message);
    }
  }

  const envKeyList = (process.env.ALPHATekX_API_KEYS || '').split(',').map((key) => key.trim()).filter(Boolean);
  envKeyList.forEach((key) => {
    if (!apiKeys.some((item) => item.key === key)) {
      apiKeys.push({ key, owner: 'env-store', role: 'developer', createdAt: new Date().toISOString() });
    }
  });

  return apiKeys;
}

const API_KEYS = await loadApiKeyStore();

const requestedPort = Number.isInteger(parseInt(process.env.PORT, 10)) ? parseInt(process.env.PORT, 10) : 4000;

async function isPortFree(port) {
  return new Promise((resolve, reject) => {
    const tester = net.createServer()
      .once('error', (err) => {
        if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
          resolve(false);
        } else {
          reject(err);
        }
      })
      .once('listening', () => {
        tester.close(() => resolve(true));
      })
      .listen(port, '0.0.0.0');
  });
}

async function findOpenPort(startPort, maxAttempts = 16) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = startPort + attempt;
    if (await isPortFree(candidate)) {
      return candidate;
    }
  }
  throw new Error(`Could not find an available port between ${startPort} and ${startPort + maxAttempts - 1}.`);
}

const PORT = await findOpenPort(requestedPort);
if (PORT !== requestedPort) {
  console.warn(`[server] Requested port ${requestedPort} is unavailable. Listening on ${PORT} instead.`);
}

function getApiKeyFromRequest(req) {
  const explicit = req.header('X-Alphatekx-Key');
  if (explicit) {
    return explicit.trim();
  }

  const authorization = req.header('Authorization');
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    return authorization.slice('bearer '.length).trim();
  }

  return '';
}

function getApiKeyMeta(apiKey) {
  return API_KEYS.find((entry) => entry.key === apiKey);
}

const authMiddleware = (req, res, next) => {
  const apiKey = getApiKeyFromRequest(req);
  const meta = getApiKeyMeta(apiKey);

  if (!apiKey || !meta) {
    return res.status(401).json({
      error: 'Unauthorized. Missing or invalid API key. Provide X-Alphatekx-Key or Authorization: Bearer <key>.',
    });
  }

  req.apiKeyMeta = meta;
  next();
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/upload-scan', async (req, res) => {
  await handleUploadScan(req, res);
});

app.post('/api/deploy', authMiddleware, async (req, res) => {
  const { projectPath } = req.body;
  if (!projectPath || typeof projectPath !== 'string') {
    return res.status(400).json({ error: 'Missing projectPath in request body.' });
  }

  try {
    const result = await runDeploymentPipeline(projectPath, { logger: console, autoDeploy: true });
    return res.json({
      finalSecurityStatus: result.finalSecurityStatus,
      stage: result.stage,
      transactionID: result.transactionID,
      apiKeyOwner: req.apiKeyMeta?.owner,
      reportUrl: `${req.protocol}://${req.get('host')}/api/report`,
      details: result,
    });
  } catch (error) {
    console.error('[api] /api/deploy error:', error);
    return res.status(500).json({ error: 'Deployment pipeline failed to execute.' });
  }
});

app.get('/api/report', authMiddleware, async (req, res) => {
  try {
    const data = await generateSecurityReport(AUDIT_LOG_PATH);
    return res.json({ report: data });
  } catch (error) {
    console.error('[api] /api/report error:', error);
    return res.status(500).json({ error: 'Unable to generate report.' });
  }
});

app.get('/api/plugins', authMiddleware, async (req, res) => {
  try {
    const plugins = await loadPlugins();
    return res.json({
      plugins: plugins.map((plugin) => ({
        name: plugin.name,
      })),
      count: plugins.length,
    });
  } catch (error) {
    console.error('[api] /api/plugins error:', error);
    return res.status(500).json({ error: 'Unable to load plugins.' });
  }
});

app.get('/api/status/:transactionID', authMiddleware, async (req, res) => {
  try {
    const entries = await loadAuditLog(AUDIT_LOG_PATH);
    const matches = entries.filter((entry) => entry.transactionID === req.params.transactionID);
    if (matches.length === 0) {
      return res.status(404).json({ error: 'Transaction not found.' });
    }

    return res.json({ transactionID: req.params.transactionID, entries: matches });
  } catch (error) {
    console.error('[api] /api/status error:', error);
    return res.status(500).json({ error: 'Unable to retrieve transaction status.' });
  }
});

app.get('/api/keys', authMiddleware, (req, res) => {
  if (req.apiKeyMeta?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin API key required to view key metadata.' });
  }

  return res.json({ keys: API_KEYS.map(({ owner, role, createdAt }) => ({ owner, role, createdAt })) });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'AlphaTekx API wrapper',
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found', path: req.originalUrl, message: 'Check / for available endpoints.' });
  }

  return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.originalUrl,
    message: 'Check / for available endpoints.',
  });
});

app.use((err, req, res, next) => {
  console.error('[server] unexpected error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`AlphaTekx API wrapper listening on http://localhost:${PORT}`);
});

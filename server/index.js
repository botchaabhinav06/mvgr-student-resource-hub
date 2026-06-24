import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import r2Routes from './routes/r2Routes.js';
import adminNormalizationRoutes from './routes/adminNormalizationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { isConfigured } from './firebaseAdmin.js';

const PORT = 3000;

async function startServer() {
  const app = express();

  // Simple Request Logger
  app.use((req, res, next) => {
    console.log(`[Express Incoming] ${req.method} ${req.url} - Content-Type: ${req.headers['content-type']}`);
    next();
  });

  // Parse JSON payloads
  app.use(express.json());

  // CORS support
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (origin) {
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        res.header('Access-Control-Allow-Origin', origin);
      }
    } else {
      res.header('Access-Control-Allow-Origin', '*');
    }

    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Mount Cloudflare R2 API routes
  app.use('/api/r2', r2Routes);

  // Mount Admin Normalization routes
  app.use('/api/admin/normalization', adminNormalizationRoutes);

  // Mount AI features routing backend backplane
  app.use('/api/ai', aiRoutes);

  // Safe root route check
  app.get('/', (req, res) => {
    res.json({
      ok: true,
      message: 'MVGR Student Resource Hub backend is running',
    });
  });

  // General health check backplane
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Safe Admin verification backplane
  app.get('/api/auth/admin-health', (req, res) => {
    if (isConfigured) {
      res.json({
        ok: true,
        firebaseAdminConfigured: true,
        projectIdConfigured: true,
        message: 'Firebase Admin backend is configured',
      });
    } else {
      res.json({
        ok: false,
        firebaseAdminConfigured: false,
        message: 'Firebase Admin backend is not configured',
      });
    }
  });

  // Integrate Vite Dev Server middleware or static file serving
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Express Server] Mounting Vite dev middleware...');
    const viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(viteInstance.middlewares);
  } else {
    console.log('[Express Server] Mounting static production distributor...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Express Server] Active on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer().catch((error) => {
  console.error('[Startup Failure] Failed to bootstrap server:', error);
});

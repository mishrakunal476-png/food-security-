import { createServer as createHttpServer } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './routes/auth';
import { donationsRouter } from './routes/donations';
import { notificationsRouter } from './routes/notifications';
import { supportRouter } from './routes/support';
import { closePool, getPool } from './db/client';

const app = express();
const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.env.PORT || 3000);
app.disable('x-powered-by');
app.use(express.json({ limit: '128kb' }));
app.get('/health', (_request, response) => response.json({ ok: true, service: 'foodloop' }));
app.use('/api/auth', authRouter);
app.use('/api/donations', donationsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/support', supportRouter);
app.get('/api/health', async (_request, response) => {
  try {
    if (process.env.DATABASE_URL) await getPool().query('SELECT 1');
    response.json({ ok: true, service: 'foodloop', database: Boolean(process.env.DATABASE_URL) });
  } catch {
    response.status(503).json({ ok: false, service: 'foodloop', database: false });
  }
});
app.use('/api', (_request, response) => response.status(404).json({ error: 'FoodLoop API route not found.' }));

const httpServer = createHttpServer(app);
let vite: Awaited<ReturnType<typeof createViteServer>> | null = null;
if (process.env.NODE_ENV === 'production') {
  const dist = resolve(root, 'dist');
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get(/.*/, (_request, response) => response.sendFile(resolve(dist, 'index.html')));
} else {
  vite = await createViteServer({
    root,
    appType: 'spa',
    server: { middlewareMode: true, hmr: { server: httpServer }, watch: { usePolling: true } },
  });
  app.use(vite.middlewares);
}

httpServer.listen(port, '0.0.0.0', () => {
  console.log(`FoodLoop listening on 0.0.0.0:${port} (${process.env.NODE_ENV === 'production' ? 'production' : 'development'})`);
});

async function shutdown() {
  httpServer.close();
  await vite?.close();
  await closePool();
  process.exit(0);
}
process.on('SIGINT', () => void shutdown());
process.on('SIGTERM', () => void shutdown());

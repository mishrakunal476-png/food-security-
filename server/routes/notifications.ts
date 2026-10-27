import { Router } from 'express';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { notifications } from '../db/schema';
import { requireUser } from '../auth';

export const notificationsRouter = Router();
notificationsRouter.use(requireUser);

notificationsRouter.get('/', async (request, response) => {
  const user = request.foodloopUser!;
  const rows = await getDb().select().from(notifications).where(eq(notifications.recipientId, user.id)).orderBy(desc(notifications.createdAt)).limit(50);
  response.json({ notifications: rows.map((row) => ({ id: row.id, title: row.title, detail: row.detail, tone: row.tone, read: row.read, createdAt: row.createdAt.toISOString() })) });
});

notificationsRouter.post('/read', async (request, response) => {
  const user = request.foodloopUser!;
  await getDb().update(notifications).set({ read: true }).where(eq(notifications.recipientId, user.id));
  response.json({ ok: true });
});

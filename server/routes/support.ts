import { Router } from 'express';
import { desc, eq, or, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../db/client';
import { donations } from '../db/schema';
import { requireUser } from '../auth';

export const supportRouter = Router();
supportRouter.post('/chat', requireUser, async (request, response) => {
  const parsed = z.object({ message: z.string().trim().min(1).max(2000) }).safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: 'Write a short support question.' }); return; }
  const apiUrl = process.env.MANUS_API_URL;
  const apiKey = process.env.MANUS_API_KEY;
  if (!apiUrl || !apiKey) { response.status(503).json({ error: 'FoodLoop AI support is not configured. Please use the help center or contact an admin.' }); return; }
  const user = request.foodloopUser!;
  const db = getDb();
  let accessible;
  if (user.role === 'admin') {
    accessible = await db.select({ id: donations.id, foodName: donations.foodName, status: donations.status, useBy: donations.useBy }).from(donations).orderBy(desc(donations.createdAt)).limit(30);
  } else if (user.role === 'donor') {
    accessible = await db.select({ id: donations.id, foodName: donations.foodName, status: donations.status, useBy: donations.useBy }).from(donations).where(eq(donations.donorId, user.id)).orderBy(desc(donations.createdAt)).limit(20);
  } else if (user.role === 'ngo') {
    accessible = await db.select({ id: donations.id, foodName: donations.foodName, status: donations.status, useBy: donations.useBy }).from(donations).where(or(eq(donations.ngoId, user.id), eq(donations.status, 'listed'))).orderBy(desc(donations.createdAt)).limit(20);
  } else {
    accessible = await db.select({ id: donations.id, foodName: donations.foodName, status: donations.status, useBy: donations.useBy }).from(donations).where(or(eq(donations.partnerId, user.id), inArray(donations.status, ['matched', 'partner_assigned', 'picked_up']))).orderBy(desc(donations.createdAt)).limit(20);
  }
  const safeContext = accessible.map((item) => ({ id: item.id, food: item.foodName, status: item.status, useBy: item.useBy.toISOString() }));
  try {
    const upstream = await fetch(`${apiUrl.replace(/\/$/, '')}/v1/chat/completions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ messages: [
        { role: 'system', content: `You are Loop, FoodLoop's careful support guide. Current authenticated role: ${user.role}. Only discuss the minimal sample of donation records below; do not reveal contact details, exact pickup locations or records not present. Records: ${JSON.stringify(safeContext)}. Explain status and suggest where the user can review it. Do not claim actions succeeded, do not perform actions, do not certify food as safe, and do not give definitive safety assurances from donor notes. Flag missing/concerning facts for human review. Ask the user to confirm consequential actions in the app and offer an admin escalation. Payments are not implemented. Keep answers concise and factual.` },
        { role: 'user', content: parsed.data.message },
      ] }),
      signal: AbortSignal.timeout(20_000),
    });
    const body = await upstream.json() as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
    if (!upstream.ok || body.error) { response.status(502).json({ error: body.error?.message || 'The support service is temporarily unavailable.' }); return; }
    const answer = body.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) { response.status(502).json({ error: 'Support did not return an answer. Please try again or contact an admin.' }); return; }
    response.json({ answer: answer.trim() });
  } catch {
    response.status(504).json({ error: 'Support timed out. Your question was not used to change any donation.' });
  }
});

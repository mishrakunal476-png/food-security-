import { Router } from 'express';
import { desc, eq, inArray, or } from 'drizzle-orm';
import type { ResultSetHeader } from 'mysql2';
import { z } from 'zod';
import { getDb, getPool } from '../db/client';
import { activityEvents, donations, notifications, users } from '../db/schema';
import { requireUser } from '../auth';

export const donationsRouter = Router();
donationsRouter.use(requireUser);

const listingSchema = z.object({
  foodName: z.string().trim().min(2).max(255), category: z.enum(['Meals', 'Produce', 'Bakery', 'Dairy', 'Pantry']),
  quantity: z.number().int().positive().max(10000), unit: z.string().trim().min(1).max(32), servings: z.number().int().positive().max(100000),
  area: z.string().trim().min(2).max(255), pickupLocation: z.string().trim().min(3).max(255), pickupWindow: z.string().trim().min(3).max(180),
  storage: z.string().trim().min(3).max(255), foodSafetyNotes: z.string().trim().min(3).max(2000), allergens: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
  preparedAt: z.string().datetime(), useBy: z.string().datetime(),
});

function safeDonation(row: typeof donations.$inferSelect, privateLocation: boolean) {
  return {
    ...row,
    pickupLocation: privateLocation ? row.pickupLocation : row.area,
    events: [] as { id: string; kind: string; title: string; detail: string; at: string }[],
  };
}

async function addEvent(donationId: string, actorId: string, kind: string, title: string, detail: string) {
  await getDb().insert(activityEvents).values({ id: crypto.randomUUID(), donationId, actorId, kind, title, detail, createdAt: new Date() });
}

async function claimTransition(query: string, values: (string | Date)[], donationId: string, actorId: string, kind: string, title: string, detail: string) {
  const connection = await getPool().getConnection();
  let transactionStarted = false;
  try {
    await connection.beginTransaction();
    transactionStarted = true;
    const [result] = await connection.execute<ResultSetHeader>(query, values);
    if (result.affectedRows !== 1) { await connection.rollback(); transactionStarted = false; return false; }
    await connection.execute('INSERT INTO activity_events (id, donation_id, actor_id, kind, title, detail, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', [crypto.randomUUID(), donationId, actorId, kind, title, detail, new Date()]);
    await connection.commit();
    transactionStarted = false;
    return true;
  } catch (error) {
    if (transactionStarted) { try { await connection.rollback(); } catch { /* preserve the original database error */ } }
    throw error;
  } finally { connection.release(); }
}

async function participantIds(row: typeof donations.$inferSelect, userId: string) {
  return row.donorId === userId || row.ngoId === userId || row.partnerId === userId;
}

donationsRouter.get('/', async (request, response) => {
  const user = request.foodloopUser!;
  const db = getDb();
  const filters = [eq(donations.donorId, user.id), eq(donations.ngoId, user.id), eq(donations.partnerId, user.id)];
  if (user.role === 'ngo') filters.push(eq(donations.status, 'listed'));
  if (user.role === 'partner') filters.push(inArray(donations.status, ['matched', 'partner_assigned', 'picked_up']));
  if (user.role === 'admin') {
    const all = await db.select().from(donations).orderBy(desc(donations.createdAt)).limit(100);
    const result = [];
    for (const row of all) {
      const events = await db.select().from(activityEvents).where(eq(activityEvents.donationId, row.id)).orderBy(desc(activityEvents.createdAt));
      result.push({ ...safeDonation(row, true), events: events.reverse().map((event) => ({ id: event.id, kind: event.kind, title: event.title, detail: event.detail, at: event.createdAt.toISOString() })) });
    }
    response.json({ donations: result });
    return;
  }
  const rows = await db.select().from(donations).where(or(...filters)).orderBy(desc(donations.createdAt)).limit(100);
  const result = [];
  for (const row of rows) {
    const privateLocation = await participantIds(row, user.id);
    const events = privateLocation ? await db.select().from(activityEvents).where(eq(activityEvents.donationId, row.id)).orderBy(desc(activityEvents.createdAt)) : [];
    result.push({ ...safeDonation(row, privateLocation), events: events.reverse().map((event) => ({ id: event.id, kind: event.kind, title: event.title, detail: event.detail, at: event.createdAt.toISOString() })) });
  }
  response.json({ donations: result });
});

donationsRouter.post('/', async (request, response) => {
  const user = request.foodloopUser!;
  if (user.role !== 'donor') { response.status(403).json({ error: 'Only a food donor can create a listing.' }); return; }
  const parsed = listingSchema.safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Check the listing details.' }); return; }
  const input = parsed.data;
  const now = Date.now();
  const useBy = new Date(input.useBy);
  const preparedAt = new Date(input.preparedAt);
  if (preparedAt.getTime() > now) { response.status(400).json({ error: 'Preparation time cannot be in the future.' }); return; }
  if (useBy.getTime() <= now || useBy.getTime() <= preparedAt.getTime()) { response.status(400).json({ error: 'Use-by time must be after preparation and in the future.' }); return; }
  const id = `FL-${Date.now().toString().slice(-8)}`;
  const db = getDb();
  await db.insert(donations).values({
    id, donorId: user.id, donorName: user.organizationName || user.name,
    foodName: input.foodName, category: input.category, quantity: input.quantity, unit: input.unit, servings: input.servings,
    area: input.area, pickupLocation: input.pickupLocation, pickupWindow: input.pickupWindow, storage: input.storage, foodSafetyNotes: input.foodSafetyNotes,
    allergens: input.allergens, preparedAt: new Date(input.preparedAt), useBy, etaMinutes: 22, status: 'listed',
    assignmentHistory: [], createdAt: new Date(), needsReassignment: false,
  });
  await addEvent(id, user.id, 'listed', 'Donation listed', `${input.quantity} ${input.unit} · ${user.organizationName || user.name}`);
  response.status(201).json({ id, ok: true });
});

donationsRouter.post('/:id/actions', async (request, response) => {
  const user = request.foodloopUser!;
  const action = z.enum(['accept', 'decline', 'accept_route', 'partner_decline', 'pickup', 'deliver', 'simulate_failure', 'confirm_reassignment']).safeParse(request.body?.action);
  if (!action.success) { response.status(400).json({ error: 'Choose a supported delivery action.' }); return; }
  const db = getDb();
  const [row] = await db.select().from(donations).where(eq(donations.id, request.params.id)).limit(1);
  if (!row) { response.status(404).json({ error: 'Donation not found.' }); return; }
  const participant = await participantIds(row, user.id) || user.role === 'admin';
  const update = async (values: Partial<typeof donations.$inferInsert>, kind: string, title: string, detail: string) => {
    await db.update(donations).set(values).where(eq(donations.id, row.id));
    await addEvent(row.id, user.id, kind, title, detail);
    response.json({ ok: true });
  };
  switch (action.data) {
    case 'accept':
      if (user.role !== 'ngo' || row.status !== 'listed') { response.status(403).json({ error: 'Only an NGO can accept an available listing.' }); return; }
      if (Date.now() + row.etaMinutes * 60_000 >= row.useBy.getTime()) { response.status(409).json({ error: 'Estimated arrival would be after the use-by time.' }); return; }
      if (!await claimTransition("UPDATE donations SET status='matched', ngo_id=?, ngo_name=? WHERE id=? AND status='listed' AND ngo_id IS NULL", [user.id, user.organizationName || user.name, row.id], row.id, user.id, 'matched', `Matched with ${user.organizationName || user.name}`, 'The NGO accepted the donation.')) { response.status(409).json({ error: 'Another NGO already changed this listing. Refresh to see its latest status.' }); return; }
      response.json({ ok: true }); return;
    case 'decline':
      if (user.role !== 'ngo' || row.status !== 'listed') { response.status(403).json({ error: 'Only an NGO can decline an available listing.' }); return; }
      if (!await claimTransition("UPDATE donations SET status='declined' WHERE id=? AND status='listed' AND ngo_id IS NULL", [row.id], row.id, user.id, 'note', `${user.organizationName || user.name} passed on this listing`, 'The listing remains in activity history.')) { response.status(409).json({ error: 'Another NGO already changed this listing. Refresh to see its latest status.' }); return; }
      response.json({ ok: true }); return;
    case 'accept_route':
      if (user.role !== 'partner' || row.status !== 'matched' || !row.ngoId) { response.status(403).json({ error: 'Only an available delivery partner can accept a matched route.' }); return; }
      if (Date.now() + row.etaMinutes * 60_000 >= row.useBy.getTime()) { response.status(409).json({ error: 'Estimated arrival would be after the use-by time.' }); return; }
      if (row.needsReassignment) { response.status(409).json({ error: 'A donor or NGO must confirm the backup assignment before a partner can accept.' }); return; }
      if (!await claimTransition("UPDATE donations SET status='partner_assigned', partner_id=?, partner_name=?, assignment_history=? WHERE id=? AND status='matched' AND ngo_id IS NOT NULL AND partner_id IS NULL AND needs_reassignment=FALSE", [user.id, user.name, JSON.stringify([...row.assignmentHistory, { partnerId: user.id, partnerName: user.name, assignedAt: new Date().toISOString(), outcome: 'active' }]), row.id], row.id, user.id, 'assigned', `${user.name} accepted the route`, 'The partner assignment is recorded.')) { response.status(409).json({ error: 'Another partner or workflow action already changed this route. Refresh to see the latest status.' }); return; }
      response.json({ ok: true }); return;
    case 'partner_decline':
      if (user.role !== 'partner' || row.status !== 'partner_assigned' || row.partnerId !== user.id) { response.status(403).json({ error: 'Only the assigned partner can decline this route.' }); return; }
      await db.update(donations).set({ status: 'matched', partnerId: null, partnerName: null, needsReassignment: true, assignmentHistory: row.assignmentHistory.map((item) => item.outcome === 'active' ? { ...item, outcome: 'failed' } : item) }).where(eq(donations.id, row.id));
      await addEvent(row.id, user.id, 'failure', `${user.name} declined the route`, 'The donor, NGO and admin need another available partner.');
      const adminUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin'));
      for (const recipientId of [row.donorId, row.ngoId, ...adminUsers.map((admin) => admin.id)].filter((value): value is string => Boolean(value))) {
        await db.insert(notifications).values({ id: crypto.randomUUID(), recipientId, title: 'Partner declined this route', detail: `A backup is needed for ${row.foodName}.`, tone: 'coral', createdAt: new Date() });
      }
      response.json({ ok: true }); return;
    case 'pickup':
      if (row.status !== 'partner_assigned' || !(row.partnerId === user.id || user.role === 'admin')) { response.status(403).json({ error: 'Only the assigned partner or admin can confirm pickup.' }); return; }
      await update({ status: 'picked_up' }, 'picked_up', 'Pickup confirmed', `${row.quantity} ${row.unit} · demo handoff code verified.`); return;
    case 'deliver':
      if (row.status !== 'picked_up' || !(row.partnerId === user.id || user.role === 'admin')) { response.status(403).json({ error: 'Only the assigned partner or admin can confirm delivery.' }); return; }
      await update({ status: 'delivered', deliveredQuantity: row.quantity, assignmentHistory: row.assignmentHistory.map((item) => item.outcome === 'active' ? { ...item, outcome: 'completed' } : item) }, 'delivered', 'Handoff confirmed', `${row.quantity} ${row.unit} received · demo code verified.`); return;
    case 'simulate_failure':
      if (!participant || !['partner_assigned', 'matched'].includes(row.status) || user.role === 'partner') { response.status(403).json({ error: 'Only the donor, matched NGO or admin can simulate a delivery failure.' }); return; }
      await update({ status: 'matched', partnerId: null, partnerName: null, needsReassignment: true, assignmentHistory: row.assignmentHistory.map((item) => item.outcome === 'active' ? { ...item, outcome: 'failed' } : item) }, 'failure', 'Partner unavailable · backup needed', 'Previous assignment is preserved in history.');
      const failureAdmins = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin'));
      for (const recipientId of [row.donorId, row.ngoId, ...failureAdmins.map((admin) => admin.id)].filter((value): value is string => Boolean(value))) {
        await db.insert(notifications).values({ id: crypto.randomUUID(), recipientId, title: 'Delivery needs a backup', detail: `A partner is unavailable for ${row.foodName}.`, tone: 'coral', createdAt: new Date() });
      }
      response.json({ ok: true }); return;
    case 'confirm_reassignment':
      response.status(409).json({ error: 'Real partner availability is not configured. Use the clearly labeled demo mode for backup-partner suggestions.' }); return;
  }
});

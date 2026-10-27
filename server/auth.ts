import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { eq, and, gt } from 'drizzle-orm';
import { getDb } from './db/client';
import { appSessions, users } from './db/schema';
import type { Role } from '../shared/types';

export interface SessionUser {
  id: string;
  openId: string;
  name: string;
  email: string | null;
  role: Role;
  organizationName: string | null;
  area: string | null;
  onboardingComplete: boolean;
}

declare global {
  namespace Express {
    interface Request { foodloopUser?: SessionUser }
  }
}

export const APP_COOKIE = 'webdev_app_session';
export const STATE_COOKIE = 'foodloop_oauth_state';
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;
export function secureCookieForOrigin(origin?: string): boolean {
  if (!origin) return true;
  try { return new URL(origin).protocol === 'https:'; } catch { return true; }
}
const cookie = (name: string, value: string, maxAge: number, path = '/', secure = true) => `${name}=${encodeURIComponent(value)}; Path=${path}; Max-Age=${maxAge}; HttpOnly; ${secure ? 'Secure; SameSite=None' : 'SameSite=Lax'}`;
export const clearCookie = (name: string, path = '/', secure = true) => `${name}=; Path=${path}; Max-Age=0; HttpOnly; ${secure ? 'Secure; SameSite=None' : 'SameSite=Lax'}`;
export const hash = (value: string) => createHash('sha256').update(value).digest('hex');

export function setSessionCookie(response: Response, value: string, browserOrigin?: string) {
  response.append('Set-Cookie', cookie(APP_COOKIE, value, SESSION_AGE_SECONDS, '/', secureCookieForOrigin(browserOrigin)));
}
export function setStateCookie(response: Response, value: string, browserOrigin?: string) {
  response.append('Set-Cookie', cookie(STATE_COOKIE, value, 600, '/api/auth/callback', secureCookieForOrigin(browserOrigin)));
}
export function clearAuthCookies(response: Response, browserOrigin?: string) {
  const secure = secureCookieForOrigin(browserOrigin);
  response.append('Set-Cookie', clearCookie(APP_COOKIE, '/', secure));
  response.append('Set-Cookie', clearCookie(STATE_COOKIE, '/api/auth/callback', secure));
}

export function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.cookie;
  if (!raw) return null;
  for (const entry of raw.split(';')) {
    const index = entry.indexOf('=');
    if (index < 0) continue;
    if (entry.slice(0, index).trim() === name) {
      try { return decodeURIComponent(entry.slice(index + 1).trim()); } catch { return null; }
    }
  }
  return null;
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function toSessionUser(user: typeof users.$inferSelect): SessionUser {
  return {
    id: user.id, openId: user.openId, name: user.name, email: user.email,
    role: user.role as Role, organizationName: user.organizationName, area: user.area,
    onboardingComplete: user.onboardingComplete,
  };
}

export async function upsertOAuthUser(identity: { openId: string; name?: string; email?: string | null }) {
  const db = getDb();
  const name = identity.name?.trim() || 'FoodLoop member';
  const existing = await db.select().from(users).where(eq(users.openId, identity.openId)).limit(1);
  if (existing[0]) {
    await db.update(users).set({ name, email: identity.email ?? existing[0].email }).where(eq(users.id, existing[0].id));
    const updated = await db.select().from(users).where(eq(users.id, existing[0].id)).limit(1);
    return toSessionUser(updated[0]);
  }
  const id = `usr_${hash(identity.openId).slice(0, 28)}`;
  await db.insert(users).values({ id, openId: identity.openId, name, email: identity.email ?? null, role: 'donor', organizationName: null, area: null, onboardingComplete: false });
  const created = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return toSessionUser(created[0]);
}

async function resolvePlatformPreviewToken(token: string): Promise<SessionUser | null> {
  const secret = process.env.MANUS_JWT_SECRET;
  const projectId = process.env.MANUS_PROJECT_ID;
  if (!secret || !projectId) return null;
  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (!payload || typeof payload === 'string') return null;
    if (payload.appId !== projectId) return null;
    const openId = typeof payload.openId === 'string' ? payload.openId : typeof payload.open_id === 'string' ? payload.open_id : null;
    if (!openId) return null;
    const [user] = await getDb().select().from(users).where(eq(users.openId, openId)).limit(1);
    if (user) return toSessionUser(user);
    return upsertOAuthUser({ openId, name: typeof payload.name === 'string' ? payload.name : undefined, email: typeof payload.email === 'string' ? payload.email : null });
  } catch { return null; }
}

export async function getCurrentUser(request: Request): Promise<SessionUser | null> {
  const token = readCookie(request, APP_COOKIE);
  if (!token) return null;
  if (token.split('.').length === 3) {
    const previewUser = await resolvePlatformPreviewToken(token);
    if (previewUser) return previewUser;
  }
  try {
    const [row] = await getDb().select({ userId: appSessions.userId }).from(appSessions)
      .where(and(eq(appSessions.tokenHash, hash(token)), gt(appSessions.expiresAt, new Date()))).limit(1);
    if (!row) return null;
    const [user] = await getDb().select().from(users).where(eq(users.id, row.userId)).limit(1);
    return user ? toSessionUser(user) : null;
  } catch { return null; }
}

export async function createAppSession(userId: string, response: Response, browserOrigin?: string) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_AGE_SECONDS * 1000);
  await getDb().insert(appSessions).values({ tokenHash: hash(token), userId, expiresAt });
  setSessionCookie(response, token, browserOrigin);
}

export async function destroyCurrentSession(request: Request) {
  const token = readCookie(request, APP_COOKIE);
  if (token && token.split('.').length !== 3) {
    try { await getDb().delete(appSessions).where(eq(appSessions.tokenHash, hash(token))); } catch { /* cookie will still be cleared */ }
  }
}

export function requireUser(request: Request, response: Response, next: NextFunction) {
  void getCurrentUser(request).then((user) => {
    if (!user) { response.status(401).json({ error: 'Sign in to continue.' }); return; }
    request.foodloopUser = user;
    next();
  }).catch(() => response.status(401).json({ error: 'Sign in to continue.' }));
}

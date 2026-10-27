import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '../db/client';
import { users } from '../db/schema';
import { clearAuthCookies, clearCookie, createAppSession, destroyCurrentSession, getCurrentUser, hash, readCookie, requireUser, safeEqual, secureCookieForOrigin, setStateCookie, STATE_COOKIE, upsertOAuthUser } from '../auth';

export const authRouter = Router();
const roleSchema = z.enum(['donor', 'ngo', 'partner']);

function originFromRequest(requestOrigin: string | undefined): URL | null {
  if (!requestOrigin) return null;
  try {
    const parsed = new URL(requestOrigin);
    if (!['https:', 'http:'].includes(parsed.protocol)) return null;
    if (parsed.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(parsed.hostname)) return null;
    return parsed;
  } catch { return null; }
}

authRouter.get('/me', async (request, response) => {
  const user = await getCurrentUser(request);
  if (!user) { response.json({ user: null }); return; }
  response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, organizationName: user.organizationName, area: user.area, onboardingComplete: user.onboardingComplete } });
});

authRouter.post('/start', async (request, response) => {
  const portal = process.env.MANUS_OAUTH_PORTAL_URL;
  const projectId = process.env.MANUS_PROJECT_ID;
  if (!portal || !projectId) { response.status(503).json({ error: 'Manus sign-in is not configured for this project.' }); return; }
  const origin = originFromRequest(request.get('origin'));
  if (!origin) { response.status(400).json({ error: 'Could not verify the FoodLoop browser origin. Refresh and try again.' }); return; }
  const redirectUri = new URL('/api/auth/callback', origin).toString();
  const nonce = crypto.randomUUID();
  const state = Buffer.from(JSON.stringify({ redirectUri, nonce })).toString('base64url');
  setStateCookie(response, hash(state), origin.toString());
  const authorization = new URL('/app-auth', portal);
  authorization.searchParams.set('appId', projectId);
  authorization.searchParams.set('redirectUri', redirectUri);
  authorization.searchParams.set('state', state);
  authorization.searchParams.set('responseType', 'code');
  response.json({ authorizationUrl: authorization.toString() });
});

authRouter.get('/callback', async (request, response) => {
  const code = typeof request.query.code === 'string' ? request.query.code : '';
  const state = typeof request.query.state === 'string' ? request.query.state : '';
  const stateCookie = readCookie(request, STATE_COOKIE);
  if (!code || !state || !stateCookie || !safeEqual(stateCookie, hash(state))) {
    response.append('Set-Cookie', clearCookie(STATE_COOKIE, '/api/auth/callback'));
    response.redirect(303, '/login?error=state');
    return;
  }
  let stateData: { redirectUri: string; nonce: string };
  try {
    stateData = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as { redirectUri: string; nonce: string };
    const callback = new URL(stateData.redirectUri);
    if (callback.pathname !== '/api/auth/callback' || !stateData.nonce) throw new Error('Invalid callback state.');
  } catch {
    response.append('Set-Cookie', clearCookie(STATE_COOKIE, '/api/auth/callback'));
    response.redirect(303, '/login?error=state');
    return;
  }
  response.append('Set-Cookie', clearCookie(STATE_COOKIE, '/api/auth/callback', secureCookieForOrigin(stateData.redirectUri)));
  const apiUrl = process.env.MANUS_OAUTH_API_URL;
  const clientId = process.env.MANUS_PROJECT_ID;
  if (!apiUrl || !clientId) { response.redirect(303, '/login?error=provider'); return; }
  try {
    const tokenResponse = await fetch(`${apiUrl.replace(/\/$/, '')}/webdev.v1.WebDevAuthPublicService/ExchangeToken`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, grantType: 'authorization_code', code, redirectUri: stateData.redirectUri }),
    });
    const tokenBody = await tokenResponse.json() as { accessToken?: string; error?: { message?: string } };
    if (!tokenResponse.ok || !tokenBody.accessToken) throw new Error(tokenBody.error?.message || 'Token exchange failed.');
    const identityResponse = await fetch(`${apiUrl.replace(/\/$/, '')}/webdev.v1.WebDevAuthPublicService/GetUserInfo`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken: tokenBody.accessToken }),
    });
    const identity = await identityResponse.json() as { openId?: string; name?: string; email?: string; error?: { message?: string } };
    if (!identityResponse.ok || !identity.openId) throw new Error(identity.error?.message || 'Could not load account identity.');
    const user = await upsertOAuthUser({ openId: identity.openId, name: identity.name, email: identity.email ?? null });
    await createAppSession(user.id, response, stateData.redirectUri);
    response.redirect(303, new URL('/onboarding', stateData.redirectUri).toString());
  } catch (error) {
    console.error('FoodLoop OAuth callback failed:', error instanceof Error ? error.message : 'unknown error');
    response.redirect(303, '/login?error=provider');
  }
});

authRouter.post('/logout', async (request, response) => {
  await destroyCurrentSession(request);
  clearAuthCookies(response, request.get('origin'));
  response.json({ ok: true });
});

authRouter.post('/onboarding', requireUser, async (request, response) => {
  const parsed = z.object({ role: roleSchema, organizationName: z.string().trim().min(2).max(180), area: z.string().trim().max(180).optional() }).safeParse(request.body);
  if (!parsed.success) { response.status(400).json({ error: 'Choose a valid role and organization name.' }); return; }
  const user = request.foodloopUser!;
  await getDb().update(users).set({ role: parsed.data.role, organizationName: parsed.data.organizationName, area: parsed.data.area ?? null, onboardingComplete: true }).where(eq(users.id, user.id));
  response.json({ ok: true });
});

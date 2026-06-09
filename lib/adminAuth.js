// lib/adminAuth.js
// JWT-based authentication — works across Vercel serverless functions.
// No in-memory session store needed. Each token is self-verifying.

import { createHash, createHmac } from 'crypto';

const TOKEN_DURATION = 8 * 60 * 60; // 8 hours in seconds

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'sotr-dev-secret-change-in-production';
}

// ── Simple JWT implementation (no external library) ───────
function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

export function createSession(username) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    sub: username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_DURATION,
  }));
  const sig = createHmac('sha256', getSecret())
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${sig}`;
}

export function validateSession(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const [header, payload, sig] = parts;
    const expected = createHmac('sha256', getSecret())
      .update(`${header}.${payload}`)
      .digest('base64url');
    if (sig !== expected) return null;
    const data = JSON.parse(base64urlDecode(payload));
    if (Date.now() / 1000 > data.exp) return null;
    return { username: data.sub, expiresAt: data.exp * 1000 };
  } catch { return null; }
}

export function destroySession() {
  // JWT tokens are stateless — destruction is handled client-side
  // by deleting the cookie. Nothing to do server-side.
  return true;
}

export function verifyPassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'sotr-admin-2026';
  const secret = getSecret();
  const hash = createHash('sha256').update(password + secret).digest('hex');
  const adminHash = createHash('sha256').update(adminPassword + secret).digest('hex');
  return hash === adminHash;
}

export function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    list[name] = decodeURIComponent(rest.join('=').trim());
  });
  return list;
}

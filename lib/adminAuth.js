// ════════════════════════════════════════════════════════════
// lib/adminAuth.js — Admin Session Management
// Lightweight cookie-based auth for the admin dashboard.
// No external auth library needed — runs entirely server-side.
//
// SETUP: Add to .env.local:
//   ADMIN_PASSWORD=your-strong-password-here
//   ADMIN_SESSION_SECRET=random-32-char-string
// ════════════════════════════════════════════════════════════

import { createHash, randomBytes } from 'crypto';

// ── Session store: pinned to global so Next.js hot reloads don't clear it ──
if (!global._sotrAdminSessions) global._sotrAdminSessions = new Map();
const sessions = global._sotrAdminSessions;
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours

export function createSession(username) {
  const token = randomBytes(32).toString('hex');
  sessions.set(token, {
    username,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION,
  });
  return token;
}

export function validateSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function destroySession(token) {
  sessions.delete(token);
}

export function hashPassword(password) {
  const secret = process.env.ADMIN_SESSION_SECRET || 'sotr-dev-secret-change-in-production';
  return createHash('sha256').update(password + secret).digest('hex');
}

export function verifyPassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'sotr-admin-2026';
  const secret = process.env.ADMIN_SESSION_SECRET || 'sotr-dev-secret-change-in-production';
  const hash = createHash('sha256').update(password + secret).digest('hex');
  const adminHash = createHash('sha256').update(adminPassword + secret).digest('hex');
  return hash === adminHash;
}

// ── Middleware: protect API routes ──
export function requireAuth(handler) {
  return async (req, res) => {
    const token = req.cookies?.['sotr-admin-session'];
    const session = validateSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    req.adminSession = session;
    return handler(req, res);
  };
}

// ── Parse cookies from request header ──
export function parseCookies(req) {
  const list = {};
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

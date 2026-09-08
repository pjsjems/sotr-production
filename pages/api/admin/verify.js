// pages/api/admin/verify.js
import { validateSession, parseCookies } from '../../../lib/adminAuth';

export default function handler(req, res) {
  const cookies = parseCookies(req);
  const token = cookies['sotr-admin-session'];
  const session = validateSession(token);
  if (!session) return res.status(401).json({ authenticated: false });
  res.status(200).json({
    authenticated: true, username: session.username, expiresAt: session.expiresAt,
    // TEMPORARY: confirm the Resend env vars took effect after adding
    // them in Vercel — booleans only, no values exposed. Remove once
    // confirmed.
    _emailDebug: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.FROM_EMAIL || null,
      senderName: process.env.SENDER_NAME || null,
    },
  });
}

// pages/api/admin/verify.js
import { validateSession, parseCookies } from '../../../lib/adminAuth';

export default function handler(req, res) {
  const cookies = parseCookies(req);
  const token = cookies['sotr-admin-session'];
  const session = validateSession(token);
  if (!session) return res.status(401).json({ authenticated: false });
  res.status(200).json({
    authenticated: true, username: session.username, expiresAt: session.expiresAt,
    _kvDebug: {
      hasOldBareVar: !!process.env.KV_REST_API_URL,
      hasNewPrefixedVar: !!process.env.spyontherise_KV_REST_API_URL,
      hasOldToken: !!process.env.KV_REST_API_TOKEN,
      hasNewToken: !!process.env.spyontherise_KV_REST_API_TOKEN,
      urlHostUsed: (() => {
        try {
          const u = process.env.KV_REST_API_URL || process.env.spyontherise_KV_REST_API_URL;
          return u ? new URL(u).host : null;
        } catch { return 'unparseable'; }
      })(),
    },
  });
}

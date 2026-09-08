// pages/api/admin/verify.js
import { validateSession, parseCookies } from '../../../lib/adminAuth';

export default function handler(req, res) {
  const cookies = parseCookies(req);
  const token = cookies['sotr-admin-session'];
  const session = validateSession(token);
  if (!session) return res.status(401).json({ authenticated: false });
  res.status(200).json({ authenticated: true, username: session.username, expiresAt: session.expiresAt });
}

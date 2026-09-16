// pages/api/admin/change-password.js
import { validateSession, parseCookies, verifyPassword, setAdminPassword } from '../../../lib/adminAuth';

export default async function handler(req, res) {
  const cookies = parseCookies(req);
  const session = validateSession(cookies['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).end();

  const { current, next } = req.body || {};
  if (!current || !next) return res.status(400).json({ error: 'Both current and new password required.' });
  if (next.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });

  if (!(await verifyPassword(current))) {
    return res.status(403).json({ error: 'Current password is incorrect.' });
  }

  try {
    await setAdminPassword(next);
    return res.status(200).json({ success: true, message: 'Password updated — takes effect immediately.' });
  } catch (e) {
    return res.status(500).json({ error: 'Could not save new password: ' + e.message });
  }
}

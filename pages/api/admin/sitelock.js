import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { readSiteLock, writeSiteLock } from '../../../lib/adminData';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method === 'GET') {
    const locked = await readSiteLock();
    return res.status(200).json({ locked });
  }
  if (req.method === 'POST') {
    const { locked } = req.body || {};
    if (typeof locked !== 'boolean') return res.status(400).json({ error: 'locked must be boolean' });
    try {
      await writeSiteLock(locked);
      return res.status(200).json({ success: true, locked });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  res.status(405).end();
}

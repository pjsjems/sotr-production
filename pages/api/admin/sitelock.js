import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { readSiteLock, writeSiteLock } from '../../../lib/adminData';

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method === 'GET') {
    const locked = await readSiteLock();
    return res.status(200).json({ locked });
  }
  if (req.method === 'POST') {
    const { locked } = req.body || {};
    if (typeof locked !== 'boolean') return res.status(400).json({ error: 'locked must be boolean' });
    await writeSiteLock(locked);
    return res.status(200).json({ success: true, locked });
  }
  res.status(405).end();
}

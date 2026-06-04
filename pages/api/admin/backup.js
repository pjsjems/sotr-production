import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { listBackups, restoreBackup } from '../../../lib/adminData';

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method === 'GET') return res.status(200).json({ backups: listBackups() });
  if (req.method === 'POST') {
    const { filename } = req.body || {};
    if (!filename) return res.status(400).json({ error: 'Filename required' });
    try { return res.status(200).json(await restoreBackup(filename)); }
    catch (e) { return res.status(500).json({ error: e.message }); }
  }
  res.status(405).end();
}

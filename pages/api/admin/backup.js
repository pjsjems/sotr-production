// pages/api/admin/backup.js
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { listBackups, restoreBackup } from '../../../lib/adminData';

export default function handler(req, res) {
  const cookies = parseCookies(req);
  const session = validateSession(cookies['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    return res.status(200).json({ backups: listBackups() });
  }

  if (req.method === 'POST') {
    const { filename } = req.body || {};
    if (!filename) return res.status(400).json({ error: 'Filename required' });
    try {
      const result = restoreBackup(filename);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}

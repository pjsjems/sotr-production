// pages/api/admin/catalog.js
import { requireAuth, parseCookies, validateSession } from '../../../lib/adminAuth';
import { getBooksArray, getSeriesSummary, getDashboardStats, listBackups, getBundlesArray } from '../../../lib/adminData';

export default function handler(req, res) {
  const cookies = parseCookies(req);
  const session = validateSession(cookies['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'GET') return res.status(405).end();

  try {
    const books = getBooksArray();
    const series = getSeriesSummary();
    const stats = getDashboardStats();
    const backups = listBackups();
    const bundles = getBundlesArray();
    res.status(200).json({ books, series, stats, backups, bundles });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

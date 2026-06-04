import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { getBooksArray, getSeriesSummary, getDashboardStats, listBackups } from '../../../lib/adminData';

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const [books, series, stats] = await Promise.all([
      getBooksArray(), getSeriesSummary(), getDashboardStats(),
    ]);
    res.status(200).json({ books, series, stats, backups: listBackups() });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { getBooksArray, getSeriesSummary, getDashboardStats, listBackups, readSiteLock, getPlatforms, getPublishingData } from '../../../lib/adminData';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized, please log in again' });
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const [books, series, stats, siteLocked, platforms, backups, publishing] = await Promise.all([
      getBooksArray(), getSeriesSummary(), getDashboardStats(), readSiteLock(), getPlatforms(), listBackups(), getPublishingData(),
    ]);
    res.status(200).json({ books, series, stats, backups, siteLocked, platforms, publishing });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

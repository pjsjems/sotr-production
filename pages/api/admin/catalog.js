import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { getBooksArray, getSeriesSummary, getDashboardStats, listBackups, readSiteLock, getPlatforms, getPublishingData, readSiteConfig } from '../../../lib/adminData';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized, please log in again' });
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const [books, series, stats, siteLocked, platforms, backups, publishing, config] = await Promise.all([
      getBooksArray(), getSeriesSummary(), getDashboardStats(), readSiteLock(), getPlatforms(), listBackups(), getPublishingData(), readSiteConfig(),
    ]);
    const featuredBookKeys = (Array.isArray(config.featuredBookKeys)
      ? config.featuredBookKeys
      : ['mercer1', 'iran', 'anatomy2', 'chess', 'atlas', 'neural'])
      .filter(key => books.some(book => book.key === key && !book.hidden))
      .slice(0, 4);
    const footerBookKeys = (Array.isArray(config.footerBookKeys)
      ? config.footerBookKeys
      : ['mercer1','mercer7','iran','warorbits','anatomy2','chess','atlas','teacher','neural','invisible','haiti','crooked1'])
      .filter(key => books.some(book => book.key === key && !book.hidden));
    res.status(200).json({ books, series, stats, siteLocked, platforms, backups, publishing, featuredBookKeys, footerBookKeys });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

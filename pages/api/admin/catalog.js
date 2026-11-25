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
    const featuredBookDefaults = ['mercer1', 'iran', 'anatomy2', 'chess', 'atlas', 'neural'];
    const configuredFeaturedKeys = (Array.isArray(config.featuredBookKeys)
      ? config.featuredBookKeys
      : featuredBookDefaults)
      .filter(key => books.some(book => book.key === key && !book.hidden));
    const featuredBookKeys = [...configuredFeaturedKeys];
    for (const key of featuredBookDefaults) {
      if (featuredBookKeys.length >= 12) break;
      if (!featuredBookKeys.includes(key) && books.some(book => book.key === key && !book.hidden)) featuredBookKeys.push(key);
    }
    const featuredBookCount = Number.isInteger(config.featuredBookCount) && config.featuredBookCount >= 1
      ? config.featuredBookCount
      : 6;
    const footerBookKeys = (Array.isArray(config.footerBookKeys)
      ? config.footerBookKeys
      : ['mercer1','mercer7','iran','warorbits','anatomy2','chess','atlas','teacher','neural','invisible','haiti','crooked1'])
      .filter(key => books.some(book => book.key === key && !book.hidden));
    res.status(200).json({ books, series, stats, siteLocked, platforms, backups, publishing, featuredBookKeys, featuredBookCount, footerBookKeys });
  } catch (e) { res.status(500).json({ error: e.message }); }
}

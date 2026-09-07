import { parseCatalog, readSiteLock, readSiteConfig } from '../../lib/adminData';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const [catalog, locked, config] = await Promise.all([parseCatalog(), readSiteLock(), readSiteConfig()]);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({
      BOOKS:      catalog.BOOKS     || {},
      SERIES:     catalog.SERIES    || {},
      BUNDLES:    catalog.BUNDLES   || [],
      PLATFORMS:  catalog.PLATFORMS || {},
      siteLocked: locked,
      config: {
        socialLinks: config.socialLinks || {},
        footerTagline: config.footerTagline || {},
      },
    });
  } catch (e) { return res.status(500).json({ error: e.message }); }
}

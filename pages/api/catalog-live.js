import { readCatalog, readSiteLock } from '../../lib/kvStore';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const [catalog, locked] = await Promise.all([
      readCatalog(),
      readSiteLock(),
    ]);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({
      BOOKS:      catalog.BOOKS     || {},
      SERIES:     catalog.SERIES    || {},
      BUNDLES:    catalog.BUNDLES   || [],
      PLATFORMS:  catalog.PLATFORMS || {},
      siteLocked: locked,
    });
  } catch (e) {
    console.error('[catalog-live]', e.message);
    return res.status(500).json({ error: 'Failed to read catalog' });
  }
}

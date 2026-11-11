import { readSiteConfig } from '../../lib/adminData';
import { normalizeSiteContent } from '../../lib/siteContent';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const config = await readSiteConfig();
    return res.status(200).json({ content: normalizeSiteContent(config.content) });
  } catch (e) {
    console.error('[content] Failed to load public content:', e.message);
    return res.status(500).json({ error: 'Unable to load site content' });
  }
}

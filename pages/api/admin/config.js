// pages/api/admin/config.js: read/write site config (forwarding email, footer, etc.)
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { readSiteConfig, writeSiteConfig } from '../../../lib/adminData';

const ALLOWED_KEYS = ['forwardEmail', 'socialLinks', 'footerTagline'];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      return res.status(200).json({ config: await readSiteConfig() });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    const updates = req.body || {};
    try {
      const cfg = await readSiteConfig();
      for (const key of ALLOWED_KEYS) {
        if (key in updates) cfg[key] = updates[key];
      }
      await writeSiteConfig(cfg);
      return res.status(200).json({ success: true, config: cfg });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}

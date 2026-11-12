// pages/api/admin/config.js: read/write site config (forwarding email, footer, etc.)
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { parseCatalog, readSiteConfig, writeSiteConfig } from '../../../lib/adminData';
import { normalizeSiteContent } from '../../../lib/siteContent';

const ALLOWED_KEYS = ['forwardEmail', 'socialLinks', 'footerTagline', 'headerTagline', 'content', 'featuredBookKeys', 'footerBookKeys'];

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
      const selectedBookFields = ['featuredBookKeys', 'footerBookKeys'].filter(key => key in updates);
      if (selectedBookFields.length) {
        const catalog = await parseCatalog();
        for (const field of selectedBookFields) {
          const keys = updates[field];
          const label = field === 'featuredBookKeys' ? 'homepage banner' : 'footer';
          if (!Array.isArray(keys) || (field === 'featuredBookKeys' && keys.length > 4) ||
            keys.some(key => typeof key !== 'string')) {
            return res.status(400).json({ error: field === 'featuredBookKeys'
              ? 'Select no more than four catalog books for the homepage banner.'
              : 'Footer book selection must be a list of catalog book keys.' });
          }
          if (new Set(keys).size !== keys.length) {
            return res.status(400).json({ error: `A book can only be selected once for the ${label}.` });
          }
          const invalidKey = keys.find(key => !catalog.BOOKS?.[key] || catalog.BOOKS[key].hidden);
          if (invalidKey) {
            return res.status(400).json({ error: `Book "${invalidKey}" is unavailable for the ${label}.` });
          }
        }
      }
      const cfg = await readSiteConfig();
      for (const key of ALLOWED_KEYS) {
        if (key in updates) {
          cfg[key] = key === 'content' ? normalizeSiteContent(updates[key]) : updates[key];
        }
      }
      await writeSiteConfig(cfg);
      return res.status(200).json({ success: true, config: cfg });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}

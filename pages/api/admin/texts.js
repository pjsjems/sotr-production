// pages/api/admin/texts.js: CRUD for texts (admin only), stored via KV/file
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { readTexts, writeTexts } from '../../../lib/adminData';

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const raw = await readTexts();
      return res.status(200).json({ texts: Array.isArray(raw) ? raw : [] });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    const { action, text, id } = req.body || {};
    try {
      const raw = await readTexts();
      const texts = Array.isArray(raw) ? raw : [];

      if (action === 'save') {
        if (!text?.id || !text?.title_en)
          return res.status(400).json({ error: 'id and title_en required' });
        const idx = texts.findIndex(t => t.id === text.id);
        if (idx >= 0) texts[idx] = { ...texts[idx], ...text };
        else texts.unshift({
          publishedAt: new Date().toISOString().slice(0, 10),
          featured: false,
          ...text,
        });
        if (text.featured) texts.forEach(t => { if (t.id !== text.id) t.featured = false; });
        await writeTexts(texts);
        return res.status(200).json({ success: true });
      }

      if (action === 'feature') {
        texts.forEach(t => { t.featured = (t.id === id); });
        await writeTexts(texts);
        return res.status(200).json({ success: true });
      }

      if (action === 'delete') {
        await writeTexts(texts.filter(t => t.id !== id));
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Unknown action' });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}

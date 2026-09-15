// pages/api/admin/texts.js: CRUD for texts (admin only), stored via KV/file
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { readTexts, writeTexts } from '../../../lib/adminData';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
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
        // Note: no publishedAt auto-stamp here. publishedAt is legacy
        // display/fallback state (see lib/textSchedule.js) — it's only
        // ever set together with scheduledAt below, so a brand new
        // draft (scheduledAt: null) has no publishedAt to accidentally
        // fall back to and stays correctly invisible to the public.
        const idx = texts.findIndex(t => t.id === text.id);
        if (idx >= 0) texts[idx] = { ...texts[idx], ...text };
        else texts.unshift({
          scheduledAt: null,
          hidden: false,
          ...text,
        });
        await writeTexts(texts);
        return res.status(200).json({ success: true });
      }

      // Publish immediately: schedules the text for right now and clears
      // any hide override. Whether it becomes THE current Text of the
      // Month (vs. an archived one) is computed from its scheduledAt
      // relative to every other visible text — see lib/textSchedule.js.
      if (action === 'publish-now') {
        const t = texts.find(x => x.id === id);
        if (!t) return res.status(404).json({ error: 'Text not found' });
        const now = new Date();
        t.scheduledAt = now.toISOString();
        t.publishedAt = now.toISOString().slice(0, 10);
        t.hidden = false;
        await writeTexts(texts);
        return res.status(200).json({ success: true, scheduledAt: t.scheduledAt });
      }

      // Set/change/clear the go-live date and time. An empty scheduledAt
      // reverts the text to a draft (never public). publishedAt (the
      // legacy date shown on public pages) is kept in sync with it so
      // the two fields never disagree.
      if (action === 'schedule') {
        const t = texts.find(x => x.id === id);
        if (!t) return res.status(404).json({ error: 'Text not found' });
        const { scheduledAt } = req.body || {};
        if (scheduledAt) {
          const parsed = new Date(scheduledAt);
          if (Number.isNaN(parsed.getTime())) return res.status(400).json({ error: 'Invalid date' });
          t.scheduledAt = parsed.toISOString();
          t.publishedAt = parsed.toISOString().slice(0, 10);
        } else {
          t.scheduledAt = null;
          t.publishedAt = null;
        }
        await writeTexts(texts);
        return res.status(200).json({ success: true, scheduledAt: t.scheduledAt });
      }

      // Manual visibility kill-switch, independent of scheduling.
      if (action === 'toggle-hidden') {
        const t = texts.find(x => x.id === id);
        if (!t) return res.status(404).json({ error: 'Text not found' });
        t.hidden = !t.hidden;
        await writeTexts(texts);
        return res.status(200).json({ success: true, hidden: t.hidden });
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

// pages/api/texts.js
// GET  /api/texts          — returns all texts (preview only, no full content)
// GET  /api/texts?id=slug  — returns preview for one text
// POST /api/texts          — email gate: returns full text after email capture
import fs from 'fs';
import path from 'path';

const TEXTS_PATH = path.join(process.cwd(), 'data', 'texts.json');

function readTexts() {
  try { return JSON.parse(fs.readFileSync(TEXTS_PATH, 'utf8')); }
  catch { return []; }
}

// Strip full content for public listing
function sanitize(t) {
  const { full_en, full_fr, full_es, ...safe } = t;
  return safe;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    const texts = readTexts();
    const { id } = req.query;
    if (id) {
      const t = texts.find(x => x.id === id);
      if (!t) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(sanitize(t));
    }
    return res.status(200).json(texts.map(sanitize));
  }

  // POST — email gate: caller submits { id, email, lang }
  // We record the email via newsletter API and return the full text
  if (req.method === 'POST') {
    const { id, email, lang = 'en' } = req.body || {};
    if (!id || !email) return res.status(400).json({ error: 'id and email required' });
    if (!email.includes('@')) return res.status(400).json({ error: 'Invalid email' });

    const texts = readTexts();
    const t = texts.find(x => x.id === id);
    if (!t) return res.status(404).json({ error: 'Text not found' });

    // Subscribe email via existing newsletter system
    try {
      const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      await fetch(`${base}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, lang,
          bookKey: t.id,
          bookTitle: t[`title_${lang}`] || t.title_en,
          type: 'text-of-month',
          tag: `text-${t.id}`,
        }),
      });
    } catch (e) {
      console.warn('[texts] Newsletter subscribe failed:', e.message);
    }

    // Return the full text content
    return res.status(200).json({
      success: true,
      full_en: t.full_en,
      full_fr: t.full_fr,
      full_es: t.full_es,
    });
  }

  res.status(405).end();
}

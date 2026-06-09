// pages/api/admin/texts.js — CRUD for texts.json (admin only)
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import fs from 'fs';
import path from 'path';

const TEXTS_PATH = path.join(process.cwd(), 'data', 'texts.json');

function read() {
  try { return JSON.parse(fs.readFileSync(TEXTS_PATH, 'utf8')); }
  catch { return []; }
}
function write(data) {
  fs.writeFileSync(TEXTS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export default function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  // GET — list all
  if (req.method === 'GET') {
    return res.status(200).json({ texts: read() });
  }

  // POST — create or update
  if (req.method === 'POST') {
    const { action, text } = req.body || {};

    if (action === 'save') {
      if (!text?.id || !text?.title_en) return res.status(400).json({ error: 'id and title_en required' });
      const texts = read();
      const idx = texts.findIndex(t => t.id === text.id);
      if (idx >= 0) texts[idx] = { ...texts[idx], ...text };
      else texts.unshift({ publishedAt: new Date().toISOString().slice(0,10), featured: false, ...text });
      write(texts);
      return res.status(200).json({ success: true });
    }

    if (action === 'feature') {
      const { id } = req.body;
      const texts = read();
      texts.forEach(t => { t.featured = t.id === id; });
      write(texts);
      return res.status(200).json({ success: true });
    }

    if (action === 'delete') {
      const { id } = req.body;
      write(read().filter(t => t.id !== id));
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  res.status(405).end();
}

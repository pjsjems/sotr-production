// pages/api/covers/[key].js — serves a book cover uploaded via the admin
// dashboard (pages/api/admin/upload-image.js), which stores it in KV
// rather than on the (read-only, in production) filesystem.
import { KV_URL, KV_TOKEN } from '../../../lib/adminData';

export default async function handler(req, res) {
  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'key required' });
  if (!KV_URL || !KV_TOKEN) return res.status(501).json({ error: 'Storage not configured' });

  try {
    const r = await fetch(`${KV_URL}/get/sotr:book-cover:${key}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    const json = await r.json();
    if (!json.result) return res.status(404).json({ error: 'No cover found' });

    const payload = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
    const buffer = Buffer.from(payload.data, 'base64');
    res.setHeader('Content-Type', payload.mimeType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

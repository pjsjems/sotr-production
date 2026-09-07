import { KV_URL, KV_TOKEN } from '../../../lib/adminData';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'id required' });
  const lang = ['en', 'fr', 'es'].includes(req.query.lang) ? req.query.lang : 'en';

  const kvUrl   = KV_URL;
  const kvToken = KV_TOKEN;

  if (!kvUrl || !kvToken) {
    return res.status(501).json({ error: 'Storage not configured' });
  }

  try {
    const fileKey = lang === 'en'
      ? `sotr:text-attachment:${id}`
      : `sotr:text-attachment:${id}:${lang}`;
    const r = await fetch(`${kvUrl}/get/${fileKey}`, {
      headers: { Authorization: `Bearer ${kvToken}` },
    });
    const json = await r.json();
    if (!json.result) return res.status(404).json({ error: 'No attachment found' });

    const payload = typeof json.result === 'string'
      ? JSON.parse(json.result) : json.result;

    const buffer = Buffer.from(payload.data, 'base64');
    res.setHeader('Content-Type', payload.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${payload.fileName}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(buffer);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

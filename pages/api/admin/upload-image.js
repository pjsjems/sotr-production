// pages/api/admin/upload-image.js
// Cover images are stored in KV (like Text of the Month attachments —
// see upload-text.js), not on the deployed filesystem: Vercel's
// filesystem is read-only outside /tmp, so writing into public/covers/
// at request time always throws in production. Served back out via
// pages/api/covers/[key].js.
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { updateBook, updateSeries, KV_URL, KV_TOKEN } from '../../../lib/adminData';
import formidable from 'formidable';
import fs from 'fs';
import os from 'os';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  if (!KV_URL || !KV_TOKEN) {
    return res.status(501).json({ error: 'File storage not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.' });
  }

  const form = formidable({
    uploadDir: os.tmpdir(), // the only writable path in a serverless deployment
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024,
    filter: ({ mimetype }) => mimetype && mimetype.startsWith('image/'),
  });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const entityKey = (Array.isArray(fields.entityKey) ? fields.entityKey[0] : fields.entityKey)
      || (Array.isArray(fields.bookKey) ? fields.bookKey[0] : fields.bookKey);
    const entityType = (Array.isArray(fields.entityType) ? fields.entityType[0] : fields.entityType) || 'book';
    const language = (Array.isArray(fields.language) ? fields.language[0] : fields.language) || 'en';
    const rawLanguages = Array.isArray(fields.languages) ? fields.languages[0] : fields.languages;
    const file = Array.isArray(files.cover) ? files.cover[0] : files.cover;
    if (!entityKey || !file) return res.status(400).json({ error: 'entityKey and cover file required' });
    if (!['book', 'series'].includes(entityType)) return res.status(400).json({ error: 'entityType must be book or series' });
    if (!['en', 'fr', 'es'].includes(language)) return res.status(400).json({ error: 'language must be en, fr, or es' });
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(entityKey)) return res.status(400).json({ error: 'Invalid entity key' });
    let languages = [language];
    if (rawLanguages) {
      try {
        languages = JSON.parse(rawLanguages);
      } catch {
        return res.status(400).json({ error: 'languages must be a JSON array of en, fr, and es.' });
      }
    }
    if (!Array.isArray(languages) || !languages.length ||
      languages.some(item => !['en', 'fr', 'es'].includes(item)) ||
      new Set(languages).size !== languages.length ||
      !languages.includes(language)) {
      return res.status(400).json({ error: 'Select one or more valid image display languages including the upload language.' });
    }

    try {
      const buffer = fs.readFileSync(file.filepath);
      fs.unlink(file.filepath, () => {}); // best-effort cleanup of the tmp copy
      const fileKey = entityType === 'book' && language === 'en'
        ? `sotr:book-cover:${entityKey}`
        : `sotr:${entityType}-cover:${entityKey}:${language}`;
      const uploadedAt = Date.now();
      const payload = {
        fileName: file.originalFilename || `${entityKey}-${language}.jpg`,
        mimeType: file.mimetype || 'image/jpeg',
        data: buffer.toString('base64'),
        uploadedAt: new Date(uploadedAt).toISOString(),
      };
      const r = await fetch(`${KV_URL}/set/${fileKey}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error(`KV write failed: HTTP ${r.status}`);

      // A version query param changes on every upload, so the long,
      // immutable cache on pages/api/covers/[key].js can't ever serve a
      // stale image after a re-upload — the old URL just stops being
      // referenced anywhere, rather than needing to be invalidated.
      const query = new URLSearchParams({ entity: entityType, lang: language, v: String(uploadedAt) });
      const imageUrl = `/api/covers/${entityKey}?${query.toString()}`;
      if (entityType === 'book') {
        const updates = Object.fromEntries(languages.map(item => [`image_${item}`, imageUrl]));
        if (languages.includes('en')) updates.image = imageUrl;
        await updateBook(entityKey, updates);
      } else {
        await updateSeries({
          key: entityKey,
          ...Object.fromEntries(languages.map(item => [`cover_${item}`, imageUrl])),
        });
      }
      return res.status(200).json({ success: true, image: imageUrl });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });
}

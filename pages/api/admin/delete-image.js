import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { parseCatalog, updateBook, updateSeries, KV_URL, KV_TOKEN } from '../../../lib/adminData';

const LANGUAGES = ['en', 'fr', 'es'];

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  const { entityType, entityKey, language } = req.body || {};
  if (!['book', 'series'].includes(entityType)) return res.status(400).json({ error: 'entityType must be book or series' });
  if (!LANGUAGES.includes(language)) return res.status(400).json({ error: 'language must be en, fr, or es' });
  if (typeof entityKey !== 'string' || !/^[a-z0-9][a-z0-9-]*$/i.test(entityKey)) {
    return res.status(400).json({ error: 'Invalid entity key' });
  }

  try {
    const catalog = await parseCatalog();
    const record = entityType === 'book' ? catalog.BOOKS?.[entityKey] : catalog.SERIES?.[entityKey];
    if (!record) return res.status(404).json({ error: `${entityType} not found` });

    const prefix = entityType === 'book' ? 'image' : 'cover';
    const field = `${prefix}_${language}`;
    const imageUrl = record[field] || (entityType === 'book' && language === 'en' ? record.image : '');
    if (!imageUrl) return res.status(404).json({ error: 'No image is set for this language' });

    const updates = { [field]: '' };
    if (entityType === 'book' && language === 'en') updates.image = '';
    if (entityType === 'book') await updateBook(entityKey, updates);
    else await updateSeries({ key: entityKey, ...updates });

    let cleanupWarning = '';
    const stillReferenced = LANGUAGES.some(item =>
      item !== language && record[`${prefix}_${item}`] === imageUrl,
    );
    if (!stillReferenced && KV_URL && KV_TOKEN) {
      try {
        const image = new URL(imageUrl, 'https://www.spyontherise.com');
        const expectedPath = `/api/covers/${entityKey}`;
        const storedEntity = image.searchParams.get('entity');
        const storedLanguage = image.searchParams.get('lang');
        if (image.pathname === expectedPath && storedEntity === entityType && LANGUAGES.includes(storedLanguage)) {
          const fileKey = entityType === 'book' && storedLanguage === 'en'
            ? `sotr:book-cover:${entityKey}`
            : `sotr:${entityType}-cover:${entityKey}:${storedLanguage}`;
          const response = await fetch(`${KV_URL}/del/${fileKey}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${KV_TOKEN}` },
          });
          if (!response.ok) throw new Error(`Image storage delete failed: HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('[delete-image] image storage cleanup failed:', error.message);
        cleanupWarning = `Image reference was removed, but stored image cleanup failed: ${error.message}`;
      }
    }

    return res.status(200).json({ success: true, image: '', warning: cleanupWarning });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

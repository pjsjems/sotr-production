// pages/api/admin/add-book.js — append a new book entry to data/catalog.js
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { addBook, generateBookKey, parseCatalog } from '../../../lib/adminData';

export default function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  const { bookData, previewKey } = req.body || {};

  // Preview key generation without saving
  if (previewKey) {
    try {
      const { BOOKS } = parseCatalog();
      const key = generateBookKey(previewKey, Object.keys(BOOKS));
      return res.status(200).json({ key });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (!bookData || !bookData.title) return res.status(400).json({ error: 'Title is required' });

  try {
    const result = addBook(bookData);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// pages/api/admin/book.js
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { updateBook, toggleAvailability, updateSynopsis } from '../../../lib/adminData';

export default function handler(req, res) {
  const cookies = parseCookies(req);
  const session = validateSession(cookies['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).end();

  const { action, key, updates, synopsis, retailerUrls } = req.body || {};
  if (!key) return res.status(400).json({ error: 'Book key required' });

  try {
    let result;

    switch (action) {
      case 'toggle':
        result = toggleAvailability(key);
        break;
      case 'update':
        if (!updates || typeof updates !== 'object')
          return res.status(400).json({ error: 'Updates object required' });
        result = updateBook(key, updates);
        break;
      case 'synopsis':
        if (!synopsis)
          return res.status(400).json({ error: 'Synopsis object required' });
        result = updateSynopsis(key, synopsis, retailerUrls);
        break;
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }

    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

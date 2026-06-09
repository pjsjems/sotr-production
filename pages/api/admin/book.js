import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { updateBook, toggleAvailability, toggleHidden, updateSynopsis } from '../../../lib/adminData';

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized — please log in again' });
  if (req.method !== 'POST') return res.status(405).end();
  const { action, key, updates, synopsis } = req.body || {};
  if (!key) return res.status(400).json({ error: 'Book key required' });
  try {
    let result;
    if (action === 'toggle')        result = await toggleAvailability(key);
    else if (action === 'hide')     result = await toggleHidden(key);
    else if (action === 'update')   result = await updateBook(key, updates || {});
    else if (action === 'synopsis') result = await updateSynopsis(key, synopsis || {});
    else return res.status(400).json({ error: 'Unknown action' });
    res.status(200).json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

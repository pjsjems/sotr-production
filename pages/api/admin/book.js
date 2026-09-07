import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { updateBook, toggleAvailability, toggleHidden, updateSynopsis, addPlatform, updateSeries } from '../../../lib/adminData';

const NO_KEY_ACTIONS = ['add-platform', 'update-series'];

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized, please log in again' });
  if (req.method !== 'POST') return res.status(405).end();
  const { action, key, updates, synopsis, platform, platformType, series } = req.body || {};
  if (!NO_KEY_ACTIONS.includes(action) && !key) return res.status(400).json({ error: 'Book key required' });
  try {
    let result;
    if (action === 'toggle')        result = await toggleAvailability(key);
    else if (action === 'hide')     result = await toggleHidden(key);
    else if (action === 'update')   result = await updateBook(key, updates || {});
    else if (action === 'synopsis') result = await updateSynopsis(key, synopsis || {});
    else if (action === 'add-platform') {
      if (!platform || !platformType) return res.status(400).json({ error: 'platform and platformType required' });
      result = await addPlatform(platform, platformType);
    }
    else if (action === 'update-series') {
      if (!series?.key) return res.status(400).json({ error: 'series key required' });
      result = await updateSeries(series);
    }
    else return res.status(400).json({ error: 'Unknown action' });
    res.status(200).json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

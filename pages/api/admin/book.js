import { validateSession, parseCookies } from '../../../lib/adminAuth';
import {
  updateBook, toggleAvailability, toggleHidden, updateSynopsis,
  addPlatform, updatePlatform, deletePlatform,
  updateSeries, addSeries, addBookToSeries, removeBookFromSeries,
} from '../../../lib/adminData';

const NO_KEY_ACTIONS = [
  'add-platform', 'update-platform', 'delete-platform',
  'update-series', 'add-series', 'series-add-book', 'series-remove-book',
];

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized, please log in again' });
  if (req.method !== 'POST') return res.status(405).end();
  const {
    action, key, updates, synopsis, links, platform, platformType,
    series, seriesKey, bookKey,
  } = req.body || {};
  if (!NO_KEY_ACTIONS.includes(action) && !key) return res.status(400).json({ error: 'Book key required' });
  try {
    let result;
    if (action === 'toggle')        result = await toggleAvailability(key);
    else if (action === 'hide')     result = await toggleHidden(key);
    else if (action === 'update')   result = await updateBook(key, updates || {});
    else if (action === 'synopsis') result = await updateSynopsis(key, synopsis || {}, links);
    else if (action === 'add-platform') {
      if (!platform || !platformType) return res.status(400).json({ error: 'platform and platformType required' });
      result = await addPlatform(platform, platformType);
    }
    else if (action === 'update-platform') {
      if (!platformType || !platform?.key) return res.status(400).json({ error: 'platformType and platform.key required' });
      result = await updatePlatform(platformType, platform.key, platform);
    }
    else if (action === 'delete-platform') {
      if (!platformType || !platform?.key) return res.status(400).json({ error: 'platformType and platform.key required' });
      result = await deletePlatform(platformType, platform.key);
    }
    else if (action === 'update-series') {
      if (!series?.key) return res.status(400).json({ error: 'series key required' });
      result = await updateSeries(series);
    }
    else if (action === 'add-series') {
      if (!series?.name) return res.status(400).json({ error: 'series name required' });
      result = await addSeries(series);
    }
    else if (action === 'series-add-book') {
      if (!seriesKey || !bookKey) return res.status(400).json({ error: 'seriesKey and bookKey required' });
      result = await addBookToSeries(seriesKey, bookKey);
    }
    else if (action === 'series-remove-book') {
      if (!seriesKey || !bookKey) return res.status(400).json({ error: 'seriesKey and bookKey required' });
      result = await removeBookFromSeries(seriesKey, bookKey);
    }
    else return res.status(400).json({ error: 'Unknown action' });
    res.status(200).json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
}

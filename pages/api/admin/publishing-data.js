import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { addAuthor, addCollection, addPublisher, migratePublishingData } from '../../../lib/adminData';

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized, please log in again' });
  if (req.method !== 'POST') return res.status(405).end();

  const { action, collection } = req.body || {};
  try {
    if (action === 'migrate') return res.status(200).json(await migratePublishingData());
    if (action === 'create-author') return res.status(200).json(await addAuthor(req.body?.author));
    if (action === 'create-publisher') return res.status(200).json(await addPublisher(req.body?.publisher));
    if (action === 'create-collection') {
      return res.status(200).json(await addCollection(collection));
    }
    return res.status(400).json({ error: 'Unknown publishing-data action.' });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
}

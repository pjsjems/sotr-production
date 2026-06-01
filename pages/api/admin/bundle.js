// pages/api/admin/bundle.js
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { saveBundle, deleteBundle, getBundlesArray } from '../../../lib/adminData';

export default function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try { return res.status(200).json({ bundles: getBundlesArray() }); }
    catch (e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'POST') {
    const { action, bundle, id } = req.body || {};
    try {
      if (action === 'save') {
        if (!bundle || !bundle.id || !bundle.title) return res.status(400).json({ error: 'Bundle id and title required' });
        return res.status(200).json(saveBundle(bundle));
      }
      if (action === 'delete') {
        if (!id) return res.status(400).json({ error: 'Bundle id required' });
        return res.status(200).json(deleteBundle(id));
      }
      return res.status(400).json({ error: 'Unknown action' });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  res.status(405).end();
}

// pages/api/admin/toggle-featured.js
// Admin-only: patches is_featured on a freeText document in Sanity.
// Requires SANITY_WRITE_TOKEN in .env.local

import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { createClient } from 'next-sanity';

const writeClient = createClient({
  projectId:  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder',
  dataset:    process.env.NEXT_PUBLIC_SANITY_DATASET    || 'production',
  apiVersion: '2024-01-01',
  token:      process.env.SANITY_WRITE_TOKEN,
  useCdn:     false,
});

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id, is_featured } = req.body || {};
  if (!id || typeof is_featured !== 'boolean')
    return res.status(400).json({ error: 'Missing id or is_featured' });

  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.SANITY_WRITE_TOKEN)
    return res.status(503).json({ error: 'Sanity not configured — set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN' });

  try {
    if (is_featured) {
      const others = await writeClient.fetch(
        `*[_type == "freeText" && is_featured == true && _id != $id]{ _id }`, { id }
      );
      await Promise.all(others.map(doc => writeClient.patch(doc._id).set({ is_featured: false }).commit()));
    }
    await writeClient.patch(id).set({ is_featured }).commit();
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[toggle-featured]', err);
    return res.status(500).json({ error: 'Sanity patch failed' });
  }
}

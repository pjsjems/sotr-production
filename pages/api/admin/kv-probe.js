// TEMPORARY diagnostic — isolated write/read probe against a throwaway
// key, unrelated to any real data, to see whether this KV store durably
// persists a write at all. Delete this file once the investigation into
// the disappearing-text bug is resolved.
import { validateSession, parseCookies } from '../../../lib/adminAuth';

const KV_URL = process.env.KV_REST_API_URL || process.env.spyontherise_KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.spyontherise_KV_REST_API_TOKEN;

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const key = 'sotr:__probe__';
  const value = `probe-${Date.now()}`;
  const out = { value, key };
  try {
    const setR = await fetch(`${KV_URL}/set/${key}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    out.setStatus = setR.status;
    out.setHeaders = Object.fromEntries(setR.headers.entries());
    out.setBody = await setR.text();

    const getR = await fetch(`${KV_URL}/get/${key}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
    out.getStatusImmediate = getR.status;
    out.getHeadersImmediate = Object.fromEntries(getR.headers.entries());
    out.getBodyImmediate = await getR.text();
  } catch (e) {
    out.error = e.message;
  }
  res.status(200).json(out);
}

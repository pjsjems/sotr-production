// TEMPORARY diagnostic — write a throwaway key, then read it back at
// several delays within the SAME request/response cycle, to see exactly
// when (if ever) the write becomes visible and whether it ever reverts.
// Delete this file once the disappearing-text investigation is resolved.
import { validateSession, parseCookies } from '../../../lib/adminAuth';

const KV_URL = process.env.KV_REST_API_URL || process.env.spyontherise_KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.spyontherise_KV_REST_API_TOKEN;

async function get(key) {
  const r = await fetch(`${KV_URL}/get/${key}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
  const syncToken = r.headers.get('upstash-sync-token');
  const body = await r.text();
  return { status: r.status, syncToken, body };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const key = 'sotr:__probe2__';
  const value = `probe-${Date.now()}`;
  const out = { value, key, reads: [] };

  try {
    const setR = await fetch(`${KV_URL}/set/${key}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    out.setStatus = setR.status;
    out.setSyncToken = setR.headers.get('upstash-sync-token');
    out.setBody = await setR.text();

    for (const delayMs of [0, 500, 2000, 5000]) {
      if (delayMs) await sleep(delayMs);
      const r = await get(key);
      out.reads.push({ afterMs: delayMs, ...r });
    }

    // Also check what's actually in sotr:texts right now, to see if the
    // real key shows the same pattern as this throwaway one.
    out.textsNow = await get('sotr:texts');
  } catch (e) {
    out.error = e.message;
  }
  res.status(200).json(out);
}

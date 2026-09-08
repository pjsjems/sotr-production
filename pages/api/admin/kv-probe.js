// TEMPORARY diagnostic — replicate the exact read-modify-write pattern
// used by the real texts save flow, but on a throwaway key, to isolate
// whether the bug is about that pattern in general or specific to the
// real "sotr:texts" key. Delete once the investigation is resolved.
import { validateSession, parseCookies } from '../../../lib/adminAuth';

const KV_URL = process.env.KV_REST_API_URL || process.env.spyontherise_KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.spyontherise_KV_REST_API_TOKEN;

async function kvGet(key) {
  const r = await fetch(`${KV_URL}/get/${key}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
  const body = await r.json().catch(() => null);
  return body && body.result != null ? JSON.parse(body.result) : undefined;
}
async function kvSet(key, value) {
  const r = await fetch(`${KV_URL}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: JSON.stringify(value) }),
  });
  return { status: r.status, body: await r.text() };
}

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const key = 'sotr:__probe_rmw__';
  const out = {};
  try {
    // 1) Seed an array on the throwaway key, similar shape to real texts.
    const seed = [{ id: 'seed-item', title_en: 'Seed', full_en: 'x'.repeat(500) }];
    out.seedWrite = await kvSet(key, seed);

    // 2) Read it back (like readTexts()).
    const read1 = await kvGet(key);
    out.read1Count = Array.isArray(read1) ? read1.length : 'NOT ARRAY: ' + JSON.stringify(read1);

    // 3) Modify in JS (like unshift) and write back (like writeTexts()).
    const modified = Array.isArray(read1) ? [{ id: 'new-item', title_en: 'New', full_en: 'y'.repeat(500) }, ...read1] : seed;
    out.modifiedCount = modified.length;
    out.rewrite = await kvSet(key, modified);

    // 4) Immediately re-read via a completely fresh fetch, same as a
    // separate follow-up request would.
    const read2 = await kvGet(key);
    out.read2Count = Array.isArray(read2) ? read2.length : 'NOT ARRAY: ' + JSON.stringify(read2);
    out.read2Ids = Array.isArray(read2) ? read2.map(x => x.id) : null;

    // 5) Wait 2s and read again.
    await new Promise(r => setTimeout(r, 2000));
    const read3 = await kvGet(key);
    out.read3Count = Array.isArray(read3) ? read3.length : 'NOT ARRAY: ' + JSON.stringify(read3);
    out.read3Ids = Array.isArray(read3) ? read3.map(x => x.id) : null;
  } catch (e) {
    out.error = e.message;
  }
  res.status(200).json(out);
}

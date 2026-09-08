// TEMPORARY diagnostic — call the REAL readTexts() side-by-side with a
// raw GET of the same key, to find exactly where they diverge. Delete
// once the investigation into the disappearing-text bug is resolved.
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { readTexts, KV_URL, KV_TOKEN } from '../../../lib/adminData';

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const out = {};
  try {
    out.kvUrlHost = KV_URL ? new URL(KV_URL).host : null;

    const rawR = await fetch(`${KV_URL}/get/sotr:texts`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
    const rawBody = await rawR.text();
    out.rawGetStatus = rawR.status;
    out.rawGetBodyLength = rawBody.length;
    try {
      const parsed = JSON.parse(rawBody);
      const inner = typeof parsed.result === 'string' ? JSON.parse(parsed.result) : parsed.result;
      out.rawGetIds = Array.isArray(inner) ? inner.map(t => t.id) : 'NOT ARRAY';
    } catch (e) { out.rawGetParseError = e.message; }

    const real = await readTexts();
    out.readTextsIsArray = Array.isArray(real);
    out.readTextsIds = Array.isArray(real) ? real.map(t => t.id) : real;
  } catch (e) {
    out.error = e.message;
  }
  res.status(200).json(out);
}

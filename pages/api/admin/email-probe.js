// TEMPORARY diagnostic — send a real test email via Resend and surface
// the exact response/error, since the real flow swallows this into a
// console.error the admin can't see. Delete once email delivery is
// confirmed working. POST { to: "you@example.com" } while logged in.
import { validateSession, parseCookies } from '../../../lib/adminAuth';

const FROM_EMAIL  = process.env.FROM_EMAIL || 'noreply@spyontherise.com';
const SENDER_NAME = process.env.SENDER_NAME || 'SPY ON THE RISE';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  const { to } = req.body || {};
  if (!to) return res.status(400).json({ error: 'to required' });

  const out = { hasKey: !!RESEND_API_KEY, from: `${SENDER_NAME} <${FROM_EMAIL}>`, to };
  if (!RESEND_API_KEY) return res.status(200).json({ ...out, skipped: 'no RESEND_API_KEY' });

  try {
    const payload = {
      from: `${SENDER_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: 'SPY ON THE RISE — email delivery test',
      html: '<p>This is a diagnostic test email.</p>',
    };
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify(payload),
    });
    out.status = r.status;
    out.ok = r.ok;
    out.body = await r.text();
  } catch (e) {
    out.thrown = e.message;
  }
  res.status(200).json(out);
}

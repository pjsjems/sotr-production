// pages/api/contact.js: saves messages via KV (or file in local dev)
import { readMessages, writeMessages, readSiteConfig } from '../../lib/adminData';

const FROM_EMAIL     = process.env.FROM_EMAIL || 'noreply@spyontherise.com';
const SENDER_NAME    = process.env.SENDER_NAME || 'SPY ON THE RISE';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Best-effort notification to the admin-configured forwarding address
// (Settings → Contact Forwarding Email) — that setting was previously
// saved but never actually used anywhere. Never throws: a delivery
// failure here must not fail the contact form submission, which has
// already succeeded by the time this runs (the message is saved either
// way and always visible in the admin Messages panel).
async function forwardToAdmin({ name, email, subject, message, type }) {
  if (!RESEND_API_KEY) return;
  try {
    const cfg = await readSiteConfig();
    const to = (cfg.forwardEmail || '').trim();
    if (!to) return;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: `${SENDER_NAME} <${FROM_EMAIL}>`,
        to: [to],
        reply_to: email,
        subject: `[${type}] New contact message${subject ? `: ${subject}` : ''}`,
        html: `<p><strong>From:</strong> ${name} (${email})</p>${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}<p style="white-space:pre-wrap">${message}</p>`,
      }),
    });
  } catch (e) {
    console.warn('[Contact] Forwarding email failed:', e.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message, type = 'general' } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const msgs = await readMessages();
    msgs.unshift({
      id: Date.now().toString(),
      name, email,
      subject: subject || '',
      message, type,
      date: new Date().toISOString(),
      read: false,
    });
    if (msgs.length > 200) msgs.length = 200;
    await writeMessages(msgs);
    console.log('[Contact] Saved:', { name, email, subject, type });
    forwardToAdmin({ name, email, subject, message, type }); // fire-and-forget, doesn't block the response
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('[Contact] Error:', e.message);
    return res.status(500).json({ error: 'Failed to save message' });
  }
}

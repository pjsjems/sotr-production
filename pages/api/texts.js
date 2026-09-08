// pages/api/texts.js
// GET  /api/texts          : returns all texts (preview only, no full content)
// GET  /api/texts?id=slug  : returns preview for one text
// POST /api/texts          : email gate, returns full text after email capture
import { readTexts, readMessages, writeMessages, KV_URL, KV_TOKEN } from '../../lib/adminData';

const FROM_EMAIL      = process.env.FROM_EMAIL || 'noreply@spyontherise.com';
const SENDER_NAME     = process.env.SENDER_NAME || 'SPY ON THE RISE';
const RESEND_API_KEY  = process.env.RESEND_API_KEY;

const EMAIL_LABELS = {
  en: { subject: t => `Your full text: ${t}`, greeting: 'Thank you for your interest.', intro: 'Here is the full text you requested:', footer: 'SPY ON THE RISE · spyontherise.com', by: 'By', attachmentNote: 'The full text is also attached as a document.' },
  fr: { subject: t => `Votre texte complet : ${t}`, greeting: 'Merci pour votre intérêt.', intro: 'Voici le texte complet que vous avez demandé :', footer: 'SPY ON THE RISE · spyontherise.com', by: 'Par', attachmentNote: 'Le texte complet est également joint en pièce jointe.' },
  es: { subject: t => `Tu texto completo: ${t}`, greeting: 'Gracias por tu interés.', intro: 'Aquí está el texto completo que solicitaste:', footer: 'SPY ON THE RISE · spyontherise.com', by: 'Por', attachmentNote: 'El texto completo también se adjunta como documento.' },
};

// Strip full content for public listing
function sanitize(t, mode = 'preview') {
  const { full_en, full_fr, full_es, ...withoutFull } = t;
  if (mode === 'archive') {
    const { preview_en, preview_fr, preview_es, ...archiveFields } = withoutFull;
    return archiveFields;
  }
  return withoutFull;
}

async function safeReadTexts() {
  const raw = await readTexts();
  return Array.isArray(raw) ? raw.filter(t => t && typeof t === 'object') : [];
}

// Fetches a text's uploaded PDF/Word attachment for one language, if any
// was uploaded — same key scheme as pages/api/texts/download.js.
async function fetchAttachment(id, lang) {
  if (!KV_URL || !KV_TOKEN) return null;
  const fileKey = lang === 'en' ? `sotr:text-attachment:${id}` : `sotr:text-attachment:${id}:${lang}`;
  try {
    const r = await fetch(`${KV_URL}/get/${fileKey}`, { headers: { Authorization: `Bearer ${KV_TOKEN}` } });
    const json = await r.json();
    if (!json.result) return null;
    return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
  } catch { return null; }
}

function buildEmailHtml({ title, subtitle, author, bodyText, lang, hasAttachment }) {
  const lbl = EMAIL_LABELS[lang] || EMAIL_LABELS.en;
  const bodyHtml = (bodyText || '').split('\n\n').map(p => `<p style="margin:0 0 1em;line-height:1.8;">${p}</p>`).join('');
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><title>${title}</title></head>
<body style="font-family:Georgia,serif;max-width:640px;margin:0 auto;padding:40px 24px;color:#1a1a1a;background:#fff">
  <div style="border-bottom:2px solid #7A1515;margin-bottom:24px;padding-bottom:16px">
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#7A1515;margin:0">SPY ON THE RISE</p>
  </div>
  <p style="color:#555;margin:0 0 24px">${lbl.greeting}</p>
  <h1 style="font-size:26px;margin:0 0 8px;line-height:1.25">${title}</h1>
  ${subtitle ? `<h2 style="font-size:15px;font-weight:normal;color:#555;margin:0 0 8px;font-style:italic">${subtitle}</h2>` : ''}
  <p style="font-size:13px;color:#888;margin:0 0 32px">${lbl.by} ${author}</p>
  <p style="color:#444;margin:0 0 24px">${lbl.intro}</p>
  <div style="border-left:3px solid #7A1515;padding-left:20px;margin-bottom:32px;line-height:1.8;font-size:15px">${bodyHtml}</div>
  ${hasAttachment ? `<p style="font-size:13px;color:#7A1515;margin:0 0 32px">${lbl.attachmentNote}</p>` : ''}
  <div style="border-top:1px solid #e5e5e5;margin-top:24px;padding-top:20px">
    <p style="font-size:11px;color:#aaa;margin:0;letter-spacing:1px">${lbl.footer}</p>
  </div>
</body></html>`;
}

async function sendFullTextEmail({ to, text, lang }) {
  if (!RESEND_API_KEY) {
    console.log('[texts] No RESEND_API_KEY, skipping email delivery to', to);
    return;
  }
  const title = text[`title_${lang}`] || text.title_en || '';
  const subtitle = text[`subtitle_${lang}`] || '';
  const bodyText = text[`full_${lang}`] || text.full_en || '';
  const attachment = await fetchAttachment(text.id, lang);

  const lbl = EMAIL_LABELS[lang] || EMAIL_LABELS.en;
  const payload = {
    from: `${SENDER_NAME} <${FROM_EMAIL}>`,
    to: [to],
    subject: lbl.subject(title),
    html: buildEmailHtml({ title, subtitle, author: text.author || 'Jems S. Pompée', bodyText, lang, hasAttachment: !!attachment }),
  };
  if (attachment) {
    payload.attachments = [{ filename: attachment.fileName || `${text.id}.pdf`, content: attachment.data }];
  }

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify(payload),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(`Resend error: ${err.message || r.status}`);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {

  if (req.method === 'GET') {
    const texts = await safeReadTexts();
    const { id } = req.query;
    if (id) {
      const t = texts.find(x => x.id === id);
      if (!t) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(sanitize(t));
    }
    const mode = req.query.mode || 'preview';
    return res.status(200).json(texts.map(t => sanitize(t, mode)));
  }

  // POST: email gate, caller submits { id, email, lang }
  // We record the email via newsletter API and return the full text
  if (req.method === 'POST') {
    const { id, email, lang = 'en' } = req.body || {};
    if (!id || !email) return res.status(400).json({ error: 'id and email required' });
    if (!email.includes('@')) return res.status(400).json({ error: 'Invalid email' });

    const texts = await safeReadTexts();
    const t = texts.find(x => x.id === id);
    if (!t) return res.status(404).json({ error: 'Text not found' });

    // Record the request directly (shows up in the admin Messages panel).
    // Not routed through /api/newsletter's HTTP self-call: that helper
    // resolves its base URL from NEXT_PUBLIC_SITE_URL, which is always
    // the production domain — meaning every local/preview run of this
    // handler was silently POSTing test data to the live site instead of
    // itself. Writing directly here is both correct and faster.
    try {
      const title = t[`title_${lang}`] || t.title_en || '';
      const msgs = await readMessages();
      msgs.unshift({
        id: Date.now().toString(),
        name: 'Anonymous',
        email,
        subject: `Text of the Month request: ${title}`,
        message: `Requested the full text of "${title}" (${lang}).`,
        type: 'text-of-month',
        receivedAt: new Date().toISOString(),
        read: false,
        replied: false,
        replyText: '',
        repliedAt: null,
      });
      if (msgs.length > 200) msgs.length = 200;
      await writeMessages(msgs);
    } catch (e) {
      console.warn('[texts] Failed to record message:', e.message);
    }

    // Email the full text (with its PDF/Word attachment if one was
    // uploaded for this language) — failure here must not block the
    // page from revealing the text inline, which always happens below.
    try {
      await sendFullTextEmail({ to: email, text: t, lang });
    } catch (e) {
      console.error('[texts] Email delivery failed:', e.message);
    }

    // Return the full text content
    return res.status(200).json({
      success: true,
      full_en: t.full_en,
      full_fr: t.full_fr,
      full_es: t.full_es,
    });
  }

  res.status(405).end();

  } catch (e) {
    console.error('[api/texts] handler error:', e.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

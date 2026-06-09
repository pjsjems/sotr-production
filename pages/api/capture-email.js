// pages/api/capture-email.js
// Handles email capture for "Texte du mois" full-text unlock.
// POST { email, slug, lang } → send full text by email via Resend.
// Set RESEND_API_KEY in .env.local

import { sanityClient, FREE_TEXT_BY_SLUG_QUERY, isSanityConfigured, pickLang } from '../../lib/queries';

const FROM_EMAIL    = process.env.FROM_EMAIL    || 'noreply@spyontherise.com';
const SENDER_NAME   = process.env.SENDER_NAME   || 'SPY ON THE RISE';
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const LABELS = {
  fr: { subject:(t) => `Votre texte complet : ${t}`, greeting:'Merci pour votre intérêt.', intro:"Voici le texte complet que vous avez demandé :", footer:"SPY ON THE RISE · spyontherise.com", error:"Une erreur est survenue. Veuillez réessayer.", success:"Texte envoyé ! Vérifiez votre boîte de réception." },
  en: { subject:(t) => `Your full text: ${t}`,       greeting:'Thank you for your interest.', intro:"Here is the full text you requested:", footer:"SPY ON THE RISE · spyontherise.com", error:"An error occurred. Please try again.", success:"Text sent! Check your inbox." },
  es: { subject:(t) => `Tu texto completo: ${t}`,    greeting:'Gracias por tu interés.', intro:"Aquí está el texto completo que solicitaste:", footer:"SPY ON THE RISE · spyontherise.com", error:"Ocurrió un error. Por favor, inténtalo de nuevo.", success:"¡Texto enviado! Revisa tu bandeja de entrada." },
};

function ptToHtml(blocks = []) {
  return blocks.map(b => {
    if (b._type !== 'block') return '';
    const text = (b.children || []).map(c => c.text || '').join('');
    return `<p style="margin:0 0 1em;line-height:1.8;">${text}</p>`;
  }).join('');
}

function buildEmailHtml({ title, subtitle, authorName, bodyHtml, lang }) {
  const lbl = LABELS[lang] || LABELS.fr;
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charset="UTF-8"><title>${title}</title></head>
<body style="font-family:Georgia,serif;max-width:640px;margin:0 auto;padding:40px 24px;color:#1a1a1a;background:#fff">
  <div style="border-bottom:2px solid #B8860B;margin-bottom:24px;padding-bottom:16px">
    <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#B8860B;margin:0">SPY ON THE RISE</p>
  </div>
  <p style="color:#555;margin:0 0 24px">${lbl.greeting}</p>
  <h1 style="font-size:28px;margin:0 0 8px;line-height:1.2">${title}</h1>
  ${subtitle ? `<h2 style="font-size:16px;font-weight:normal;color:#555;margin:0 0 8px;font-style:italic">${subtitle}</h2>` : ''}
  <p style="font-size:13px;color:#888;margin:0 0 32px">— ${authorName}</p>
  <p style="color:#444;margin:0 0 24px">${lbl.intro}</p>
  <div style="border-left:3px solid #B8860B;padding-left:20px;margin-bottom:40px;line-height:1.8;font-size:15px">${bodyHtml}</div>
  <div style="border-top:1px solid #e5e5e5;margin-top:40px;padding-top:20px">
    <p style="font-size:11px;color:#aaa;margin:0;letter-spacing:1px">${lbl.footer}</p>
  </div>
</body></html>`;
}

async function sendViaResend({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'Authorization':`Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from:`${SENDER_NAME} <${FROM_EMAIL}>`, to:[to], subject, html }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(`Resend error: ${err.message || res.status}`); }
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });

  const { email, slug, lang = 'fr' } = req.body || {};
  const safeLang = ['fr','en','es'].includes(lang) ? lang : 'fr';
  const lbl = LABELS[safeLang];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error:lbl.error });
  if (!slug) return res.status(400).json({ error:'Missing slug' });

  try {
    if (!isSanityConfigured()) {
      console.log('[capture-email] Sanity not configured — logging only:', { email, slug, lang:safeLang });
      return res.status(200).json({ ok:true, message:lbl.success });
    }

    const doc = await sanityClient.fetch(FREE_TEXT_BY_SLUG_QUERY, { slug });
    if (!doc) return res.status(404).json({ error:'Text not found' });

    const { title, subtitle, full } = pickLang(doc, safeLang);
    const bodyHtml = ptToHtml(full);

    if (!RESEND_API_KEY) {
      console.log('[capture-email] No RESEND_API_KEY — logging email:', { to:email, title, lang:safeLang });
      return res.status(200).json({ ok:true, message:lbl.success });
    }

    const html = buildEmailHtml({ title, subtitle, authorName:doc.author, bodyHtml, lang:safeLang });
    await sendViaResend({ to:email, subject:lbl.subject(title), html });

    return res.status(200).json({ ok:true, message:lbl.success });
  } catch (err) {
    console.error('[capture-email]', err);
    return res.status(500).json({ error:lbl.error });
  }
}

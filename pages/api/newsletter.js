// ════════════════════════════════════════════════
// Newsletter Signup API
// POST /api/newsletter
// Body: { email: string, lang: 'en' | 'fr' | 'es' }
//
// SETUP:
//   1. Create a Mailchimp account at mailchimp.com
//   2. Get your List ID and API Key
//   3. Add to .env.local:
//      MAILCHIMP_API_KEY=your-key
//      MAILCHIMP_LIST_ID=your-list-id
//      MAILCHIMP_SERVER=us1  (the prefix in your API key, e.g. "us1")
// ════════════════════════════════════════════════

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, lang = 'en', tags: extraTags = [], bookKey, bookTitle = '', type } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Save notification request to local store (non-blocking, always runs)
  const saveLocally = async () => {
    try {
      const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      await fetch(`${base}/api/admin/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang, bookKey, bookTitle, type: type === 'prelaunch' ? 'notification' : type }),
      });
    } catch (e) {
      console.log('[Newsletter] Local store save failed:', e.message);
    }
  };

  // If Mailchimp is not yet configured, return success for development
  if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID) {
    const devTags = [`lang-${lang}`, 'website-signup', ...extraTags];
    if (type === 'prelaunch' && bookKey) { devTags.push('prelaunch-notification', `book-${bookKey}`); }
    console.log(`[Newsletter] Signup received: ${email} (${lang}) tags:[${devTags.join(',')}] , Mailchimp not configured yet`);
    saveLocally();
    return res.status(200).json({ success: true, message: 'Subscribed (dev mode)' });
  }

  try {
    const server = process.env.MAILCHIMP_SERVER || 'us1';
    const listId = process.env.MAILCHIMP_LIST_ID;
    const apiKey = process.env.MAILCHIMP_API_KEY;

    const response = await fetch(
      `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`,
      {
        method: 'POST',
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            LANGUAGE: lang.toUpperCase(),
          },
          tags: (()=>{ const t=[`lang-${lang}`,'website-signup',...extraTags]; if(type==='prelaunch'&&bookKey){t.push('prelaunch-notification',`book-${bookKey}`);}  return t; })(),
        }),
      }
    );

    const data = await response.json();

    if (response.ok || data.title === 'Member Exists') {
      saveLocally();
      return res.status(200).json({ success: true });
    }

    console.error('[Newsletter] Mailchimp error:', data);
    return res.status(500).json({ error: 'Subscription failed' });

  } catch (err) {
    console.error('[Newsletter] Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

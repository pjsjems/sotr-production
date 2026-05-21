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

  const { email, lang = 'en', tags: extraTags = [] } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // If Mailchimp is not yet configured, return success for development
  if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID) {
    console.log(`[Newsletter] Signup received: ${email} (${lang}) tags:[${[`lang-${lang}`,'website-signup',...extraTags].join(',')}] , Mailchimp not configured yet`);
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
          tags: [`lang-${lang}`, 'website-signup', ...extraTags],
        }),
      }
    );

    const data = await response.json();

    if (response.ok || data.title === 'Member Exists') {
      return res.status(200).json({ success: true });
    }

    console.error('[Newsletter] Mailchimp error:', data);
    return res.status(500).json({ error: 'Subscription failed' });

  } catch (err) {
    console.error('[Newsletter] Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// ════════════════════════════════════════════════
// Contact Form API
// POST /api/contact
// Body: { name, email, subject, message, type }
//
// SETUP:
//   Add to .env.local:
//     CONTACT_EMAIL=contact@spyontherise.com
//     (Uses Vercel's built-in email when deployed)
// ════════════════════════════════════════════════

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message, type = 'general' } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Log the contact request (for development)
  console.log('[Contact]', { name, email, subject, type, messageLength: message.length });

  // In production, this would send an email via:
  // - Resend (resend.com): recommended, free tier 3000/month
  // - SendGrid
  // - Nodemailer with SMTP
  // Claude will configure this during deployment (Step 7)

  return res.status(200).json({ success: true });
}

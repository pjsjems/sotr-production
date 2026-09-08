// pages/api/contact.js: saves messages via KV (or file in local dev)
import { readMessages, writeMessages } from '../../lib/adminData';

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
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('[Contact] Error:', e.message);
    return res.status(500).json({ error: 'Failed to save message' });
  }
}

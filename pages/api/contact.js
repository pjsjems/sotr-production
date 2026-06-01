// pages/api/contact.js — saves messages to data/messages.json
import fs from 'fs';
import path from 'path';

const MESSAGES_PATH = path.join(process.cwd(), 'data', 'messages.json');

function saveMessage(msg) {
  let msgs = [];
  if (fs.existsSync(MESSAGES_PATH)) {
    try { msgs = JSON.parse(fs.readFileSync(MESSAGES_PATH, 'utf8')); } catch {}
  }
  msgs.unshift(msg);
  if (msgs.length > 200) msgs.splice(200);
  fs.writeFileSync(MESSAGES_PATH, JSON.stringify(msgs, null, 2), 'utf8');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message, type = 'general' } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing required fields' });

  try {
    saveMessage({
      id: Date.now().toString(),
      name, email,
      subject: subject || '',
      message, type,
      date: new Date().toISOString(),
      read: false,
    });
    console.log('[Contact] Saved:', { name, email, subject, type });
    return res.status(200).json({ success: true });
  } catch (e) {
    console.error('[Contact] Error:', e.message);
    return res.status(500).json({ error: 'Failed to save message' });
  }
}

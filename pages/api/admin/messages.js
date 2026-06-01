// pages/api/admin/messages.js — contact messages + prelaunch notification requests
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const MSG_PATH = path.join(DATA_DIR, 'messages.json');
const NOTIF_PATH = path.join(DATA_DIR, 'notifications.json');

function readJSON(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch { return []; }
}
function writeJSON(filePath, data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export default function handler(req, res) {
  // Public POST — save notification signup (no auth, called from newsletter API)
  if (req.method === 'POST' && !parseCookies(req)['sotr-admin-session']) {
    const { email, bookKey, bookTitle, lang = 'en', type = 'general' } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    if (type === 'notification' || type === 'prelaunch') {
      const notifs = readJSON(NOTIF_PATH);
      const exists = notifs.findIndex(n => n.email === email && n.bookKey === bookKey);
      if (exists >= 0) return res.status(200).json({ success: true, message: 'Already registered' });
      notifs.unshift({
        id: Date.now().toString(),
        email,
        bookKey: bookKey || '',
        bookTitle: bookTitle || bookKey || '',
        lang,
        requestedAt: new Date().toISOString(),
        notified: false,
      });
      writeJSON(NOTIF_PATH, notifs);
      return res.status(200).json({ success: true });
    }

    // General contact message (fallback)
    const { name, subject, message } = req.body || {};
    const msgs = readJSON(MSG_PATH);
    msgs.unshift({
      id: Date.now().toString(),
      name: name || 'Anonymous',
      email,
      subject: subject || '(no subject)',
      message: message || '',
      type,
      receivedAt: new Date().toISOString(),
      read: false,
      replied: false,
      replyText: '',
      repliedAt: null,
    });
    writeJSON(MSG_PATH, msgs);
    return res.status(200).json({ success: true });
  }

  // All remaining methods require admin auth
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    const msgs = readJSON(MSG_PATH);
    const notifs = readJSON(NOTIF_PATH);
    return res.status(200).json({
      messages: msgs,
      notifications: notifs,
      unreadMessages: msgs.filter(m => !m.read).length,
      unreadNotifications: notifs.filter(n => !n.notified).length,
    });
  }

  if (req.method === 'PATCH') {
    const { id, action, replyText, store = 'messages' } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });

    const filePath = store === 'notifications' ? NOTIF_PATH : MSG_PATH;
    const items = readJSON(filePath);
    const idx = items.findIndex(m => m.id === id);
    if (idx < 0) return res.status(404).json({ error: 'Item not found' });

    if (action === 'delete') {
      items.splice(idx, 1);
      writeJSON(filePath, items);
      return res.status(200).json({ success: true });
    }
    if (action === 'read') items[idx].read = true;
    if (action === 'unread') items[idx].read = false;
    if (action === 'notified') items[idx].notified = true;
    if (action === 'reply') {
      items[idx].replied = true;
      items[idx].replyText = replyText || '';
      items[idx].repliedAt = new Date().toISOString();
    }

    writeJSON(filePath, items);
    return res.status(200).json({ success: true, item: items[idx] });
  }

  // Legacy POST support (read/delete actions from old MessagesPanel)
  if (req.method === 'POST') {
    const { action, id, store = 'messages' } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });

    const filePath = store === 'notifications' ? NOTIF_PATH : MSG_PATH;
    const items = readJSON(filePath);

    if (action === 'read') {
      const idx = items.findIndex(m => m.id === id);
      if (idx >= 0) { items[idx].read = true; writeJSON(filePath, items); }
      return res.status(200).json({ success: true });
    }
    if (action === 'delete') {
      writeJSON(filePath, items.filter(m => m.id !== id));
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Unknown action' });
  }

  res.status(405).end();
}

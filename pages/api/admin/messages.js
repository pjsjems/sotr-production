// pages/api/admin/messages.js: contact messages + prelaunch notification requests
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { readMessages, writeMessages, readNotifications, writeNotifications } from '../../../lib/adminData';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // Public POST: save notification signup (no auth, called from newsletter API)
  if (req.method === 'POST' && !parseCookies(req)['sotr-admin-session']) {
    const { email, bookKey, bookTitle, lang = 'en', type = 'general' } = req.body || {};
    if (!email) return res.status(400).json({ error: 'Email required' });

    try {
      if (type === 'notification' || type === 'prelaunch') {
        const notifs = await readNotifications();
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
        await writeNotifications(notifs);
        return res.status(200).json({ success: true });
      }

      // General contact message (fallback) — also used for "text of the
      // month" full-text requests, tagged via `type`.
      const { name, subject, message } = req.body || {};
      const msgs = await readMessages();
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
      await writeMessages(msgs);
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // All remaining methods require admin auth
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const [msgs, notifs] = await Promise.all([readMessages(), readNotifications()]);
      return res.status(200).json({
        messages: msgs,
        notifications: notifs,
        unreadMessages: msgs.filter(m => !m.read).length,
        unreadNotifications: notifs.filter(n => !n.notified).length,
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'PATCH') {
    const { id, action, replyText, store = 'messages' } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });

    try {
      const isNotif = store === 'notifications';
      const items = isNotif ? await readNotifications() : await readMessages();
      const idx = items.findIndex(m => m.id === id);
      if (idx < 0) return res.status(404).json({ error: 'Item not found' });

      if (action === 'delete') {
        items.splice(idx, 1);
        isNotif ? await writeNotifications(items) : await writeMessages(items);
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

      isNotif ? await writeNotifications(items) : await writeMessages(items);
      return res.status(200).json({ success: true, item: items[idx] });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // Legacy POST support (read/delete actions from old MessagesPanel)
  if (req.method === 'POST') {
    const { action, id, store = 'messages' } = req.body || {};
    if (!id) return res.status(400).json({ error: 'id required' });

    try {
      const isNotif = store === 'notifications';
      const items = isNotif ? await readNotifications() : await readMessages();

      if (action === 'read') {
        const idx = items.findIndex(m => m.id === id);
        if (idx >= 0) {
          items[idx].read = true;
          isNotif ? await writeNotifications(items) : await writeMessages(items);
        }
        return res.status(200).json({ success: true });
      }
      if (action === 'delete') {
        const filtered = items.filter(m => m.id !== id);
        isNotif ? await writeNotifications(filtered) : await writeMessages(filtered);
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: 'Unknown action' });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  res.status(405).end();
}

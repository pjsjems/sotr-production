// pages/api/admin/change-password.js
import { validateSession, parseCookies, verifyPassword } from '../../../lib/adminAuth';
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const cookies = parseCookies(req);
  const session = validateSession(cookies['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method !== 'POST') return res.status(405).end();

  const { current, next } = req.body || {};
  if (!current || !next) return res.status(400).json({ error: 'Both current and new password required.' });
  if (next.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });

  if (!verifyPassword(current)) {
    return res.status(403).json({ error: 'Current password is incorrect.' });
  }

  const envPath = path.join(process.cwd(), '.env.local');
  try {
    let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    if (/^ADMIN_PASSWORD=.*/m.test(content)) {
      content = content.replace(/^ADMIN_PASSWORD=.*/m, `ADMIN_PASSWORD=${next}`);
    } else {
      content += `\nADMIN_PASSWORD=${next}`;
    }
    fs.writeFileSync(envPath, content, 'utf8');
    return res.status(200).json({ success: true, message: 'Password updated in .env.local. Restart the server to apply.' });
  } catch (e) {
    return res.status(500).json({ error: 'Could not write .env.local: ' + e.message });
  }
}

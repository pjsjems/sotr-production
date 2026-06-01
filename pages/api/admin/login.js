// pages/api/admin/login.js
import { verifyPassword, createSession } from '../../../lib/adminAuth';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password required' });

  if (!verifyPassword(password)) {
    // Delay response to slow brute force
    setTimeout(() => res.status(401).json({ error: 'Invalid password' }), 800);
    return;
  }

  const token = createSession('admin');
  res.setHeader('Set-Cookie',
    `sotr-admin-session=${token}; HttpOnly; Path=/; Max-Age=${8 * 3600}; SameSite=Lax`
  );
  res.status(200).json({ success: true });
}

// pages/api/admin/logout.js
import { destroySession, parseCookies } from '../../../lib/adminAuth';

export default function handler(req, res) {
  const cookies = parseCookies(req);
  const token = cookies['sotr-admin-session'];
  if (token) destroySession(token);
  res.setHeader('Set-Cookie',
    'sotr-admin-session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
  );
  res.status(200).json({ success: true });
}

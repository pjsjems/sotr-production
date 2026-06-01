// pages/api/admin/config.js — read/write site config (forwarding email, etc.)
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch { return {}; }
}

function writeConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2), 'utf8');
}

const ALLOWED_KEYS = ['forwardEmail'];

export default function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    return res.status(200).json({ config: readConfig() });
  }

  if (req.method === 'POST') {
    const updates = req.body || {};
    const cfg = readConfig();
    for (const key of ALLOWED_KEYS) {
      if (key in updates) cfg[key] = updates[key];
    }
    writeConfig(cfg);
    return res.status(200).json({ success: true, config: cfg });
  }

  res.status(405).end();
}

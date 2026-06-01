// pages/api/admin/publish.js — git add/commit/push → Vercel auto-deploy
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  const { message = 'Admin: content update via dashboard' } = req.body || {};
  const safeMsg = message.replace(/"/g, "'").replace(/`/g, "'").slice(0, 200);

  try {
    await execAsync('git add data/catalog.js public/site-logic.js public/covers', { cwd: process.cwd() });

    let commitOutput = '';
    try {
      const result = await execAsync(`git commit -m "${safeMsg}"`, { cwd: process.cwd() });
      commitOutput = result.stdout.trim();
    } catch (commitErr) {
      const out = (commitErr.stdout || '') + (commitErr.stderr || '');
      if (out.includes('nothing to commit')) {
        return res.status(200).json({ success: true, message: 'Nothing to commit — site is already up to date.' });
      }
      throw commitErr;
    }

    const { stdout: pushOut } = await execAsync('git push', { cwd: process.cwd() });
    return res.status(200).json({
      success: true,
      message: 'Pushed to GitHub. Vercel auto-deploy triggered.',
      details: commitOutput + '\n' + pushOut.trim(),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Publish failed' });
  }
}

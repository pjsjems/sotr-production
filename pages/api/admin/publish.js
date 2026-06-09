// pages/api/admin/publish.js — git add/commit/push → Vercel auto-deploy
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  const { message = 'Admin: content update via dashboard', forceRefresh = false } = req.body || {};
  const safeMsg = message.replace(/"/g, "'").replace(/`/g, "'").slice(0, 200);
  const execOptions = { cwd: process.cwd() };

  try {
    await execAsync('git add data/catalog.js data/texts.json public/site-logic.js public/covers', execOptions);

    let hasChanges = false;
    let commitOutput = '';
    try {
      const result = await execAsync(`git commit -m "${safeMsg}"`, execOptions);
      commitOutput = result.stdout.trim();
      hasChanges = true;
    } catch (commitErr) {
      const out = (commitErr.stdout || '') + (commitErr.stderr || '');
      if (out.includes('nothing to commit')) {
        hasChanges = false;
      } else {
        throw commitErr;
      }
    }

    // If forceRefresh requested, create an empty commit to force full redeploy
    if (forceRefresh && !hasChanges) {
      await execAsync('git commit --allow-empty -m "Force refresh: redeploy all content"', execOptions);
      await execAsync('git push', execOptions);
      return res.status(200).json({
        success: true, deployed: true,
        message: 'Full refresh triggered. Vercel will redeploy all content in 30-60 seconds.',
      });
    }

    if (!hasChanges) {
      return res.status(200).json({ success: true, deployed: false, message: 'Nothing to commit — site is already up to date.' });
    }

    const { stdout: pushOut } = await execAsync('git push', execOptions);
    return res.status(200).json({
      success: true,
      deployed: true,
      message: 'Pushed to GitHub. Vercel auto-deploy triggered.',
      details: commitOutput + '\n' + pushOut.trim(),
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Publish failed' });
  }
}

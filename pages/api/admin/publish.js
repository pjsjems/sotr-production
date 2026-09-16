// pages/api/admin/publish.js: git add/commit/push, triggers Vercel auto-deploy
//
// Local-development-only. Every catalog/text edit made through this
// dashboard is already live within ~10 seconds via the KV-backed store
// in lib/adminData.js — nothing here is required for changes to reach
// the public site. This button exists purely as an optional convenience
// for committing a version-controlled snapshot to git while developing
// locally with a real git checkout. On the deployed site itself there
// is no git repository or git binary in the serverless runtime, so this
// always fails there — that's expected, not a bug to "fix" by making it
// work in production; see the .git existence check below for an honest
// error instead of a cryptic exec failure.
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();

  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    return res.status(501).json({
      error: 'No git repository here — this only works when running the dashboard locally against a real checkout. Your saved changes are already live; nothing to publish.',
    });
  }

  const { message = 'Admin: content update via dashboard', forceRefresh = false } = req.body || {};
  const safeMsg = message.replace(/"/g, "'").replace(/`/g, "'").slice(0, 200);
  const execOptions = { cwd: process.cwd() };

  try {
    // catalog.json (not the stale, unused-at-runtime catalog.js) is what
    // every book/series/bundle/platform edit actually writes to when KV
    // isn't configured — see lib/adminData.js.
    await execAsync('git add data/catalog.json data/texts.json public/site-logic.js public/covers', execOptions);

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
      return res.status(200).json({ success: true, deployed: false, message: 'Nothing to commit, site is already up to date.' });
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

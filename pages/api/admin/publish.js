// pages/api/admin/publish.js: git add/commit/push, triggers Vercel auto-deploy
//
// Local-development-only. Every catalog/text edit made through this
// dashboard is already live within ~10 seconds via the KV-backed store
// in lib/adminData.js — nothing here is required for changes to reach
// the public site. This button exists purely as an optional convenience
// for committing a version-controlled snapshot to git while developing
// locally with a real git checkout. The deployed serverless runtime may
// not include a git repository or executable, so report that explicitly.
import { validateSession, parseCookies } from '../../../lib/adminAuth';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execFileAsync = promisify(execFile);

async function getGitAvailability() {
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    return { available: false, reason: 'No git repository in this environment.' };
  }
  try {
    await execFileAsync('git', ['--version'], { cwd: process.cwd() });
    return { available: true };
  } catch {
    return { available: false, reason: 'Git is not installed in this environment.' };
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const session = validateSession(parseCookies(req)['sotr-admin-session']);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    return res.status(200).json(await getGitAvailability());
  }
  if (req.method !== 'POST') return res.status(405).end();

  const execOptions = { cwd: process.cwd() };

  try {
    const availability = await getGitAvailability();
    if (!availability.available) {
      return res.status(501).json({
        error: `${availability.reason} Admin edits are already saved and live; commit snapshots from a local git checkout.`,
      });
    }

    const { message = 'Admin: content update via dashboard', forceRefresh = false } = req.body || {};
    const safeMsg = String(message).slice(0, 200);
    // catalog.json (not the stale, unused-at-runtime catalog.js) is what
    // every book/series/bundle/platform edit actually writes to when KV
    // isn't configured — see lib/adminData.js.
    await execFileAsync('git', ['add', 'data/catalog.json', 'data/texts.json', 'public/site-logic.js', 'public/covers'], execOptions);

    let hasChanges = false;
    let commitOutput = '';
    try {
      const result = await execFileAsync('git', ['commit', '-m', safeMsg], execOptions);
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
      await execFileAsync('git', ['commit', '--allow-empty', '-m', 'Force refresh: redeploy all content'], execOptions);
      await execFileAsync('git', ['push'], execOptions);
      return res.status(200).json({
        success: true, deployed: true,
        message: 'Full refresh triggered. Vercel will redeploy all content in 30-60 seconds.',
      });
    }

    if (!hasChanges) {
      return res.status(200).json({ success: true, deployed: false, message: 'Nothing to commit, site is already up to date.' });
    }

    const { stdout: pushOut } = await execFileAsync('git', ['push'], execOptions);
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

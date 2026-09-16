export function resolveComingSoonState({
  siteLocked,
  hostname = '',
  previewToken,
  envComingSoonMode,
}) {
  // Checked first and unconditionally: readSiteLock() (lib/adminData.js)
  // always returns a definite true/false, never null/undefined, so the
  // `typeof siteLocked === 'boolean'` early-return below always fired in
  // every real request — meaning the bypass token the admin dashboard
  // advertises ("spyontherise.com/?preview=sotr2026") never had any
  // effect once Site Lock was actually on, despite existing right below
  // that dead code path.
  if (previewToken === 'sotr2026') {
    return false;
  }

  if (typeof siteLocked === 'boolean') {
    return siteLocked;
  }

  const host = hostname.toLowerCase();
  const isPublicDomain = host === 'spyontherise.com' || host === 'www.spyontherise.com';
  const isPreviewUrl = host.includes('vercel.app') || host === 'localhost' || host === '127.0.0.1';

  if (envComingSoonMode === 'false') {
    return false;
  }

  if (isPreviewUrl) {
    return false;
  }

  return isPublicDomain;
}

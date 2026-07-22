export function resolveComingSoonState({
  siteLocked,
  hostname = '',
  previewToken,
  envComingSoonMode,
}) {
  if (typeof siteLocked === 'boolean') {
    return siteLocked;
  }

  const host = hostname.toLowerCase();
  const isPublicDomain = host === 'spyontherise.com' || host === 'www.spyontherise.com';
  const isPreviewUrl = host.includes('vercel.app') || host === 'localhost' || host === '127.0.0.1';
  const hasAdminBypass = previewToken === 'sotr2026';

  if (envComingSoonMode === 'false') {
    return false;
  }

  if (isPreviewUrl || hasAdminBypass) {
    return false;
  }

  return isPublicDomain;
}

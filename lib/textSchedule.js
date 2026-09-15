// lib/textSchedule.js
// Pure Text-of-the-Month scheduling/visibility rules — no Node APIs, so
// this is safe to import from both API routes (server) and the admin
// scheduler UI (client). Single source of truth for "is this text public
// right now, and is it the current one" so the public API and the admin
// status pills can never disagree.
//
// Each text carries two independent controls:
//   scheduledAt — ISO datetime string for when it goes live. Missing/
//                 empty means "draft", never public regardless of hidden.
//   hidden      — manual override that pulls a text from public view
//                 immediately, regardless of its schedule.
// Legacy records (from before scheduling existed) fall back to their
// existing `publishedAt` date so nothing already live disappears.

export function getScheduledAt(t) {
  return (t && (t.scheduledAt || t.publishedAt)) || null;
}

function scheduledTime(t) {
  const sched = getScheduledAt(t);
  if (!sched) return NaN;
  return new Date(sched).getTime();
}

// draft | scheduled | hidden | eligible ("eligible" = scheduled in the
// past and not hidden — still needs withComputedFeatured to know whether
// it's the current text or an archived one).
export function getTextStatus(t, now = Date.now()) {
  if (!t) return 'draft';
  if (t.hidden) return 'hidden';
  const ts = scheduledTime(t);
  if (Number.isNaN(ts)) return 'draft';
  return ts <= now ? 'eligible' : 'scheduled';
}

// Texts the public is allowed to see right now.
export function getPublicTexts(texts, now = Date.now()) {
  return (texts || []).filter(t => t && getTextStatus(t, now) === 'eligible');
}

// Marks whichever publicly-visible text has the latest scheduledAt as
// the current Text of the Month (`featured: true`); everyone else in
// the list is a past text (Archives).
export function withComputedFeatured(publicTexts) {
  let currentId = null, latest = -Infinity;
  for (const t of publicTexts) {
    const ts = scheduledTime(t);
    if (ts > latest) { latest = ts; currentId = t.id; }
  }
  return publicTexts.map(t => ({ ...t, featured: t.id === currentId }));
}

// Convenience: status for the admin UI, distinguishing the current text
// from merely-past-but-visible ones (which getTextStatus alone can't do,
// since that requires comparing against every other text).
export function getAdminStatus(t, allTexts, now = Date.now()) {
  const base = getTextStatus(t, now);
  if (base !== 'eligible') return base; // draft | scheduled | hidden
  const current = withComputedFeatured(getPublicTexts(allTexts, now)).find(x => x.featured);
  return current && current.id === t.id ? 'live' : 'archived';
}

// lib/adminData.js
// Reads/writes data/catalog.json on every call.
// JSON file is not cached by Node.js: changes are instant.
// Uses Vercel KV when available, falls back to file system.

import fs from 'fs';
import path from 'path';

const CATALOG_PATH = path.join(process.cwd(), 'data', 'catalog.json');
const BACKUPS_PATH  = path.join(process.cwd(), 'data', 'backups.json');
const MAX_BACKUPS = 20;

// Vercel's marketplace KV/Redis integration prefixes env vars with the
// project name (e.g. spyontherise_KV_REST_API_URL) instead of the old
// bare KV_REST_API_URL. Support both so reconnecting the store doesn't
// require another code change.
export const KV_URL   = process.env.KV_REST_API_URL   || process.env.spyontherise_KV_REST_API_URL;
export const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.spyontherise_KV_REST_API_TOKEN;

// ── Generic verified KV read/write ────────────────────────
// A write is only ever reported successful once it's confirmed by
// reading the value straight back. A non-2xx response, an error field
// in the body, or an empty read-back are all treated as real failures
// instead of being swallowed — this is what stops an admin save from
// silently vanishing: some KV proxies return 200 OK even when a write
// didn't actually apply (e.g. payload over the plan's size limit).
async function kvGet(key) {
  const r = await fetch(`${KV_URL}/get/${key}`, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
  });
  let body;
  try { body = await r.json(); } catch { body = null; }
  if (!r.ok || (body && body.error)) {
    throw new Error(`KV read failed for ${key}: ${body?.error || `HTTP ${r.status}`}`);
  }
  if (!body || body.result == null) return undefined;
  return typeof body.result === 'string' ? JSON.parse(body.result) : body.result;
}

async function kvSet(key, value) {
  const r = await fetch(`${KV_URL}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: JSON.stringify(value) }),
  });
  let body;
  try { body = await r.json(); } catch { body = null; }
  if (!r.ok || (body && body.error)) {
    throw new Error(`KV write failed for ${key}: ${body?.error || `HTTP ${r.status}`}`);
  }
  const verify = await kvGet(key);
  if (verify === undefined) {
    throw new Error(`KV write to ${key} did not persist (read-back empty)`);
  }
}

// ── Storage: KV in production, file in dev ────────────────
async function readStore() {
  if (KV_URL && KV_TOKEN) {
    try {
      const data = await kvGet('sotr:catalog');
      if (data !== undefined) return data;
    } catch (e) { console.error('[adminData] KV read error:', e.message); }
  }
  try {
    return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  } catch {
    return { BOOKS: {}, SERIES: {}, PLATFORMS: {}, BUNDLES: [] };
  }
}

async function writeStore(data) {
  if (KV_URL && KV_TOKEN) {
    try {
      await kvSet('sotr:catalog', data);
      return;
    } catch (e) {
      console.error('[adminData] KV write error:', e.message);
      throw new Error(`Save failed: ${e.message}`);
    }
  }
  try {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[adminData] File write error:', e.message);
    throw new Error('Save failed: no KV configured (set KV_REST_API_URL and KV_REST_API_TOKEN) and the filesystem is read-only in this environment.');
  }
}

// ── Sitelock via KV or local file ─────────────────────────
export async function readSiteLock() {
  if (KV_URL && KV_TOKEN) {
    try {
      const data = await kvGet('sotr:sitelock');
      if (data !== undefined) return data === true;
    } catch (e) { console.error('[adminData] sitelock KV read error:', e.message); }
  }
  try {
    const f = path.join(process.cwd(), 'data', 'sitelock.json');
    return fs.existsSync(f) && JSON.parse(fs.readFileSync(f, 'utf8')).locked === true;
  } catch { return false; }
}

export async function writeSiteLock(locked) {
  if (KV_URL && KV_TOKEN) {
    try {
      await kvSet('sotr:sitelock', locked === true);
      return;
    } catch (e) {
      console.error('[adminData] sitelock KV write error:', e.message);
      throw new Error(`Save failed: ${e.message}`);
    }
  }
  try {
    const f = path.join(process.cwd(), 'data', 'sitelock.json');
    fs.writeFileSync(f, JSON.stringify({ locked, updatedAt: new Date().toISOString() }), 'utf8');
  } catch (e) {
    console.error('[adminData] sitelock file write error:', e.message);
    throw new Error('Save failed: no KV configured (set KV_REST_API_URL and KV_REST_API_TOKEN) and the filesystem is read-only in this environment.');
  }
}

// ── Texts via KV (production) or file (local dev) ────────
export async function readTexts() {
  if (KV_URL && KV_TOKEN) {
    try {
      const data = await kvGet('sotr:texts');
      if (data !== undefined) {
        if (Array.isArray(data)) return data;
        // Stored value isn't a proper list (unexpected shape) — treat it
        // like an empty store instead of handing bad data to callers.
        console.error('[adminData] texts KV value is not an array, ignoring:', typeof data);
      }
      // KV reachable but empty (e.g. just connected): fall through to the
      // bundled file below instead of reporting no texts at all — the next
      // save will read this same data and write it back into KV.
    } catch (e) {
      console.error('[adminData] texts KV read error:', e.message);
    }
  }
  try {
    const p = path.join(process.cwd(), 'data', 'texts.json');
    if (!fs.existsSync(p)) return [];
    const fileData = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Array.isArray(fileData) ? fileData : [];
  } catch { return []; }
}

export async function writeTexts(texts) {
  if (KV_URL && KV_TOKEN) {
    try {
      await kvSet('sotr:texts', texts);
      return;
    } catch (e) {
      console.error('[adminData] texts KV write error:', e.message);
      throw new Error(`Save failed: ${e.message}`);
    }
  }
  try {
    const p = path.join(process.cwd(), 'data', 'texts.json');
    fs.writeFileSync(p, JSON.stringify(texts, null, 2), 'utf8');
  } catch (e) {
    console.error('[adminData] texts file write error:', e.message);
    throw new Error('Save failed: no KV configured (set KV_REST_API_URL and KV_REST_API_TOKEN) and the filesystem is read-only in this environment.');
  }
}

// ── Site config (forwarding email, footer settings, etc.) ─
export async function readSiteConfig() {
  if (KV_URL && KV_TOKEN) {
    try {
      const data = await kvGet('sotr:config');
      if (data !== undefined) return data;
      // Fall through to the file below rather than reporting empty config.
    } catch (e) {
      console.error('[adminData] config KV read error:', e.message);
    }
  }
  try {
    const p = path.join(process.cwd(), 'data', 'config.json');
    if (!fs.existsSync(p)) return {};
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { return {}; }
}

export async function writeSiteConfig(cfg) {
  if (KV_URL && KV_TOKEN) {
    try {
      await kvSet('sotr:config', cfg);
      return;
    } catch (e) {
      console.error('[adminData] config KV write error:', e.message);
      throw new Error(`Save failed: ${e.message}`);
    }
  }
  try {
    const p = path.join(process.cwd(), 'data', 'config.json');
    fs.writeFileSync(p, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (e) {
    console.error('[adminData] config file write error:', e.message);
    throw new Error('Save failed: no KV configured (set KV_REST_API_URL and KV_REST_API_TOKEN) and the filesystem is read-only in this environment.');
  }
}

// ── Backups via KV or local file (was raw fs.writeFileSync into a
// directory, which silently failed on every save in production since
// Vercel's filesystem is read-only — that's why backups never appeared) ─
async function readBackupsList() {
  if (KV_URL && KV_TOKEN) {
    try {
      const data = await kvGet('sotr:backups');
      if (Array.isArray(data)) return data;
    } catch (e) { console.error('[adminData] backups KV read error:', e.message); }
  }
  try {
    if (!fs.existsSync(BACKUPS_PATH)) return [];
    const data = JSON.parse(fs.readFileSync(BACKUPS_PATH, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

async function writeBackupsList(list) {
  if (KV_URL && KV_TOKEN) {
    await kvSet('sotr:backups', list);
    return;
  }
  fs.writeFileSync(BACKUPS_PATH, JSON.stringify(list, null, 2), 'utf8');
}

async function backup(data) {
  try {
    const list = await readBackupsList();
    const id = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    list.unshift({ id, date: id.replace('T', ' '), size: JSON.stringify(data).length, data });
    if (list.length > MAX_BACKUPS) list.length = MAX_BACKUPS;
    await writeBackupsList(list);
  } catch (e) {
    // A failed snapshot must never block the save the admin actually
    // asked for — but it should be visible in logs, not just vanish.
    console.error('[adminData] backup snapshot failed:', e.message);
  }
}

// ── Public API ────────────────────────────────────────────
export async function parseCatalog() { return readStore(); }

export async function updateBook(key, updates) {
  const catalog = await readStore();
  if (!catalog.BOOKS?.[key]) throw new Error(`Book "${key}" not found`);
  const allowed = ['title','subtitle','synopsis','price','available','hidden',
    'release','color','genre','lang','pages','vol','series','seriesKey','orn',
    'synopsis_en','synopsis_fr','synopsis_es','image','format','links'];
  await backup(catalog);
  for (const [k, v] of Object.entries(updates)) {
    if (allowed.includes(k)) catalog.BOOKS[key][k] = v;
  }
  await writeStore(catalog);
  return { success: true, key, updates };
}

export async function toggleAvailability(key) {
  const catalog = await readStore();
  if (!catalog.BOOKS?.[key]) throw new Error(`Book "${key}" not found`);
  await backup(catalog);
  catalog.BOOKS[key].available = !catalog.BOOKS[key].available;
  await writeStore(catalog);
  return { success: true, key, available: catalog.BOOKS[key].available };
}

export async function toggleHidden(key) {
  const catalog = await readStore();
  if (!catalog.BOOKS?.[key]) throw new Error(`Book "${key}" not found`);
  await backup(catalog);
  catalog.BOOKS[key].hidden = !catalog.BOOKS[key].hidden;
  await writeStore(catalog);
  return { success: true, key, hidden: catalog.BOOKS[key].hidden };
}

export async function updateSynopsis(key, { en, fr, es }, links) {
  const updates = {};
  if (en !== undefined) { updates.synopsis_en = en; updates.synopsis = en; }
  if (fr !== undefined) updates.synopsis_fr = fr;
  if (es !== undefined) updates.synopsis_es = es;
  if (links !== undefined) updates.links = links;
  return updateBook(key, updates);
}

export async function getBooksArray() {
  const { BOOKS } = await readStore();
  return Object.values(BOOKS || {}).map(b => ({
    key: b.key, title: b.title, subtitle: b.subtitle || '',
    genre: b.genre, series: b.series, seriesKey: b.seriesKey,
    vol: b.vol || '', available: b.available, hidden: b.hidden || false,
    price: b.price, release: b.release || '', lang: b.lang,
    color: b.color, image: b.image || '',
    synopsis: b.synopsis || '',
    synopsis_en: b.synopsis_en || b.synopsis || '',
    synopsis_fr: b.synopsis_fr || '',
    synopsis_es: b.synopsis_es || '',
    links: b.links || {},
  }));
}

export async function getSeriesSummary() {
  const { BOOKS, SERIES } = await readStore();
  return Object.values(SERIES || {}).map(s => ({
    key: s.key, name: s.name, tag: s.tag,
    total: s.volumes.length,
    available: s.volumes.filter(k => BOOKS[k]?.available).length,
    locked: s.volumes.filter(k => BOOKS[k] && !BOOKS[k].available).length,
  }));
}

export async function getDashboardStats() {
  const { BOOKS, SERIES, BUNDLES } = await readStore();
  const books = Object.values(BOOKS || {});
  let lastModified = new Date().toISOString();
  try { lastModified = fs.statSync(CATALOG_PATH).mtime.toISOString(); } catch {}
  return {
    totalTitles: books.length,
    availableTitles: books.filter(b => b.available).length,
    lockedTitles: books.filter(b => !b.available).length,
    hiddenTitles: books.filter(b => b.hidden).length,
    totalSeries: Object.keys(SERIES || {}).length,
    totalBundles: (BUNDLES || []).length,
    genreBreakdown: books.reduce((a, b) => { a[b.genre] = (a[b.genre] || 0) + 1; return a; }, {}),
    lastModified,
  };
}

export async function listBackups() {
  const list = await readBackupsList();
  return list.map(({ id, date, size }) => ({ filename: id, date, size }));
}

export async function restoreBackup(filename) {
  const list = await readBackupsList();
  const entry = list.find(b => b.id === filename);
  if (!entry) throw new Error('Backup not found');
  await backup(await readStore());
  await writeStore(entry.data);
  return { success: true, restored: filename };
}

export function generateBookKey(title, existingKeys) {
  let slug = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 20).replace(/-$/, '');
  let key = slug, n = 2;
  while (existingKeys.includes(key)) { key = `${slug}-${n}`; n++; }
  return key;
}

export async function addBook(bookData) {
  const catalog = await readStore();
  const existing = Object.keys(catalog.BOOKS || {});
  if (!bookData.key) bookData.key = generateBookKey(bookData.title || 'untitled', existing);
  if (catalog.BOOKS[bookData.key]) bookData.key = generateBookKey(bookData.title || 'untitled', existing);
  const key = bookData.key;
  catalog.BOOKS[key] = {
    key, color: bookData.color || '#1C2B4A', orn: bookData.orn || '◆',
    genre: bookData.genre || '', title: bookData.title || '', subtitle: bookData.subtitle || '',
    lang: bookData.lang || 'EN / FR', pages: bookData.pages || 'TBD',
    series: bookData.series || 'Standalone', seriesKey: bookData.seriesKey || null,
    vol: bookData.vol || '', available: bookData.available === true,
    hidden: false, price: bookData.price || 'Coming Soon', release: bookData.release || '',
    synopsis: bookData.synopsis || '', synopsis_en: bookData.synopsis_en || bookData.synopsis || '',
    synopsis_fr: bookData.synopsis_fr || '', synopsis_es: bookData.synopsis_es || '',
    image: bookData.image || '',
    details: [
      ['Genre', bookData.genre || ''], ['Language', bookData.lang || 'EN / FR'],
      ['Format', bookData.format || 'Print · eBook'], ['Publisher', 'SPY ON THE RISE'],
    ],
  };
  // Keep the series' own volumes list in sync — getSeriesSummary() counts
  // from here, not from books' seriesKey, so a book created straight into
  // a series (rather than added to it afterward) must be pushed in too.
  if (bookData.seriesKey && catalog.SERIES?.[bookData.seriesKey] && !catalog.SERIES[bookData.seriesKey].volumes.includes(key)) {
    catalog.SERIES[bookData.seriesKey].volumes.push(key);
  }
  await backup(catalog);
  await writeStore(catalog);
  return { success: true, key };
}

export async function getPlatforms() {
  const { PLATFORMS } = await readStore();
  return PLATFORMS || {};
}

export async function addPlatform(platform, platformType) {
  const catalog = await readStore();
  if (!catalog.PLATFORMS) catalog.PLATFORMS = {};
  if (!catalog.PLATFORMS[platformType]) catalog.PLATFORMS[platformType] = [];
  await backup(catalog);
  catalog.PLATFORMS[platformType].push(platform);
  await writeStore(catalog);
  return { success: true };
}

export async function updatePlatform(platformType, key, updates) {
  const catalog = await readStore();
  const list = catalog.PLATFORMS?.[platformType];
  if (!list) throw new Error(`Platform type "${platformType}" not found`);
  const idx = list.findIndex(p => p.key === key);
  if (idx < 0) throw new Error(`Platform "${key}" not found`);
  await backup(catalog);
  const allowed = ['name', 'abbr', 'color', 'note', 'url', 'feat'];
  for (const [k, v] of Object.entries(updates)) {
    if (allowed.includes(k)) list[idx][k] = v;
  }
  await writeStore(catalog);
  return { success: true };
}

export async function deletePlatform(platformType, key) {
  const catalog = await readStore();
  const list = catalog.PLATFORMS?.[platformType];
  if (!list) throw new Error(`Platform type "${platformType}" not found`);
  await backup(catalog);
  catalog.PLATFORMS[platformType] = list.filter(p => p.key !== key);
  await writeStore(catalog);
  return { success: true };
}

export async function updateSeries(series) {
  const catalog = await readStore();
  if (!catalog.SERIES?.[series.key]) throw new Error('Series not found');
  await backup(catalog);
  if (series.name) catalog.SERIES[series.key].name = series.name;
  if (series.tag)  catalog.SERIES[series.key].tag  = series.tag;
  await writeStore(catalog);
  return { success: true };
}

export async function addSeries(seriesData) {
  const catalog = await readStore();
  if (!catalog.SERIES) catalog.SERIES = {};
  const name = (seriesData?.name || '').trim();
  if (!name) throw new Error('Series name is required');
  const key = generateBookKey(name, Object.keys(catalog.SERIES));
  catalog.SERIES[key] = {
    key,
    num: String(Object.keys(catalog.SERIES).length + 1).padStart(2, '0'),
    tag: (seriesData.tag || '').trim(),
    name,
    volumes: [],
    totalVols: 0,
    desc: (seriesData.desc || '').trim(),
    conceptHead: '',
    conceptBody: '',
    stats: [],
  };
  await backup(catalog);
  await writeStore(catalog);
  return { success: true, key, name };
}

export async function addBookToSeries(seriesKey, bookKey) {
  const catalog = await readStore();
  if (!catalog.SERIES?.[seriesKey]) throw new Error('Series not found');
  if (!catalog.BOOKS?.[bookKey]) throw new Error('Book not found');
  await backup(catalog);
  const prevSeriesKey = catalog.BOOKS[bookKey].seriesKey;
  if (prevSeriesKey && prevSeriesKey !== seriesKey && catalog.SERIES[prevSeriesKey]) {
    catalog.SERIES[prevSeriesKey].volumes = catalog.SERIES[prevSeriesKey].volumes.filter(k => k !== bookKey);
  }
  if (!catalog.SERIES[seriesKey].volumes.includes(bookKey)) {
    catalog.SERIES[seriesKey].volumes.push(bookKey);
  }
  catalog.BOOKS[bookKey].seriesKey = seriesKey;
  catalog.BOOKS[bookKey].series = catalog.SERIES[seriesKey].name;
  await writeStore(catalog);
  return { success: true };
}

export async function removeBookFromSeries(seriesKey, bookKey) {
  const catalog = await readStore();
  if (!catalog.SERIES?.[seriesKey]) throw new Error('Series not found');
  await backup(catalog);
  catalog.SERIES[seriesKey].volumes = catalog.SERIES[seriesKey].volumes.filter(k => k !== bookKey);
  if (catalog.BOOKS?.[bookKey]) {
    catalog.BOOKS[bookKey].seriesKey = null;
    catalog.BOOKS[bookKey].series = 'Standalone';
  }
  await writeStore(catalog);
  return { success: true };
}

export async function getBundlesArray() { return (await readStore()).BUNDLES || []; }

export async function saveBundle(bundle) {
  const catalog = await readStore();
  await backup(catalog);
  const idx = catalog.BUNDLES.findIndex(b => b.id === bundle.id);
  if (idx >= 0) catalog.BUNDLES[idx] = bundle; else catalog.BUNDLES.push(bundle);
  await writeStore(catalog);
  return { success: true, bundle };
}

export async function deleteBundle(id) {
  const catalog = await readStore();
  await backup(catalog);
  catalog.BUNDLES = catalog.BUNDLES.filter(b => b.id !== id);
  await writeStore(catalog);
  return { success: true, deleted: id };
}

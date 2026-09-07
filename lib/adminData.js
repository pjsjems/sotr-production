// lib/adminData.js
// Reads/writes data/catalog.json on every call.
// JSON file is not cached by Node.js: changes are instant.
// Uses Vercel KV when available, falls back to file system.

import fs from 'fs';
import path from 'path';

const CATALOG_PATH = path.join(process.cwd(), 'data', 'catalog.json');
const BACKUP_DIR   = path.join(process.cwd(), 'data', 'backups');

// Vercel's marketplace KV/Redis integration prefixes env vars with the
// project name (e.g. spyontherise_KV_REST_API_URL) instead of the old
// bare KV_REST_API_URL. Support both so reconnecting the store doesn't
// require another code change.
export const KV_URL   = process.env.KV_REST_API_URL   || process.env.spyontherise_KV_REST_API_URL;
export const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.spyontherise_KV_REST_API_TOKEN;

// ── Storage: KV in production, file in dev ────────────────
async function readStore() {
  const kvUrl   = KV_URL;
  const kvToken = KV_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(`${kvUrl}/get/sotr:catalog`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const json = await r.json();
      if (json.result) {
        const data = typeof json.result === 'string'
          ? JSON.parse(json.result) : json.result;
        return data;
      }
    } catch (e) { console.error('[adminData] KV read error:', e.message); }
  }
  try {
    return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  } catch {
    return { BOOKS: {}, SERIES: {}, PLATFORMS: {}, BUNDLES: [] };
  }
}

async function writeStore(data) {
  const kvUrl   = KV_URL;
  const kvToken = KV_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(`${kvUrl}/set/sotr:catalog`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(data) }),
      });
      if (!r.ok) throw new Error(`KV responded ${r.status}`);
      return;
    } catch (e) {
      console.error('[adminData] KV write error:', e.message);
      throw new Error(`Save failed: KV write error (${e.message}). Check KV_REST_API_URL and KV_REST_API_TOKEN.`);
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
  const kvUrl   = KV_URL;
  const kvToken = KV_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(`${kvUrl}/get/sotr:sitelock`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const json = await r.json();
      return json.result === 'true' || json.result === true;
    } catch {}
  }
  try {
    const f = path.join(process.cwd(), 'data', 'sitelock.json');
    return fs.existsSync(f) && JSON.parse(fs.readFileSync(f, 'utf8')).locked === true;
  } catch { return false; }
}

export async function writeSiteLock(locked) {
  const kvUrl   = KV_URL;
  const kvToken = KV_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(`${kvUrl}/set/sotr:sitelock`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: locked ? 'true' : 'false' }),
      });
      if (!r.ok) throw new Error(`KV responded ${r.status}`);
      return;
    } catch (e) {
      console.error('[adminData] sitelock KV write error:', e.message);
      throw new Error(`Save failed: KV write error (${e.message}). Check KV_REST_API_URL and KV_REST_API_TOKEN.`);
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
  const kvUrl   = KV_URL;
  const kvToken = KV_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(`${kvUrl}/get/sotr:texts`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const json = await r.json();
      if (json.result) {
        return typeof json.result === 'string'
          ? JSON.parse(json.result)
          : json.result;
      }
      return [];
    } catch (e) {
      console.error('[adminData] texts KV read error:', e.message);
    }
  }
  try {
    const p = path.join(process.cwd(), 'data', 'texts.json');
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch { return []; }
}

export async function writeTexts(texts) {
  const kvUrl   = KV_URL;
  const kvToken = KV_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(`${kvUrl}/set/sotr:texts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: JSON.stringify(texts) }),
      });
      if (!r.ok) throw new Error(`KV responded ${r.status}`);
      return;
    } catch (e) {
      console.error('[adminData] texts KV write error:', e.message);
      throw new Error(`Save failed: KV write error (${e.message}). Check KV_REST_API_URL and KV_REST_API_TOKEN.`);
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
  const kvUrl   = KV_URL;
  const kvToken = KV_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(`${kvUrl}/get/sotr:config`, {
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      const json = await r.json();
      if (json.result) {
        return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
      }
      return {};
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
  const kvUrl   = KV_URL;
  const kvToken = KV_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(`${kvUrl}/set/sotr:config`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: JSON.stringify(cfg) }),
      });
      if (!r.ok) throw new Error(`KV responded ${r.status}`);
      return;
    } catch (e) {
      console.error('[adminData] config KV write error:', e.message);
      throw new Error(`Save failed: KV write error (${e.message}). Check KV_REST_API_URL and KV_REST_API_TOKEN.`);
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

// ── Backup ────────────────────────────────────────────────
function backup(data) {
  try {
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    fs.writeFileSync(path.join(BACKUP_DIR, `catalog_${ts}.json`), JSON.stringify(data, null, 2), 'utf8');
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('catalog_')).sort();
    if (files.length > 20) files.slice(0, files.length - 20).forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
  } catch {}
}

// ── Public API ────────────────────────────────────────────
export async function parseCatalog() { return readStore(); }

export async function updateBook(key, updates) {
  const catalog = await readStore();
  if (!catalog.BOOKS?.[key]) throw new Error(`Book "${key}" not found`);
  const allowed = ['title','subtitle','synopsis','price','available','hidden',
    'release','color','genre','lang','pages','vol','series','seriesKey','orn',
    'synopsis_en','synopsis_fr','synopsis_es','image','format','links'];
  backup(catalog);
  for (const [k, v] of Object.entries(updates)) {
    if (allowed.includes(k)) catalog.BOOKS[key][k] = v;
  }
  await writeStore(catalog);
  return { success: true, key, updates };
}

export async function toggleAvailability(key) {
  const catalog = await readStore();
  if (!catalog.BOOKS?.[key]) throw new Error(`Book "${key}" not found`);
  backup(catalog);
  catalog.BOOKS[key].available = !catalog.BOOKS[key].available;
  await writeStore(catalog);
  return { success: true, key, available: catalog.BOOKS[key].available };
}

export async function toggleHidden(key) {
  const catalog = await readStore();
  if (!catalog.BOOKS?.[key]) throw new Error(`Book "${key}" not found`);
  backup(catalog);
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

export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('catalog_'))
    .sort().reverse().slice(0, 10)
    .map(f => ({ filename: f, date: f.replace('catalog_', '').replace(/\.json$/, '').replace('T', ' '), size: fs.statSync(path.join(BACKUP_DIR, f)).size }));
}

export async function restoreBackup(filename) {
  const p = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(p)) throw new Error('Backup not found');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  backup(await readStore());
  await writeStore(data);
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
  backup(catalog);
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
  backup(catalog);
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
  backup(catalog);
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
  backup(catalog);
  catalog.PLATFORMS[platformType] = list.filter(p => p.key !== key);
  await writeStore(catalog);
  return { success: true };
}

export async function updateSeries(series) {
  const catalog = await readStore();
  if (!catalog.SERIES?.[series.key]) throw new Error('Series not found');
  backup(catalog);
  if (series.name) catalog.SERIES[series.key].name = series.name;
  if (series.tag)  catalog.SERIES[series.key].tag  = series.tag;
  await writeStore(catalog);
  return { success: true };
}

export async function addBookToSeries(seriesKey, bookKey) {
  const catalog = await readStore();
  if (!catalog.SERIES?.[seriesKey]) throw new Error('Series not found');
  if (!catalog.BOOKS?.[bookKey]) throw new Error('Book not found');
  backup(catalog);
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
  backup(catalog);
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
  backup(catalog);
  const idx = catalog.BUNDLES.findIndex(b => b.id === bundle.id);
  if (idx >= 0) catalog.BUNDLES[idx] = bundle; else catalog.BUNDLES.push(bundle);
  await writeStore(catalog);
  return { success: true, bundle };
}

export async function deleteBundle(id) {
  const catalog = await readStore();
  backup(catalog);
  catalog.BUNDLES = catalog.BUNDLES.filter(b => b.id !== id);
  await writeStore(catalog);
  return { success: true, deleted: id };
}

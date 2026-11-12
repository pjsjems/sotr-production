// lib/adminData.js
// Reads/writes data/catalog.json on every call.
// JSON file is not cached by Node.js: changes are instant.
// Uses Vercel KV when available, falls back to file system.

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { migratePublishingCatalog, validateEditorialRelations } from './publishingSchema';

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
// Root cause of every "text disappears" report: Upstash's REST API does
// not unwrap a {"value": ...} field from a POST body — it stores
// whatever bytes you send, verbatim. This code was sending
// JSON.stringify({ value: JSON.stringify(value) }), so what actually
// got stored was the literal string '{"value":"[...]"}, not our array.
// readTexts() correctly saw that as "not an array" and silently fell
// back to the bundled file every time (which is why it always looked
// like exactly one, unchanging text) — while the old verification here
// only checked for `undefined`, so it never caught its own malformed
// write. The fix is simply not to wrap the body: POST the value's JSON
// text directly, matching what Upstash's /set/<key> actually expects.
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
  const serialized = JSON.stringify(value);
  const r = await fetch(`${KV_URL}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: serialized,
  });
  let body;
  try { body = await r.json(); } catch { body = null; }
  if (!r.ok || (body && body.error)) {
    throw new Error(`KV write failed for ${key}: ${body?.error || `HTTP ${r.status}`}`);
  }
  // Verify by shape, not just presence — a malformed write (like the
  // double-wrapping bug above) still reads back as "something", just
  // not the array/object we actually wrote.
  const verify = await kvGet(key);
  if (verify === undefined || JSON.stringify(verify) !== serialized) {
    throw new Error(`KV write to ${key} did not persist correctly (read-back mismatch)`);
  }
}

// A book's series membership is described by two independent fields —
// SERIES[key].volumes (an explicit list, what the public series page
// and totalVols/stat counts trust) and BOOKS[key].seriesKey (what the
// admin dashboard's "books in this series" view and filters trust) —
// and not every write path updates both (addBook's silent no-op when
// seriesKey doesn't match a real series yet; updateBook's generic
// field-merge never touches volumes at all). Reconciling here, in the
// one choke point every reader and writer goes through, means a book
// can never silently vanish from its series' public page just because
// some write only set one side: every write function re-persists
// whatever readStore() hands back, so the fix sticks permanently the
// next time anything is saved. Additive only — a book already listed
// in volumes is never removed just because its own seriesKey disagrees,
// so this can only fill gaps, never destroy an intentional listing.
function reconcileSeries(catalog) {
  const books = catalog.BOOKS || {};
  const series = catalog.SERIES || {};
  for (const s of Object.values(series)) {
    if (!Array.isArray(s.volumes)) s.volumes = [];
    s.volumes = s.volumes.filter(k => !!books[k]); // drop dangling refs to deleted books
    for (const b of Object.values(books)) {
      if (b.seriesKey === s.key && !s.volumes.includes(b.key)) s.volumes.push(b.key);
    }
    s.totalVols = s.volumes.length;
  }
  return catalog;
}

// Series created via the admin's "+ Add New Series" flow start with
// stats: [] and nothing ever fills it in afterward, leaving their public
// page's Volumes/Available/In Production stat row silently blank.
// Deliberately NOT part of reconcileSeries() above: that function runs
// inside readStore(), which every write function also calls before
// mutating and persisting — synthesizing here would freeze a stale
// pre-mutation snapshot into storage the moment any unrelated write
// touched the series, and the "only if empty" guard would then never
// fire again. This stays a display-only computation applied fresh on
// every read, in parseCatalog() only, so it can never go stale or get
// permanently baked in.
function withSynthesizedStats(catalog) {
  const books = catalog.BOOKS || {};
  for (const s of Object.values(catalog.SERIES || {})) {
    if (Array.isArray(s.stats) && s.stats.length > 0) continue;
    const available = s.volumes.filter(k => books[k]?.available).length;
    s.stats = [
      { n: String(s.totalVols), l: { en: 'Volumes', fr: 'Volumes', es: 'Volúmenes' } },
      { n: String(available), l: { en: 'Available Now', fr: 'Disponibles', es: 'Disponibles' } },
      { n: String(s.totalVols - available), l: { en: 'In Production', fr: 'En Production', es: 'En Producción' } },
    ];
  }
  return catalog;
}

// ── Storage: KV in production, file in dev ────────────────
async function readStore() {
  if (KV_URL && KV_TOKEN) {
    try {
      const data = await kvGet('sotr:catalog');
      if (data && typeof data === 'object' && data.BOOKS) return reconcileSeries(data);
      if (data !== undefined) console.error('[adminData] catalog KV value has unexpected shape, ignoring');
    } catch (e) { console.error('[adminData] KV read error:', e.message); }
  }
  try {
    return reconcileSeries(JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8')));
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
      if (data && typeof data === 'object' && !Array.isArray(data)) return data;
      if (data !== undefined) console.error('[adminData] config KV value has unexpected shape, ignoring');
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

// On-demand backup, triggered explicitly by the admin rather than as a
// side effect of some other save — unlike backup() above, a failure
// here must be visible to whoever clicked the button.
export async function createManualBackup(snapshot) {
  const catalog = snapshot || await readStore();
  const list = await readBackupsList();
  const id = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  list.unshift({ id, date: id.replace('T', ' '), size: JSON.stringify(catalog).length, data: catalog });
  if (list.length > MAX_BACKUPS) list.length = MAX_BACKUPS;
  await writeBackupsList(list);
  return { success: true, id };
}

// ── Messages & notification signups via KV or local file ─
// Previously raw fs.writeFileSync straight to data/*.json — a no-op
// error on Vercel's read-only filesystem, uncaught, so every contact
// message and "text of the month" email request 500'd in production.
export async function readMessages() {
  if (KV_URL && KV_TOKEN) {
    try {
      const data = await kvGet('sotr:messages');
      if (Array.isArray(data)) return data;
      if (data !== undefined) console.error('[adminData] messages KV value has unexpected shape, ignoring');
    } catch (e) { console.error('[adminData] messages KV read error:', e.message); }
  }
  try {
    const p = path.join(process.cwd(), 'data', 'messages.json');
    if (!fs.existsSync(p)) return [];
    const fileData = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Array.isArray(fileData) ? fileData : [];
  } catch { return []; }
}

export async function writeMessages(msgs) {
  if (KV_URL && KV_TOKEN) {
    try { await kvSet('sotr:messages', msgs); return; }
    catch (e) {
      console.error('[adminData] messages KV write error:', e.message);
      throw new Error(`Save failed: ${e.message}`);
    }
  }
  try {
    const p = path.join(process.cwd(), 'data', 'messages.json');
    fs.writeFileSync(p, JSON.stringify(msgs, null, 2), 'utf8');
  } catch (e) {
    console.error('[adminData] messages file write error:', e.message);
    throw new Error('Save failed: no KV configured and the filesystem is read-only in this environment.');
  }
}

export async function readNotifications() {
  if (KV_URL && KV_TOKEN) {
    try {
      const data = await kvGet('sotr:notifications');
      if (Array.isArray(data)) return data;
      if (data !== undefined) console.error('[adminData] notifications KV value has unexpected shape, ignoring');
    } catch (e) { console.error('[adminData] notifications KV read error:', e.message); }
  }
  try {
    const p = path.join(process.cwd(), 'data', 'notifications.json');
    if (!fs.existsSync(p)) return [];
    const fileData = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Array.isArray(fileData) ? fileData : [];
  } catch { return []; }
}

export async function writeNotifications(notifs) {
  if (KV_URL && KV_TOKEN) {
    try { await kvSet('sotr:notifications', notifs); return; }
    catch (e) {
      console.error('[adminData] notifications KV write error:', e.message);
      throw new Error(`Save failed: ${e.message}`);
    }
  }
  try {
    const p = path.join(process.cwd(), 'data', 'notifications.json');
    fs.writeFileSync(p, JSON.stringify(notifs, null, 2), 'utf8');
  } catch (e) {
    console.error('[adminData] notifications file write error:', e.message);
    throw new Error('Save failed: no KV configured and the filesystem is read-only in this environment.');
  }
}

// ── Public API ────────────────────────────────────────────
export async function parseCatalog() { return withSynthesizedStats(await readStore()); }

export async function getPublishingData() {
  const catalog = await readStore();
  return {
    schemaVersion: catalog.PUBLISHING_SCHEMA_VERSION || 0,
    migrationReport: catalog.PUBLISHING_MIGRATION_REPORT || null,
    categories: Object.values(catalog.PUBLISHING_CATEGORIES || {}),
    subcategories: Object.values(catalog.PUBLISHING_SUBCATEGORIES || {}),
    genres: Object.values(catalog.PUBLISHING_GENRES || {}),
    subjects: Object.values(catalog.PUBLISHING_SUBJECTS || {}),
    contentTypes: Object.values(catalog.PUBLISHING_CONTENT_TYPES || {}),
    audiences: Object.values(catalog.PUBLISHING_AUDIENCES || {}),
    readingLevels: Object.values(catalog.PUBLISHING_READING_LEVELS || {}),
    formats: Object.values(catalog.PUBLISHING_FORMATS || {}),
    languages: Object.values(catalog.PUBLISHING_LANGUAGES || {}),
    authors: Object.values(catalog.AUTHORS || {}),
    publishers: Object.values(catalog.PUBLISHERS || {}),
    collections: Object.values(catalog.COLLECTIONS || {}),
    distributionChannels: Object.values(catalog.DISTRIBUTION_CHANNELS || {}),
  };
}

export async function migratePublishingData() {
  let catalog;
  if (KV_URL && KV_TOKEN) {
    catalog = await kvGet('sotr:catalog');
    if (!catalog || typeof catalog !== 'object' || !catalog.BOOKS || typeof catalog.BOOKS !== 'object') {
      throw new Error('Production catalogue is unavailable or has an invalid shape; no migration was applied.');
    }
    reconcileSeries(catalog);
  } else {
    catalog = await readStore();
  }
  const { catalog: migrated, report } = migratePublishingCatalog(catalog);
  if (!report.alreadyMigrated) {
    await createManualBackup(catalog);
    await writeStore(migrated);
  }
  return { success: true, report };
}

export async function addCollection(collectionData) {
  const catalog = await readStore();
  if (!catalog.COLLECTIONS) catalog.COLLECTIONS = {};
  const name = String(collectionData?.name || '').trim();
  if (!name) throw new Error('Collection name is required.');
  const id = `${generateBookKey(name, Object.keys(catalog.COLLECTIONS))}`;
  if (Object.values(catalog.COLLECTIONS).some(collection => String(collection.name || '').toLowerCase() === name.toLowerCase())) {
    throw new Error('A collection with this name already exists.');
  }
  const collection = {
    id,
    code: String(collectionData.code || '').trim(),
    name,
    description: String(collectionData.description || '').trim(),
    cover: '',
    status: 'active',
    displayOrder: Object.keys(catalog.COLLECTIONS).length,
  };
  await backup(catalog);
  catalog.COLLECTIONS[id] = collection;
  await writeStore(catalog);
  return { success: true, collection };
}

export async function addAuthor(authorData) {
  const catalog = await readStore();
  catalog.AUTHORS ||= {};
  const name = String(authorData?.name || '').trim();
  if (!name) throw relationError('Author name is required.');
  if (Object.values(catalog.AUTHORS).some(author => author.name.toLowerCase() === name.toLowerCase())) {
    throw relationError('An author with this name already exists.');
  }
  const id = randomUUID();
  const author = { id, name, active: true, createdAt: new Date().toISOString() };
  await backup(catalog);
  catalog.AUTHORS[id] = author;
  await writeStore(catalog);
  return { success: true, author };
}

export async function addPublisher(publisherData) {
  const catalog = await readStore();
  catalog.PUBLISHERS ||= {};
  const name = String(publisherData?.name || '').trim();
  if (!name) throw relationError('Publisher name is required.');
  if (Object.values(catalog.PUBLISHERS).some(publisher => String(publisher.name || '').toLowerCase() === name.toLowerCase())) {
    throw relationError('A publisher with this name already exists.');
  }
  const id = generateBookKey(name, Object.keys(catalog.PUBLISHERS));
  const publisher = { id, name, active: true };
  await backup(catalog);
  catalog.PUBLISHERS[id] = publisher;
  await writeStore(catalog);
  return { success: true, publisher };
}

function nextSotrBookId(books) {
  const used = new Set(Object.values(books).map(book => book.sotrBookId).filter(Boolean));
  let number = 1;
  while (used.has(`SOTR-BK-${String(number).padStart(4, '0')}`)) number++;
  return `SOTR-BK-${String(number).padStart(4, '0')}`;
}

function relationError(message) {
  return Object.assign(new Error(message), { status: 400 });
}

function canonicalIsbn(value) {
  const isbn = String(value || '').replace(/[-\s]/g, '').toUpperCase();
  if (/^\d{13}$/.test(isbn)) return isbn;
  if (/^\d{9}[\dX]$/.test(isbn)) {
    const firstTwelve = `978${isbn.slice(0, 9)}`;
    const sum = [...firstTwelve].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0);
    return `${firstTwelve}${(10 - (sum % 10)) % 10}`;
  }
  return isbn;
}

function isValidIsbn10(value) {
  const isbn = String(value || '').replace(/[-\s]/g, '').toUpperCase();
  return /^\d{9}[\dX]$/.test(isbn) &&
    [...isbn].reduce((sum, character, index) => sum + (character === 'X' ? 10 : Number(character)) * (10 - index), 0) % 11 === 0;
}

function isValidIsbn13(value) {
  const isbn = String(value || '').replace(/[-\s]/g, '');
  if (!/^\d{13}$/.test(isbn)) return false;
  const sum = [...isbn.slice(0, 12)].reduce((total, digit, index) => total + Number(digit) * (index % 2 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === Number(isbn[12]);
}

function persistBookRelations(catalog, bookKey, updates) {
  const book = catalog.BOOKS[bookKey];
  if (Array.isArray(updates.genreIds) || 'primaryGenreId' in updates) {
    catalog.BOOK_GENRES ||= {};
    const genreIds = Array.isArray(updates.genreIds)
      ? [...new Set(updates.genreIds)]
      : Object.values(catalog.BOOK_GENRES).filter(item => item.bookKey === bookKey).map(item => item.genreId);
    const existingPrimary = Object.values(catalog.BOOK_GENRES).find(item => item.bookKey === bookKey && item.isPrimary)?.genreId;
    const primaryGenreId = updates.primaryGenreId !== undefined ? updates.primaryGenreId : existingPrimary || null;
    for (const [relationKey, relation] of Object.entries(catalog.BOOK_GENRES)) {
      if (relation.bookKey === bookKey) delete catalog.BOOK_GENRES[relationKey];
    }
    genreIds.forEach((genreId, displayOrder) => {
      catalog.BOOK_GENRES[`${bookKey}:${genreId}`] = {
        bookKey, genreId, isPrimary: genreId === primaryGenreId, displayOrder,
      };
    });
    if (primaryGenreId) book.genre = catalog.PUBLISHING_GENRES[primaryGenreId]?.label || book.genre;
    else if (Array.isArray(updates.genreIds)) book.genre = '';
  }

  if (Array.isArray(updates.subjectIds) || 'primarySubjectId' in updates) {
    catalog.BOOK_SUBJECTS ||= {};
    const subjectIds = Array.isArray(updates.subjectIds)
      ? [...new Set(updates.subjectIds)]
      : Object.values(catalog.BOOK_SUBJECTS).filter(item => item.bookKey === bookKey).map(item => item.subjectId);
    const existingPrimary = Object.values(catalog.BOOK_SUBJECTS).find(item => item.bookKey === bookKey && item.isPrimary)?.subjectId;
    const primarySubjectId = updates.primarySubjectId !== undefined ? updates.primarySubjectId : existingPrimary || null;
    for (const [relationKey, relation] of Object.entries(catalog.BOOK_SUBJECTS)) {
      if (relation.bookKey === bookKey) delete catalog.BOOK_SUBJECTS[relationKey];
    }
    subjectIds.forEach((subjectId, displayOrder) => {
      catalog.BOOK_SUBJECTS[`${bookKey}:${subjectId}`] = {
        bookKey, subjectId, isPrimary: subjectId === primarySubjectId, displayOrder,
      };
    });
  }

  if (Array.isArray(updates.seriesMemberships)) {
    catalog.BOOK_SERIES ||= {};
    for (const [relationKey, relation] of Object.entries(catalog.BOOK_SERIES)) {
      if (relation.bookKey !== bookKey) continue;
      if (catalog.SERIES?.[relation.seriesKey]) {
        catalog.SERIES[relation.seriesKey].volumes = catalog.SERIES[relation.seriesKey].volumes.filter(key => key !== bookKey);
      }
      delete catalog.BOOK_SERIES[relationKey];
    }
    const memberships = [];
    const seenSeries = new Set();
    for (const membership of updates.seriesMemberships) {
      const { seriesKey } = membership;
      if (seenSeries.has(seriesKey)) throw relationError(`Series "${seriesKey}" is selected more than once.`);
      seenSeries.add(seriesKey);
      if (!catalog.SERIES?.[seriesKey]) throw relationError(`Series "${seriesKey}" is missing.`);
      const volumeNumber = membership.volumeNumber === '' || membership.volumeNumber == null ? null : Number(membership.volumeNumber);
      const readingOrder = membership.readingOrder === '' || membership.readingOrder == null ? null : Number(membership.readingOrder);
      const publicationOrder = membership.publicationOrder === '' || membership.publicationOrder == null ? null : Number(membership.publicationOrder);
      if ([volumeNumber, readingOrder, publicationOrder].some(value => value !== null && (!Number.isFinite(value) || value <= 0))) {
        throw relationError('Series volume and order values must be positive numbers.');
      }
      if (volumeNumber !== null && Object.values(catalog.BOOK_SERIES).some(relation =>
        relation.seriesKey === seriesKey && relation.bookKey !== bookKey && Number(relation.volumeNumber) === volumeNumber,
      )) throw relationError(`Volume ${volumeNumber} is already assigned in "${catalog.SERIES[seriesKey].name}".`);
      const relation = {
        bookKey, seriesKey, volumeNumber,
        volumeLabel: membership.volumeLabel || null,
        readingOrder, publicationOrder,
      };
      catalog.BOOK_SERIES[`${bookKey}:${seriesKey}`] = relation;
      catalog.SERIES[seriesKey].volumes.push(bookKey);
      memberships.push(relation);
    }
    const primary = memberships[0];
    book.seriesKey = primary?.seriesKey || null;
    book.series = primary ? catalog.SERIES[primary.seriesKey].name : 'Standalone';
    book.vol = primary?.volumeLabel || '';
  }

  if (Array.isArray(updates.contributors)) {
    catalog.AUTHORS ||= {};
    catalog.BOOK_CONTRIBUTORS ||= {};
    for (const [relationKey, relation] of Object.entries(catalog.BOOK_CONTRIBUTORS)) {
      if (relation.bookKey === bookKey) delete catalog.BOOK_CONTRIBUTORS[relationKey];
    }
    const seenAuthors = new Set();
    updates.contributors.forEach((contributor, index) => {
      if (seenAuthors.has(contributor.authorId)) throw relationError('A contributor can only be assigned once to a book.');
      seenAuthors.add(contributor.authorId);
      if (!catalog.AUTHORS[contributor.authorId] || catalog.AUTHORS[contributor.authorId].active === false) {
        throw relationError(`Contributor "${contributor.authorId}" is missing or inactive.`);
      }
      const relation = {
        bookKey,
        authorId: contributor.authorId,
        role: contributor.role || 'author',
        displayOrder: Number.isInteger(Number(contributor.displayOrder)) ? Number(contributor.displayOrder) : index,
      };
      catalog.BOOK_CONTRIBUTORS[`${bookKey}:${contributor.authorId}`] = relation;
    });
  }

  if (Array.isArray(updates.collectionIds)) {
    const priorCollectionIds = Object.values(catalog.BOOK_COLLECTIONS || {})
      .filter(relation => relation.bookKey === bookKey).map(relation => relation.collectionId);
    const invalid = updates.collectionIds.find(id => !catalog.COLLECTIONS?.[id] ||
      (catalog.COLLECTIONS[id].status !== 'active' && !priorCollectionIds.includes(id)));
    if (invalid) throw relationError(`Collection "${invalid}" is missing or inactive.`);
    const collectionIds = [...new Set(updates.collectionIds)];
    for (const [id, relation] of Object.entries(catalog.BOOK_COLLECTIONS || {})) {
      if (relation.bookKey === bookKey) delete catalog.BOOK_COLLECTIONS[id];
    }
    for (const collectionId of collectionIds) {
      const id = `${bookKey}:${collectionId}`;
      catalog.BOOK_COLLECTIONS[id] = { bookKey, collectionId };
    }
  }

  if (Array.isArray(updates.editions)) {
    if (!catalog.EDITIONS) catalog.EDITIONS = {};
    if (!catalog.LISTINGS) catalog.LISTINGS = {};
    if (!catalog.KDP_MAPPINGS) catalog.KDP_MAPPINGS = {};
    const retained = new Set();
    for (const editionInput of updates.editions) {
      const id = editionInput.id || randomUUID();
      if (catalog.EDITIONS[id] && catalog.EDITIONS[id].bookKey !== bookKey) throw relationError('Edition belongs to a different book.');
      const previousEdition = catalog.EDITIONS[id];
      const edition = { ...editionInput, id, bookKey };
      if (!edition.formatId || !catalog.PUBLISHING_FORMATS?.[edition.formatId] ||
          (!catalog.PUBLISHING_FORMATS[edition.formatId].active && previousEdition?.formatId !== edition.formatId)) {
        throw relationError('Each edition must use an active format.');
      }
      if (!Array.isArray(edition.languageIds) || edition.languageIds.some(languageId =>
        !catalog.PUBLISHING_LANGUAGES?.[languageId] ||
        (!catalog.PUBLISHING_LANGUAGES[languageId].active && !(previousEdition?.languageIds || []).includes(languageId)),
      )) {
        throw relationError('Each edition must use valid edition language values.');
      }
      if (!['draft', 'in-development', 'published', 'discontinued', 'unverified'].includes(edition.status || 'draft') ||
          (edition.status === 'unverified' && previousEdition?.status !== 'unverified')) {
        throw relationError('Edition status is invalid.');
      }
      if (edition.isbn10 && !isValidIsbn10(edition.isbn10)) {
        throw relationError(`Edition "${edition.name || id}" has an invalid ISBN.`);
      }
      if (edition.isbn13 && !isValidIsbn13(edition.isbn13)) {
        throw relationError(`Edition "${edition.name || id}" has an invalid ISBN-13.`);
      }
      const duplicateIsbn = Object.values(catalog.EDITIONS).find(existing =>
        existing.id !== id && [edition.isbn10, edition.isbn13].filter(Boolean).some(value =>
          [existing.isbn10, existing.isbn13].filter(Boolean).some(other => canonicalIsbn(other) === canonicalIsbn(value)),
        ),
      );
      if (duplicateIsbn) throw relationError(`An ISBN is already assigned to edition "${duplicateIsbn.name || duplicateIsbn.id}".`);
      retained.add(id);
      catalog.EDITIONS[id] = edition;

      const listingIds = new Set();
      for (const listingInput of edition.listings || []) {
        const listingId = listingInput.id || randomUUID();
        if (catalog.LISTINGS[listingId] && catalog.LISTINGS[listingId].editionId !== id) throw relationError('Listing belongs to a different edition.');
        if (listingInput.url && !/^https?:\/\//i.test(listingInput.url)) throw relationError('Listing URL must use HTTP or HTTPS.');
        if (!['not-submitted', 'in-review', 'published', 'unavailable', 'discontinued', 'unverified'].includes(listingInput.status || 'not-submitted') ||
            (listingInput.status === 'unverified' && catalog.LISTINGS[listingId]?.status !== 'unverified')) {
          throw relationError('Listing status is invalid.');
        }
        const channelId = listingInput.channelId || `${String(listingInput.channelName || 'other').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${randomUUID().slice(0, 8)}`;
        if (!catalog.DISTRIBUTION_CHANNELS[channelId]) {
          catalog.DISTRIBUTION_CHANNELS[channelId] = {
            id: channelId,
            name: String(listingInput.channelName || 'Other').trim(),
            active: true,
          };
        }
        catalog.LISTINGS[listingId] = { ...listingInput, id: listingId, editionId: id, channelId };
        listingIds.add(listingId);

        for (const [mappingId, mapping] of Object.entries(catalog.KDP_MAPPINGS)) {
          if (mapping.listingId === listingId) delete catalog.KDP_MAPPINGS[mappingId];
        }
        if (listingInput.kdpMapping) {
          const mappingId = listingInput.kdpMapping.id || `${listingId}:kdp`;
          if (catalog.KDP_MAPPINGS[mappingId] && catalog.KDP_MAPPINGS[mappingId].listingId !== listingId) {
            throw relationError('KDP mapping belongs to a different listing.');
          }
          const categories = listingInput.kdpMapping.categories || [];
          if (!Array.isArray(categories) || categories.length > 3) throw relationError('A KDP listing can have no more than three categories.');
          catalog.KDP_MAPPINGS[mappingId] = {
            ...listingInput.kdpMapping,
            id: mappingId,
            listingId,
            marketplace: listingInput.kdpMapping.marketplace || listingInput.marketplace || '',
            categories,
          };
        }
      }
      for (const [listingId, listing] of Object.entries(catalog.LISTINGS)) {
        if (listing.editionId === id && !listingIds.has(listingId)) {
          delete catalog.LISTINGS[listingId];
          for (const [mappingId, mapping] of Object.entries(catalog.KDP_MAPPINGS)) {
            if (mapping.listingId === listingId) delete catalog.KDP_MAPPINGS[mappingId];
          }
        }
      }
    }
    for (const [id, edition] of Object.entries(catalog.EDITIONS)) {
      if (edition.bookKey === bookKey && !retained.has(id)) {
        for (const [listingId, listing] of Object.entries(catalog.LISTINGS)) {
          if (listing.editionId === id) {
            delete catalog.LISTINGS[listingId];
            for (const [mappingId, mapping] of Object.entries(catalog.KDP_MAPPINGS)) {
              if (mapping.listingId === listingId) delete catalog.KDP_MAPPINGS[mappingId];
            }
          }
        }
        delete catalog.EDITIONS[id];
      }
    }
  }
}

export async function updateBook(key, updates) {
  const catalog = await readStore();
  if (!catalog.BOOKS?.[key]) throw new Error(`Book "${key}" not found`);
  const hasPublishingSchema = (catalog.PUBLISHING_SCHEMA_VERSION || 0) > 0;
  if (hasPublishingSchema) {
    try {
      const currentBook = {
        ...catalog.BOOKS[key],
        genreIds: Object.values(catalog.BOOK_GENRES || {}).filter(item => item.bookKey === key).map(item => item.genreId),
        primaryGenreId: Object.values(catalog.BOOK_GENRES || {}).find(item => item.bookKey === key && item.isPrimary)?.genreId || '',
        subjectIds: Object.values(catalog.BOOK_SUBJECTS || {}).filter(item => item.bookKey === key).map(item => item.subjectId),
        primarySubjectId: Object.values(catalog.BOOK_SUBJECTS || {}).find(item => item.bookKey === key && item.isPrimary)?.subjectId || '',
      };
      validateEditorialRelations(updates, catalog, currentBook);
    } catch (error) {
      error.status = 400;
      throw error;
    }
  }
  if ('seriesKey' in updates && updates.seriesKey && !catalog.SERIES?.[updates.seriesKey]) {
    throw relationError('Selected series does not exist.');
  }
  const allowed = ['title','subtitle','synopsis','price','available','hidden',
    'release','color','genre','lang','pages','vol','series','seriesKey','orn',
    'synopsis_en','synopsis_fr','synopsis_es','title_en','title_fr','title_es',
    'subtitle_en','subtitle_fr','subtitle_es','genre_en','genre_fr','genre_es',
    'price_en','price_fr','price_es','release_en','release_fr','release_es',
    'vol_en','vol_fr','vol_es','image','image_en','image_fr','image_es','format','links'];
  if (hasPublishingSchema) allowed.push(
    'publishingCategoryId','publishingSubcategoryId','contentTypeId','targetAudienceId',
    'ageRangeMin','ageRangeMax','readingLevelId','originalLanguageId','publisherId',
    'publicationStatus',
  );
  await backup(catalog);
  // A seriesKey change must also move the book between the two series'
  // volumes lists — reconcileSeries() would fill this in on the next
  // read anyway, but doing it here keeps this write internally
  // consistent immediately, not just eventually.
  if ('seriesKey' in updates && updates.seriesKey !== catalog.BOOKS[key].seriesKey) {
    const prevKey = catalog.BOOKS[key].seriesKey;
    const nextKey = updates.seriesKey;
    if (prevKey && catalog.SERIES?.[prevKey]) {
      catalog.SERIES[prevKey].volumes = catalog.SERIES[prevKey].volumes.filter(k => k !== key);
    }
    if (nextKey && catalog.SERIES?.[nextKey] && !catalog.SERIES[nextKey].volumes.includes(key)) {
      catalog.SERIES[nextKey].volumes.push(key);
    }
    catalog.BOOK_SERIES ||= {};
    for (const [relationKey, relation] of Object.entries(catalog.BOOK_SERIES)) {
      if (relation.bookKey === key) delete catalog.BOOK_SERIES[relationKey];
    }
    if (nextKey && catalog.SERIES?.[nextKey]) {
      catalog.BOOK_SERIES[`${key}:${nextKey}`] = {
        bookKey: key,
        seriesKey: nextKey,
        volumeNumber: null,
        volumeLabel: updates.vol ?? catalog.BOOKS[key].vol ?? null,
        readingOrder: null,
        publicationOrder: catalog.SERIES[nextKey].volumes.indexOf(key) + 1,
      };
    }
  }
  for (const [k, v] of Object.entries(updates)) {
    if (allowed.includes(k)) {
      if (k === 'ageRangeMin' || k === 'ageRangeMax') catalog.BOOKS[key][k] = v === '' || v == null ? null : Number(v);
      else catalog.BOOKS[key][k] = v;
    }
  }
  if ('title_en' in updates) catalog.BOOKS[key].title = updates.title_en;
  else if ('title' in updates && !catalog.BOOKS[key].title_en) catalog.BOOKS[key].title_en = updates.title;
  for (const [localized, legacy] of [
    ['subtitle_en', 'subtitle'], ['price_en', 'price'], ['release_en', 'release'], ['vol_en', 'vol'],
  ]) {
    if (localized in updates) catalog.BOOKS[key][legacy] = updates[localized];
  }
  if (hasPublishingSchema) persistBookRelations(catalog, key, updates);
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

function getBookContributors(catalog, book) {
  const contributors = Object.values(catalog.BOOK_CONTRIBUTORS || {})
    .filter(item => item.bookKey === book.key)
    .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0));
  return contributors.length ? contributors : book.contributors || [];
}

export async function getBooksArray() {
  const catalog = await readStore();
  const relationsFor = table => bookKey => Object.values(catalog[table] || {})
    .filter(item => item.bookKey === bookKey)
    .sort((left, right) => Number(left.displayOrder || 0) - Number(right.displayOrder || 0));
  return Object.values(catalog.BOOKS || {}).map(book => {
    const genres = relationsFor('BOOK_GENRES')(book.key);
    const subjects = relationsFor('BOOK_SUBJECTS')(book.key);
    const collections = relationsFor('BOOK_COLLECTIONS')(book.key);
    const seriesMemberships = relationsFor('BOOK_SERIES')(book.key);
    return {
      key: book.key, title: book.title, subtitle: book.subtitle || '',
        title_en: book.title_en || book.title || '',
        title_fr: book.title_fr || '',
        title_es: book.title_es || '',
        subtitle_en: book.subtitle_en || book.subtitle || '',
        subtitle_fr: book.subtitle_fr || '',
        subtitle_es: book.subtitle_es || '',
        genre_en: book.genre_en || book.genre || '',
        genre_fr: book.genre_fr || '',
        genre_es: book.genre_es || '',
        price_en: book.price_en || book.price || '',
        price_fr: book.price_fr || '',
        price_es: book.price_es || '',
        release_en: book.release_en || book.release || '',
        release_fr: book.release_fr || '',
        release_es: book.release_es || '',
        vol_en: book.vol_en || book.vol || '',
        vol_fr: book.vol_fr || '',
        vol_es: book.vol_es || '',
      genre: book.genre, series: book.series, seriesKey: book.seriesKey,
      vol: book.vol || '', available: book.available, hidden: book.hidden || false,
      price: book.price, release: book.release || '', lang: book.lang,
      color: book.color, image: book.image || '',
      image_en: book.image_en || book.image || '',
      image_fr: book.image_fr || '',
      image_es: book.image_es || '',
      synopsis: book.synopsis || '',
      synopsis_en: book.synopsis_en || book.synopsis || '',
      synopsis_fr: book.synopsis_fr || '',
      synopsis_es: book.synopsis_es || '',
      links: book.links || {},
      sotrBookId: book.sotrBookId || '',
      publishingCategoryId: book.publishingCategoryId || '',
      publishingSubcategoryId: book.publishingSubcategoryId || '',
      genreIds: genres.length ? genres.map(item => item.genreId) : book.genreIds || [],
      primaryGenreId: genres.find(item => item.isPrimary)?.genreId || book.primaryGenreId || '',
      subjectIds: subjects.length ? subjects.map(item => item.subjectId) : book.subjectIds || [],
      primarySubjectId: subjects.find(item => item.isPrimary)?.subjectId || book.primarySubjectId || '',
      contentTypeId: book.contentTypeId || '',
      targetAudienceId: book.targetAudienceId || '',
      ageRangeMin: book.ageRangeMin ?? '',
      ageRangeMax: book.ageRangeMax ?? '',
      readingLevelId: book.readingLevelId || '',
      originalLanguageId: book.originalLanguageId || '',
      publicationStatus: book.publicationStatus || '',
      collectionIds: collections.length ? collections.map(item => item.collectionId) : book.collectionIds || [],
      publisherId: book.publisherId || '',
      contributors: getBookContributors(catalog, book),
      seriesMemberships: seriesMemberships.length ? seriesMemberships : book.seriesMemberships || [],
      editions: Object.values(catalog.EDITIONS || {}).filter(edition => edition.bookKey === book.key).map(edition => ({
        ...edition,
        listings: Object.values(catalog.LISTINGS || {}).filter(listing => listing.editionId === edition.id).map(listing => ({
          ...listing,
          channelName: catalog.DISTRIBUTION_CHANNELS?.[listing.channelId]?.name || listing.channelName || '',
          kdpMapping: Object.values(catalog.KDP_MAPPINGS || {}).find(mapping => mapping.listingId === listing.id) || null,
        })),
      })),
    };
  });
}

export async function getSeriesSummary() {
  const { BOOKS, SERIES } = await readStore();
  return Object.values(SERIES || {}).map(s => ({
    key: s.key, name: s.name, tag: s.tag,
    name_en: s.name_en || s.name || '',
    name_fr: s.name_fr || '',
    name_es: s.name_es || '',
    desc: s.desc || '',
    desc_en: s.desc_en || s.desc || '',
    desc_fr: s.desc_fr || '',
    desc_es: s.desc_es || '',
    hidden: s.hidden === true,
    cover_en: s.cover_en || '',
    cover_fr: s.cover_fr || '',
    cover_es: s.cover_es || '',
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
  const normalizedBook = {
    key, color: bookData.color || '#1C2B4A', orn: bookData.orn || '◆',
    genre: bookData.genre || '', title: bookData.title_en || bookData.title || '', subtitle: bookData.subtitle_en || bookData.subtitle || '',
    title_en: bookData.title_en || bookData.title || '',
    title_fr: bookData.title_fr || '',
    title_es: bookData.title_es || '',
    subtitle_en: bookData.subtitle_en || bookData.subtitle || '',
    subtitle_fr: bookData.subtitle_fr || '',
    subtitle_es: bookData.subtitle_es || '',
    genre_en: bookData.genre_en || bookData.genre || '',
    genre_fr: bookData.genre_fr || '',
    genre_es: bookData.genre_es || '',
    lang: bookData.lang || 'EN / FR', pages: bookData.pages || 'TBD',
    series: bookData.series || 'Standalone', seriesKey: bookData.seriesKey || null,
    vol: bookData.vol || '', available: bookData.available === true,
    hidden: false, price: bookData.price_en || bookData.price || 'Coming Soon',
    price_en: bookData.price_en || bookData.price || 'Coming Soon',
    price_fr: bookData.price_fr || (bookData.available === true ? '' : 'À venir'),
    price_es: bookData.price_es || (bookData.available === true ? '' : 'Próximamente'),
    release: bookData.release_en || bookData.release || '',
    release_en: bookData.release_en || bookData.release || '',
    release_fr: bookData.release_fr || '', release_es: bookData.release_es || '',
    vol_en: bookData.vol_en || bookData.vol || '', vol_fr: bookData.vol_fr || '', vol_es: bookData.vol_es || '',
    synopsis: bookData.synopsis || '', synopsis_en: bookData.synopsis_en || bookData.synopsis || '',
    synopsis_fr: bookData.synopsis_fr || '', synopsis_es: bookData.synopsis_es || '',
    image: bookData.image_en || bookData.image || '',
    image_en: bookData.image_en || bookData.image || '',
    image_fr: bookData.image_fr || '',
    image_es: bookData.image_es || '',
    details: [
      ['Genre', bookData.genre || ''], ['Language', bookData.lang || 'EN / FR'],
      ['Format', bookData.format || 'Print · eBook'], ['Publisher', 'SPY ON THE RISE'],
    ],
    sotrBookId: nextSotrBookId(catalog.BOOKS || {}),
    publishingCategoryId: bookData.publishingCategoryId || null,
    publishingSubcategoryId: bookData.publishingSubcategoryId || null,
    genreIds: bookData.genreIds || (bookData.genre ? [bookData.genre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')] : []),
    primaryGenreId: bookData.primaryGenreId || (bookData.genre ? bookData.genre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : null),
    subjectIds: bookData.subjectIds || [],
    primarySubjectId: bookData.primarySubjectId || null,
    contentTypeId: bookData.contentTypeId || null,
    targetAudienceId: bookData.targetAudienceId || null,
    ageRangeMin: bookData.ageRangeMin ?? null,
    ageRangeMax: bookData.ageRangeMax ?? null,
    readingLevelId: bookData.readingLevelId || null,
    originalLanguageId: bookData.originalLanguageId || null,
    publicationStatus: bookData.publicationStatus || 'draft',
    publisherId: bookData.publisherId || null,
    collectionIds: bookData.collectionIds || [],
    contributors: bookData.contributors || [],
    seriesMemberships: bookData.seriesMemberships || [],
  };
  const hasPublishingSchema = (catalog.PUBLISHING_SCHEMA_VERSION || 0) > 0;
  if (hasPublishingSchema) {
    try {
      validateEditorialRelations(normalizedBook, catalog);
    } catch (error) {
      error.status = 400;
      throw error;
    }
  }
  const relationInput = {
    ...bookData,
    genreIds: normalizedBook.genreIds,
    primaryGenreId: normalizedBook.primaryGenreId,
    subjectIds: normalizedBook.subjectIds,
    primarySubjectId: normalizedBook.primarySubjectId,
    collectionIds: normalizedBook.collectionIds,
    contributors: normalizedBook.contributors,
    seriesMemberships: Array.isArray(bookData.seriesMemberships) &&
      (bookData.seriesMemberships.length > 0 || !bookData.seriesKey)
      ? normalizedBook.seriesMemberships
      : bookData.seriesKey
        ? [{
          seriesKey: bookData.seriesKey,
          volumeNumber: null,
          volumeLabel: bookData.vol || null,
          readingOrder: null,
          publicationOrder: null,
        }]
        : normalizedBook.seriesMemberships,
  };
  for (const field of [
    'genreIds', 'primaryGenreId', 'subjectIds', 'primarySubjectId',
    'collectionIds', 'contributors', 'seriesMemberships',
  ]) delete normalizedBook[field];
  catalog.BOOKS[key] = normalizedBook;
  // Keep the series' own volumes list in sync — getSeriesSummary() counts
  // from here, not from books' seriesKey, so a book created straight into
  // a series (rather than added to it afterward) must be pushed in too.
  if (bookData.seriesKey && catalog.SERIES?.[bookData.seriesKey] && !catalog.SERIES[bookData.seriesKey].volumes.includes(key)) {
    catalog.SERIES[bookData.seriesKey].volumes.push(key);
    catalog.BOOK_SERIES ||= {};
    catalog.BOOK_SERIES[`${key}:${bookData.seriesKey}`] = {
      bookKey: key,
      seriesKey: bookData.seriesKey,
      volumeNumber: null,
      volumeLabel: bookData.vol || null,
      readingOrder: null,
      publicationOrder: catalog.SERIES[bookData.seriesKey].volumes.length,
    };
  }
  if (bookData.seriesKey && !catalog.SERIES?.[bookData.seriesKey]) throw new Error('Selected series does not exist.');
  if (hasPublishingSchema) persistBookRelations(catalog, key, relationInput);
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
  if ('name_en' in series && !String(series.name_en || '').trim()) throw new Error('English series name is required');
  await backup(catalog);
  const record = catalog.SERIES[series.key];
  for (const field of ['name_en', 'name_fr', 'name_es', 'desc_en', 'desc_fr', 'desc_es', 'cover_en', 'cover_fr', 'cover_es', 'tag']) {
    if (typeof series[field] === 'string') record[field] = series[field].trim();
  }
  if (typeof series.name === 'string') record.name = series.name.trim();
  if (typeof series.desc === 'string') record.desc = series.desc.trim();
  if (typeof series.name_en === 'string') record.name = series.name_en.trim();
  if (typeof series.desc_en === 'string') record.desc = series.desc_en.trim();
  await writeStore(catalog);
  return { success: true };
}

export async function addSeries(seriesData) {
  const catalog = await readStore();
  if (!catalog.SERIES) catalog.SERIES = {};
  const names = Object.fromEntries(['en', 'fr', 'es'].map(lang => [
    lang, String(seriesData?.[`name_${lang}`] || (lang === 'en' ? seriesData?.name : '') || '').trim(),
  ]));
  const descriptions = Object.fromEntries(['en', 'fr', 'es'].map(lang => [
    lang, String(seriesData?.[`desc_${lang}`] || (lang === 'en' ? seriesData?.desc : '') || '').trim(),
  ]));
  const name = names.en;
  if (!name) throw new Error('Series name is required');
  const key = generateBookKey(name, Object.keys(catalog.SERIES));
  catalog.SERIES[key] = {
    key,
    num: String(Object.keys(catalog.SERIES).length + 1).padStart(2, '0'),
    tag: (seriesData.tag || '').trim(),
    name,
    name_en: names.en,
    name_fr: names.fr,
    name_es: names.es,
    volumes: [],
    totalVols: 0,
    desc: descriptions.en,
    desc_en: descriptions.en,
    desc_fr: descriptions.fr,
    desc_es: descriptions.es,
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
    if (catalog.BOOK_SERIES) delete catalog.BOOK_SERIES[`${bookKey}:${prevSeriesKey}`];
  }
  if (!catalog.SERIES[seriesKey].volumes.includes(bookKey)) {
    catalog.SERIES[seriesKey].volumes.push(bookKey);
  }
  catalog.BOOKS[bookKey].seriesKey = seriesKey;
  catalog.BOOKS[bookKey].series = catalog.SERIES[seriesKey].name;
  if ((catalog.PUBLISHING_SCHEMA_VERSION || 0) > 0) {
    catalog.BOOK_SERIES ||= {};
    catalog.BOOK_SERIES[`${bookKey}:${seriesKey}`] ||= {
      bookKey,
      seriesKey,
      volumeNumber: null,
      volumeLabel: catalog.BOOKS[bookKey].vol || null,
      readingOrder: null,
      publicationOrder: catalog.SERIES[seriesKey].volumes.indexOf(bookKey) + 1,
    };
  }
  await writeStore(catalog);
  return { success: true };
}

export async function removeBookFromSeries(seriesKey, bookKey) {
  const catalog = await readStore();
  if (!catalog.SERIES?.[seriesKey]) throw new Error('Series not found');
  await backup(catalog);
  catalog.SERIES[seriesKey].volumes = catalog.SERIES[seriesKey].volumes.filter(k => k !== bookKey);
  if (catalog.BOOK_SERIES) delete catalog.BOOK_SERIES[`${bookKey}:${seriesKey}`];
  if (catalog.BOOKS?.[bookKey]) {
    const remaining = Object.values(catalog.BOOK_SERIES || {}).find(item => item.bookKey === bookKey);
    catalog.BOOKS[bookKey].seriesKey = remaining?.seriesKey || null;
    catalog.BOOKS[bookKey].series = remaining
      ? catalog.SERIES[remaining.seriesKey]?.name || 'Standalone'
      : 'Standalone';
  }
  await writeStore(catalog);
  return { success: true };
}

export async function toggleSeriesHidden(seriesKey) {
  const catalog = await readStore();
  if (!catalog.SERIES?.[seriesKey]) throw new Error('Series not found');
  await backup(catalog);
  catalog.SERIES[seriesKey].hidden = !catalog.SERIES[seriesKey].hidden;
  await writeStore(catalog);
  return { success: true, key: seriesKey, hidden: catalog.SERIES[seriesKey].hidden };
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

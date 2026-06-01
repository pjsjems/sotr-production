// ════════════════════════════════════════════════════════════
// lib/adminData.js — Catalog Read/Write for Admin Dashboard
// Reads and writes data/catalog.js safely with validation.
// All admin mutations go through this module.
// ════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';

const CATALOG_PATH = path.join(process.cwd(), 'data', 'catalog.js');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

// ── Read catalog ──────────────────────────────────────────
export function readCatalogRaw() {
  return fs.readFileSync(CATALOG_PATH, 'utf8');
}

// ── Parse catalog safely ──────────────────────────────────
export function parseCatalog() {
  try {
    const raw = readCatalogRaw();
    // Extract BOOKS, SERIES, PLATFORMS, BUNDLES via safe eval scope
    const mod = { exports: {} };
    const wrappedCode = raw
      .replace(/if\s*\(typeof module[\s\S]*/, '');
    // eslint-disable-next-line no-new-func
    const fn = new Function('module', 'exports', wrappedCode + '\nmodule.exports={BOOKS,SERIES,PLATFORMS,BUNDLES}');
    fn(mod, mod.exports);
    return mod.exports;
  } catch (e) {
    console.error('[adminData] parseCatalog error:', e.message);
    return { BOOKS: {}, SERIES: {}, PLATFORMS: {}, BUNDLES: [] };
  }
}

// ── Backup before any write ───────────────────────────────
function backupCatalog() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, `catalog_${ts}.js`);
  fs.copyFileSync(CATALOG_PATH, backupPath);
  // Keep only last 20 backups
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('catalog_'))
    .sort();
  if (backups.length > 20) {
    backups.slice(0, backups.length - 20).forEach(f =>
      fs.unlinkSync(path.join(BACKUP_DIR, f))
    );
  }
  return backupPath;
}

// ── Update a book field ───────────────────────────────────
export function updateBook(key, updates) {
  const catalog = parseCatalog();
  if (!catalog.BOOKS[key]) throw new Error(`Book key "${key}" not found`);

  const book = catalog.BOOKS[key];
  const allowed = ['title','subtitle','synopsis','price','available','release',
    'color','genre','lang','pages','vol','series','seriesKey','orn',
    'synopsis_en','synopsis_fr','synopsis_es','retailerUrls','image'];

  const sanitized = {};
  for (const [k, v] of Object.entries(updates)) {
    if (allowed.includes(k)) sanitized[k] = v;
  }

  const backupPath = backupCatalog();
  let raw = readCatalogRaw();

  // Find and update each field within the book entry
  for (const [field, value] of Object.entries(sanitized)) {
    const strVal = typeof value === 'string'
      ? `'${value.replace(/'/g, "\\'")}'`
      : value === true ? 'true' : value === false ? 'false' : `'${value}'`;

    // Update existing field in this book entry
    // Use \n  } to find the closing brace at 2-space indent (end of book block)
    const bookStart = raw.indexOf(`${key}:`);
    if (bookStart === -1) continue;
    const nextBook = raw.indexOf('\n  }', bookStart + key.length + 20);
    const bookChunk = nextBook > 0 ? raw.slice(bookStart, nextBook) : raw.slice(bookStart);

    const fieldRe = new RegExp(`(${field}:\\s*)([^,\\n]+)`);
    if (fieldRe.test(bookChunk)) {
      const updatedChunk = bookChunk.replace(fieldRe, `$1${strVal}`);
      raw = raw.slice(0, bookStart) + updatedChunk + raw.slice(bookStart + bookChunk.length);
    }
  }

  fs.writeFileSync(CATALOG_PATH, raw, 'utf8');
  return { success: true, backup: backupPath, key, updates: sanitized };
}

// ── Toggle book availability ──────────────────────────────
export function toggleAvailability(key) {
  const catalog = parseCatalog();
  if (!catalog.BOOKS[key]) throw new Error(`Book "${key}" not found`);
  const current = catalog.BOOKS[key].available;
  return updateBook(key, { available: !current });
}

// ── Update synopsis (all languages) ──────────────────────
export function updateSynopsis(key, { en, fr, es }, retailerUrls) {
  const updates = {};
  if (en !== undefined) updates.synopsis_en = en;
  if (fr !== undefined) updates.synopsis_fr = fr;
  if (es !== undefined) updates.synopsis_es = es;
  if (en !== undefined) updates.synopsis = en; // keep fallback in sync
  if (retailerUrls && typeof retailerUrls === 'object') updates.retailerUrls = retailerUrls;
  return updateBook(key, updates);
}

// ── Get all books as array ────────────────────────────────
export function getBooksArray() {
  const { BOOKS } = parseCatalog();
  return Object.values(BOOKS).map(b => ({
    key: b.key,
    title: b.title,
    subtitle: b.subtitle || '',
    genre: b.genre,
    series: b.series,
    seriesKey: b.seriesKey,
    vol: b.vol || '',
    available: b.available,
    price: b.price,
    release: b.release || '',
    lang: b.lang,
    color: b.color,
    synopsis: b.synopsis || '',
    synopsis_en: b.synopsis_en || b.synopsis || '',
    synopsis_fr: b.synopsis_fr || '',
    synopsis_es: b.synopsis_es || '',
    image: b.image || '',
  }));
}

// ── Get bundles array ─────────────────────────────────────
export function getBundlesArray() {
  const { BUNDLES } = parseCatalog();
  return BUNDLES;
}

// ── Save (add or update) a bundle ────────────────────────
export function saveBundle(bundle) {
  const backupPath = backupCatalog();
  const raw = readCatalogRaw();
  const { BUNDLES } = parseCatalog();

  const idx = BUNDLES.findIndex(b => b.id === bundle.id);
  const newBundles = idx >= 0
    ? [...BUNDLES.slice(0, idx), bundle, ...BUNDLES.slice(idx + 1)]
    : [...BUNDLES, bundle];

  const bundleStr = JSON.stringify(newBundles, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");

  const start = raw.indexOf('const BUNDLES = [');
  const end = raw.indexOf('\n];', start) + 3;
  if (start < 0 || end < 3) throw new Error('Could not locate BUNDLES array in catalog.js');

  const newRaw = raw.slice(0, start) + 'const BUNDLES = ' + bundleStr + ';\n' + raw.slice(end);
  fs.writeFileSync(CATALOG_PATH, newRaw, 'utf8');
  return { success: true, bundle, backup: backupPath };
}

// ── Delete a bundle by id ─────────────────────────────────
export function deleteBundle(id) {
  const backupPath = backupCatalog();
  const raw = readCatalogRaw();
  const { BUNDLES } = parseCatalog();
  const newBundles = BUNDLES.filter(b => b.id !== id);

  const bundleStr = JSON.stringify(newBundles, null, 2)
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"/g, "'");

  const start = raw.indexOf('const BUNDLES = [');
  const end = raw.indexOf('\n];', start) + 3;
  if (start < 0 || end < 3) throw new Error('Could not locate BUNDLES array');

  const newRaw = raw.slice(0, start) + 'const BUNDLES = ' + bundleStr + ';\n' + raw.slice(end);
  fs.writeFileSync(CATALOG_PATH, newRaw, 'utf8');
  return { success: true, deleted: id, backup: backupPath };
}

// ── Get series summary ────────────────────────────────────
export function getSeriesSummary() {
  const { BOOKS, SERIES } = parseCatalog();
  return Object.values(SERIES).map(s => ({
    key: s.key,
    name: s.name,
    tag: s.tag,
    total: s.volumes.length,
    available: s.volumes.filter(k => BOOKS[k]?.available).length,
    locked: s.volumes.filter(k => BOOKS[k] && !BOOKS[k].available).length,
  }));
}

// ── Get dashboard stats ───────────────────────────────────
export function getDashboardStats() {
  const { BOOKS, SERIES, BUNDLES } = parseCatalog();
  const books = Object.values(BOOKS);
  return {
    totalTitles: books.length,
    availableTitles: books.filter(b => b.available).length,
    lockedTitles: books.filter(b => !b.available).length,
    totalSeries: Object.keys(SERIES).length,
    totalBundles: BUNDLES.length,
    bundleIds: BUNDLES.map(b => b.id),
    limitedBundles: BUNDLES.filter(b => b.timer || b.limited).length,
    genreBreakdown: books.reduce((acc, b) => {
      acc[b.genre] = (acc[b.genre] || 0) + 1;
      return acc;
    }, {}),
    lastModified: fs.statSync(CATALOG_PATH).mtime.toISOString(),
  };
}

// ── List backups ──────────────────────────────────────────
export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('catalog_'))
    .sort()
    .reverse()
    .slice(0, 10)
    .map(f => ({
      filename: f,
      date: f.replace('catalog_', '').replace('.js', '').replace(/T/, ' ').replace(/-/g, (m, i) => i > 10 ? ':' : '-'),
      size: fs.statSync(path.join(BACKUP_DIR, f)).size,
    }));
}

// ── Restore from backup ───────────────────────────────────
export function restoreBackup(filename) {
  const backupPath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(backupPath)) throw new Error('Backup not found');
  backupCatalog(); // backup current before restoring
  fs.copyFileSync(backupPath, CATALOG_PATH);
  return { success: true, restored: filename };
}

// ── Generate unique book key from title ───────────────────
export function generateBookKey(title, existingKeys) {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 20)
    .replace(/-$/, '');

  let key = slug;
  let counter = 2;
  while (existingKeys.includes(key)) {
    key = `${slug}-${counter}`;
    counter++;
  }
  return key;
}

// ── Add a new book to the catalog ────────────────────────
export function addBook(bookData) {
  const { BOOKS } = parseCatalog();
  const existingKeys = Object.keys(BOOKS);

  if (!bookData.key) {
    bookData.key = generateBookKey(bookData.title || 'untitled', existingKeys);
  }
  if (BOOKS[bookData.key]) {
    bookData.key = generateBookKey(bookData.title || 'untitled', existingKeys);
  }

  const key = bookData.key;
  const esc = s => (s || '').replace(/'/g, "\\'").replace(/\n/g, ' ');

  const entry = `
  ${key}: { key:'${key}', color:'${bookData.color || '#1C2B4A'}', orn:'${bookData.orn || '◆'}',
    genre:'${esc(bookData.genre)}',
    title:'${esc(bookData.title)}',
    subtitle:'${esc(bookData.subtitle)}',
    lang:'${bookData.lang || 'EN / FR'}', pages:'${bookData.pages || 'TBD'}',
    series:'${esc(bookData.series || 'Standalone')}',
    seriesKey:${bookData.seriesKey ? `'${bookData.seriesKey}'` : 'null'},
    vol:'${esc(bookData.vol)}',
    available:${bookData.available === true ? 'true' : 'false'},
    price:'${esc(bookData.price || 'Coming Soon')}',
    ${bookData.release ? `release:'${esc(bookData.release)}',` : ''}
    synopsis:'${esc(bookData.synopsis)}',
    synopsis_en:'${esc(bookData.synopsis_en || bookData.synopsis)}',
    synopsis_fr:'${esc(bookData.synopsis_fr)}',
    synopsis_es:'${esc(bookData.synopsis_es)}',
    details:[
      ['Genre','${esc(bookData.genre)}'],
      ['Language','${bookData.lang || 'EN / FR'}'],
      ['Format','${bookData.format || 'Print · eBook'}'],
      ['Publisher','SPY ON THE RISE']
    ] },
`;

  backupCatalog();
  let raw = readCatalogRaw();

  const booksStart = raw.indexOf('const BOOKS');
  const closingIdx = raw.indexOf('\n};', booksStart);
  if (closingIdx < 0) throw new Error('Could not find end of BOOKS object');

  raw = raw.slice(0, closingIdx) + entry + raw.slice(closingIdx);
  fs.writeFileSync(CATALOG_PATH, raw, 'utf8');
  return { success: true, key };
}

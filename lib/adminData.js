// lib/adminData.js
// All catalog operations go through lib/kvStore.js.
// Production: reads/writes Vercel KV (persistent, instant).
// Development: reads/writes data/catalog.json (file system).

import { readCatalog, writeCatalog, backupCatalogToFile } from './kvStore.js';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

export async function parseCatalog() {
  return await readCatalog();
}

export async function updateBook(key, updates) {
  const catalog = await readCatalog();
  if (!catalog.BOOKS[key]) throw new Error(`Book key "${key}" not found`);
  const allowed = ['title','subtitle','synopsis','price','available','release',
    'color','genre','lang','pages','vol','series','seriesKey','orn',
    'synopsis_en','synopsis_fr','synopsis_es','image','retailerUrls','format'];
  backupCatalogToFile(catalog);
  for (const [k, v] of Object.entries(updates)) {
    if (allowed.includes(k)) catalog.BOOKS[key][k] = v;
  }
  await writeCatalog(catalog);
  return { success: true, key, updates };
}

export async function toggleAvailability(key) {
  const catalog = await readCatalog();
  if (!catalog.BOOKS[key]) throw new Error(`Book "${key}" not found`);
  backupCatalogToFile(catalog);
  catalog.BOOKS[key].available = !catalog.BOOKS[key].available;
  await writeCatalog(catalog);
  return { success: true, key, available: catalog.BOOKS[key].available };
}

export async function updateSynopsis(key, { en, fr, es }) {
  const updates = {};
  if (en !== undefined) { updates.synopsis_en = en; updates.synopsis = en; }
  if (fr !== undefined) updates.synopsis_fr = fr;
  if (es !== undefined) updates.synopsis_es = es;
  return updateBook(key, updates);
}

export async function getBooksArray() {
  const { BOOKS } = await readCatalog();
  return Object.values(BOOKS).map(b => ({
    key: b.key, title: b.title, subtitle: b.subtitle || '',
    genre: b.genre, series: b.series, seriesKey: b.seriesKey,
    vol: b.vol || '', available: b.available, price: b.price,
    release: b.release || '', lang: b.lang, color: b.color,
    image: b.image || '', synopsis: b.synopsis || '',
    synopsis_en: b.synopsis_en || b.synopsis || '',
    synopsis_fr: b.synopsis_fr || '',
    synopsis_es: b.synopsis_es || '',
  }));
}

export async function getSeriesSummary() {
  const { BOOKS, SERIES } = await readCatalog();
  return Object.values(SERIES).map(s => ({
    key: s.key, name: s.name, tag: s.tag,
    total: s.volumes.length,
    available: s.volumes.filter(k => BOOKS[k]?.available).length,
    locked: s.volumes.filter(k => BOOKS[k] && !BOOKS[k].available).length,
  }));
}

export async function getDashboardStats() {
  const { BOOKS, SERIES, BUNDLES } = await readCatalog();
  const books = Object.values(BOOKS);
  let lastModified = new Date().toISOString();
  try {
    lastModified = fs.statSync(path.join(process.cwd(), 'data', 'catalog.json')).mtime.toISOString();
  } catch {}
  return {
    totalTitles: books.length,
    availableTitles: books.filter(b => b.available).length,
    lockedTitles: books.filter(b => !b.available).length,
    totalSeries: Object.keys(SERIES).length,
    totalBundles: BUNDLES.length,
    genreBreakdown: books.reduce((acc, b) => {
      acc[b.genre] = (acc[b.genre] || 0) + 1; return acc;
    }, {}),
    lastModified,
  };
}

export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.startsWith('catalog_')).sort().reverse().slice(0, 10)
    .map(f => ({
      filename: f,
      date: f.replace('catalog_', '').replace(/\.json$/, '').replace('T', ' '),
      size: fs.statSync(path.join(BACKUP_DIR, f)).size,
    }));
}

export async function restoreBackup(filename) {
  const backupPath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(backupPath)) throw new Error('Backup not found');
  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  const current = await readCatalog();
  backupCatalogToFile(current);
  await writeCatalog(data);
  return { success: true, restored: filename };
}

export function generateBookKey(title, existingKeys) {
  let slug = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 20).replace(/-$/, '');
  let key = slug, counter = 2;
  while (existingKeys.includes(key)) { key = `${slug}-${counter}`; counter++; }
  return key;
}

export async function addBook(bookData) {
  const catalog = await readCatalog();
  const existingKeys = Object.keys(catalog.BOOKS);
  if (!bookData.key) bookData.key = generateBookKey(bookData.title || 'untitled', existingKeys);
  if (catalog.BOOKS[bookData.key]) bookData.key = generateBookKey(bookData.title || 'untitled', existingKeys);
  const key = bookData.key;
  catalog.BOOKS[key] = {
    key, color: bookData.color || '#1C2B4A', orn: bookData.orn || '◆',
    genre: bookData.genre || '', title: bookData.title || '',
    subtitle: bookData.subtitle || '', lang: bookData.lang || 'EN / FR',
    pages: bookData.pages || 'TBD', series: bookData.series || 'Standalone',
    seriesKey: bookData.seriesKey || null, vol: bookData.vol || '',
    available: bookData.available === true, price: bookData.price || 'Coming Soon',
    release: bookData.release || '', synopsis: bookData.synopsis || '',
    synopsis_en: bookData.synopsis_en || bookData.synopsis || '',
    synopsis_fr: bookData.synopsis_fr || '', synopsis_es: bookData.synopsis_es || '',
    image: bookData.image || '',
    details: [
      ['Genre', bookData.genre || ''], ['Language', bookData.lang || 'EN / FR'],
      ['Format', bookData.format || 'Print · eBook'], ['Publisher', 'SPY ON THE RISE'],
    ],
  };
  backupCatalogToFile(catalog);
  await writeCatalog(catalog);
  return { success: true, key };
}

export async function getBundlesArray() {
  return (await readCatalog()).BUNDLES;
}

export async function saveBundle(bundle) {
  const catalog = await readCatalog();
  backupCatalogToFile(catalog);
  const idx = catalog.BUNDLES.findIndex(b => b.id === bundle.id);
  if (idx >= 0) catalog.BUNDLES[idx] = bundle; else catalog.BUNDLES.push(bundle);
  await writeCatalog(catalog);
  return { success: true, bundle };
}

export async function deleteBundle(id) {
  const catalog = await readCatalog();
  backupCatalogToFile(catalog);
  catalog.BUNDLES = catalog.BUNDLES.filter(b => b.id !== id);
  await writeCatalog(catalog);
  return { success: true, deleted: id };
}

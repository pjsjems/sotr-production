// lib/kvStore.js
// Storage abstraction: Vercel KV in production, file in dev.
// Automatically detects which environment it is in.

import fs from 'fs';
import path from 'path';

const CATALOG_KEY  = 'sotr:catalog';
const SITELOCK_KEY = 'sotr:sitelock';
const CATALOG_PATH = path.join(process.cwd(), 'data', 'catalog.json');
const BACKUP_DIR   = path.join(process.cwd(), 'data', 'backups');

function isKVEnabled() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKV() {
  const { kv } = await import('@vercel/kv');
  return kv;
}

// ── Catalog read ──────────────────────────────────────────
export async function readCatalog() {
  if (isKVEnabled()) {
    try {
      const kv = await getKV();
      const data = await kv.get(CATALOG_KEY);
      if (data) return typeof data === 'string' ? JSON.parse(data) : data;
      // KV empty on first run — seed from file
      const fileData = readCatalogFromFile();
      await writeCatalog(fileData);
      return fileData;
    } catch (e) {
      console.error('[kvStore] KV read failed, using file:', e.message);
      return readCatalogFromFile();
    }
  }
  return readCatalogFromFile();
}

// ── Catalog write ─────────────────────────────────────────
export async function writeCatalog(data) {
  if (isKVEnabled()) {
    try {
      const kv = await getKV();
      await kv.set(CATALOG_KEY, JSON.stringify(data));
      // Also snapshot to file as backup
      try { writeCatalogToFile(data); } catch {}
      return;
    } catch (e) {
      console.error('[kvStore] KV write failed, using file:', e.message);
    }
  }
  writeCatalogToFile(data);
}

// ── Site lock read ────────────────────────────────────────
export async function readSiteLock() {
  if (isKVEnabled()) {
    try {
      const kv = await getKV();
      const val = await kv.get(SITELOCK_KEY);
      return val === true || val === 'true' || val === 1;
    } catch (e) {
      console.error('[kvStore] SiteLock KV read failed:', e.message);
    }
  }
  // Fallback: read from a local file
  try {
    const lockFile = path.join(process.cwd(), 'data', 'sitelock.json');
    if (!fs.existsSync(lockFile)) return false;
    const val = JSON.parse(fs.readFileSync(lockFile, 'utf8'));
    return val.locked === true;
  } catch { return false; }
}

// ── Site lock write ───────────────────────────────────────
export async function writeSiteLock(locked) {
  if (isKVEnabled()) {
    try {
      const kv = await getKV();
      await kv.set(SITELOCK_KEY, locked ? 'true' : 'false');
      return;
    } catch (e) {
      console.error('[kvStore] SiteLock KV write failed:', e.message);
    }
  }
  // Fallback: write to local file
  const lockFile = path.join(process.cwd(), 'data', 'sitelock.json');
  fs.writeFileSync(lockFile, JSON.stringify({ locked, updatedAt: new Date().toISOString() }), 'utf8');
}

// ── File system helpers ───────────────────────────────────
function readCatalogFromFile() {
  try {
    return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  } catch { return { BOOKS: {}, SERIES: {}, PLATFORMS: {}, BUNDLES: [] }; }
}

function writeCatalogToFile(data) {
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export function backupCatalogToFile(data) {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupPath = path.join(BACKUP_DIR, `catalog_${ts}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');
  const backups = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('catalog_')).sort();
  if (backups.length > 20) backups.slice(0, backups.length - 20)
    .forEach(f => fs.unlinkSync(path.join(BACKUP_DIR, f)));
  return backupPath;
}

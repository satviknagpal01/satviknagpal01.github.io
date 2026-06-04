// One-time migration: CSV export of the Google Sheets tabs → Astro content collections.
// Usage: node scripts/migrate-csv.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* ignore */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

function slugify(s) {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’‘"“”.]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

function splitList(v) {
  return String(v || '').split(',').map(s => s.trim()).filter(Boolean);
}

function freshDir(dir) {
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(dir)) {
    if (f.endsWith('.json')) rmSync(join(dir, f));
  }
}

function uniqueSlug(base, used) {
  let slug = base || 'untitled';
  let n = 2;
  while (used.has(slug)) slug = `${base}-${n++}`;
  used.add(slug);
  return slug;
}

// ── Books ──────────────────────────────────────────────────────────────────
function migrateBooks() {
  const csvPath = join(ROOT, 'CSVFiles', 'Books - Books.csv');
  const rows = parseCSV(readFileSync(csvPath, 'utf8')).filter(r => r.length > 1 && r[0]?.trim());
  rows.shift(); // header
  const dir = join(ROOT, 'src', 'content', 'books');
  freshDir(dir);
  const used = new Set();
  let count = 0;
  for (const r of rows) {
    const [title, author, coverURL, status, genres, dateAdded] = r;
    const slug = uniqueSlug(slugify(title), used);
    const obj = {
      title: title.trim(),
      author: (author || '').trim(),
      coverURL: (coverURL || '').trim(),
      status: ['Read', 'Reading', 'Unread', 'Wishlist'].includes((status || '').trim())
        ? status.trim() : 'Unread',
      genres: splitList(genres),
      dateAdded: (dateAdded || '').trim(),
    };
    writeFileSync(join(dir, `${slug}.json`), JSON.stringify(obj, null, 2) + '\n');
    count++;
  }
  return count;
}

// ── Wishlist ───────────────────────────────────────────────────────────────
function migrateWishlist() {
  const csvPath = join(ROOT, 'CSVFiles', 'Books - Wishlist.csv');
  const dir = join(ROOT, 'src', 'content', 'wishlist');
  freshDir(dir);
  if (!existsSync(csvPath)) return 0;
  const rows = parseCSV(readFileSync(csvPath, 'utf8')).filter(r => r.length > 1 && r[0]?.trim());
  rows.shift(); // header
  const used = new Set();
  let count = 0;
  for (const r of rows) {
    const [title, author, coverURL, buyLink, priority, price, note, dateAdded] = r;
    const slug = uniqueSlug(slugify(title), used);
    const obj = {
      title: title.trim(),
      author: (author || '').trim(),
      coverURL: (coverURL || '').trim(),
      buyLink: (buyLink || '').trim(),
      priority: ['High', 'Medium', 'Low'].includes((priority || '').trim())
        ? priority.trim() : 'Medium',
      price: (price || '').trim(),
      note: (note || '').trim(),
      dateAdded: (dateAdded || '').trim(),
    };
    writeFileSync(join(dir, `${slug}.json`), JSON.stringify(obj, null, 2) + '\n');
    count++;
  }
  return count;
}

const b = migrateBooks();
const w = migrateWishlist();
console.log(`Migrated ${b} books, ${w} wishlist items.`);

/**
 * Cleans raw review CSVs in data/ and writes cleaned CSVs to refined-data/.
 *
 * Rules applied, in order:
 *   1. Strip HTML tags, collapse whitespace.
 *   2. Drop empty / stars-only / numbers-only reviews.
 *   3. Drop reviews under MIN_LENGTH characters (after cleaning).
 *   4. Drop reviews written in Hindi (Devanagari script).
 *   5. Deduplicate by (source + lowercased text).
 *
 * Usage: node scripts/clean-reviews.mjs   (or `npm run clean`)
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const REFINED_DIR = join(__dirname, '..', 'refined-data');
const MIN_LENGTH = 10;

// Devanagari Unicode block (U+0900–U+097F) covers Hindi, Marathi, etc.
const DEVANAGARI_RE = /[ऀ-ॿ]/;

function stripHtml(text) {
  return text.replace(/<[^>]*>/g, '');
}

function collapseWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function isOnlyStarsOrNumbersOrPunctuation(text) {
  return /^[\d\s★☆*.,!?\-_'"()]+$/.test(text);
}

function isHindi(text) {
  // Any meaningful presence of Devanagari characters marks the review as
  // Hindi (or Hindi-mixed) — a single stray character from an emoji-adjacent
  // glyph won't trip this, but a real Devanagari word will.
  const devanagariChars = (text.match(new RegExp(DEVANAGARI_RE, 'g')) || []).length;
  return devanagariChars >= 3;
}

function cleanText(raw) {
  return collapseWhitespace(stripHtml(raw ?? ''));
}

function cleanCsvFile(filename) {
  const inputPath = join(DATA_DIR, filename);
  const raw = readFileSync(inputPath, 'utf-8');

  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  });

  const counts = {
    total: records.length,
    empty: 0,
    tooShort: 0,
    hindi: 0,
    duplicate: 0,
    kept: 0,
  };

  const seen = new Set();
  const cleaned = [];

  for (const record of records) {
    const text = cleanText(record.review);

    if (!text || isOnlyStarsOrNumbersOrPunctuation(text)) {
      counts.empty++;
      continue;
    }

    if (text.length < MIN_LENGTH) {
      counts.tooShort++;
      continue;
    }

    if (isHindi(text)) {
      counts.hindi++;
      continue;
    }

    const dedupeKey = `${record.source}::${text.toLowerCase()}`;
    if (seen.has(dedupeKey)) {
      counts.duplicate++;
      continue;
    }
    seen.add(dedupeKey);

    cleaned.push({ ...record, review: text, title: cleanText(record.title) });
    counts.kept++;
  }

  mkdirSync(REFINED_DIR, { recursive: true });
  const outputPath = join(REFINED_DIR, filename);

  if (cleaned.length > 0) {
    const csv = stringify(cleaned, { header: true, columns: Object.keys(cleaned[0]) });
    writeFileSync(outputPath, csv, 'utf-8');
  } else {
    writeFileSync(outputPath, '', 'utf-8');
  }

  return counts;
}

function main() {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith('.csv'));

  if (files.length === 0) {
    console.log('No CSV files found in data/.');
    return;
  }

  console.log(`Cleaning ${files.length} CSV file(s)...\n`);

  const summary = [];

  for (const filename of files) {
    const counts = cleanCsvFile(filename);
    summary.push({ filename, ...counts });

    console.log(`${filename}`);
    console.log(`  total:      ${counts.total}`);
    console.log(`  removed empty/stars-only: ${counts.empty}`);
    console.log(`  removed <${MIN_LENGTH} chars:     ${counts.tooShort}`);
    console.log(`  removed Hindi:            ${counts.hindi}`);
    console.log(`  removed duplicates:       ${counts.duplicate}`);
    console.log(`  kept:                     ${counts.kept}`);
    console.log('');
  }

  const totals = summary.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      empty: acc.empty + s.empty,
      tooShort: acc.tooShort + s.tooShort,
      hindi: acc.hindi + s.hindi,
      duplicate: acc.duplicate + s.duplicate,
      kept: acc.kept + s.kept,
    }),
    { total: 0, empty: 0, tooShort: 0, hindi: 0, duplicate: 0, kept: 0 }
  );

  console.log('=== Overall ===');
  console.log(`Total input rows:   ${totals.total}`);
  console.log(`Removed (empty):    ${totals.empty}`);
  console.log(`Removed (<${MIN_LENGTH} chars): ${totals.tooShort}`);
  console.log(`Removed (Hindi):    ${totals.hindi}`);
  console.log(`Removed (dupes):    ${totals.duplicate}`);
  console.log(`Kept:               ${totals.kept}`);
  console.log(`\nWritten to ${REFINED_DIR}`);
}

main();

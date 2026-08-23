import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import type { Review, ReviewSource } from './types';

const REFINED_DATA_DIR = path.join(process.cwd(), 'refined-data');

const VALID_SOURCES: ReviewSource[] = ['play_store', 'app_store', 'reddit', 'consumer_complaints'];

function normalizeSource(raw: string): ReviewSource {
  const key = raw?.trim().toLowerCase();
  if (VALID_SOURCES.includes(key as ReviewSource)) return key as ReviewSource;
  return 'consumer_complaints';
}

interface RawRow {
  id?: string;
  source?: string;
  author?: string;
  rating?: string;
  title?: string;
  review?: string;
  date?: string;
  url?: string;
}

/** Loads every CSV in refined-data/ and normalizes rows into the Review shape. */
export async function loadRefinedReviews(): Promise<Review[]> {
  if (!existsSync(REFINED_DATA_DIR)) return [];

  const files = (await readdir(REFINED_DATA_DIR)).filter((f) => f.endsWith('.csv'));
  const allReviews: Review[] = [];

  for (const filename of files) {
    const filePath = path.join(REFINED_DATA_DIR, filename);
    const raw = await readFile(filePath, 'utf-8');
    if (!raw.trim()) continue;

    const rows = parse(raw, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    }) as RawRow[];

    for (const row of rows) {
      if (!row.review || !row.review.trim()) continue;

      const rating = row.rating !== undefined && row.rating !== '' ? parseFloat(row.rating) : NaN;

      allReviews.push({
        id: row.id || `${filename}_${allReviews.length}`,
        review: row.review,
        title: row.title || '',
        rating: Number.isNaN(rating) ? null : rating,
        source: normalizeSource(row.source || ''),
        author: row.author || null,
        reviewDate: row.date || null,
        url: row.url || null,
      });
    }
  }

  return allReviews;
}

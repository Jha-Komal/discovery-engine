import type { AggregationStats, ByRelevanceClass } from './types';

const KEEP_FULL = new Set(['totalCount', 'analyzedCount', 'averageRating', 'sourceDistribution', 'relevanceClassDistribution']);

function sumClass(c: ByRelevanceClass): number {
  return c.DIRECT_WISHLIST + c.ADJACENT_DECISION + c.GENERAL_ECOMMERCE + c.IRRELEVANT;
}

function isByRelevanceClassMap(v: unknown): v is Record<string, ByRelevanceClass> {
  if (typeof v !== 'object' || v === null) return false;
  const first = Object.values(v as Record<string, unknown>)[0];
  return typeof first === 'object' && first !== null && 'DIRECT_WISHLIST' in (first as object);
}

/**
 * Caps every frequency/breakdown map in AggregationStats to its top-K
 * entries before it goes into a prompt. Several fields (postponement reason
 * especially) are effectively free text, not a clean taxonomy — 186 near-
 * unique reasons was alone eating >60% of the stats token budget, well
 * before the sample records even started. Storage (aggregation.json, the
 * dashboard charts) keeps full fidelity; only the prompt-facing copy is
 * pruned, since the point here is "give the model the dominant patterns,"
 * not "give it every long-tail one-off count."
 */
export function pruneStatsForPrompt(stats: AggregationStats, topK = 20): AggregationStats {
  const pruned = {} as Record<string, unknown>;

  for (const [key, value] of Object.entries(stats)) {
    if (KEEP_FULL.has(key) || typeof value !== 'object' || value === null) {
      pruned[key] = value;
      continue;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (isByRelevanceClassMap(value)) {
      pruned[key] = Object.fromEntries(
        (entries as [string, ByRelevanceClass][]).sort((a, b) => sumClass(b[1]) - sumClass(a[1])).slice(0, topK)
      );
    } else if (entries.length > 0 && typeof entries[0][1] === 'number') {
      pruned[key] = Object.fromEntries((entries as [string, number][]).sort((a, b) => b[1] - a[1]).slice(0, topK));
    } else {
      pruned[key] = value;
    }
  }

  return pruned as unknown as AggregationStats;
}

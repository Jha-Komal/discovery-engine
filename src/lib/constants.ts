export const ANALYSIS_BATCH_SIZE = 10;

/**
 * How many analyzed reviews to sample into the research-report prompt for
 * qualitative grounding (evidence quotes, pattern-finding). The report's
 * count/denominator/% quantification comes from AggregationStats (exact,
 * over the full corpus, and pruned to top-20-per-category before hitting the
 * prompt — see prompt-stats.ts), not from this sample — so this just needs
 * to be large enough for representative coverage, not exhaustive.
 *
 * This org's gpt-4o tier caps at 30,000 TPM (confirmed via a real 429 —
 * requesting 400 records hit ~117k tokens, ~4x over). The pruned stats
 * payload alone is ~17k chars (needed for exact quantification, can't shrink
 * much further), which leaves little room per record at this ceiling —
 * measured directly against the real prompt builder: 25 lands at ~24.8k
 * tokens (with reserved output), a real ~17% safety margin below 30k; 30
 * only has ~11%. This is well below the 150 that worked fine under
 * gpt-4o-mini's much higher TPM allowance — "stronger model" and "bigger
 * sample" are in direct tension on this tier, and this favors not hitting
 * 429s over raw sample volume.
 */
export const RESEARCH_REPORT_SAMPLE_SIZE = 25;

/**
 * How many analyzed reviews to sample into the insights prompt. Each record
 * here is just {id, review, sentiment} — far lighter than the research
 * report's per-record shape — and insights no longer sends the stats blob
 * at all (it's a "read and synthesize" task, not a quantification one), so
 * this can go higher than the research-report sample while staying safely
 * under the same 30,000 TPM ceiling.
 */
export const INSIGHTS_SAMPLE_SIZE = 180;

/** The 10 discovery questions the Growth Team needs answered, in quick Q&A form. */
export const DISCOVERY_QUESTIONS = [
  'Why do users add fashion products to their wishlist?',
  'What prevents wishlisted products from eventually being purchased?',
  'What uncertainties remain after users have identified a product they like?',
  'What causes users to postpone a purchase?',
  'How do users compare multiple shortlisted products?',
  'What information do users seek outside Myntra/AJIO before purchasing?',
  'What role do fit, size, styling, price, reviews, occasion and social validation play?',
  'When do users use the wishlist as genuine purchase intent versus simply as a bookmarking mechanism?',
  'How do these behaviors differ across user segments?',
  'What unmet needs emerge consistently across user conversations?',
] as const;

export const SOURCE_LABELS: Record<string, string> = {
  play_store: 'Play Store',
  app_store: 'App Store',
  reddit: 'Reddit',
  consumer_complaints: 'Consumer Complaints',
};

export const PRIORITY_LABELS: Record<string, string> = {
  quick_win: 'Quick Win',
  medium: 'Medium Priority',
  high: 'High Priority',
  long_term: 'Long-Term',
};

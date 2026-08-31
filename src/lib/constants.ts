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
 * How many analyzed reviews to sample into each insights batch. Review
 * length in this corpus is heavily skewed (p50 ~135 chars, p90 ~936, max
 * ~2800) — confirmed via a real 429 that two same-sized batches can differ
 * 4x in actual token size depending on which reviews they draw. Combined
 * with the per-review length cap in the insights route, 120 keeps even the
 * worst case (every review in the batch hitting the cap) safely under this
 * org's 30,000 TPM ceiling on gpt-4o, with real margin — not just on average.
 */
export const INSIGHTS_SAMPLE_SIZE = 120;

/**
 * How many independent, non-overlapping batches of INSIGHTS_SAMPLE_SIZE
 * reviews to run — each batch drafts its own answer per question (a single
 * call safely fits this org's 30k TPM ceiling), then a final synthesis call
 * merges the drafts into one answer per question. Net effect: insights draw
 * on INSIGHTS_SAMPLE_SIZE * INSIGHTS_BATCH_COUNT reviews total without any
 * single request exceeding the rate limit.
 */
export const INSIGHTS_BATCH_COUNT = 3;

/**
 * Minimum gap enforced between the *start* of consecutive insight-batch
 * calls. Confirmed via a real 429: this org's gpt-4o TPM limit is a rolling
 * ~60s window counting actual completed usage, not a continuously-refilling
 * bucket — a 30s post-call sleep still 429'd on batch 2 (reported "Requested
 * 50217" — batch 1's ~20k tokens were still fully counted 30s later). 65s
 * gives the window room to roll over with margin; still not a guarantee if
 * OpenAI's window boundary lands unluckily.
 */
export const INSIGHTS_BATCH_MIN_GAP_MS = 65000;

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

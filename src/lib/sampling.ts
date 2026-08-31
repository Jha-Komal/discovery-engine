import type { ReviewWithAnalysis, RelevanceClass } from './types';

/**
 * Prioritizes DIRECT_WISHLIST, then ADJACENT_DECISION, then GENERAL_ECOMMERCE
 * — drops IRRELEVANT entirely. Shared by both the research-report and
 * insights prompts so each sees the most useful evidence first, not just
 * whatever order reviews happen to sit in reviews.json.
 */
const RELEVANCE_PRIORITY: Record<RelevanceClass, number> = {
  DIRECT_WISHLIST: 0,
  ADJACENT_DECISION: 1,
  GENERAL_ECOMMERCE: 2,
  IRRELEVANT: 3,
};

export function sampleByRelevance(withAnalysis: ReviewWithAnalysis[], size: number): ReviewWithAnalysis[] {
  return withAnalysis
    .filter((r) => r.analysis !== null && r.analysis.relevance.class !== 'IRRELEVANT')
    .sort((a, b) => RELEVANCE_PRIORITY[a.analysis!.relevance.class] - RELEVANCE_PRIORITY[b.analysis!.relevance.class])
    .slice(0, size);
}

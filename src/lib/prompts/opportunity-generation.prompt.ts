import type { AggregationStats, Insight } from '../types';

export function buildOpportunityGenerationPrompt(
  stats: AggregationStats,
  insights: Array<Pick<Insight, 'question' | 'answer'>>
): string {
  return `You are a Growth PM turning review analysis into ranked, quantified opportunity areas that could increase the percentage of Myntra users who purchase at least one wishlisted item within 30 days.

HARD CONSTRAINT: none of the opportunity areas may rely on monetary incentives (no discounts, cashback, coupons, price cuts). Focus on non-monetary levers: information (sizing, fit, quality signals), trust (authenticity, reviews), social proof, decision support (comparison tools, reminders, styling context), and friction reduction (returns, availability).

AGGREGATED STATISTICS (real counts/percentages from the review corpus — use these numbers, do not invent new ones):
${JSON.stringify(stats, null, 2)}

KEY INSIGHTS ALREADY GENERATED:
${JSON.stringify(insights, null, 2)}

Identify the most significant opportunity areas. For EACH one:
- title: short, specific name for the opportunity (not generic — e.g. "Fit/Size Uncertainty Blocks Wishlist Conversion", not "Improve UX")
- description: what the opportunity is and why it matters for the wishlist→purchase metric, in 2-4 sentences
- quantifiedMetric: a specific, numbers-grounded statement pulled from the statistics above (e.g. "34% of purchase-barrier mentions cite fit/size uncertainty, the single largest barrier category")
- affectedShare: your best estimate, as a decimal 0-1, of the share of relevant reviews/users this opportunity affects — derive this directly from the stats, do not guess arbitrarily
- relatedBarriers: array of barrier/uncertainty category strings from the stats that this opportunity addresses
- priority: "quick_win" | "medium" | "high" | "long_term" based on estimated effort vs. impact
- comparisonNote: one sentence explicitly comparing this opportunity's estimated size/impact to at least one other opportunity area (e.g. "twice as large as the authenticity-trust opportunity based on mention frequency")

Rank by affectedShare descending. Return at least 4 and at most 8 opportunity areas.

Return ONLY a valid JSON array:
[
  {
    "title": "<title>",
    "description": "<description>",
    "quantifiedMetric": "<metric statement>",
    "affectedShare": 0.34,
    "relatedBarriers": ["fit_uncertainty"],
    "priority": "high",
    "comparisonNote": "<comparison sentence>"
  }
]`;
}

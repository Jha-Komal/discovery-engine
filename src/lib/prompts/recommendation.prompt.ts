import type { AggregationStats, OpportunityArea } from '../types';

export function buildRecommendationPrompt(
  stats: AggregationStats,
  opportunities: Array<Pick<OpportunityArea, 'title' | 'description' | 'priority'>>
): string {
  return `You are a product strategy consultant producing an actionable roadmap to increase Myntra's wishlist-to-purchase conversion rate within 30 days.

HARD CONSTRAINT: You may NOT recommend anything involving monetary incentives — no discounts, cashback, coupons, flash sales, or price reductions of any kind. Every recommendation must be a product, UX, information, trust, or engagement lever instead. If a recommendation would only work by cutting price, do not include it.

REVIEW STATISTICS:
${JSON.stringify(stats, null, 2)}

OPPORTUNITY AREAS IDENTIFIED:
${JSON.stringify(opportunities, null, 2)}

Generate concrete, specific product recommendations across 4 priority tiers:
- quick_win: easy to implement, high impact, low effort (1-2 weeks)
- medium: moderate effort, meaningful impact (1-3 months)
- high: significant effort, high strategic value (3-6 months)
- long_term: major initiative, transformative impact (6+ months)

Each recommendation must tie back to a specific opportunity area or statistic — no generic advice like "improve UX."

Return ONLY a valid JSON array:
[
  {
    "priority": "quick_win|medium|high|long_term",
    "title": "<short specific title>",
    "description": "<what to build/change and why it addresses the underlying problem, referencing the data>"
  }
]

Generate at least 2 recommendations per priority tier (8 total minimum).`;
}

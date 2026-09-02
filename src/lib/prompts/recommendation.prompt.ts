import type { AggregationStats } from '../types';

export function buildRecommendationPrompt(stats: AggregationStats, researchReport: string): string {
  return `You are a product strategy consultant producing an actionable roadmap to increase Myntra's wishlist-to-purchase conversion rate within 30 days.

HARD CONSTRAINT: You may NOT recommend anything involving monetary incentives — no discounts, cashback, coupons, flash sales, or price reductions of any kind. Every recommendation must be a product, UX, information, trust, or engagement lever instead. If a recommendation would only work by cutting price, do not include it.

REVIEW STATISTICS:
${JSON.stringify(stats, null, 2)}

RESEARCH REPORT (evidence, discovery-question answers, behavioral chains, ranked opportunity hypotheses, and open research gaps — this report deliberately stops short of proposing solutions; that's your job here):
${researchReport}

Ground every recommendation in a specific opportunity hypothesis or research gap from the report above — do not recommend anything the report doesn't support. Where the report flags an opportunity as needing interview validation (P2/P3, or evidence_confidence below HIGH), reflect that uncertainty in the recommendation rather than treating it as settled.

Generate concrete, specific product recommendations across 4 priority tiers:
- quick_win: easy to implement, high impact, low effort (1-2 weeks)
- medium: moderate effort, meaningful impact (1-3 months)
- high: significant effort, high strategic value (3-6 months)
- long_term: major initiative, transformative impact (6+ months)

Each recommendation must tie back to a specific opportunity area or statistic — no generic advice like "improve UX."

For each recommendation, also carry over the evidence backing behind the opportunity hypothesis it addresses:
- evidence: the occurrence count / evidence volume from that opportunity's EVIDENCE section in the report (e.g. "20 occurrences"). If the report gives a range or multiple sources, summarize it in a few words.
- observedBehavior: the OBSERVED BEHAVIOR from that opportunity, in a few words (e.g. "checking reviews/photos, seeking external validation, delaying purchase").
- affectedJourney: the journey stage(s) this touches, as "<stage> → <stage>" if the report implies a transition, otherwise a single stage.
- confidence: copy the opportunity's EVIDENCE CONFIDENCE rating exactly — one of HIGH, MEDIUM, LOW, INSUFFICIENT. Do not upgrade it just because you like the recommendation.
- unknowns: copy or summarize that opportunity's UNKNOWN / PRIMARY RESEARCH QUESTION — what still needs interview or data validation before this is a settled problem, not just a hypothesis.

Return ONLY a valid JSON array:
[
  {
    "priority": "quick_win|medium|high|long_term",
    "title": "<short specific title>",
    "description": "<what to build/change and why it addresses the underlying problem, referencing the data>",
    "evidence": "<e.g. 20 occurrences>",
    "observedBehavior": "<observed user behavior from the source opportunity>",
    "affectedJourney": "<journey stage(s), e.g. product evaluation → move-to-bag>",
    "confidence": "HIGH|MEDIUM|LOW|INSUFFICIENT",
    "unknowns": "<what still needs validation>"
  }
]

Generate at least 2 recommendations per priority tier (8 total minimum).`;
}

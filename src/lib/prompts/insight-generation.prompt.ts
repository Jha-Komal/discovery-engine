import type { AggregationStats } from '../types';

export function buildInsightGenerationPrompt(
  stats: AggregationStats,
  representativeReviews: Array<{ id: string; review: string; sentiment: string }>,
  questions: readonly string[]
): string {
  return `You are a senior Growth PM analyst investigating why Myntra users wishlist fashion products but don't convert to purchase within 30 days. The constraint is that any eventual solution CANNOT use monetary incentives (no discounts, cashback, or coupons) — so your answers should surface non-monetary, information/trust/psychology-based explanations wherever the data supports them.

AGGREGATED STATISTICS (computed directly from AI-extracted review data, not guessed):
${JSON.stringify(stats, null, 2)}

REPRESENTATIVE REVIEWS (sample, for grounding your answers in real language):
${JSON.stringify(representativeReviews, null, 2)}

QUESTIONS TO ANSWER:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each question, provide a detailed, evidence-grounded answer that cites the statistics where relevant (e.g. "X% of reviews mention..."). If the data is too sparse to answer a question confidently, say so honestly and lower the confidence score rather than fabricating certainty.

For each question, provide:
- answer: detailed, actionable answer grounded in the stats and sample reviews
- confidence: how confident you are given the available evidence (0.0 to 1.0)
- supportingReviewIds: array of review IDs from the sample that best support this answer

Return ONLY a valid JSON array:
[
  {
    "question": "<question text, exactly as given>",
    "answer": "<detailed answer>",
    "confidence": 0.8,
    "supportingReviewIds": ["<id1>", "<id2>"]
  }
]`;
}

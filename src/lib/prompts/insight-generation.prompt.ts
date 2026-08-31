export function buildInsightGenerationPrompt(
  representativeReviews: Array<{ id: string; review: string; sentiment: string }>,
  questions: readonly string[]
): string {
  return `You are a senior Growth PM analyst who has just read through a large set of Myntra user reviews and discussions to understand why users wishlist fashion products but don't convert to purchase within 30 days. The constraint is that any eventual solution CANNOT use monetary incentives (no discounts, cashback, or coupons) — so your answers should surface non-monetary, information/trust/psychology-based explanations wherever the reviews support them.

REVIEWS YOU'VE READ (background context only — do NOT quote them verbatim, reference specific review text, or cite review IDs in your answers; form your own overall impression from reading them):
${JSON.stringify(representativeReviews, null, 2)}

QUESTIONS TO ANSWER:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

For each question, write your answer the way you'd explain it to a colleague after reading everything — a plain-language synthesis of the overall pattern you noticed, not a citation-backed report. Use soft, qualitative framing ("most users...", "a common thread is...", "a smaller but recurring group...", "there's little evidence of...") instead of exact numbers, percentages, or counts — precise quantification lives in the separate Research Report; this is the fast, holistic read. If the reviews don't give you enough to answer a question with real confidence, say so plainly and lower the confidence score rather than fabricating certainty.

For each question, provide:
- answer: a holistic, plain-language synthesis of the overall pattern — no exact numbers/percentages, no quoted review text, no review IDs
- confidence: how confident you are given the available evidence (0.0 to 1.0)

Return ONLY a valid JSON array:
[
  {
    "question": "<question text, exactly as given>",
    "answer": "<holistic synthesis, no numbers or quotes>",
    "confidence": 0.8
  }
]`;
}

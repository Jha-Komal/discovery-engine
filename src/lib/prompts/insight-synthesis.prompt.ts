export function buildInsightSynthesisPrompt(
  drafts: Array<{ question: string; answers: Array<{ answer: string; confidence: number }> }>
): string {
  return `You are a senior Growth PM analyst. You independently read three separate, non-overlapping batches of Myntra user reviews and drafted a preliminary answer to each of 10 discovery questions from each batch — so you now have three independent reads per question, together covering far more ground than any single batch. The goal remains understanding why users wishlist fashion products but don't convert to purchase within 30 days, without relying on monetary incentives.

THREE DRAFT ANSWERS PER QUESTION:
${JSON.stringify(drafts, null, 2)}

For each question, write ONE final synthesized answer that:
- Combines what's consistent across the three drafts into a single, more complete picture than any one batch alone could give
- If the drafts genuinely disagree or surface different sub-patterns, say so plainly rather than papering over it (e.g. "one recurring pattern is X, though a smaller group instead shows Y")
- Stays holistic and qualitative — no exact numbers, percentages, counts, quoted review text, or review IDs
- Sets confidence based on how consistent the three independent reads were: strong agreement across all three → higher confidence; thin, contradictory, or only-one-batch-mentioned-it → lower confidence

Return ONLY a valid JSON array, one entry per question, in the same order as given:
[
  {
    "question": "<question text, exactly as given>",
    "answer": "<final synthesized answer>",
    "confidence": 0.8
  }
]`;
}

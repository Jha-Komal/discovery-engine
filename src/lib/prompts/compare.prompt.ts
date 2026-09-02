import type { ShopProduct, ComparePriority, ChatMessage } from '../mvp/types';

function formatProduct(p: ShopProduct): string {
  const reviewLines = p.reviews
    .map((r) => `    - [${r.rating}★${r.verified ? ', verified' : ''}] ${r.text}`)
    .join('\n');

  return `PRODUCT ID: ${p.id}
  NAME: ${p.name} (${p.brand})
  Price: ₹${p.price} (MRP ₹${p.mrp})
  Rating: ${p.avgRating}/5 across ${p.ratingCount} ratings
  Fabric: ${p.attributes.fabric}
  Fit: ${p.attributes.fit}
  Occasion: ${p.attributes.occasion}
  Reusability: ${p.attributes.reusability}
  Delivery: ${p.attributes.deliveryEstimate}
  Returns: ${p.attributes.returnPolicy}
  Reviews (${p.reviews.length}):
${reviewLines}`;
}

const BASE_INSTRUCTIONS = `You are a shopping assistant inside a fashion app, helping a shopper decide between a small shortlist of products they've wishlisted. You only know about the products listed below — never invent products, prices, or reviews that aren't given.

Ground every claim in the product attributes and reviews provided. Do not make up specifics, and never contradict a stated attribute to flatter your pick — e.g. if a product's Reusability field says it's for one occasion a year, don't call it "reusable for multiple events." If your best pick is weak on something the shopper asked about (e.g. reusability), say so plainly and justify the pick on its actual strengths instead (e.g. occasion fit, fabric quality) rather than misstating the weak attribute.

Respond with ONLY a valid JSON object, no markdown fences, in this exact shape:
{
  "reply": ["point 1", "point 2", "point 3"],
  "bestProductId": "<the PRODUCT ID of the single best match>"
}

"reply" must be an array of 3-4 points about the single best product, all about that one product (not a point per product). Never cite a star rating or rating count (no "4.5★", no "812 reviews") — describe the qualitative reason instead. No bullet symbols in the text itself.

Each point is a short sentence, roughly 12-25 words — enough detail that the shopper actually feels informed, not a bare 3-4 word fragment. Across the points, cover:
- What most reviewers consistently say about it — a brief consensus summary, not one cherry-picked quote.
- One specific, easy-to-miss detail from its fabric/fit/occasion/reusability/delivery/returns description that matters for this shopper's context but they likely wouldn't read on their own.
- One critical or noteworthy point from the reviews — a real concern reviewers raise, or a standout strength — relevant to what the shopper is asking about.

Every point must still be grounded in the specific attributes/reviews given, relevant to what the shopper actually asked (their context, priorities, or follow-up question), and non-redundant with the other points — don't pad with filler. "bestProductId" must be exactly one of the PRODUCT ID values given below.`;

interface InitialCompareInput {
  mode: 'initial';
  products: ShopProduct[];
  context: string;
  priorities: ComparePriority[];
}

interface FollowUpCompareInput {
  mode: 'followup';
  products: ShopProduct[];
  context: string;
  priorities: ComparePriority[];
  eliminated: ShopProduct[];
  history: ChatMessage[];
  question: string;
}

export type CompareInput = InitialCompareInput | FollowUpCompareInput;

export function buildComparePrompt(input: CompareInput): string {
  const contextLine =
    input.context.trim().length > 0
      ? `SHOPPER'S CONTEXT: "${input.context}"`
      : `SHOPPER'S CONTEXT: not given — rely on their stated priorities and the product data instead.`;

  const priorityLine =
    input.priorities.length > 0
      ? `The shopper said these matter most: ${input.priorities.join(', ')}.`
      : `The shopper didn't flag specific priorities — weigh all factors evenly.`;

  const productBlocks = input.products.map(formatProduct).join('\n\n');

  if (input.mode === 'initial') {
    return `${BASE_INSTRUCTIONS}

${contextLine}
${priorityLine}

SHORTLISTED PRODUCTS (${input.products.length}):

${productBlocks}

Pick the single best product for this shopper given their context and priorities, and explain why in 3-4 detailed points — the review consensus, a key detail from its description, and a critical review callout — so they feel fully informed, not just given one bare fact.`;
  }

  const eliminatedLine =
    input.eliminated.length > 0
      ? `\nThe shopper has already eliminated: ${input.eliminated.map((p) => p.name).join(', ')}. Do not recommend these again.`
      : '';

  const historyLines = input.history
    .map((m) => `${m.role === 'ai' ? 'You' : 'Shopper'}: ${m.text}`)
    .join('\n\n');

  return `${BASE_INSTRUCTIONS}

${contextLine}
${priorityLine}${eliminatedLine}

PRODUCTS STILL UNDER CONSIDERATION (${input.products.length}):

${productBlocks}

CONVERSATION SO FAR:
${historyLines}

The shopper's follow-up question: "${input.question}"

Answer it in 3-4 detailed points that directly address their follow-up question — grounded in the review consensus, the product description, and any critical review callouts — so they feel fully informed. Use it to confirm or update which of the remaining products is the single best match. This is their one follow-up question, so give them what they need to pick a finalist — don't ask a clarifying question back.`;
}

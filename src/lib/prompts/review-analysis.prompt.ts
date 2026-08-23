export function buildReviewAnalysisPrompt(
  reviews: Array<{ id: string; review: string; source: string }>
): string {
  const reviewsJson = JSON.stringify(reviews, null, 2);

  return `You are analyzing user reviews and discussions about Myntra (an online fashion e-commerce app) to understand wishlist-to-purchase conversion behavior. The Growth Team's goal is to increase the percentage of users who purchase at least one wishlisted item within 30 days. Solutions CANNOT involve monetary incentives (discounts, cashback, coupons) — so your extraction should focus on non-monetary signals: information gaps, trust issues, fit/sizing uncertainty, comparison behavior, and psychological barriers.

For each review below, extract:
- sentiment: "positive", "neutral", or "negative"
- emotion: primary emotion (e.g. "happy", "frustrated", "confused", "disappointed", "excited", "neutral", "anxious")
- themes: array of topics mentioned (e.g. ["delivery", "sizing", "returns", "pricing", "app_usability", "product_quality", "wishlist", "authenticity"])
- painPoints: array of specific pain points mentioned
- featureRequests: array of features the user explicitly or implicitly wants
- summary: one-sentence summary of the review
- confidence: confidence score of this analysis (0.0 to 1.0)
- wishlistMotivation: if the review implies why someone would wishlist/save an item, describe it briefly (e.g. "waiting for price drop", "unsure about fit", "saving gift idea", "comparison shopping", "just browsing") — or null if not inferable
- purchaseBarrier: what is stopping a purchase, if mentioned or implied (e.g. "price too high", "size unavailable", "fit uncertainty", "waiting for discount", "needs external validation", "too many options / decision paralysis", "wrong occasion timing", "trust/authenticity concern", "return/exchange friction", "poor product quality history") — or null
- uncertaintyType: residual doubt after a user has shortlisted/liked a product (e.g. "fit/size", "quality", "authenticity", "color accuracy", "value for money") — or null
- comparisonBehavior: how the user compares shortlisted/wishlisted products, if mentioned (e.g. "compares across apps/platforms", "compares within own wishlist", "seeks external reviews before deciding", "asks friends/family") — or null
- externalInfoSought: what information source outside the app the user references or implies seeking (e.g. "YouTube reviews/hauls", "influencer recommendation", "friend or WhatsApp group opinion", "Google search", "brand's own website") — or null
- decisionFactors: array containing any of ["fit", "size", "styling", "price", "reviews", "occasion", "social_validation", "brand_trust", "return_policy"] that are explicitly discussed — empty array if none
- wishlistIntent: classify as "genuine_intent" (clearly planning to buy), "bookmark_only" (just saving/browsing, no real intent), "price_tracking" (waiting for a price drop specifically), or "unclear" (not enough signal)
- segmentHint: a short freeform tag describing what kind of shopper this review reveals, if evident (e.g. "budget-conscious", "occasion-shopper", "trend-follower", "frequent-buyer", "first-time-buyer") — or null if not evident

Most reviews will be general app/product feedback, not literally about wishlists — that's expected. Extract wishlist-related fields as null/empty when the review gives no signal on that dimension; do not force an answer.

Reviews to analyze:
${reviewsJson}

Return ONLY a valid JSON array, one object per review, in this exact format:
[
  {
    "id": "<review_id>",
    "sentiment": "positive|neutral|negative",
    "emotion": "<emotion>",
    "themes": ["<theme1>"],
    "painPoints": ["<pain1>"],
    "featureRequests": ["<feature1>"],
    "summary": "<one sentence>",
    "confidence": 0.9,
    "wishlistMotivation": "<text or null>",
    "purchaseBarrier": "<text or null>",
    "uncertaintyType": "<text or null>",
    "comparisonBehavior": "<text or null>",
    "externalInfoSought": "<text or null>",
    "decisionFactors": ["fit", "price"],
    "wishlistIntent": "genuine_intent|bookmark_only|price_tracking|unclear",
    "segmentHint": "<text or null>"
  }
]`;
}

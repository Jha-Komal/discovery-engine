import type { ReviewWithAnalysis, AggregationStats } from './types';

function bump(record: Record<string, number>, key: string | null | undefined): void {
  if (!key) return;
  record[key] = (record[key] || 0) + 1;
}

export function computeAggregation(reviews: ReviewWithAnalysis[]): AggregationStats {
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let ratingSum = 0;
  let ratingCount = 0;
  let analyzedCount = 0;

  const sourceDistribution: Record<string, number> = {};
  const themeFrequency: Record<string, number> = {};
  const painPointFrequency: Record<string, number> = {};
  const emotionFrequency: Record<string, number> = {};
  const wishlistMotivationDistribution: Record<string, number> = {};
  const purchaseBarrierDistribution: Record<string, number> = {};
  const uncertaintyTypeDistribution: Record<string, number> = {};
  const comparisonBehaviorDistribution: Record<string, number> = {};
  const externalInfoSoughtDistribution: Record<string, number> = {};
  const decisionFactorDistribution: Record<string, number> = {};
  const wishlistIntentDistribution: Record<string, number> = {};
  const segmentHintDistribution: Record<string, number> = {};

  for (const review of reviews) {
    bump(sourceDistribution, review.source);

    if (review.rating !== null) {
      ratingSum += review.rating;
      ratingCount++;
    }

    const a = review.analysis;
    if (!a) continue;
    analyzedCount++;

    if (a.sentiment === 'positive') positiveCount++;
    else if (a.sentiment === 'neutral') neutralCount++;
    else if (a.sentiment === 'negative') negativeCount++;

    for (const theme of a.themes) bump(themeFrequency, theme);
    for (const pp of a.painPoints) bump(painPointFrequency, pp);
    bump(emotionFrequency, a.emotion);
    bump(wishlistMotivationDistribution, a.wishlistMotivation);
    bump(purchaseBarrierDistribution, a.purchaseBarrier);
    bump(uncertaintyTypeDistribution, a.uncertaintyType);
    bump(comparisonBehaviorDistribution, a.comparisonBehavior);
    bump(externalInfoSoughtDistribution, a.externalInfoSought);
    for (const df of a.decisionFactors) bump(decisionFactorDistribution, df);
    bump(wishlistIntentDistribution, a.wishlistIntent);
    bump(segmentHintDistribution, a.segmentHint);
  }

  return {
    totalCount: reviews.length,
    analyzedCount,
    positiveCount,
    neutralCount,
    negativeCount,
    averageRating: ratingCount > 0 ? ratingSum / ratingCount : 0,
    sourceDistribution,
    themeFrequency,
    painPointFrequency,
    emotionFrequency,
    wishlistMotivationDistribution,
    purchaseBarrierDistribution,
    uncertaintyTypeDistribution,
    comparisonBehaviorDistribution,
    externalInfoSoughtDistribution,
    decisionFactorDistribution,
    wishlistIntentDistribution,
    segmentHintDistribution,
  };
}

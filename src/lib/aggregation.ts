import type { ReviewWithAnalysis, AggregationStats, ByRelevanceClass, RelevanceClass } from './types';

function bump(record: Record<string, number>, key: string | null | undefined): void {
  if (!key) return;
  record[key] = (record[key] || 0) + 1;
}

/**
 * Same as bump(), but also tallies the count under its relevance class — so
 * downstream consumers (the research-report prompt) can check "how many of
 * these N mentions are actually DIRECT_WISHLIST evidence" instead of having
 * to guess, which previously caused the report to mislabel corpus-wide
 * counts (e.g. 292 HIGH-purchase-intent records, mostly GENERAL_ECOMMERCE)
 * as DIRECT_WISHLIST evidence when only 20 records total are DIRECT_WISHLIST.
 */
function bumpByClass(
  record: Record<string, ByRelevanceClass>,
  key: string | null | undefined,
  relevanceClass: RelevanceClass
): void {
  if (!key) return;
  if (!record[key]) {
    record[key] = { DIRECT_WISHLIST: 0, ADJACENT_DECISION: 0, GENERAL_ECOMMERCE: 0, IRRELEVANT: 0 };
  }
  record[key][relevanceClass]++;
}

export function computeAggregation(reviews: ReviewWithAnalysis[]): AggregationStats {
  let ratingSum = 0;
  let ratingCount = 0;
  let analyzedCount = 0;

  const sourceDistribution: Record<string, number> = {};

  const relevanceClassDistribution: Record<string, number> = {};
  const journeyStageFrequency: Record<string, number> = {};

  const wishlistJobCategoryDistribution: Record<string, number> = {};
  const wishlistJobCategoryByRelevanceClass: Record<string, ByRelevanceClass> = {};

  const purchaseIntentDistribution: Record<string, number> = {};
  const purchaseIntentByRelevanceClass: Record<string, ByRelevanceClass> = {};

  const barrierCategoryFrequency: Record<string, number> = {};
  const barrierCategoryByRelevanceClass: Record<string, ByRelevanceClass> = {};
  const barrierSeverityDistribution: Record<string, number> = {};

  const uncertaintyCategoryFrequency: Record<string, number> = {};
  const uncertaintyCategoryByRelevanceClass: Record<string, ByRelevanceClass> = {};

  const postponementPresentDistribution: Record<string, number> = {};
  const postponementReasonFrequency: Record<string, number> = {};
  const postponementReasonByRelevanceClass: Record<string, ByRelevanceClass> = {};

  const decisionCriteriaFrequency: Record<string, number> = {};
  const decisionCriteriaByRelevanceClass: Record<string, ByRelevanceClass> = {};

  const comparisonPresentDistribution: Record<string, number> = {};

  const externalInfoSourceFrequency: Record<string, number> = {};
  const externalInfoSourceByRelevanceClass: Record<string, ByRelevanceClass> = {};

  const socialValidationPresentDistribution: Record<string, number> = {};

  const workaroundFrequency: Record<string, number> = {};
  const workaroundByRelevanceClass: Record<string, ByRelevanceClass> = {};

  const segmentSignalFrequency: Record<string, number> = {};
  const segmentSignalByRelevanceClass: Record<string, ByRelevanceClass> = {};

  const sentimentDistribution: Record<string, number> = {};
  const emotionFrequency: Record<string, number> = {};

  const decisionOutcomeDistribution: Record<string, number> = {};

  const metricRelevanceDistribution: Record<string, number> = {};

  for (const review of reviews) {
    bump(sourceDistribution, review.source);

    if (review.rating !== null) {
      ratingSum += review.rating;
      ratingCount++;
    }

    const a = review.analysis;
    if (!a) continue;
    analyzedCount++;

    const relevanceClass = a.relevance.class;
    bump(relevanceClassDistribution, relevanceClass);
    for (const stage of a.journeyStages) bump(journeyStageFrequency, stage);

    bump(wishlistJobCategoryDistribution, a.wishlistBehavior.jobCategory);
    bumpByClass(wishlistJobCategoryByRelevanceClass, a.wishlistBehavior.jobCategory, relevanceClass);

    bump(purchaseIntentDistribution, a.purchaseIntent.level);
    bumpByClass(purchaseIntentByRelevanceClass, a.purchaseIntent.level, relevanceClass);

    for (const b of a.barriers) {
      bump(barrierCategoryFrequency, b.category);
      bumpByClass(barrierCategoryByRelevanceClass, b.category, relevanceClass);
      bump(barrierSeverityDistribution, b.severity);
    }

    for (const u of a.uncertainties) {
      bump(uncertaintyCategoryFrequency, u.category);
      bumpByClass(uncertaintyCategoryByRelevanceClass, u.category, relevanceClass);
    }

    bump(postponementPresentDistribution, a.postponement.present);
    bump(postponementReasonFrequency, a.postponement.reason);
    bumpByClass(postponementReasonByRelevanceClass, a.postponement.reason, relevanceClass);

    for (const dc of a.decisionCriteria) {
      bump(decisionCriteriaFrequency, dc.criterion);
      bumpByClass(decisionCriteriaByRelevanceClass, dc.criterion, relevanceClass);
    }

    bump(comparisonPresentDistribution, a.comparisonBehavior.present);

    for (const src of a.externalInformationSeeking.sources) {
      bump(externalInfoSourceFrequency, src);
      bumpByClass(externalInfoSourceByRelevanceClass, src, relevanceClass);
    }

    bump(socialValidationPresentDistribution, a.socialValidation.present);

    for (const w of a.workarounds) {
      bump(workaroundFrequency, w);
      bumpByClass(workaroundByRelevanceClass, w, relevanceClass);
    }
    for (const s of a.segmentSignals) {
      bump(segmentSignalFrequency, s.segment);
      bumpByClass(segmentSignalByRelevanceClass, s.segment, relevanceClass);
    }

    bump(sentimentDistribution, a.sentiment.overall);
    for (const e of a.sentiment.emotions) bump(emotionFrequency, e);

    bump(decisionOutcomeDistribution, a.decisionOutcome.status);
    bump(metricRelevanceDistribution, a.metricConnection.relevance);
  }

  return {
    totalCount: reviews.length,
    analyzedCount,
    averageRating: ratingCount > 0 ? ratingSum / ratingCount : 0,
    sourceDistribution,

    relevanceClassDistribution,
    journeyStageFrequency,

    wishlistJobCategoryDistribution,
    wishlistJobCategoryByRelevanceClass,

    purchaseIntentDistribution,
    purchaseIntentByRelevanceClass,

    barrierCategoryFrequency,
    barrierCategoryByRelevanceClass,
    barrierSeverityDistribution,

    uncertaintyCategoryFrequency,
    uncertaintyCategoryByRelevanceClass,

    postponementPresentDistribution,
    postponementReasonFrequency,
    postponementReasonByRelevanceClass,

    decisionCriteriaFrequency,
    decisionCriteriaByRelevanceClass,

    comparisonPresentDistribution,

    externalInfoSourceFrequency,
    externalInfoSourceByRelevanceClass,

    socialValidationPresentDistribution,

    workaroundFrequency,
    workaroundByRelevanceClass,

    segmentSignalFrequency,
    segmentSignalByRelevanceClass,

    sentimentDistribution,
    emotionFrequency,

    decisionOutcomeDistribution,

    metricRelevanceDistribution,
  };
}

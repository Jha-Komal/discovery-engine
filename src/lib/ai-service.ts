import { completeJson, completeText } from './openai-provider';
import { buildReviewAnalysisPrompt } from './prompts/review-analysis.prompt';
import { buildInsightGenerationPrompt } from './prompts/insight-generation.prompt';
import { buildResearchReportPrompt } from './prompts/research-report.prompt';
import { buildRecommendationPrompt } from './prompts/recommendation.prompt';
import { AnalysisResultArraySchema, InsightArraySchema, RecommendationArraySchema } from './validators';
import { parseJsonSafe } from './json-parse';
import type { AggregationStats, ReviewAnalysis, ReviewWithAnalysis, Insight, Recommendation } from './types';

/** Calls the model, parses JSON, retries once on parse failure, throws otherwise. */
async function completeAndParseArray(prompt: string, label: string, model?: string, maxTokens?: number): Promise<unknown[]> {
  let raw = await completeJson(prompt, { model, maxTokens });
  let parsed = parseJsonSafe<unknown[]>(raw);

  if (!parsed) {
    console.warn(`[AIService] ${label}: failed to parse response, retrying once...`);
    raw = await completeJson(prompt, { model, maxTokens });
    parsed = parseJsonSafe<unknown[]>(raw);
  }

  if (!parsed) {
    throw new Error(`[AIService] ${label}: failed to parse AI response after retry`);
  }

  return parsed;
}

export async function analyzeReviewBatch(
  reviews: Array<{ id: string; review: string; title: string; source: string; rating: number | null; date: string | null }>
): Promise<ReviewAnalysis[]> {
  const prompt = buildReviewAnalysisPrompt(reviews);
  const parsed = await completeAndParseArray(prompt, 'analyzeReviewBatch');
  const validated = AnalysisResultArraySchema.parse(parsed);

  return validated.map((v) => ({
    reviewId: v.record_id,

    relevance: {
      class: v.relevance.class,
      reason: v.relevance.reason,
      evidenceStrength: v.relevance.evidence_strength,
    },

    journeyStages: v.journey_stages,

    wishlistBehavior: {
      jobCategory: v.wishlist_behavior.job_category,
      jobDescription: v.wishlist_behavior.job_description,
      supportingEvidence: v.wishlist_behavior.supporting_evidence,
    },

    purchaseIntent: {
      level: v.purchase_intent.level,
      reason: v.purchase_intent.reason,
      evidenceStrength: v.purchase_intent.evidence_strength,
    },

    barriers: v.barriers.map((b) => ({
      category: b.category,
      description: b.description,
      evidence: b.evidence,
      severity: b.severity,
      evidenceStrength: b.evidence_strength,
    })),

    uncertainties: v.uncertainties.map((u) => ({
      category: u.category,
      description: u.description,
      evidence: u.evidence,
      evidenceStrength: u.evidence_strength,
    })),

    postponement: {
      present: v.postponement.present,
      reason: v.postponement.reason,
      triggerOrCondition: v.postponement.trigger_or_condition,
    },

    decisionCriteria: v.decision_criteria,

    comparisonBehavior: {
      present: v.comparison_behavior.present,
      itemsCompared: v.comparison_behavior.items_compared,
      comparisonDimensions: v.comparison_behavior.comparison_dimensions,
      difficulty: v.comparison_behavior.difficulty,
      outcome: v.comparison_behavior.outcome,
    },

    externalInformationSeeking: {
      present: v.external_information_seeking.present,
      sources: v.external_information_seeking.sources,
      informationSought: v.external_information_seeking.information_sought,
      platformInformationGap: v.external_information_seeking.platform_information_gap,
      evidence: v.external_information_seeking.evidence,
    },

    socialValidation: {
      present: v.social_validation.present,
      source: v.social_validation.source,
      validationNeeded: v.social_validation.validation_needed,
      evidence: v.social_validation.evidence,
    },

    workarounds: v.workarounds,
    segmentSignals: v.segment_signals,

    sentiment: {
      overall: v.sentiment.overall,
      emotions: v.sentiment.emotions,
    },

    decisionOutcome: {
      status: v.decision_outcome.status,
      evidence: v.decision_outcome.evidence,
    },

    metricConnection: {
      relevance: v.metric_connection.relevance,
      reason: v.metric_connection.reason,
    },

    evidenceQuote: v.evidence_quote,
    researcherNote: v.researcher_note,
  }));
}

// Both the research report and insights involve precisely cross-referencing a large
// amount of aggregated/nested data (e.g. matching a count to its correct relevance-class
// breakdown) — gpt-4o-mini demonstrably mislabels some of these on real runs. gpt-4o
// handles that kind of dense cross-referencing far more reliably.
const SYNTHESIS_MODEL = 'gpt-4o';

/** Quick Q&A-format answers to the 10 discovery questions — a fast, standalone step. */
export async function generateInsights(
  representativeReviews: Array<{ id: string; review: string; sentiment: string }>,
  questions: readonly string[]
): Promise<Omit<Insight, 'id'>[]> {
  const prompt = buildInsightGenerationPrompt(representativeReviews, questions);
  const parsed = await completeAndParseArray(prompt, 'generateInsights', SYNTHESIS_MODEL, 3000);
  return InsightArraySchema.parse(parsed);
}

/** Cross-review synthesis report — evidence extraction only, no solutions. */
export async function generateResearchReport(
  stats: AggregationStats,
  sampleRecords: ReviewWithAnalysis[]
): Promise<string> {
  const prompt = buildResearchReportPrompt(stats, sampleRecords);
  return completeText(prompt, { model: SYNTHESIS_MODEL, maxTokens: 3500 });
}

export async function generateRecommendations(
  stats: AggregationStats,
  researchReport: string
): Promise<Omit<Recommendation, 'id'>[]> {
  const prompt = buildRecommendationPrompt(stats, researchReport);
  const parsed = await completeAndParseArray(prompt, 'generateRecommendations');
  return RecommendationArraySchema.parse(parsed);
}

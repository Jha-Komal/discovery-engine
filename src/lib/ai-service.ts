import { completeJson } from './openai-provider';
import { buildReviewAnalysisPrompt } from './prompts/review-analysis.prompt';
import { buildInsightGenerationPrompt } from './prompts/insight-generation.prompt';
import { buildOpportunityGenerationPrompt } from './prompts/opportunity-generation.prompt';
import { buildRecommendationPrompt } from './prompts/recommendation.prompt';
import {
  AnalysisResultArraySchema,
  InsightArraySchema,
  OpportunityAreaArraySchema,
  RecommendationArraySchema,
} from './validators';
import { parseJsonSafe } from './json-parse';
import { DISCOVERY_QUESTIONS } from './constants';
import type {
  AggregationStats,
  ReviewAnalysis,
  Insight,
  OpportunityArea,
  Recommendation,
} from './types';

/** Calls the model, parses JSON, retries once on parse failure, throws otherwise. */
async function completeAndParseArray(prompt: string, label: string): Promise<unknown[]> {
  let raw = await completeJson(prompt);
  let parsed = parseJsonSafe<unknown[]>(raw);

  if (!parsed) {
    console.warn(`[AIService] ${label}: failed to parse response, retrying once...`);
    raw = await completeJson(prompt);
    parsed = parseJsonSafe<unknown[]>(raw);
  }

  if (!parsed) {
    throw new Error(`[AIService] ${label}: failed to parse AI response after retry`);
  }

  return parsed;
}

export async function analyzeReviewBatch(
  reviews: Array<{ id: string; review: string; source: string }>
): Promise<ReviewAnalysis[]> {
  const prompt = buildReviewAnalysisPrompt(reviews);
  const parsed = await completeAndParseArray(prompt, 'analyzeReviewBatch');
  const validated = AnalysisResultArraySchema.parse(parsed);

  return validated.map((v) => ({
    reviewId: v.id,
    sentiment: v.sentiment,
    emotion: v.emotion,
    themes: v.themes,
    painPoints: v.painPoints,
    featureRequests: v.featureRequests,
    summary: v.summary,
    confidence: v.confidence,
    wishlistMotivation: v.wishlistMotivation,
    purchaseBarrier: v.purchaseBarrier,
    uncertaintyType: v.uncertaintyType,
    comparisonBehavior: v.comparisonBehavior,
    externalInfoSought: v.externalInfoSought,
    decisionFactors: v.decisionFactors,
    wishlistIntent: v.wishlistIntent,
    segmentHint: v.segmentHint,
  }));
}

export async function generateInsights(
  stats: AggregationStats,
  representativeReviews: Array<{ id: string; review: string; sentiment: string }>
): Promise<Omit<Insight, 'id'>[]> {
  const prompt = buildInsightGenerationPrompt(stats, representativeReviews, DISCOVERY_QUESTIONS);
  const parsed = await completeAndParseArray(prompt, 'generateInsights');
  return InsightArraySchema.parse(parsed);
}

export async function generateOpportunities(
  stats: AggregationStats,
  insights: Array<Pick<Insight, 'question' | 'answer'>>
): Promise<Omit<OpportunityArea, 'id'>[]> {
  const prompt = buildOpportunityGenerationPrompt(stats, insights);
  const parsed = await completeAndParseArray(prompt, 'generateOpportunities');
  return OpportunityAreaArraySchema.parse(parsed);
}

export async function generateRecommendations(
  stats: AggregationStats,
  opportunities: Array<Pick<OpportunityArea, 'title' | 'description' | 'priority'>>
): Promise<Omit<Recommendation, 'id'>[]> {
  const prompt = buildRecommendationPrompt(stats, opportunities);
  const parsed = await completeAndParseArray(prompt, 'generateRecommendations');
  return RecommendationArraySchema.parse(parsed);
}

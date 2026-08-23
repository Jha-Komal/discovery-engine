import { randomUUID } from 'crypto';
import { loadRefinedReviews } from './csv-loader';
import * as store from './store';
import { analyzeReviewBatch, generateInsights, generateOpportunities, generateRecommendations } from './ai-service';
import { computeAggregation } from './aggregation';
import { ANALYSIS_BATCH_SIZE } from './constants';
import type { ReviewWithAnalysis } from './types';

/** Loads refined CSVs into generated/reviews.json (idempotent — safe to call repeatedly). */
export async function loadReviews(): Promise<{ loaded: number }> {
  await store.setStatus('loading', 0, 'Loading refined CSVs');
  const reviews = await loadRefinedReviews();
  await store.saveReviews(reviews);
  await store.setStatus('idle', 100, `Loaded ${reviews.length} reviews`);
  return { loaded: reviews.length };
}

async function joinReviewsWithAnalysis(): Promise<ReviewWithAnalysis[]> {
  const [reviews, analyses] = await Promise.all([store.getReviews(), store.getAnalyses()]);
  const analysisById = new Map(analyses.map((a) => [a.reviewId, a]));
  return reviews.map((r) => ({ ...r, analysis: analysisById.get(r.id) ?? null }));
}

/** Runs the full pipeline: load -> analyze -> aggregate -> insights -> opportunities -> recommendations. */
export async function runFullPipeline(): Promise<void> {
  try {
    // Step 1: load
    await store.setStatus('loading', 0, 'Loading refined CSVs');
    let reviews = await store.getReviews();
    if (reviews.length === 0) {
      reviews = await loadRefinedReviews();
      await store.saveReviews(reviews);
    }

    // Step 2: analyze unanalyzed reviews in batches
    await store.setStatus('analyzing', 5, 'Analyzing reviews with AI');
    const existingAnalyses = await store.getAnalyses();
    const analyzedIds = new Set(existingAnalyses.map((a) => a.reviewId));
    const unanalyzed = reviews.filter((r) => !analyzedIds.has(r.id));

    const batches: (typeof unanalyzed)[] = [];
    for (let i = 0; i < unanalyzed.length; i += ANALYSIS_BATCH_SIZE) {
      batches.push(unanalyzed.slice(i, i + ANALYSIS_BATCH_SIZE));
    }

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const progress = 5 + Math.floor(((i + 1) / Math.max(batches.length, 1)) * 55);
      await store.setStatus('analyzing', progress, `Analyzing batch ${i + 1}/${batches.length}`);

      const batchInput = batch.map((r) => ({ id: r.id, review: r.review, source: r.source }));

      try {
        const results = await analyzeReviewBatch(batchInput);
        await store.appendAnalyses(results);
      } catch (err) {
        console.error(`[Pipeline] Batch ${i + 1} failed:`, err);
      }
    }

    // Step 3: aggregate
    await store.setStatus('aggregating', 62, 'Computing aggregation statistics');
    const withAnalysis = await joinReviewsWithAnalysis();
    const stats = computeAggregation(withAnalysis);
    await store.saveAggregation(stats);

    // Step 4: insights
    await store.setStatus('generating_insights', 75, 'Generating insights');
    const representativeReviews = withAnalysis
      .filter((r) => r.analysis !== null)
      .slice(0, 30)
      .map((r) => ({ id: r.id, review: r.review, sentiment: r.analysis!.sentiment }));

    const insightsRaw = await generateInsights(stats, representativeReviews);
    const insights = insightsRaw.map((i) => ({ id: randomUUID(), ...i }));
    await store.saveInsights(insights);

    // Step 5: opportunity areas (quantified, comparable)
    await store.setStatus('generating_opportunities', 85, 'Identifying opportunity areas');
    const opportunitiesRaw = await generateOpportunities(
      stats,
      insights.map((i) => ({ question: i.question, answer: i.answer }))
    );
    const opportunities = opportunitiesRaw
      .map((o) => ({ id: randomUUID(), ...o }))
      .sort((a, b) => b.affectedShare - a.affectedShare);
    await store.saveOpportunities(opportunities);

    // Step 6: recommendations
    await store.setStatus('generating_recommendations', 93, 'Generating recommendations');
    const recommendationsRaw = await generateRecommendations(
      stats,
      opportunities.map((o) => ({ title: o.title, description: o.description, priority: o.priority }))
    );
    const recommendations = recommendationsRaw.map((r) => ({ id: randomUUID(), ...r }));
    await store.saveRecommendations(recommendations);

    await store.setStatus('completed', 100, 'Pipeline completed successfully');
  } catch (err) {
    await store.setStatus('error', 0, `Pipeline error: ${String(err)}`);
    throw err;
  }
}

export async function getReviewsWithAnalysis(): Promise<ReviewWithAnalysis[]> {
  return joinReviewsWithAnalysis();
}

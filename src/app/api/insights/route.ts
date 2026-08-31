import { randomUUID } from 'crypto';
import { getReviewsWithAnalysis } from '@/lib/pipeline';
import { sampleByRelevance } from '@/lib/sampling';
import { generateInsights } from '@/lib/ai-service';
import { getInsights, saveInsights } from '@/lib/store';
import { DISCOVERY_QUESTIONS, INSIGHTS_SAMPLE_SIZE } from '@/lib/constants';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const insights = await getInsights();
    return ok(insights);
  } catch (err) {
    return fail(String(err));
  }
}

/**
 * Generates the Q&A-format insights from whatever analysis already exists —
 * a fast, standalone step that does NOT re-run the per-review analysis
 * pipeline. Safe to call any time after at least some reviews are analyzed.
 */
export async function POST() {
  try {
    const withAnalysis = await getReviewsWithAnalysis();
    const analyzed = withAnalysis.filter((r) => r.analysis !== null);

    if (analyzed.length === 0) {
      return fail('No analyzed reviews yet — run the analysis pipeline first.', 409);
    }

    const representativeReviews = sampleByRelevance(withAnalysis, INSIGHTS_SAMPLE_SIZE).map((r) => ({
      id: r.id,
      review: r.review,
      sentiment: r.analysis!.sentiment.overall,
    }));

    const insightsRaw = await generateInsights(representativeReviews, DISCOVERY_QUESTIONS);
    const insights = insightsRaw.map((i) => ({ id: randomUUID(), ...i }));
    await saveInsights(insights);

    return ok(insights);
  } catch (err) {
    return fail(String(err));
  }
}

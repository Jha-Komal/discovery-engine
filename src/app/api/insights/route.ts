import { randomUUID } from 'crypto';
import { getReviewsWithAnalysis } from '@/lib/pipeline';
import { sampleByRelevance } from '@/lib/sampling';
import { generateInsights, synthesizeInsights } from '@/lib/ai-service';
import { getInsights, saveInsights } from '@/lib/store';
import { DISCOVERY_QUESTIONS, INSIGHTS_SAMPLE_SIZE, INSIGHTS_BATCH_COUNT, INSIGHTS_BATCH_MIN_GAP_MS } from '@/lib/constants';
import { ok, fail } from '@/lib/api-response';
import type { ReviewWithAnalysis } from '@/lib/types';

export async function GET() {
  try {
    const insights = await getInsights();
    return ok(insights);
  } catch (err) {
    return fail(String(err));
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Review length in this corpus is heavily skewed (p50 ~135 chars, p90 ~936,
// max ~2800) — a batch that happens to draw a cluster of long reviews can be
// 4x the size of one that doesn't (confirmed against real data: one 180-
// record batch was 197k chars vs another's 50k, both from the same sampling
// logic). Capping length bounds each batch's worst case regardless of which
// specific reviews land in it, instead of gambling on average-case sizing.
const MAX_REVIEW_CHARS_IN_SAMPLE = 350;

function toSample(reviews: ReviewWithAnalysis[]) {
  return reviews.map((r) => ({
    id: r.id,
    review: r.review.length > MAX_REVIEW_CHARS_IN_SAMPLE ? r.review.slice(0, MAX_REVIEW_CHARS_IN_SAMPLE) + '…' : r.review,
    sentiment: r.analysis!.sentiment.overall,
  }));
}

/**
 * Waits until at least INSIGHTS_BATCH_MIN_GAP_MS has elapsed since
 * lastCallStart, then returns the new call's start time. The gap is
 * measured start-to-start, not call-to-call, because the rate limit is a
 * rolling window on actual usage — a call's tokens stay "in window" for the
 * full window duration regardless of how long the call itself took.
 */
async function waitForRateLimitWindow(lastCallStart: number): Promise<number> {
  const elapsed = Date.now() - lastCallStart;
  if (elapsed < INSIGHTS_BATCH_MIN_GAP_MS) {
    await sleep(INSIGHTS_BATCH_MIN_GAP_MS - elapsed);
  }
  return Date.now();
}

/**
 * Generates the Q&A-format insights from whatever analysis already exists —
 * a fast, standalone step that does NOT re-run the per-review analysis
 * pipeline. Safe to call any time after at least some reviews are analyzed.
 *
 * Runs INSIGHTS_BATCH_COUNT independent, non-overlapping batches of
 * INSIGHTS_SAMPLE_SIZE reviews each (every single call stays safely under
 * this org's 30k TPM ceiling on its own), spaced start-to-start to avoid
 * tripping the limit cumulatively (see waitForRateLimitWindow), then merges
 * the per-batch drafts into one final answer per question — so the result
 * reflects far more reviews than any one request's token budget could hold.
 */
export async function POST() {
  try {
    const withAnalysis = await getReviewsWithAnalysis();
    const analyzed = withAnalysis.filter((r) => r.analysis !== null);

    if (analyzed.length === 0) {
      return fail('No analyzed reviews yet — run the analysis pipeline first.', 409);
    }

    const bigSample = sampleByRelevance(withAnalysis, INSIGHTS_SAMPLE_SIZE * INSIGHTS_BATCH_COUNT);
    const batches = chunk(bigSample, INSIGHTS_SAMPLE_SIZE);

    const draftBatches: Awaited<ReturnType<typeof generateInsights>>[] = [];
    let lastCallStart = 0;

    for (const batch of batches) {
      lastCallStart = await waitForRateLimitWindow(lastCallStart);
      const draft = await generateInsights(toSample(batch), DISCOVERY_QUESTIONS);
      draftBatches.push(draft);
    }

    let insightsRaw: Awaited<ReturnType<typeof generateInsights>>;
    if (draftBatches.length > 1) {
      await waitForRateLimitWindow(lastCallStart);
      insightsRaw = await synthesizeInsights(draftBatches, DISCOVERY_QUESTIONS);
    } else {
      insightsRaw = draftBatches[0];
    }

    const insights = insightsRaw.map((i) => ({ id: randomUUID(), ...i }));
    await saveInsights(insights);

    return ok(insights);
  } catch (err) {
    return fail(String(err));
  }
}

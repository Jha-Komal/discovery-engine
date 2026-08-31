import { getReviewsWithAnalysis } from '@/lib/pipeline';
import { computeAggregation } from '@/lib/aggregation';
import { sampleByRelevance } from '@/lib/sampling';
import { generateResearchReport } from '@/lib/ai-service';
import { getResearchReport, saveResearchReport } from '@/lib/store';
import { RESEARCH_REPORT_SAMPLE_SIZE } from '@/lib/constants';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const report = await getResearchReport();
    return ok(report);
  } catch (err) {
    return fail(String(err));
  }
}

/**
 * Regenerates the research report from whatever analysis already exists —
 * standalone, does NOT re-run the per-review analysis pipeline. Safe to call
 * any time after at least some reviews are analyzed.
 */
export async function POST() {
  try {
    const withAnalysis = await getReviewsWithAnalysis();
    const analyzed = withAnalysis.filter((r) => r.analysis !== null);

    if (analyzed.length === 0) {
      return fail('No analyzed reviews yet — run the analysis pipeline first.', 409);
    }

    const stats = computeAggregation(withAnalysis);
    const sample = sampleByRelevance(withAnalysis, RESEARCH_REPORT_SAMPLE_SIZE);

    const content = await generateResearchReport(stats, sample);
    const report = { content, generatedAt: new Date().toISOString(), recordCount: stats.analyzedCount };
    await saveResearchReport(report);

    return ok(report);
  } catch (err) {
    return fail(String(err));
  }
}

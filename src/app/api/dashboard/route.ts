import { getAggregation, getResearchReport, getRecommendations } from '@/lib/store';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const [stats, report, recommendations] = await Promise.all([
      getAggregation(),
      getResearchReport(),
      getRecommendations(),
    ]);

    return ok({
      stats,
      reportGeneratedAt: report?.generatedAt ?? null,
      recommendationsCount: recommendations.length,
    });
  } catch (err) {
    return fail(String(err));
  }
}

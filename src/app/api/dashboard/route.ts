import { getAggregation, getInsights, getOpportunities, getRecommendations } from '@/lib/store';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const [stats, insights, opportunities, recommendations] = await Promise.all([
      getAggregation(),
      getInsights(),
      getOpportunities(),
      getRecommendations(),
    ]);

    return ok({
      stats,
      insightsCount: insights.length,
      opportunitiesCount: opportunities.length,
      recommendationsCount: recommendations.length,
    });
  } catch (err) {
    return fail(String(err));
  }
}

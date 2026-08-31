import type { NextRequest } from 'next/server';
import { getReviewsWithAnalysis } from '@/lib/pipeline';
import { ok, fail } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const sentiment = searchParams.get('sentiment');
    const relevanceClass = searchParams.get('relevanceClass');
    const purchaseIntent = searchParams.get('purchaseIntent');
    const keyword = searchParams.get('keyword')?.toLowerCase();
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '25', 10), 100);

    let reviews = await getReviewsWithAnalysis();

    if (source) reviews = reviews.filter((r) => r.source === source);
    if (sentiment) reviews = reviews.filter((r) => r.analysis?.sentiment.overall.toLowerCase() === sentiment);
    if (relevanceClass) reviews = reviews.filter((r) => r.analysis?.relevance.class === relevanceClass);
    if (purchaseIntent) reviews = reviews.filter((r) => r.analysis?.purchaseIntent.level === purchaseIntent);
    if (keyword) {
      reviews = reviews.filter(
        (r) => r.review.toLowerCase().includes(keyword) || r.title.toLowerCase().includes(keyword)
      );
    }

    const total = reviews.length;
    const start = (page - 1) * limit;
    const paginated = reviews.slice(start, start + limit);

    return ok({ items: paginated, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    return fail(String(err));
  }
}

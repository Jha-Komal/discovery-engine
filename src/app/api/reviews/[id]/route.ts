import { getReviewsWithAnalysis } from '@/lib/pipeline';
import { ok, fail } from '@/lib/api-response';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reviews = await getReviewsWithAnalysis();
    const review = reviews.find((r) => r.id === id);

    if (!review) return fail('Review not found', 404);
    return ok(review);
  } catch (err) {
    return fail(String(err));
  }
}

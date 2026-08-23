import { loadReviews } from '@/lib/pipeline';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const result = await loadReviews();
    return ok(result);
  } catch (err) {
    return fail(String(err));
  }
}

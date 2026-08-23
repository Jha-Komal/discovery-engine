import { getRecommendations } from '@/lib/store';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const recommendations = await getRecommendations();
    return ok(recommendations);
  } catch (err) {
    return fail(String(err));
  }
}

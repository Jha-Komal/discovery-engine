import { getInsights } from '@/lib/store';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const insights = await getInsights();
    return ok(insights);
  } catch (err) {
    return fail(String(err));
  }
}

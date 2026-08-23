import { getOpportunities } from '@/lib/store';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const opportunities = await getOpportunities();
    return ok(opportunities);
  } catch (err) {
    return fail(String(err));
  }
}

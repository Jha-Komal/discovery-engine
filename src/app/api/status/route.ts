import { getStatus } from '@/lib/store';
import { ok, fail } from '@/lib/api-response';

export async function GET() {
  try {
    const status = await getStatus();
    return ok(status);
  } catch (err) {
    return fail(String(err));
  }
}

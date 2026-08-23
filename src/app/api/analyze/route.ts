import { runFullPipeline } from '@/lib/pipeline';
import { getStatus } from '@/lib/store';
import { ok, fail } from '@/lib/api-response';

// Runs the full pipeline in the background and returns immediately.
// Progress is tracked via GET /api/status.
export async function POST() {
  const current = await getStatus();
  const busyStates = [
    'loading',
    'analyzing',
    'aggregating',
    'generating_insights',
    'generating_opportunities',
    'generating_recommendations',
  ];

  if (busyStates.includes(current.status)) {
    return fail('Pipeline is already running', 409);
  }

  // Fire and forget — the pipeline updates generated/status.json as it progresses.
  runFullPipeline().catch((err) => {
    console.error('[Pipeline] Unhandled error:', err);
  });

  return ok({ started: true });
}

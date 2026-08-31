import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { StatusState } from '@/lib/types';

const ACTIVE_STATUSES = new Set([
  'loading',
  'analyzing',
  'aggregating',
  'generating_research_report',
  'generating_recommendations',
]);

export function useStatus() {
  return useQuery({
    queryKey: ['status'],
    queryFn: () => apiFetch<StatusState>('/api/status'),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && ACTIVE_STATUSES.has(status) ? 2000 : false;
    },
  });
}

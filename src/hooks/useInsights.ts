import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { Insight } from '@/lib/types';

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: () => apiFetch<Insight[]>('/api/insights'),
  });
}

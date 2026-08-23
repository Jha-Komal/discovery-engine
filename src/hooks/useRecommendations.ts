import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { Recommendation } from '@/lib/types';

export function useRecommendations() {
  return useQuery({
    queryKey: ['recommendations'],
    queryFn: () => apiFetch<Recommendation[]>('/api/recommendations'),
  });
}

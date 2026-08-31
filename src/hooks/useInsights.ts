import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiPost } from '@/lib/api-client';
import type { Insight } from '@/lib/types';

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: () => apiFetch<Insight[]>('/api/insights'),
  });
}

/** Regenerates insights from already-analyzed reviews — fast, no pipeline re-run. */
export function useGenerateInsights() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<Insight[]>('/api/insights'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insights'] }),
  });
}

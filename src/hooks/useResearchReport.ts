import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiPost } from '@/lib/api-client';
import type { ResearchReport } from '@/lib/types';

export function useResearchReport() {
  return useQuery({
    queryKey: ['research-report'],
    queryFn: () => apiFetch<ResearchReport | null>('/api/research-report'),
  });
}

/** Regenerates the report from already-analyzed reviews — standalone, no pipeline re-run. */
export function useGenerateResearchReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<ResearchReport>('/api/research-report'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['research-report'] }),
  });
}

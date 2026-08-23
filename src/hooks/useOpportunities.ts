import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { OpportunityArea } from '@/lib/types';

export function useOpportunities() {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: () => apiFetch<OpportunityArea[]>('/api/opportunities'),
  });
}

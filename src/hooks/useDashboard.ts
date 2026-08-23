import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { AggregationStats } from '@/lib/types';

export interface DashboardData {
  stats: AggregationStats | null;
  insightsCount: number;
  opportunitiesCount: number;
  recommendationsCount: number;
}

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiFetch<DashboardData>('/api/dashboard'),
  });
}

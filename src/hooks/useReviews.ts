import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { ReviewFilters, ReviewWithAnalysis } from '@/lib/types';

export interface ReviewsPage {
  items: ReviewWithAnalysis[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useReviews(filters: ReviewFilters) {
  const params = new URLSearchParams();
  if (filters.source) params.set('source', filters.source);
  if (filters.sentiment) params.set('sentiment', filters.sentiment);
  if (filters.relevanceClass) params.set('relevanceClass', filters.relevanceClass);
  if (filters.purchaseIntent) params.set('purchaseIntent', filters.purchaseIntent);
  if (filters.keyword) params.set('keyword', filters.keyword);
  params.set('page', String(filters.page ?? 1));
  params.set('limit', String(filters.limit ?? 25));

  return useQuery({
    queryKey: ['reviews', filters],
    queryFn: () => apiFetch<ReviewsPage>(`/api/reviews?${params.toString()}`),
  });
}

export function useReview(id: string | null) {
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => apiFetch<ReviewWithAnalysis>(`/api/reviews/${id}`),
    enabled: !!id,
  });
}

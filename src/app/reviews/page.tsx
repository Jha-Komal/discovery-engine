'use client';

import { useState } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { FilterPanel } from '@/components/shared/FilterPanel';
import { ReviewTable } from '@/components/shared/ReviewTable';
import { ReviewDrawer } from '@/components/shared/ReviewDrawer';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/shared/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useReviews } from '@/hooks/useReviews';
import type { ReviewFilters, ReviewWithAnalysis } from '@/lib/types';

export default function ReviewsPage() {
  const [filters, setFilters] = useState<ReviewFilters>({ page: 1, limit: 25 });
  const [selected, setSelected] = useState<ReviewWithAnalysis | null>(null);
  const { data, isLoading, error, refetch } = useReviews(filters);

  return (
    <>
      <TopNav title="Reviews" subtitle="Explore individual reviews and their AI-extracted analysis" />
      <div className="space-y-4 p-6">
        <FilterPanel filters={filters} onChange={setFilters} />

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader text="Loading reviews..." />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load reviews" message={(error as Error).message} onRetry={() => refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="No reviews found"
            description="Try adjusting your filters, or load and analyze reviews from the Dashboard."
          />
        ) : (
          <>
            <ReviewTable reviews={data.items} onSelect={setSelected} />

            <div className="flex items-center justify-between text-sm text-muted">
              <span>
                Showing {(data.page - 1) * data.limit + 1}-
                {Math.min(data.page * data.limit, data.total)} of {data.total}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page <= 1}
                  onClick={() => setFilters({ ...filters, page: data.page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={data.page >= data.totalPages}
                  onClick={() => setFilters({ ...filters, page: data.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <ReviewDrawer review={selected} onClose={() => setSelected(null)} />
    </>
  );
}

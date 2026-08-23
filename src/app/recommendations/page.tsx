'use client';

import { TopNav } from '@/components/layout/TopNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/shared/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useRecommendations } from '@/hooks/useRecommendations';
import { PRIORITY_LABELS } from '@/lib/constants';
import type { Priority, Recommendation } from '@/lib/types';

const TIERS: Priority[] = ['quick_win', 'medium', 'high', 'long_term'];

function Section({ priority, items }: { priority: Priority; items: Recommendation[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted">
        {PRIORITY_LABELS[priority]}
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((rec) => (
          <Card key={rec.id}>
            <CardHeader className="pb-2">
              <CardTitle>{rec.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted">{rec.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function RecommendationsPage() {
  const { data, isLoading, error, refetch } = useRecommendations();

  return (
    <>
      <TopNav
        title="Recommendations"
        subtitle="Non-monetary product recommendations, prioritized by effort vs. impact"
      />
      <div className="space-y-8 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader text="Loading recommendations..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load recommendations"
            message={(error as Error).message}
            onRetry={() => refetch()}
          />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No recommendations yet"
            description="Run the analysis pipeline from the Dashboard to generate recommendations."
          />
        ) : (
          TIERS.map((tier) => (
            <Section key={tier} priority={tier} items={data.filter((r) => r.priority === tier)} />
          ))
        )}
      </div>
    </>
  );
}

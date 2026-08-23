'use client';

import { LightbulbIcon } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfidenceBar } from '@/components/shared/ConfidenceBar';
import { Loader } from '@/components/shared/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useInsights } from '@/hooks/useInsights';

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const variant = pct >= 80 ? 'positive' : pct < 50 ? 'negative' : 'neutral';
  return <Badge variant={variant}>{pct}% confidence</Badge>;
}

export default function InsightsPage() {
  const { data, isLoading, error, refetch } = useInsights();

  return (
    <>
      <TopNav title="Insights" subtitle="AI-generated answers to the 10 discovery questions" />
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader text="Loading insights..." />
          </div>
        ) : error ? (
          <ErrorState title="Failed to load insights" message={(error as Error).message} onRetry={() => refetch()} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No insights yet"
            description="Run the analysis pipeline from the Dashboard to generate insights."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {data.map((insight) => (
              <Card key={insight.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <LightbulbIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <h3 className="text-sm font-semibold leading-snug text-foreground">
                        {insight.question}
                      </h3>
                    </div>
                    <ConfidenceBadge value={insight.confidence} />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <p className="text-sm leading-relaxed text-muted">{insight.answer}</p>
                  <ConfidenceBar value={insight.confidence} />
                  {insight.supportingReviewIds.length > 0 && (
                    <div>
                      <p className="mb-1.5 text-xs font-medium text-muted">
                        Supporting reviews ({insight.supportingReviewIds.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {insight.supportingReviewIds.slice(0, 8).map((id) => (
                          <span
                            key={id}
                            className="inline-flex items-center rounded bg-muted-background px-1.5 py-0.5 font-mono text-xs text-muted"
                          >
                            {id.slice(0, 10)}…
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

'use client';

import { Target } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader } from '@/components/shared/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useOpportunities } from '@/hooks/useOpportunities';
import { PRIORITY_LABELS } from '@/lib/constants';
import type { Priority } from '@/lib/types';

const PRIORITY_VARIANT: Record<Priority, 'positive' | 'neutral' | 'negative' | 'default'> = {
  quick_win: 'positive',
  medium: 'neutral',
  high: 'default',
  long_term: 'negative',
};

export default function OpportunitiesPage() {
  const { data, isLoading, error, refetch } = useOpportunities();

  return (
    <>
      <TopNav
        title="Opportunity Areas"
        subtitle="Quantified, ranked opportunities to improve wishlist-to-purchase conversion (no monetary incentives)"
      />
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader text="Loading opportunity areas..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to load opportunities"
            message={(error as Error).message}
            onRetry={() => refetch()}
          />
        ) : !data || data.length === 0 ? (
          <EmptyState
            title="No opportunity areas yet"
            description="Run the analysis pipeline from the Dashboard to identify and quantify opportunity areas."
          />
        ) : (
          <div className="space-y-4">
            {data.map((opp, idx) => (
              <Card key={opp.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <h3 className="text-base font-semibold text-foreground">{opp.title}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted">{opp.description}</p>
                      </div>
                    </div>
                    <Badge variant={PRIORITY_VARIANT[opp.priority]}>{PRIORITY_LABELS[opp.priority]}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg bg-primary-light p-3 text-sm font-medium text-primary">
                    {opp.quantifiedMetric}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted">
                      <span>Estimated affected share</span>
                      <span>{Math.round(opp.affectedShare * 100)}%</span>
                    </div>
                    <Progress value={opp.affectedShare * 100} />
                  </div>

                  {opp.relatedBarriers.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {opp.relatedBarriers.map((b) => (
                        <Badge key={b} variant="outline">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <p className="border-t border-border pt-3 text-xs italic text-muted">
                    {opp.comparisonNote}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

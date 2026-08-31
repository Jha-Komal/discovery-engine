'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquareText, ThumbsUp, ThumbsDown, Star, PlayCircle } from 'lucide-react';
import { TopNav } from '@/components/layout/TopNav';
import { MetricCard } from '@/components/shared/MetricCard';
import { SentimentPieChart } from '@/components/charts/SentimentPieChart';
import { DistributionBarChart } from '@/components/charts/DistributionBarChart';
import { ProgressIndicator } from '@/components/shared/ProgressIndicator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader } from '@/components/shared/Loader';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDashboard } from '@/hooks/useDashboard';
import { useStatus } from '@/hooks/useStatus';
import { apiFetch, apiPost } from '@/lib/api-client';

const ACTIVE_STATUSES = new Set([
  'loading',
  'analyzing',
  'aggregating',
  'generating_research_report',
  'generating_recommendations',
]);

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useDashboard();
  const { data: status } = useStatus();
  const queryClient = useQueryClient();

  const loadMutation = useMutation({
    mutationFn: () => apiFetch<{ loaded: number }>('/api/load-reviews'),
    onSuccess: () => queryClient.invalidateQueries(),
  });

  const analyzeMutation = useMutation({
    mutationFn: () => apiPost<{ started: boolean }>('/api/analyze'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['status'] }),
  });

  const isRunning = status ? ACTIVE_STATUSES.has(status.status) : false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState title="Failed to load dashboard" message={(error as Error).message} onRetry={() => refetch()} />
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <>
      <TopNav title="Dashboard" subtitle="Wishlist-to-purchase conversion discovery engine" />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pipeline</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Load cleaned reviews, then run the full AI analysis pipeline.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => loadMutation.mutate()}
                disabled={isRunning || loadMutation.isPending}
              >
                {loadMutation.isPending ? 'Loading...' : 'Load Reviews'}
              </Button>
              <Button
                onClick={() => analyzeMutation.mutate()}
                disabled={isRunning || analyzeMutation.isPending}
              >
                <PlayCircle className="h-4 w-4" />
                {isRunning ? 'Running...' : 'Run Analysis'}
              </Button>
            </div>
          </CardHeader>
          {status && status.status !== 'idle' && (
            <CardContent>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{status.message}</span>
                <span className="text-muted">{status.progress}%</span>
              </div>
              <ProgressIndicator status={status.status} />
            </CardContent>
          )}
        </Card>

        {!stats ? (
          <EmptyState
            title="No analysis yet"
            description="Click Load Reviews, then Run Analysis to generate the dashboard from your Myntra review data."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
              <MetricCard label="Total Reviews" value={stats.totalCount.toLocaleString()} icon={MessageSquareText} />
              <MetricCard label="Analyzed" value={stats.analyzedCount.toLocaleString()} icon={PlayCircle} />
              <MetricCard label="Positive" value={(stats.sentimentDistribution.POSITIVE ?? 0).toLocaleString()} icon={ThumbsUp} tone="positive" />
              <MetricCard label="Negative" value={(stats.sentimentDistribution.NEGATIVE ?? 0).toLocaleString()} icon={ThumbsDown} tone="negative" />
              <MetricCard label="Avg Rating" value={stats.averageRating.toFixed(2)} icon={Star} tone="neutral" />
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <SentimentPieChart
                positive={stats.sentimentDistribution.POSITIVE ?? 0}
                neutral={stats.sentimentDistribution.NEUTRAL ?? 0}
                negative={stats.sentimentDistribution.NEGATIVE ?? 0}
                mixed={stats.sentimentDistribution.MIXED ?? 0}
              />
              <DistributionBarChart title="Source Distribution" data={stats.sourceDistribution} />
              <DistributionBarChart title="Relevance Class" data={stats.relevanceClassDistribution} color="var(--myntra-orange)" />
              <DistributionBarChart title="Top Barriers" data={stats.barrierCategoryFrequency} color="var(--negative)" />
              <DistributionBarChart
                title="Top Uncertainties"
                data={stats.uncertaintyCategoryFrequency}
                color="var(--myntra-pink)"
              />
              <DistributionBarChart
                title="Purchase Intent"
                data={stats.purchaseIntentDistribution}
                color="var(--positive)"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PipelineStatus } from '@/lib/types';

const STAGES: { key: PipelineStatus; label: string }[] = [
  { key: 'loading', label: 'Loading Reviews' },
  { key: 'analyzing', label: 'Analyzing Reviews' },
  { key: 'aggregating', label: 'Generating Statistics' },
  { key: 'generating_research_report', label: 'Generating Research Report' },
  { key: 'generating_recommendations', label: 'Generating Recommendations' },
  { key: 'completed', label: 'Completed' },
];

export function ProgressIndicator({ status }: { status: PipelineStatus }) {
  const currentIdx = STAGES.findIndex((s) => s.key === status);

  return (
    <ol className="space-y-3">
      {STAGES.map((stage, idx) => {
        const isDone = currentIdx > idx || status === 'completed';
        const isActive = stage.key === status;

        return (
          <li key={stage.key} className="flex items-center gap-3">
            {isDone ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-positive" />
            ) : isActive ? (
              <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-border" />
            )}
            <span
              className={cn(
                'text-sm',
                isActive ? 'font-semibold text-foreground' : isDone ? 'text-foreground' : 'text-muted'
              )}
            >
              {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

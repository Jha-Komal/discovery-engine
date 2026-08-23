import { Progress } from '@/components/ui/progress';

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>Confidence</span>
        <span>{pct}%</span>
      </div>
      <Progress value={pct} />
    </div>
  );
}

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-negative/20 bg-negative/5 py-16 text-center">
      <div className="rounded-full bg-negative/10 p-3">
        <AlertTriangle className="h-6 w-6 text-negative" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {message && <p className="max-w-sm text-sm text-muted">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

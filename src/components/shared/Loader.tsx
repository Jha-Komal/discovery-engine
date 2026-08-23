import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Loader({ text, className }: { text?: string; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 text-muted', className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      {text && <p className="text-sm">{text}</p>}
    </div>
  );
}

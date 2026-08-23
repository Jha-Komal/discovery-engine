import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function MetricCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: 'default' | 'positive' | 'negative' | 'neutral';
}) {
  const toneClass = {
    default: 'text-primary bg-primary/10',
    positive: 'text-positive bg-positive/10',
    negative: 'text-negative bg-negative/10',
    neutral: 'text-neutral bg-neutral/10',
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        </div>
        {Icon && (
          <div className={cn('rounded-lg p-2.5', toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

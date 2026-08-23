import { Badge } from '@/components/ui/badge';
import type { Sentiment } from '@/lib/types';

export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const variant = sentiment === 'positive' ? 'positive' : sentiment === 'negative' ? 'negative' : 'neutral';
  return <Badge variant={variant}>{sentiment}</Badge>;
}

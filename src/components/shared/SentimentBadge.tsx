import { Badge } from '@/components/ui/badge';
import type { OverallSentiment } from '@/lib/types';

export function SentimentBadge({ sentiment }: { sentiment: OverallSentiment }) {
  const variant =
    sentiment === 'POSITIVE' ? 'positive' : sentiment === 'NEGATIVE' ? 'negative' : sentiment === 'MIXED' ? 'default' : 'neutral';
  return <Badge variant={variant}>{sentiment.toLowerCase()}</Badge>;
}

import { Badge } from '@/components/ui/badge';
import { SOURCE_LABELS } from '@/lib/constants';

export function SourceBadge({ source }: { source: string }) {
  return <Badge variant="outline">{SOURCE_LABELS[source] ?? source}</Badge>;
}

'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SOURCE_LABELS } from '@/lib/constants';
import type { ReviewFilters } from '@/lib/types';

export function FilterPanel({
  filters,
  onChange,
}: {
  filters: ReviewFilters;
  onChange: (filters: ReviewFilters) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-52 flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Search reviews..."
          className="pl-9"
          defaultValue={filters.keyword ?? ''}
          onChange={(e) => onChange({ ...filters, keyword: e.target.value, page: 1 })}
        />
      </div>

      <Select
        value={filters.source ?? ''}
        onChange={(e) => onChange({ ...filters, source: (e.target.value || undefined) as ReviewFilters['source'], page: 1 })}
      >
        <option value="">All Sources</option>
        {Object.entries(SOURCE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <Select
        value={filters.sentiment ?? ''}
        onChange={(e) => onChange({ ...filters, sentiment: (e.target.value || undefined) as ReviewFilters['sentiment'], page: 1 })}
      >
        <option value="">All Sentiments</option>
        <option value="positive">Positive</option>
        <option value="neutral">Neutral</option>
        <option value="negative">Negative</option>
      </Select>

      <Select
        value={filters.wishlistIntent ?? ''}
        onChange={(e) =>
          onChange({ ...filters, wishlistIntent: (e.target.value || undefined) as ReviewFilters['wishlistIntent'], page: 1 })
        }
      >
        <option value="">All Wishlist Intent</option>
        <option value="genuine_intent">Genuine Intent</option>
        <option value="bookmark_only">Bookmark Only</option>
        <option value="price_tracking">Price Tracking</option>
        <option value="unclear">Unclear</option>
      </Select>
    </div>
  );
}

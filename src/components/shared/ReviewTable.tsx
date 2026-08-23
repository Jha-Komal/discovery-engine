import { SourceBadge } from './SourceBadge';
import { SentimentBadge } from './SentimentBadge';
import type { ReviewWithAnalysis } from '@/lib/types';

export function ReviewTable({
  reviews,
  onSelect,
}: {
  reviews: ReviewWithAnalysis[];
  onSelect: (review: ReviewWithAnalysis) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted-background text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Rating</th>
            <th className="px-4 py-3">Review</th>
            <th className="px-4 py-3">Sentiment</th>
            <th className="px-4 py-3">Wishlist Intent</th>
            <th className="px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr
              key={review.id}
              onClick={() => onSelect(review)}
              className="cursor-pointer border-b border-border last:border-0 hover:bg-muted-background"
            >
              <td className="px-4 py-3">
                <SourceBadge source={review.source} />
              </td>
              <td className="px-4 py-3 text-muted">{review.rating ?? '—'}</td>
              <td className="max-w-md truncate px-4 py-3 text-foreground">{review.review}</td>
              <td className="px-4 py-3">
                {review.analysis ? <SentimentBadge sentiment={review.analysis.sentiment} /> : '—'}
              </td>
              <td className="px-4 py-3 text-muted">{review.analysis?.wishlistIntent ?? '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted">
                {review.reviewDate ? new Date(review.reviewDate).toLocaleDateString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

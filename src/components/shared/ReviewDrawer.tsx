'use client';

import { X } from 'lucide-react';
import { SourceBadge } from './SourceBadge';
import { SentimentBadge } from './SentimentBadge';
import { ConfidenceBar } from './ConfidenceBar';
import { Badge } from '@/components/ui/badge';
import type { ReviewWithAnalysis } from '@/lib/types';

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
    </div>
  );
}

export function ReviewDrawer({
  review,
  onClose,
}: {
  review: ReviewWithAnalysis | null;
  onClose: () => void;
}) {
  if (!review) return null;
  const a = review.analysis;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <SourceBadge source={review.source} />
            {a && <SentimentBadge sentiment={a.sentiment} />}
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-foreground">{review.review}</p>

        {a ? (
          <div className="space-y-4">
            <Field label="Summary" value={a.summary} />
            <Field label="Emotion" value={a.emotion} />
            <Field label="Wishlist Intent" value={a.wishlistIntent} />
            <Field label="Wishlist Motivation" value={a.wishlistMotivation} />
            <Field label="Purchase Barrier" value={a.purchaseBarrier} />
            <Field label="Uncertainty Type" value={a.uncertaintyType} />
            <Field label="Comparison Behavior" value={a.comparisonBehavior} />
            <Field label="External Info Sought" value={a.externalInfoSought} />
            <Field label="Segment Hint" value={a.segmentHint} />

            {a.decisionFactors.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted">Decision Factors</p>
                <div className="flex flex-wrap gap-1.5">
                  {a.decisionFactors.map((f) => (
                    <Badge key={f} variant="outline">
                      {f}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {a.themes.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted">Themes</p>
                <div className="flex flex-wrap gap-1.5">
                  {a.themes.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            {a.painPoints.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted">Pain Points</p>
                <div className="flex flex-wrap gap-1.5">
                  {a.painPoints.map((p) => (
                    <Badge key={p} variant="negative">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <ConfidenceBar value={a.confidence} />
          </div>
        ) : (
          <p className="text-sm text-muted">This review has not been analyzed yet.</p>
        )}
      </div>
    </div>
  );
}

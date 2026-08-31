'use client';

import { X } from 'lucide-react';
import { SourceBadge } from './SourceBadge';
import { SentimentBadge } from './SentimentBadge';
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

function Tags({ label, values, variant }: { label: string; values: string[]; variant?: 'outline' | 'negative' }) {
  if (values.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <Badge key={v} variant={variant}>
            {v}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <div className="space-y-3">{children}</div>
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
            {a && <SentimentBadge sentiment={a.sentiment.overall} />}
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-foreground">{review.review}</p>

        {a ? (
          <div className="space-y-4">
            <Section title="Relevance">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{a.relevance.class}</Badge>
                <Badge variant="muted">{a.relevance.evidenceStrength}</Badge>
              </div>
              <Field label="Reason" value={a.relevance.reason} />
            </Section>

            <Tags label="Journey Stages" values={a.journeyStages} variant="outline" />

            {(a.wishlistBehavior.jobCategory || a.wishlistBehavior.jobDescription) && (
              <Section title="Wishlist Behavior">
                <Field label="Job Category" value={a.wishlistBehavior.jobCategory} />
                <Field label="Job Description" value={a.wishlistBehavior.jobDescription} />
                <Field label="Supporting Evidence" value={a.wishlistBehavior.supportingEvidence} />
              </Section>
            )}

            <Section title="Purchase Intent">
              <div className="flex items-center gap-2">
                <Badge variant={a.purchaseIntent.level === 'HIGH' ? 'positive' : 'outline'}>{a.purchaseIntent.level}</Badge>
                <Badge variant="muted">{a.purchaseIntent.evidenceStrength}</Badge>
              </div>
              <Field label="Reason" value={a.purchaseIntent.reason} />
            </Section>

            {a.barriers.length > 0 && (
              <Section title={`Barriers (${a.barriers.length})`}>
                {a.barriers.map((b, i) => (
                  <div key={i} className="rounded-lg bg-muted-background p-2.5">
                    <div className="mb-1 flex items-center gap-1.5">
                      <Badge variant="negative">{b.category}</Badge>
                      <Badge variant="muted">{b.severity}</Badge>
                    </div>
                    <p className="text-sm text-foreground">{b.description}</p>
                    <p className="mt-1 text-xs italic text-muted">&ldquo;{b.evidence}&rdquo;</p>
                  </div>
                ))}
              </Section>
            )}

            {a.uncertainties.length > 0 && (
              <Section title={`Uncertainties (${a.uncertainties.length})`}>
                {a.uncertainties.map((u, i) => (
                  <div key={i} className="rounded-lg bg-muted-background p-2.5">
                    <Badge variant="outline">{u.category}</Badge>
                    <p className="mt-1 text-sm text-foreground">{u.description}</p>
                    <p className="mt-1 text-xs italic text-muted">&ldquo;{u.evidence}&rdquo;</p>
                  </div>
                ))}
              </Section>
            )}

            {a.postponement.present !== 'UNKNOWN' && (
              <Section title="Postponement">
                <Badge variant={a.postponement.present === 'YES' ? 'negative' : 'muted'}>{a.postponement.present}</Badge>
                <Field label="Reason" value={a.postponement.reason} />
                <Field label="Trigger / Condition" value={a.postponement.triggerOrCondition} />
              </Section>
            )}

            {a.decisionCriteria.length > 0 && (
              <Tags label="Decision Criteria" values={a.decisionCriteria.map((d) => d.criterion)} variant="outline" />
            )}

            {a.comparisonBehavior.present !== 'UNKNOWN' && (
              <Section title="Comparison Behavior">
                <Badge variant={a.comparisonBehavior.present === 'YES' ? 'default' : 'muted'}>{a.comparisonBehavior.present}</Badge>
                <Field label="Items Compared" value={a.comparisonBehavior.itemsCompared} />
                <Field label="Difficulty" value={a.comparisonBehavior.difficulty} />
                <Field label="Outcome" value={a.comparisonBehavior.outcome} />
              </Section>
            )}

            {a.externalInformationSeeking.present !== 'UNKNOWN' && (
              <Section title="External Information-Seeking">
                <Badge variant={a.externalInformationSeeking.present === 'YES' ? 'default' : 'muted'}>
                  {a.externalInformationSeeking.present}
                </Badge>
                <Tags label="Sources" values={a.externalInformationSeeking.sources} variant="outline" />
                <Field label="Platform Info Gap" value={a.externalInformationSeeking.platformInformationGap} />
              </Section>
            )}

            {a.socialValidation.present !== 'UNKNOWN' && (
              <Section title="Social Validation">
                <Badge variant={a.socialValidation.present === 'YES' ? 'default' : 'muted'}>{a.socialValidation.present}</Badge>
                <Field label="Source" value={a.socialValidation.source} />
                <Field label="Validation Needed" value={a.socialValidation.validationNeeded} />
              </Section>
            )}

            <Tags label="Workarounds" values={a.workarounds} variant="outline" />
            <Tags label="Segment Signals" values={a.segmentSignals.map((s) => s.segment)} variant="outline" />
            <Tags label="Emotions" values={a.sentiment.emotions} />

            {a.decisionOutcome.status !== 'UNKNOWN' && (
              <Section title="Decision Outcome">
                <Badge variant="outline">{a.decisionOutcome.status}</Badge>
                <Field label="Evidence" value={a.decisionOutcome.evidence} />
              </Section>
            )}

            <Section title="Business-Metric Connection">
              <Badge variant={a.metricConnection.relevance === 'HIGH' ? 'positive' : 'outline'}>{a.metricConnection.relevance}</Badge>
              <Field label="Reason" value={a.metricConnection.reason} />
            </Section>

            <Section title="Evidence Quote">
              <p className="text-sm italic text-foreground">&ldquo;{a.evidenceQuote}&rdquo;</p>
            </Section>

            <Section title="Researcher Note">
              <p className="text-sm text-foreground">{a.researcherNote}</p>
            </Section>
          </div>
        ) : (
          <p className="text-sm text-muted">This review has not been analyzed yet.</p>
        )}
      </div>
    </div>
  );
}

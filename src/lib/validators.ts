import { z } from 'zod';

/**
 * A zod enum that tolerates model drift (wrong case, a synonym, a missing
 * field) instead of throwing and failing the whole batch — falls back to
 * `fallback` for anything that doesn't match. Only used for the schema's
 * fixed-vocabulary fields; open-ended taxonomy fields (barrier category,
 * theme, etc.) stay as plain strings per the prompt's "don't restrict
 * yourself to this taxonomy" instruction.
 */
function looseEnum<const T extends readonly [string, ...string[]]>(values: T, fallback: T[number]) {
  return z.preprocess((val) => {
    if (typeof val !== 'string') return fallback;
    const upper = val.trim().toUpperCase().replace(/\s+/g, '_');
    return (values as readonly string[]).includes(upper) ? upper : fallback;
  }, z.enum(values));
}

const evidenceStrength = looseEnum(['EXPLICIT', 'STRONG_INFERENCE', 'WEAK_INFERENCE', 'UNKNOWN'] as const, 'UNKNOWN');
const intentEvidenceStrength = looseEnum(['EXPLICIT', 'STRONG_INFERENCE', 'UNKNOWN'] as const, 'UNKNOWN');
const triState = looseEnum(['YES', 'NO', 'UNKNOWN'] as const, 'UNKNOWN');
const severity = looseEnum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'] as const, 'UNKNOWN');

const nullableString = z.string().nullable().optional().transform((v) => v ?? null);
const stringArray = z.array(z.string()).optional().transform((v) => v ?? []);

const BarrierSchema = z.object({
  category: z.string(),
  description: z.string(),
  severity,
  evidence_strength: evidenceStrength,
  evidence: z.string(),
});

const UncertaintySchema = z.object({
  category: z.string(),
  description: z.string(),
  evidence_strength: evidenceStrength,
  evidence: z.string(),
});

const DecisionCriterionSchema = z.object({
  criterion: z.string(),
  evidence: z.string(),
});

const SegmentSignalSchema = z.object({
  segment: z.string(),
  evidence: z.string(),
});

export const AnalysisResultSchema = z.object({
  record_id: z.string(),
  source: z.string().optional(),
  date: nullableString,
  rating: z.number().nullable().optional().transform((v) => v ?? null),

  relevance: z.object({
    class: looseEnum(['DIRECT_WISHLIST', 'ADJACENT_DECISION', 'GENERAL_ECOMMERCE', 'IRRELEVANT'] as const, 'IRRELEVANT'),
    reason: z.string(),
    evidence_strength: evidenceStrength,
  }),

  journey_stages: stringArray,

  wishlist_behavior: z
    .object({
      job_category: nullableString,
      job_description: nullableString,
      supporting_evidence: nullableString,
    })
    .optional()
    .transform((v) => v ?? { job_category: null, job_description: null, supporting_evidence: null }),

  purchase_intent: z.object({
    level: looseEnum(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'] as const, 'UNKNOWN'),
    reason: nullableString,
    evidence_strength: intentEvidenceStrength,
  }),

  barriers: z.array(BarrierSchema).optional().transform((v) => v ?? []),
  uncertainties: z.array(UncertaintySchema).optional().transform((v) => v ?? []),

  postponement: z
    .object({
      present: triState,
      reason: nullableString,
      trigger_or_condition: nullableString,
    })
    .optional()
    .transform((v) => v ?? { present: 'UNKNOWN' as const, reason: null, trigger_or_condition: null }),

  decision_criteria: z.array(DecisionCriterionSchema).optional().transform((v) => v ?? []),

  comparison_behavior: z
    .object({
      present: triState,
      items_compared: nullableString,
      comparison_dimensions: stringArray,
      difficulty: nullableString,
      outcome: nullableString,
    })
    .optional()
    .transform(
      (v) =>
        v ?? {
          present: 'UNKNOWN' as const,
          items_compared: null,
          comparison_dimensions: [],
          difficulty: null,
          outcome: null,
        }
    ),

  external_information_seeking: z
    .object({
      present: triState,
      sources: stringArray,
      information_sought: stringArray,
      platform_information_gap: nullableString,
      evidence: nullableString,
    })
    .optional()
    .transform(
      (v) =>
        v ?? {
          present: 'UNKNOWN' as const,
          sources: [],
          information_sought: [],
          platform_information_gap: null,
          evidence: null,
        }
    ),

  social_validation: z
    .object({
      present: triState,
      source: nullableString,
      validation_needed: nullableString,
      evidence: nullableString,
    })
    .optional()
    .transform((v) => v ?? { present: 'UNKNOWN' as const, source: null, validation_needed: null, evidence: null }),

  workarounds: stringArray,
  segment_signals: z.array(SegmentSignalSchema).optional().transform((v) => v ?? []),

  sentiment: z.object({
    overall: looseEnum(['POSITIVE', 'NEGATIVE', 'MIXED', 'NEUTRAL'] as const, 'NEUTRAL'),
    emotions: stringArray,
  }),

  decision_outcome: z
    .object({
      status: looseEnum(
        ['PURCHASED', 'POSTPONED', 'ABANDONED', 'SWITCHED_PRODUCT', 'SWITCHED_PLATFORM', 'STILL_CONSIDERING', 'UNKNOWN'] as const,
        'UNKNOWN'
      ),
      evidence: nullableString,
    })
    .optional()
    .transform((v) => v ?? { status: 'UNKNOWN' as const, evidence: null }),

  metric_connection: z.object({
    relevance: looseEnum(['HIGH', 'MEDIUM', 'LOW', 'NONE'] as const, 'NONE'),
    reason: z.string(),
  }),

  evidence_quote: z.string().optional().transform((v) => v ?? ''),
  researcher_note: z.string().optional().transform((v) => v ?? ''),
});

export const AnalysisResultArraySchema = z.array(AnalysisResultSchema);

export const InsightSchema = z.object({
  question: z.string(),
  answer: z.string(),
  confidence: z.number().min(0).max(1),
});

export const InsightArraySchema = z.array(InsightSchema);

export const RecommendationSchema = z.object({
  priority: z.enum(['quick_win', 'medium', 'high', 'long_term']),
  title: z.string(),
  description: z.string(),
});

export const RecommendationArraySchema = z.array(RecommendationSchema);

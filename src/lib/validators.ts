import { z } from 'zod';

export const AnalysisResultSchema = z.object({
  id: z.string(),
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  emotion: z.string(),
  themes: z.array(z.string()),
  painPoints: z.array(z.string()),
  featureRequests: z.array(z.string()),
  summary: z.string(),
  confidence: z.number().min(0).max(1),
  wishlistMotivation: z.string().nullable(),
  purchaseBarrier: z.string().nullable(),
  uncertaintyType: z.string().nullable(),
  comparisonBehavior: z.string().nullable(),
  externalInfoSought: z.string().nullable(),
  decisionFactors: z.array(
    z.enum([
      'fit',
      'size',
      'styling',
      'price',
      'reviews',
      'occasion',
      'social_validation',
      'brand_trust',
      'return_policy',
    ])
  ),
  wishlistIntent: z.enum(['genuine_intent', 'bookmark_only', 'price_tracking', 'unclear']),
  segmentHint: z.string().nullable(),
});

export const AnalysisResultArraySchema = z.array(AnalysisResultSchema);

export const InsightSchema = z.object({
  question: z.string(),
  answer: z.string(),
  confidence: z.number().min(0).max(1),
  supportingReviewIds: z.array(z.string()),
});

export const InsightArraySchema = z.array(InsightSchema);

export const OpportunityAreaSchema = z.object({
  title: z.string(),
  description: z.string(),
  quantifiedMetric: z.string(),
  affectedShare: z.number().min(0).max(1),
  relatedBarriers: z.array(z.string()),
  priority: z.enum(['quick_win', 'medium', 'high', 'long_term']),
  comparisonNote: z.string(),
});

export const OpportunityAreaArraySchema = z.array(OpportunityAreaSchema);

export const RecommendationSchema = z.object({
  priority: z.enum(['quick_win', 'medium', 'high', 'long_term']),
  title: z.string(),
  description: z.string(),
});

export const RecommendationArraySchema = z.array(RecommendationSchema);

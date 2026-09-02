// Core domain types for the Myntra wishlist-to-purchase discovery engine.

export type ReviewSource = 'play_store' | 'app_store' | 'reddit' | 'consumer_complaints';

/** UI-level lowercase sentiment, derived from analysis.sentiment.overall. */
export type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed';

export type Priority = 'quick_win' | 'medium' | 'high' | 'long_term';

export type PipelineStatus =
  | 'idle'
  | 'loading'
  | 'analyzing'
  | 'aggregating'
  | 'generating_research_report'
  | 'generating_recommendations'
  | 'completed'
  | 'error';

export interface Review {
  id: string;
  review: string;
  title: string;
  rating: number | null;
  source: ReviewSource;
  author: string | null;
  reviewDate: string | null;
  url: string | null;
}

export type EvidenceStrength = 'EXPLICIT' | 'STRONG_INFERENCE' | 'WEAK_INFERENCE' | 'UNKNOWN';
export type RelevanceClass = 'DIRECT_WISHLIST' | 'ADJACENT_DECISION' | 'GENERAL_ECOMMERCE' | 'IRRELEVANT';
export type PurchaseIntentLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type Severity = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type TriState = 'YES' | 'NO' | 'UNKNOWN';
export type OverallSentiment = 'POSITIVE' | 'NEGATIVE' | 'MIXED' | 'NEUTRAL';
export type DecisionOutcomeStatus =
  | 'PURCHASED'
  | 'POSTPONED'
  | 'ABANDONED'
  | 'SWITCHED_PRODUCT'
  | 'SWITCHED_PLATFORM'
  | 'STILL_CONSIDERING'
  | 'UNKNOWN';
export type MetricRelevance = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface Barrier {
  category: string;
  description: string;
  evidence: string;
  severity: Severity;
  evidenceStrength: EvidenceStrength;
}

export interface Uncertainty {
  category: string;
  description: string;
  evidence: string;
  evidenceStrength: EvidenceStrength;
}

export interface DecisionCriterion {
  criterion: string;
  evidence: string;
}

export interface SegmentSignal {
  segment: string;
  evidence: string;
}

/**
 * Per-review AI evidence-extraction result. Mirrors the deep-research prompt's
 * output contract 1:1 (see prompts/review-analysis.prompt.ts) — this stage
 * extracts evidence only, it does not draw conclusions or propose solutions.
 */
export interface ReviewAnalysis {
  reviewId: string;

  relevance: {
    class: RelevanceClass;
    reason: string;
    evidenceStrength: EvidenceStrength;
  };

  journeyStages: string[];

  wishlistBehavior: {
    jobCategory: string | null;
    jobDescription: string | null;
    supportingEvidence: string | null;
  };

  purchaseIntent: {
    level: PurchaseIntentLevel;
    reason: string | null;
    evidenceStrength: EvidenceStrength;
  };

  barriers: Barrier[];
  uncertainties: Uncertainty[];

  postponement: {
    present: TriState;
    reason: string | null;
    triggerOrCondition: string | null;
  };

  decisionCriteria: DecisionCriterion[];

  comparisonBehavior: {
    present: TriState;
    itemsCompared: string | null;
    comparisonDimensions: string[];
    difficulty: string | null;
    outcome: string | null;
  };

  externalInformationSeeking: {
    present: TriState;
    sources: string[];
    informationSought: string[];
    platformInformationGap: string | null;
    evidence: string | null;
  };

  socialValidation: {
    present: TriState;
    source: string | null;
    validationNeeded: string | null;
    evidence: string | null;
  };

  workarounds: string[];
  segmentSignals: SegmentSignal[];

  sentiment: {
    overall: OverallSentiment;
    emotions: string[];
  };

  decisionOutcome: {
    status: DecisionOutcomeStatus;
    evidence: string | null;
  };

  metricConnection: {
    relevance: MetricRelevance;
    reason: string;
  };

  evidenceQuote: string;
  researcherNote: string;
}

export interface ReviewWithAnalysis extends Review {
  analysis: ReviewAnalysis | null;
}

/** Count of a category broken down by the relevance class of the records it came from. */
export type ByRelevanceClass = Record<RelevanceClass, number>;

export interface AggregationStats {
  totalCount: number;
  analyzedCount: number;
  averageRating: number;
  sourceDistribution: Record<string, number>;

  /** Exact, authoritative counts — any relevance-class attribution elsewhere must be
   *  consistent with these totals (e.g. a DIRECT_WISHLIST-attributed count can never
   *  exceed relevanceClassDistribution.DIRECT_WISHLIST). */
  relevanceClassDistribution: Record<string, number>;
  journeyStageFrequency: Record<string, number>;

  wishlistJobCategoryDistribution: Record<string, number>;
  wishlistJobCategoryByRelevanceClass: Record<string, ByRelevanceClass>;

  purchaseIntentDistribution: Record<string, number>;
  purchaseIntentByRelevanceClass: Record<string, ByRelevanceClass>;

  barrierCategoryFrequency: Record<string, number>;
  barrierCategoryByRelevanceClass: Record<string, ByRelevanceClass>;
  barrierSeverityDistribution: Record<string, number>;

  uncertaintyCategoryFrequency: Record<string, number>;
  uncertaintyCategoryByRelevanceClass: Record<string, ByRelevanceClass>;

  postponementPresentDistribution: Record<string, number>;
  postponementReasonFrequency: Record<string, number>;
  postponementReasonByRelevanceClass: Record<string, ByRelevanceClass>;

  decisionCriteriaFrequency: Record<string, number>;
  decisionCriteriaByRelevanceClass: Record<string, ByRelevanceClass>;

  comparisonPresentDistribution: Record<string, number>;

  externalInfoSourceFrequency: Record<string, number>;
  externalInfoSourceByRelevanceClass: Record<string, ByRelevanceClass>;

  socialValidationPresentDistribution: Record<string, number>;

  workaroundFrequency: Record<string, number>;
  workaroundByRelevanceClass: Record<string, ByRelevanceClass>;

  segmentSignalFrequency: Record<string, number>;
  segmentSignalByRelevanceClass: Record<string, ByRelevanceClass>;

  sentimentDistribution: Record<string, number>;
  emotionFrequency: Record<string, number>;

  decisionOutcomeDistribution: Record<string, number>;

  metricRelevanceDistribution: Record<string, number>;
}

/** Quick Q&A-format answer to one of the 10 discovery questions — a lighter, scannable
 *  companion to the full research report's Q1-10 section, generated as its own fast
 *  standalone step from already-computed analysis/aggregation. */
export interface Insight {
  id: string;
  question: string;
  answer: string;
  confidence: number;
}

/**
 * Cross-review synthesis report: data quality, the 10 discovery questions,
 * behavioral chains, segment×problem matrix, and ranked opportunity
 * hypotheses. Research-only (no feature/solution proposals) — see
 * prompts/research-report.prompt.ts. Free-text/markdown, not small JSON
 * objects, since it's a full structured report rather than a dashboard list.
 */
export interface ResearchReport {
  content: string;
  generatedAt: string;
  /** How many analyzed reviews fed into this report (denominator context) */
  recordCount: number;
}

export interface Recommendation {
  id: string;
  priority: Priority;
  title: string;
  description: string;
  /** e.g. "20 occurrences" — pulled from the opportunity's EVIDENCE count in the research report */
  evidence: string;
  observedBehavior: string;
  /** e.g. "product evaluation → move-to-bag" */
  affectedJourney: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  /** What still needs interview/data validation before treating this as settled */
  unknowns: string;
}

export interface StatusState {
  status: PipelineStatus;
  progress: number;
  message: string;
  updatedAt: string;
}

export interface ReviewFilters {
  source?: ReviewSource;
  sentiment?: Sentiment;
  relevanceClass?: RelevanceClass;
  purchaseIntent?: PurchaseIntentLevel;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

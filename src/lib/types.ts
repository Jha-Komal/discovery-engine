// Core domain types for the Myntra wishlist-to-purchase discovery engine.

export type ReviewSource = 'play_store' | 'app_store' | 'reddit' | 'consumer_complaints';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export type WishlistIntent = 'genuine_intent' | 'bookmark_only' | 'price_tracking' | 'unclear';

export type Priority = 'quick_win' | 'medium' | 'high' | 'long_term';

export type PipelineStatus =
  | 'idle'
  | 'loading'
  | 'analyzing'
  | 'aggregating'
  | 'generating_insights'
  | 'generating_opportunities'
  | 'generating_recommendations'
  | 'completed'
  | 'error';

export type DecisionFactor =
  | 'fit'
  | 'size'
  | 'styling'
  | 'price'
  | 'reviews'
  | 'occasion'
  | 'social_validation'
  | 'brand_trust'
  | 'return_policy';

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

/** Per-review AI extraction result, tailored to wishlist-to-purchase research questions. */
export interface ReviewAnalysis {
  reviewId: string;
  sentiment: Sentiment;
  emotion: string;
  themes: string[];
  painPoints: string[];
  featureRequests: string[];
  summary: string;
  confidence: number;

  /** Why the item was likely added to a wishlist (price-wait, uncertain-fit, gift-idea, ...) */
  wishlistMotivation: string | null;
  /** What's blocking purchase conversion (price, fit uncertainty, size unavailable, ...) */
  purchaseBarrier: string | null;
  /** Residual doubt remaining after the user shortlisted the product */
  uncertaintyType: string | null;
  /** How the user compares shortlisted/wishlisted products */
  comparisonBehavior: string | null;
  /** Where the user looks outside the app for validation/info */
  externalInfoSought: string | null;
  /** Which purchase-decision factors are mentioned */
  decisionFactors: DecisionFactor[];
  /** Genuine purchase intent vs. just bookmarking vs. price tracking */
  wishlistIntent: WishlistIntent;
  /** Freeform tag hinting at the user segment this review reveals, if any */
  segmentHint: string | null;
}

export interface ReviewWithAnalysis extends Review {
  analysis: ReviewAnalysis | null;
}

export interface AggregationStats {
  totalCount: number;
  analyzedCount: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  averageRating: number;
  sourceDistribution: Record<string, number>;
  themeFrequency: Record<string, number>;
  painPointFrequency: Record<string, number>;
  emotionFrequency: Record<string, number>;
  wishlistMotivationDistribution: Record<string, number>;
  purchaseBarrierDistribution: Record<string, number>;
  uncertaintyTypeDistribution: Record<string, number>;
  comparisonBehaviorDistribution: Record<string, number>;
  externalInfoSoughtDistribution: Record<string, number>;
  decisionFactorDistribution: Record<string, number>;
  wishlistIntentDistribution: Record<string, number>;
  segmentHintDistribution: Record<string, number>;
}

export interface Insight {
  id: string;
  question: string;
  answer: string;
  confidence: number;
  supportingReviewIds: string[];
}

/** A quantified, comparable opportunity area that could move the wishlist→purchase metric. */
export interface OpportunityArea {
  id: string;
  title: string;
  description: string;
  /** e.g. "38% of genuine-intent wishlist reviews cite fit/size uncertainty" */
  quantifiedMetric: string;
  /** Estimated share of relevant reviews affected, 0-1 */
  affectedShare: number;
  relatedBarriers: string[];
  priority: Priority;
  /** How this opportunity compares in size/impact to the others */
  comparisonNote: string;
}

export interface Recommendation {
  id: string;
  priority: Priority;
  title: string;
  description: string;
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
  wishlistIntent?: WishlistIntent;
  theme?: string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

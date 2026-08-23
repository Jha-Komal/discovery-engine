export const ANALYSIS_BATCH_SIZE = 10;

/** The 10 discovery questions the Growth Team needs answered. */
export const DISCOVERY_QUESTIONS = [
  'Why do users add fashion products to their wishlist?',
  'What prevents wishlisted products from eventually being purchased?',
  'What uncertainties remain after users have identified a product they like?',
  'What causes users to postpone a purchase?',
  'How do users compare multiple shortlisted products?',
  'What information do users seek outside Myntra/AJIO before purchasing?',
  'What role do fit, size, styling, price, reviews, occasion and social validation play?',
  'When do users use the wishlist as genuine purchase intent versus simply as a bookmarking mechanism?',
  'How do these behaviors differ across user segments?',
  'What unmet needs emerge consistently across user conversations?',
] as const;

export const SOURCE_LABELS: Record<string, string> = {
  play_store: 'Play Store',
  app_store: 'App Store',
  reddit: 'Reddit',
  consumer_complaints: 'Consumer Complaints',
};

export const PRIORITY_LABELS: Record<string, string> = {
  quick_win: 'Quick Win',
  medium: 'Medium Priority',
  high: 'High Priority',
  long_term: 'Long-Term',
};

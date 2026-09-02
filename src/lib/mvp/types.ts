export type ComparePriority = 'fit' | 'quality' | 'price' | 'reviews' | 'occasion fit' | 'delivery';

export const COMPARE_PRIORITIES: ComparePriority[] = [
  'fit',
  'quality',
  'price',
  'reviews',
  'occasion fit',
  'delivery',
];

export interface ShopReview {
  id: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  daysAgo: number;
  verified: boolean;
}

export interface ShopProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  emoji: string;
  swatch: string;
  price: number;
  mrp: number;
  avgRating: number;
  ratingCount: number;
  attributes: {
    fabric: string;
    fit: string;
    occasion: string;
    reusability: string;
    deliveryEstimate: string;
    returnPolicy: string;
  };
  reviews: ShopReview[];
}

export interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  /** User messages (the follow-up question). AI messages use `points` instead. */
  text: string;
  /** AI replies render as 3-4 short bullet points instead of prose. */
  points?: string[];
  /** The product this AI message recommends as the best pick, if any. */
  bestProductId?: string;
}

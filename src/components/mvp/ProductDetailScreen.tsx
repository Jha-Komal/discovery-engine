import { ArrowLeft, Heart, Star, Truck, RotateCcw, ShoppingBag } from 'lucide-react';
import type { ShopProduct } from '@/lib/mvp/types';

interface ProductDetailScreenProps {
  product: ShopProduct;
  wishlisted: boolean;
  onToggleWishlist: () => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
  inBag: boolean;
  onAddToBag: () => void;
  onGoToBag: () => void;
  onBack: () => void;
}

const ATTRIBUTE_ROWS: { key: keyof ShopProduct['attributes']; label: string }[] = [
  { key: 'fabric', label: 'Fabric' },
  { key: 'fit', label: 'Fit' },
  { key: 'occasion', label: 'Occasion' },
  { key: 'reusability', label: 'Reusability' },
];

export function ProductDetailScreen({
  product,
  wishlisted,
  onToggleWishlist,
  wishlistCount,
  onOpenWishlist,
  inBag,
  onAddToBag,
  onGoToBag,
  onBack,
}: ProductDetailScreenProps) {
  const discount = Math.round((1 - product.price / product.mrp) * 100);
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="flex min-h-full flex-col bg-white pb-4">
      <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button onClick={onBack}>
          <ArrowLeft className="h-5 w-5 text-neutral-700" />
        </button>
        <button onClick={onOpenWishlist} aria-label="Open wishlist" className="relative">
          <Heart className="h-5 w-5 text-neutral-700" />
          {wishlistCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
              {wishlistCount}
            </span>
          )}
        </button>
      </div>

      <div
        className="flex h-64 items-center justify-center text-8xl"
        style={{ background: product.swatch }}
      >
        {product.emoji}
      </div>

      <div className="space-y-2 border-b border-neutral-100 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-800">{product.brand}</p>
        <p className="text-sm text-neutral-600">{product.name}</p>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 rounded bg-green-700 px-1.5 py-0.5 text-xs font-semibold text-white">
            {product.avgRating} <Star className="h-3 w-3 fill-white" />
          </span>
          <span className="text-xs text-neutral-500">{product.ratingCount} Ratings</span>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xl font-bold text-neutral-900">₹{product.price}</span>
          <span className="text-sm text-neutral-400 line-through">₹{product.mrp}</span>
          <span className="text-sm font-semibold text-green-700">{discount}% OFF</span>
        </div>
      </div>

      <div className="space-y-2 border-b border-neutral-100 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <Truck className="h-4 w-4 text-neutral-500" />
          Delivery in {product.attributes.deliveryEstimate}
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <RotateCcw className="h-4 w-4 text-neutral-500" />
          {product.attributes.returnPolicy}
        </div>
      </div>

      <div className="space-y-2.5 border-b border-neutral-100 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Product Details</p>
        {ATTRIBUTE_ROWS.map(({ key, label }) => (
          <div key={key} className="flex gap-3 text-xs">
            <span className="w-24 shrink-0 text-neutral-400">{label}</span>
            <span className="text-neutral-700">{product.attributes[key]}</span>
          </div>
        ))}
      </div>

      <div className="space-y-3 px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Ratings &amp; Reviews</p>
          <span className="text-xs text-neutral-500">{product.reviews.length} shown</span>
        </div>

        <div className="flex items-center gap-4 rounded-lg bg-neutral-50 p-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-neutral-900">{product.avgRating}</p>
            <p className="text-[10px] text-neutral-500">{product.ratingCount} ratings</p>
          </div>
          <div className="flex-1 space-y-1">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-1.5 text-[10px] text-neutral-500">
                <span className="w-2.5">{star}★</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full bg-green-700"
                    style={{ width: `${(count / product.reviews.length) * 100}%` }}
                  />
                </div>
                <span className="w-4 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {product.reviews.map((review) => (
            <div key={review.id} className="border-b border-neutral-100 pb-3 last:border-0">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-0.5 rounded bg-green-700 px-1 py-px text-[10px] font-semibold text-white">
                  {review.rating} <Star className="h-2.5 w-2.5 fill-white" />
                </span>
                <span className="text-xs font-semibold text-neutral-800">{review.author}</span>
                {review.verified && (
                  <span className="text-[10px] font-medium text-green-700">Verified Purchase</span>
                )}
              </div>
              <p className="pt-1 text-xs leading-relaxed text-neutral-600">{review.text}</p>
              <p className="pt-1 text-[10px] text-neutral-400">{review.daysAgo} days ago</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 flex gap-2 border-t border-neutral-200 bg-white p-3">
        <button
          onClick={onToggleWishlist}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-bold ${
            wishlisted ? 'border-primary text-primary' : 'border-neutral-300 text-neutral-700'
          }`}
        >
          <Heart className="h-4 w-4" fill={wishlisted ? '#ff3f6c' : 'none'} />
          {wishlisted ? 'Wishlisted' : 'Wishlist'}
        </button>
        <button
          onClick={inBag ? onGoToBag : onAddToBag}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white"
        >
          <ShoppingBag className="h-4 w-4" />
          {inBag ? 'Go to Bag' : 'Add to Bag'}
        </button>
      </div>
    </div>
  );
}

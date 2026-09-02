import { Heart, Check } from 'lucide-react';
import type { ShopProduct } from '@/lib/mvp/types';

interface ProductCardProps {
  product: ShopProduct;
  wishlisted: boolean;
  onToggleWishlist: () => void;
  onOpenDetail: () => void;
}

export function ProductCard({ product, wishlisted, onToggleWishlist, onOpenDetail }: ProductCardProps) {
  const discount = Math.round((1 - product.price / product.mrp) * 100);

  return (
    <div
      onClick={onOpenDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpenDetail()}
      className="cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white text-left"
    >
      <div
        className="relative flex h-32 items-center justify-center text-5xl"
        style={{ background: product.swatch }}
      >
        <span>{product.emoji}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm"
        >
          <Heart
            className="h-4 w-4"
            fill={wishlisted ? '#ff3f6c' : 'none'}
            color={wishlisted ? '#ff3f6c' : '#333'}
          />
        </button>
      </div>
      <div className="space-y-0.5 p-2.5">
        <p className="truncate text-[11px] font-bold uppercase tracking-wide text-neutral-800">{product.brand}</p>
        <p className="line-clamp-2 text-[11px] leading-tight text-neutral-600">{product.name}</p>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-sm font-bold text-neutral-900">₹{product.price}</span>
          <span className="text-[11px] text-neutral-400 line-through">₹{product.mrp}</span>
          <span className="text-[11px] font-semibold text-green-700">{discount}% OFF</span>
        </div>
        <div className="flex items-center gap-1 pt-0.5 text-[11px] text-neutral-500">
          <span className="rounded bg-green-700 px-1 py-px text-[10px] font-semibold text-white">
            {product.avgRating}★
          </span>
          <span>({product.ratingCount})</span>
        </div>
      </div>
    </div>
  );
}

export function TrendingCard({ product, wishlisted, onToggleWishlist, onOpenDetail }: ProductCardProps) {
  return (
    <div
      onClick={onOpenDetail}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpenDetail()}
      className="w-28 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-neutral-200 bg-white text-left"
    >
      <div
        className="relative flex h-24 items-center justify-center text-4xl"
        style={{ background: product.swatch }}
      >
        <span>{product.emoji}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm"
        >
          <Heart
            className="h-3.5 w-3.5"
            fill={wishlisted ? '#ff3f6c' : 'none'}
            color={wishlisted ? '#ff3f6c' : '#333'}
          />
        </button>
      </div>
      <div className="space-y-0.5 p-1.5">
        <p className="truncate text-[10px] font-bold uppercase text-neutral-800">{product.brand}</p>
        <p className="text-[11px] font-bold text-neutral-900">₹{product.price}</p>
        <p className="text-[10px] text-neutral-500">{product.avgRating}★</p>
      </div>
    </div>
  );
}

export function ProductRowSelectable({
  product,
  selected,
  disabled,
  onToggle,
}: {
  product: ShopProduct;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled && !selected}
      className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white'
      } ${disabled && !selected ? 'opacity-40' : ''}`}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-2xl"
        style={{ background: product.swatch }}
      >
        {product.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-bold uppercase text-neutral-800">{product.brand}</p>
        <p className="truncate text-xs text-neutral-600">{product.name}</p>
        <p className="text-xs font-bold text-neutral-900">₹{product.price}</p>
      </div>
      <div
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          selected ? 'border-primary bg-primary' : 'border-neutral-300'
        }`}
      >
        {selected && <Check className="h-3 w-3 text-white" />}
      </div>
    </button>
  );
}

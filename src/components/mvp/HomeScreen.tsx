import { Heart, Search } from 'lucide-react';
import { getCategories, getTrendingProducts } from '@/lib/mvp/catalog';
import { TrendingCard } from './ProductCard';

interface HomeScreenProps {
  wishlist: Set<string>;
  onToggleWishlist: (id: string) => void;
  onOpenWishlist: () => void;
  onOpenProducts: (category: string | null) => void;
  onOpenProduct: (id: string) => void;
}

export function HomeScreen({
  wishlist,
  onToggleWishlist,
  onOpenWishlist,
  onOpenProducts,
  onOpenProduct,
}: HomeScreenProps) {
  const categories = getCategories();
  const trending = getTrendingProducts();

  return (
    <div className="min-h-full bg-neutral-50 pb-6">
      <div className="sticky top-0 z-20 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-lg font-black italic tracking-tight text-primary">Myntra</span>
          <button onClick={onOpenWishlist} className="relative">
            <Heart className="h-5 w-5 text-neutral-700" />
            {wishlist.size > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                {wishlist.size}
              </span>
            )}
          </button>
        </div>
        <button
          onClick={() => onOpenProducts(null)}
          className="mt-2.5 flex w-full items-center gap-2 rounded-full bg-neutral-100 px-3 py-2 text-left text-xs text-neutral-400"
        >
          <Search className="h-3.5 w-3.5" />
          Search for products, brands and more
        </button>
      </div>

      <button
        onClick={() => onOpenProducts(null)}
        className="mx-3 mt-3 block w-[calc(100%-1.5rem)] overflow-hidden rounded-xl text-left"
        style={{ background: 'linear-gradient(135deg,#7a1230,#ff3f6c 60%,#ff905a)' }}
      >
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">Wedding Season Edit</p>
          <p className="mt-1 text-base font-black text-white">Traditional wear, picked for you</p>
          <span className="mt-2 inline-block rounded-full bg-white px-3 py-1 text-[11px] font-bold text-primary">
            Shop Now
          </span>
        </div>
      </button>

      <div className="px-3 pt-4">
        <p className="pb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Shop by Category</p>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((c) => (
            <button
              key={c.category}
              onClick={() => onOpenProducts(c.category)}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                style={{ background: c.swatch }}
              >
                {c.emoji}
              </div>
              <span className="line-clamp-2 text-center text-[9px] leading-tight text-neutral-600">
                {c.category}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <div className="flex items-center justify-between px-3 pb-2">
          <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Trending Now</p>
          <button onClick={() => onOpenProducts(null)} className="text-[11px] font-semibold text-primary">
            View All
          </button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto px-3 pb-1">
          {trending.map((product) => (
            <TrendingCard
              key={product.id}
              product={product}
              wishlisted={wishlist.has(product.id)}
              onToggleWishlist={() => onToggleWishlist(product.id)}
              onOpenDetail={() => onOpenProduct(product.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import { ArrowLeft, Heart } from 'lucide-react';
import { SHOP_PRODUCTS } from '@/lib/mvp/catalog';
import { ProductCard } from './ProductCard';

interface ProductsScreenProps {
  categoryFilter: string | null;
  wishlist: Set<string>;
  onToggleWishlist: (id: string) => void;
  onOpenWishlist: () => void;
  onOpenProduct: (id: string) => void;
  onBack: () => void;
}

export function ProductsScreen({
  categoryFilter,
  wishlist,
  onToggleWishlist,
  onOpenWishlist,
  onOpenProduct,
  onBack,
}: ProductsScreenProps) {
  const products = categoryFilter
    ? SHOP_PRODUCTS.filter((p) => p.category === categoryFilter)
    : SHOP_PRODUCTS;

  return (
    <div className="min-h-full bg-neutral-50 pb-6">
      <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft className="h-5 w-5 text-neutral-700" />
          </button>
          <span className="text-sm font-bold text-neutral-900">{categoryFilter ?? 'All Products'}</span>
        </div>
        <button onClick={onOpenWishlist} className="relative">
          <Heart className="h-5 w-5 text-neutral-700" />
          {wishlist.size > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
              {wishlist.size}
            </span>
          )}
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="grid grid-cols-2 gap-2.5">
          {products.map((product) => (
            <ProductCard
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

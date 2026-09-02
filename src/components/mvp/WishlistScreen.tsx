import { ArrowLeft } from 'lucide-react';
import { getProductById } from '@/lib/mvp/catalog';
import { ProductRowSelectable } from './ProductCard';

const MIN_COMPARE = 2;
const MAX_COMPARE = 4;

interface WishlistScreenProps {
  wishlist: string[];
  selected: string[];
  onToggleSelected: (id: string) => void;
  onBack: () => void;
  onHelpMeChoose: () => void;
}

export function WishlistScreen({
  wishlist,
  selected,
  onToggleSelected,
  onBack,
  onHelpMeChoose,
}: WishlistScreenProps) {
  const products = wishlist.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const canCompare = selected.length >= MIN_COMPARE && selected.length <= MAX_COMPARE;

  return (
    <div className="flex min-h-full flex-col bg-neutral-50">
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <button onClick={onBack}>
          <ArrowLeft className="h-5 w-5 text-neutral-700" />
        </button>
        <span className="text-sm font-bold text-neutral-900">My Wishlist ({products.length})</span>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-sm text-neutral-500">Your wishlist is empty.</p>
          <p className="text-xs text-neutral-400">Tap the heart on products you like to save them here.</p>
        </div>
      ) : (
        <>
          <div className="px-3 pb-2 pt-3">
            <p className="text-xs text-neutral-500">
              Select {MIN_COMPARE}-{MAX_COMPARE} products you&apos;re genuinely deciding between.
            </p>
          </div>
          <div className="flex-1 space-y-2 px-3">
            {products.map((product) => (
              <ProductRowSelectable
                key={product.id}
                product={product}
                selected={selected.includes(product.id)}
                disabled={selected.length >= MAX_COMPARE}
                onToggle={() => onToggleSelected(product.id)}
              />
            ))}
          </div>
          <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-3">
            <button
              onClick={onHelpMeChoose}
              disabled={!canCompare}
              className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white disabled:opacity-40"
            >
              {canCompare
                ? `Help me choose (${selected.length} selected)`
                : `Select ${MIN_COMPARE}-${MAX_COMPARE} to compare`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

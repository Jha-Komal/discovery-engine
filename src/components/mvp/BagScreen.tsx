import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { getProductById } from '@/lib/mvp/catalog';
import type { ShopProduct } from '@/lib/mvp/types';

interface BagScreenProps {
  bag: string[];
  finalist: ShopProduct | null;
  onBack: () => void;
  onProceedToPay: () => void;
}

export function BagScreen({ bag, finalist, onBack, onProceedToPay }: BagScreenProps) {
  const products = bag.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const total = products.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="flex min-h-full flex-col bg-neutral-50">
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <button onClick={onBack}>
          <ArrowLeft className="h-5 w-5 text-neutral-700" />
        </button>
        <span className="text-sm font-bold text-neutral-900">Bag ({products.length})</span>
      </div>

      {finalist && (
        <div className="flex items-center gap-3 border-b border-neutral-200 bg-green-50 p-4">
          <ShoppingBag className="h-5 w-5 shrink-0 text-green-700" />
          <p className="text-xs text-green-800">
            <span className="font-bold">{finalist.name}</span> was moved to your Bag.
          </p>
        </div>
      )}

      <div className="flex-1 space-y-2 p-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-2.5">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md text-2xl"
              style={{ background: product.swatch }}
            >
              {product.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-neutral-800">{product.name}</p>
              <p className="text-xs text-neutral-500">₹{product.price}</p>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="pt-8 text-center text-xs text-neutral-400">Your bag is empty.</p>}
      </div>

      <div className="space-y-2 border-t border-neutral-200 bg-white p-3">
        {products.length > 0 && (
          <div className="flex items-center justify-between px-1 text-sm">
            <span className="text-neutral-500">Total</span>
            <span className="font-bold text-neutral-900">₹{total}</span>
          </div>
        )}
        <button
          onClick={onProceedToPay}
          disabled={products.length === 0}
          className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          {products.length > 0 ? `Proceed to Pay ₹${total}` : 'Bag is empty'}
        </button>
        <button onClick={onBack} className="w-full rounded-lg py-2 text-xs font-semibold text-neutral-500">
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

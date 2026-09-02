'use client';

import { useEffect, useState } from 'react';
import { HomeScreen } from './HomeScreen';
import { ProductsScreen } from './ProductsScreen';
import { ProductDetailScreen } from './ProductDetailScreen';
import { WishlistScreen } from './WishlistScreen';
import { ContextSheet } from './ContextSheet';
import { CompareChat } from './CompareChat';
import { BagScreen } from './BagScreen';
import { PaymentScreen } from './PaymentScreen';
import { OrderPlacedScreen } from './OrderPlacedScreen';
import { getProductById } from '@/lib/mvp/catalog';
import type { ComparePriority } from '@/lib/mvp/types';

type View =
  | 'home'
  | 'products'
  | 'detail'
  | 'wishlist'
  | 'context'
  | 'chat'
  | 'bag'
  | 'payment'
  | 'order-placed';

function generateOrderId(): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
  return `MYN-${random.slice(0, 8).toUpperCase()}`;
}

const WISHLIST_KEY = 'mvp-shop-wishlist';
const BAG_KEY = 'mvp-shop-bag';

function loadStoredIds(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function ShopApp() {
  const [view, setView] = useState<View>('home');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [bag, setBag] = useState<string[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [purchaseContext, setPurchaseContext] = useState('');
  const [priorities, setPriorities] = useState<ComparePriority[]>([]);
  const [lastAddedToBag, setLastAddedToBag] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [viewingProductId, setViewingProductId] = useState<string | null>(null);
  const [detailReturnView, setDetailReturnView] = useState<'home' | 'products'>('home');
  const [placedOrder, setPlacedOrder] = useState<{ id: string; itemCount: number } | null>(null);

  useEffect(() => {
    // Must start empty (matching SSR) and sync from localStorage post-mount —
    // reading it during render would mismatch the server-rendered HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWishlist(loadStoredIds(WISHLIST_KEY));
    setBag(loadStoredIds(BAG_KEY));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    window.localStorage.setItem(BAG_KEY, JSON.stringify(bag));
  }, [bag]);

  function toggleWishlist(id: string) {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectedForCompare(id: string) {
    setSelectedForCompare((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function handleMoveToBag(id: string) {
    setBag((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setLastAddedToBag(id);
    setView('bag');
  }

  function addToBagDirect(id: string) {
    setBag((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setLastAddedToBag(id);
  }

  function openProductDetail(id: string, from: 'home' | 'products') {
    setViewingProductId(id);
    setDetailReturnView(from);
    setView('detail');
  }

  function confirmPayment() {
    setPlacedOrder({ id: generateOrderId(), itemCount: bag.length });
    setBag([]);
    setView('order-placed');
  }

  function continueShoppingAfterOrder() {
    setPlacedOrder(null);
    setLastAddedToBag(null);
    setView('home');
  }

  if (view === 'home') {
    return (
      <HomeScreen
        wishlist={new Set(wishlist)}
        onToggleWishlist={toggleWishlist}
        onOpenWishlist={() => setView('wishlist')}
        onOpenProducts={(category) => {
          setCategoryFilter(category);
          setView('products');
        }}
        onOpenProduct={(id) => openProductDetail(id, 'home')}
      />
    );
  }

  if (view === 'products') {
    return (
      <ProductsScreen
        categoryFilter={categoryFilter}
        wishlist={new Set(wishlist)}
        onToggleWishlist={toggleWishlist}
        onOpenWishlist={() => setView('wishlist')}
        onOpenProduct={(id) => openProductDetail(id, 'products')}
        onBack={() => setView('home')}
      />
    );
  }

  if (view === 'detail') {
    const product = viewingProductId ? getProductById(viewingProductId) : undefined;
    if (!product) {
      return (
        <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-neutral-50 p-6 text-center">
          <p className="text-sm text-neutral-500">Product not found.</p>
          <button
            onClick={() => setView(detailReturnView)}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white"
          >
            Go Back
          </button>
        </div>
      );
    }
    return (
      <ProductDetailScreen
        product={product}
        wishlisted={wishlist.includes(product.id)}
        onToggleWishlist={() => toggleWishlist(product.id)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setView('wishlist')}
        inBag={bag.includes(product.id)}
        onAddToBag={() => addToBagDirect(product.id)}
        onGoToBag={() => setView('bag')}
        onBack={() => setView(detailReturnView)}
      />
    );
  }

  if (view === 'wishlist') {
    return (
      <WishlistScreen
        wishlist={wishlist}
        selected={selectedForCompare}
        onToggleSelected={toggleSelectedForCompare}
        onBack={() => setView('home')}
        onHelpMeChoose={() => setView('context')}
      />
    );
  }

  if (view === 'context') {
    return (
      <ContextSheet
        selected={selectedForCompare}
        bagCount={bag.length}
        onOpenBag={() => setView('bag')}
        onBack={() => setView('wishlist')}
        onSubmit={(context, prios) => {
          setPurchaseContext(context);
          setPriorities(prios);
          setView('chat');
        }}
      />
    );
  }

  if (view === 'chat') {
    return (
      <CompareChat
        selected={selectedForCompare}
        context={purchaseContext}
        priorities={priorities}
        bagCount={bag.length}
        onOpenBag={() => setView('bag')}
        onBack={() => setView('wishlist')}
        onMoveToBag={handleMoveToBag}
      />
    );
  }

  if (view === 'bag') {
    const finalist = lastAddedToBag ? getProductById(lastAddedToBag) : null;
    return (
      <BagScreen
        bag={bag}
        finalist={finalist ?? null}
        onBack={() => setView('home')}
        onProceedToPay={() => setView('payment')}
      />
    );
  }

  if (view === 'payment') {
    return <PaymentScreen bag={bag} onBack={() => setView('bag')} onPay={confirmPayment} />;
  }

  return (
    <OrderPlacedScreen
      orderId={placedOrder?.id ?? ''}
      itemCount={placedOrder?.itemCount ?? 0}
      onContinueShopping={continueShoppingAfterOrder}
    />
  );
}

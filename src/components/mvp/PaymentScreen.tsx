import { useState } from 'react';
import { ArrowLeft, Landmark, CreditCard, Wallet } from 'lucide-react';
import { getProductById } from '@/lib/mvp/catalog';

type PaymentMethod = 'upi' | 'card' | 'cod';

const METHODS: { id: PaymentMethod; label: string; icon: typeof Landmark }[] = [
  { id: 'upi', label: 'UPI', icon: Landmark },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard },
  { id: 'cod', label: 'Cash on Delivery', icon: Wallet },
];

interface PaymentScreenProps {
  bag: string[];
  onBack: () => void;
  onPay: () => void;
}

export function PaymentScreen({ bag, onBack, onPay }: PaymentScreenProps) {
  const [method, setMethod] = useState<PaymentMethod>('upi');
  const products = bag.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const subtotal = products.reduce((sum, p) => sum + p.price, 0);
  const total = subtotal;

  return (
    <div className="flex min-h-full flex-col bg-neutral-50">
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <button onClick={onBack}>
          <ArrowLeft className="h-5 w-5 text-neutral-700" />
        </button>
        <span className="text-sm font-bold text-neutral-900">Payment</span>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Order Summary</p>
          <div className="space-y-1 text-xs text-neutral-600">
            <div className="flex justify-between">
              <span>{products.length} item{products.length !== 1 ? 's' : ''}</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span className="text-green-700">FREE</span>
            </div>
          </div>
          <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 text-sm font-bold text-neutral-900">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Payment Method</p>
          <div className="space-y-2">
            {METHODS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
                  method === id ? 'border-primary bg-primary/5' : 'border-neutral-200 bg-white'
                }`}
              >
                <Icon className="h-4 w-4 text-neutral-600" />
                <span className="flex-1 text-xs font-medium text-neutral-800">{label}</span>
                <div
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    method === id ? 'border-primary' : 'border-neutral-300'
                  }`}
                >
                  {method === id && <div className="h-2 w-2 rounded-full bg-primary" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-auto border-t border-neutral-200 bg-white p-3">
        <button onClick={onPay} className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white">
          Pay ₹{total}
        </button>
      </div>
    </div>
  );
}

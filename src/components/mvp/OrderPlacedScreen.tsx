import { CheckCircle2 } from 'lucide-react';

interface OrderPlacedScreenProps {
  orderId: string;
  itemCount: number;
  onContinueShopping: () => void;
}

export function OrderPlacedScreen({ orderId, itemCount, onContinueShopping }: OrderPlacedScreenProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-white p-6 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-600" />
      <div>
        <p className="text-lg font-bold text-neutral-900">Order Placed!</p>
        <p className="mt-1 text-xs text-neutral-500">
          {itemCount} item{itemCount !== 1 ? 's' : ''} confirmed — thank you for shopping with us.
        </p>
      </div>
      <div className="rounded-lg bg-neutral-50 px-4 py-2 text-xs text-neutral-600">
        Order ID: <span className="font-mono font-semibold text-neutral-800">{orderId}</span>
      </div>
      <p className="text-xs text-neutral-400">Estimated delivery in 4-6 business days</p>
      <button
        onClick={onContinueShopping}
        className="mt-2 w-full max-w-[220px] rounded-lg bg-primary py-3 text-sm font-bold text-white"
      >
        Continue Shopping
      </button>
    </div>
  );
}

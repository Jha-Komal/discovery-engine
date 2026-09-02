import { useState } from 'react';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { getProductById } from '@/lib/mvp/catalog';
import { COMPARE_PRIORITIES, type ComparePriority } from '@/lib/mvp/types';

const QUICK_OCCASIONS = [
  { label: 'For a wedding', context: "Cousin's wedding next month, want something traditional but reusable" },
  { label: 'Office / daily wear', context: 'For daily office wear, need something professional and comfortable' },
  { label: 'Casual outing', context: 'Casual weekend outing, want something comfortable and easy to style' },
  { label: 'Party / date night', context: 'Party or date night, want something that stands out' },
];

interface ContextSheetProps {
  selected: string[];
  bagCount: number;
  onOpenBag: () => void;
  onBack: () => void;
  onSubmit: (context: string, priorities: ComparePriority[]) => void;
}

export function ContextSheet({ selected, bagCount, onOpenBag, onBack, onSubmit }: ContextSheetProps) {
  const [context, setContext] = useState('');
  const [priorities, setPriorities] = useState<ComparePriority[]>([]);
  const products = selected.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  function togglePriority(p: ComparePriority) {
    setPriorities((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  return (
    <div className="flex min-h-full flex-col bg-neutral-50">
      <div className="sticky top-0 z-20 flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack}>
            <ArrowLeft className="h-5 w-5 text-neutral-700" />
          </button>
          <span className="text-sm font-bold text-neutral-900">Help me choose</span>
        </div>
        <button onClick={onOpenBag} aria-label="Go to bag" className="relative">
          <ShoppingBag className="h-5 w-5 text-neutral-700" />
          {bagCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
              {bagCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex-1 space-y-4 p-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md text-2xl"
              style={{ background: p.swatch }}
            >
              {p.emoji}
            </div>
          ))}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-neutral-700">Quick picks</label>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_OCCASIONS.map((occasion) => (
              <button
                key={occasion.label}
                onClick={() => setContext(occasion.context)}
                className={`rounded-lg border px-2.5 py-2 text-left text-[11px] font-medium ${
                  context === occasion.context
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-neutral-300 text-neutral-700'
                }`}
              >
                {occasion.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-neutral-700">
            What&apos;s this for? (optional)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Cousin's wedding next month, want something traditional but reusable"
            rows={3}
            className="w-full rounded-lg border border-neutral-300 p-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-neutral-700">
            What matters most? (optional)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMPARE_PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => togglePriority(p)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                  priorities.includes(p)
                    ? 'border-primary bg-primary text-white'
                    : 'border-neutral-300 text-neutral-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-3">
        <button
          onClick={() => onSubmit(context.trim(), priorities)}
          disabled={context.trim().length === 0 && priorities.length === 0}
          className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white disabled:opacity-40"
        >
          Compare with AI
        </button>
        {context.trim().length === 0 && priorities.length === 0 && (
          <p className="pt-1.5 text-center text-[11px] text-neutral-400">
            Fill in what it&apos;s for, or pick at least one priority, to continue.
          </p>
        )}
      </div>
    </div>
  );
}

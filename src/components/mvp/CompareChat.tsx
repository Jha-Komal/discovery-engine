import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, X, ShoppingBag, Sparkles } from 'lucide-react';
import { getProductById } from '@/lib/mvp/catalog';
import { apiPost } from '@/lib/api-client';
import type { ChatMessage, ComparePriority, ShopProduct } from '@/lib/mvp/types';

interface CompareChatProps {
  selected: string[];
  context: string;
  priorities: ComparePriority[];
  bagCount: number;
  onOpenBag: () => void;
  onBack: () => void;
  onMoveToBag: (id: string) => void;
}

interface CompareApiResponse {
  points: string[];
  bestProductId: string;
}

let msgCounter = 0;
function newId() {
  msgCounter += 1;
  return `msg-${msgCounter}`;
}

function AiPickCard({ product, onMoveToBag }: { product: ShopProduct; onMoveToBag: () => void }) {
  return (
    <div className="mt-1.5 flex max-w-[85%] items-center gap-2 rounded-lg border border-primary bg-primary/5 p-2">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-xl"
        style={{ background: product.swatch }}
      >
        {product.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary">
          <Sparkles className="h-3 w-3" /> AI Pick
        </p>
        <p className="truncate text-xs font-semibold text-neutral-800">{product.name}</p>
      </div>
      <button
        onClick={onMoveToBag}
        className="flex shrink-0 items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-white"
      >
        <ShoppingBag className="h-3 w-3" />
        Move to Bag
      </button>
    </div>
  );
}

export function CompareChat({
  selected,
  context,
  priorities,
  bagCount,
  onOpenBag,
  onBack,
  onMoveToBag,
}: CompareChatProps) {
  const [eliminated, setEliminated] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followUpText, setFollowUpText] = useState('');
  const [followUpUsed, setFollowUpUsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  const remaining = selected.filter((id) => !eliminated.includes(id));
  const products = remaining.map(getProductById).filter((p): p is NonNullable<typeof p> => Boolean(p));

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    apiPost<CompareApiResponse>('/api/mvp/compare', { productIds: selected, context, priorities })
      .then(({ points, bestProductId }) => {
        setMessages([{ id: newId(), role: 'ai', text: points.join(' '), points, bestProductId }]);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  function eliminate(id: string) {
    setEliminated((prev) => [...prev, id]);
  }

  async function sendFollowUp() {
    const question = followUpText.trim();
    if (!question || followUpUsed || remaining.length === 0) return;

    const userMsg: ChatMessage = { id: newId(), role: 'user', text: question };
    setMessages((prev) => [...prev, userMsg]);
    setFollowUpText('');
    setFollowUpUsed(true);
    setLoading(true);
    setError(null);

    try {
      const { points, bestProductId } = await apiPost<CompareApiResponse>('/api/mvp/compare', {
        productIds: remaining,
        context,
        priorities,
        eliminatedIds: eliminated,
        history: messages,
        question,
      });
      setMessages((prev) => [...prev, { id: newId(), role: 'ai', text: points.join(' '), points, bestProductId }]);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
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

      <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 bg-white px-3 py-2.5">
        {products.map((p) => (
          <div key={p.id} className="relative shrink-0">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-md text-2xl"
              style={{ background: p.swatch }}
            >
              {p.emoji}
            </div>
            <button
              onClick={() => eliminate(p.id)}
              aria-label={`Eliminate ${p.name}`}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-800 text-white"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
        {products.length === 0 && (
          <p className="py-2 text-xs text-neutral-400">All options eliminated — go back and reselect.</p>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((m) => {
          const pickProduct =
            m.bestProductId && remaining.includes(m.bestProductId) ? getProductById(m.bestProductId) : undefined;

          return (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                  m.role === 'user' ? 'bg-primary text-white' : 'bg-white text-neutral-800 shadow-sm'
                }`}
              >
                {m.role === 'ai' && m.points ? (
                  <ul className="list-disc space-y-1 pl-4">
                    {m.points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="whitespace-pre-wrap">{m.text}</span>
                )}
              </div>
              {pickProduct && <AiPickCard product={pickProduct} onMoveToBag={() => onMoveToBag(pickProduct.id)} />}
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-3 py-2 text-xs text-neutral-400 shadow-sm">Thinking…</div>
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">Something went wrong: {error}</div>
        )}
      </div>

      {products.length > 0 && (
        <div className="space-y-2 border-t border-neutral-200 bg-white p-3">
          {products.length === 1 ? (
            <button
              onClick={() => onMoveToBag(products[0].id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              Move &quot;{products[0].name}&quot; to Bag
            </button>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onMoveToBag(p.id)}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-[11px] font-semibold text-neutral-600"
                >
                  Move {p.brand} to Bag
                </button>
              ))}
            </div>
          )}

          {followUpUsed ? (
            <p className="text-center text-[11px] text-neutral-400">You&apos;ve used your follow-up question.</p>
          ) : (
            <div className="flex gap-2">
              <input
                value={followUpText}
                onChange={(e) => setFollowUpText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendFollowUp()}
                placeholder="Ask one follow-up question…"
                disabled={loading}
                className="flex-1 rounded-full border border-neutral-300 px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-primary focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={sendFollowUp}
                disabled={loading || !followUpText.trim()}
                className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
              >
                Ask
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

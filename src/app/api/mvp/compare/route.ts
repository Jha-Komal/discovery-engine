import { z } from 'zod';
import { NextRequest } from 'next/server';
import { getProductById } from '@/lib/mvp/catalog';
import { COMPARE_PRIORITIES } from '@/lib/mvp/types';
import { buildComparePrompt } from '@/lib/prompts/compare.prompt';
import { completeJson } from '@/lib/openai-provider';
import { parseJsonSafe } from '@/lib/json-parse';
import { ok, fail } from '@/lib/api-response';

const RequestSchema = z
  .object({
    productIds: z.array(z.string()).min(2).max(4),
    context: z.string().max(500),
    priorities: z.array(z.enum(COMPARE_PRIORITIES as [string, ...string[]])).max(6),
    eliminatedIds: z.array(z.string()).optional().default([]),
    history: z
      .array(z.object({ id: z.string(), role: z.enum(['ai', 'user']), text: z.string() }))
      .optional()
      .default([]),
    question: z.string().max(500).optional(),
  })
  .refine((body) => body.context.trim().length > 0 || body.priorities.length > 0, {
    message: 'Provide a context or at least one priority',
    path: ['context'],
  });

interface CompareModelResponse {
  reply: string[] | string;
  bestProductId: string;
}

const COMPARE_MODEL = 'gpt-4o-mini';
const MAX_POINT_CHARS = 320;
const MAX_POINTS = 4;

/** Hard cap on point length in case the model runs long despite the prompt's word-count instruction. */
function truncatePoint(point: string): string {
  if (point.length <= MAX_POINT_CHARS) return point;
  const cut = point.slice(0, MAX_POINT_CHARS);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 20 ? lastSpace : MAX_POINT_CHARS)}…`;
}

/** Strips stray star-rating / rating-count mentions in case the model cites one despite the prompt. */
function stripRatingMentions(point: string): string {
  return point
    .replace(/\d+(\.\d+)?\s*★/g, '')
    .replace(/\d+(\.\d+)?\s*(out of|\/)\s*5(\s*stars?)?/gi, '')
    .replace(/\d[\d,]*\+?\s*(ratings?|reviews?)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s,.\-–—]+|[\s,.\-–—]+$/g, '')
    .trim();
}

/** Normalizes the model's reply into up to 4 non-empty bullet points, tolerating a plain string. */
function normalizePoints(reply: string[] | string): string[] {
  const raw = Array.isArray(reply) ? reply : [reply];
  return raw
    .map((p) => truncatePoint(stripRatingMentions(String(p).trim())))
    .filter((p) => p.length > 0)
    .slice(0, MAX_POINTS);
}

export async function POST(req: NextRequest) {
  try {
    const body = RequestSchema.parse(await req.json());

    const products = body.productIds.map(getProductById);
    if (products.some((p) => !p)) {
      return fail('One or more product IDs were not found', 404);
    }
    const resolvedProducts = products.filter((p): p is NonNullable<typeof p> => Boolean(p));
    const resolvedEliminated = body.eliminatedIds
      .map(getProductById)
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    const stillInPlay = resolvedProducts.filter((p) => !body.eliminatedIds.includes(p.id));
    if (stillInPlay.length === 0) {
      return fail('All products have been eliminated', 400);
    }

    const priorities = body.priorities as (typeof COMPARE_PRIORITIES)[number][];

    const prompt = body.question
      ? buildComparePrompt({
          mode: 'followup',
          products: stillInPlay,
          context: body.context,
          priorities,
          eliminated: resolvedEliminated,
          history: body.history,
          question: body.question,
        })
      : buildComparePrompt({
          mode: 'initial',
          products: stillInPlay,
          context: body.context,
          priorities,
        });

    let raw = await completeJson(prompt, { model: COMPARE_MODEL, maxTokens: 700 });
    let parsed = parseJsonSafe<CompareModelResponse>(raw);
    let points = parsed ? normalizePoints(parsed.reply) : [];

    if (points.length === 0) {
      raw = await completeJson(prompt, { model: COMPARE_MODEL, maxTokens: 700 });
      parsed = parseJsonSafe<CompareModelResponse>(raw);
      points = parsed ? normalizePoints(parsed.reply) : [];
    }

    if (points.length === 0 || !parsed) {
      return fail('The AI response could not be parsed — please try again.');
    }

    const stillInPlayIds = new Set(stillInPlay.map((p) => p.id));
    const bestProductId = stillInPlayIds.has(parsed.bestProductId) ? parsed.bestProductId : stillInPlay[0].id;

    return ok({ points, bestProductId });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return fail(err.issues.map((i) => i.message).join('; '), 400);
    }
    return fail(String(err));
  }
}

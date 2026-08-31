import OpenAI from 'openai';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set. Add it to .env before running the pipeline.');
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export const DEFAULT_MODEL = 'gpt-4o-mini';

interface CompleteOptions {
  /** Defaults to gpt-4o-mini — used for the high-volume per-review analysis and
   *  recommendations calls. Callers doing precise cross-referencing over large
   *  aggregated data (research report, insights) should pass a stronger model. */
  model?: string;
  maxTokens?: number;
}

/**
 * Sends a single prompt to the model and returns the raw text response.
 *
 * max_tokens default was raised from 4096 to 16000: the per-review analysis
 * schema is deeply nested (~20 fields per review, including barrier/
 * uncertainty arrays), and a batch of 10 reviews at that size reliably
 * exceeded 4096 output tokens — the response got cut off mid-JSON and
 * failed to parse on nearly every batch (confirmed against real pipeline
 * runs, not a hypothetical). Raising the cap costs nothing extra unless a
 * response actually needs it; it just removes the truncation ceiling.
 */
export async function completeJson(prompt: string, options: CompleteOptions = {}): Promise<string> {
  const { model = DEFAULT_MODEL, maxTokens = 16000 } = options;
  const response = await getClient().chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are an expert product analyst specializing in fashion e-commerce user research. Always respond with valid JSON only, no markdown, no explanation, no code fences.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Sends a prompt expecting a long structured-text report (not JSON) — used
 * for the research-report stage, which returns numbered sections, tables,
 * and prose rather than a parseable object.
 */
export async function completeText(prompt: string, options: CompleteOptions = {}): Promise<string> {
  const { model = DEFAULT_MODEL, maxTokens = 16000 } = options;
  const response = await getClient().chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a senior product researcher producing a rigorous, evidence-grounded research report. Follow the requested structure and section order exactly. Respond with the report text only — no markdown code fences, no preamble.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: maxTokens,
  });

  return response.choices[0]?.message?.content || '';
}

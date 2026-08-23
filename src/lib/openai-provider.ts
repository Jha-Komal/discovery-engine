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

/** Sends a single prompt to the model and returns the raw text response. */
export async function completeJson(prompt: string): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert product analyst specializing in fashion e-commerce user research. Always respond with valid JSON only, no markdown, no explanation, no code fences.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || '';
}

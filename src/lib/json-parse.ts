/** Safely parses a JSON string that may be wrapped in markdown code fences. */
export function parseJsonSafe<T>(raw: string): T | null {
  if (!raw) return null;

  let text = raw.trim();

  // Strip markdown code fences if the model added them despite instructions.
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (fenceMatch) text = fenceMatch[1];

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

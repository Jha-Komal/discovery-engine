import type { ApiResponse } from './types';

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: 'no-store' });
  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success || json.data === undefined) {
    throw new Error(json.error || `Request failed: ${path}`);
  }

  return json.data;
}

export async function apiPost<T>(path: string): Promise<T> {
  const res = await fetch(path, { method: 'POST' });
  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success || json.data === undefined) {
    throw new Error(json.error || `Request failed: ${path}`);
  }

  return json.data;
}

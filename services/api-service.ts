import { getCookie } from 'cookies-next';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export const convertKeysToCamel = <T = unknown>(input: unknown): T => {
  if (Array.isArray(input)) {
    return input.map(v => convertKeysToCamel(v)) as unknown as T;
  } else if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      const camelKey = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      out[camelKey] = convertKeysToCamel(v);
    }
    return out as unknown as T;
  }
  return input as T;
};

export const apiService = async (endpoint: string, method: HttpMethod, body?: unknown) => {
  try {
    const TOKEN_NAME = process.env.NEXT_PUBLIC_TOKEN_NAME ?? 'hch_token';
    const token = getCookie(TOKEN_NAME) as string | undefined;
    if (!token) throw new Error("Token is missing from cookies");

    const signal =
      method === 'GET' &&
        body && typeof body === 'object' &&
        'signal' in (body as Record<string, unknown>)
        ? (body as { signal?: AbortSignal }).signal
        : undefined;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROUTE}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal,
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const txt = await safeReadText(res);
      throw new Error(`Request failed: ${res.status} - ${txt}`);
    }

    const ct = res.headers.get('content-type');
    if (ct?.includes('application/json')) {
      const raw = await res.json();
      return convertKeysToCamel(raw);
    }
    return null;
  } catch (e) {
    console.error('API Service Error:', e);
    throw e;
  }
};

export const convertKeysToSnake = <T = unknown>(input: unknown): T => {
  if (Array.isArray(input)) {
    return input.map(v => convertKeysToSnake(v)) as unknown as T;
  } else if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      const snakeKey = k.replace(/[A-Z]/g, (L) => `_${L.toLowerCase()}`);
      out[snakeKey] = convertKeysToSnake(v);
    }
    return out as unknown as T;
  }
  return input as T;
};

async function safeReadText(res: Response) {
  try { return await res.text(); } catch { return '<no body>'; }
};

export const isApiError = (e: unknown): e is { error: string } => {
  return typeof e === "object" && e !== null && "error" in e;
};

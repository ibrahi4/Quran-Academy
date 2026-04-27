const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiPost<T = any>(
  endpoint: string,
  data: Record<string, any>,
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      json?.message || `API Error: ${res.status}`,
    );
  }

  return json;
}

export async function apiGet<T = any>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    next: { revalidate: 60 },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      json?.message || `API Error: ${res.status}`,
    );
  }

  return json;
}

export async function apiGetClient<T = any>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      json?.message || `API Error: ${res.status}`,
    );
  }

  return json;
}
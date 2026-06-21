const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  locale?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    locale: string;
    avatar: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

// ── Cookie helpers (client-side only) ────────────────────────────────────────
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

// ── API calls ─────────────────────────────────────────────────────────────────
export async function loginApi(data: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || 'Login failed');

  const result: AuthResponse = json.data || json;

  // Save token in cookie so middleware can read it
  setCookie('access_token', result.accessToken, 7);

  return result;
}

export async function registerApi(data: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || 'Registration failed');

  const result: AuthResponse = json.data || json;

  // Save token in cookie so middleware can read it
  setCookie('access_token', result.accessToken, 7);

  return result;
}

export async function logoutApi(): Promise<void> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // Clear cookie immediately
  deleteCookie('access_token');

  if (!token) return;

  await fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }).catch(() => {});
}

export async function refreshTokenApi(): Promise<AuthResponse | null> {
  const refreshToken =
    typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (!refreshToken) return null;

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;

  const json = await res.json().catch(() => null);
  const result: AuthResponse | null = json?.data || json || null;

  // Refresh the cookie too
  if (result?.accessToken) {
    setCookie('access_token', result.accessToken, 7);
  }

  return result;
}

export async function forgotPasswordApi(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || 'Request failed');
}

export async function resetPasswordApi(
  token: string,
  password: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || 'Reset failed');
}

export async function setupPasswordApi(
  token: string,
  password: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/setup-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message || 'Setup failed');
}
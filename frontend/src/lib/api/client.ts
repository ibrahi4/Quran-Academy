const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async refreshTokens(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const json = await res.json().catch(() => null);
      const result = json?.data || json;

      if (result?.accessToken && result?.refreshToken) {
        localStorage.setItem('access_token', result.accessToken);
        localStorage.setItem('refresh_token', result.refreshToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  private clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/en/auth/login';
  }

  async request<T = any>(
    endpoint: string,
    options: {
      method?: string;
      body?: Record<string, any> | FormData;
      params?: Record<string, any>;
      headers?: Record<string, string>;
      auth?: boolean;
    } = {},
  ): Promise<T> {
    const { method = 'GET', body, params, headers: customHeaders, auth = true } = options;

    const headers: Record<string, string> = { ...customHeaders };

    if (auth) {
      const token = this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const url = this.buildUrl(endpoint, params);

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    };

    let res = await fetch(url, fetchOptions);

    // 401 → try refresh
    if (res.status === 401 && auth) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        const newToken = this.getToken();
        if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(url, { ...fetchOptions, headers });
      } else {
        this.clearAuth();
        throw new ApiError('Session expired. Please login again.', 401);
      }
    }

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const message = json?.message || json?.error || `API Error: ${res.status}`;
      throw new ApiError(message, res.status, json);
    }

    // Unwrap ResponseInterceptor: { success, data, timestamp }
    return json?.data !== undefined ? json.data : json;
  }

  get<T = any>(endpoint: string, params?: Record<string, any>) {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T = any>(endpoint: string, body?: Record<string, any>) {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  patch<T = any>(endpoint: string, body?: Record<string, any>) {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  put<T = any>(endpoint: string, body?: Record<string, any>) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  del<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiClient(API_BASE);
export default api;
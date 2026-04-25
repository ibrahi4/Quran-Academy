const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((customHeaders as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers,
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }

  return res.json();
}

// ===== AUTH =====
export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    locale?: string;
  }) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchAPI<{ data: { accessToken: string; refreshToken: string; user: any } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) },
    ),

  refresh: (refreshToken: string) =>
    fetchAPI('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: (token: string) =>
    fetchAPI('/auth/logout', { method: 'POST', token }),
};

// ===== BLOG =====
export const blogAPI = {
  getAll: (params?: { page?: number; limit?: number; published?: boolean; tag?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.published !== undefined) query.set('published', String(params.published));
    if (params?.tag) query.set('tag', params.tag);
    return fetchAPI<{
      data: any[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/blog?${query.toString()}`);
  },

  getBySlug: (slug: string) => fetchAPI<any>(`/blog/slug/${slug}`),
};

// ===== TESTIMONIALS =====
export const testimonialsAPI = {
  getPublished: () => fetchAPI<any[]>('/testimonials/public'),

  submit: (data: {
    name: string;
    country?: string;
    textEn: string;
    textAr?: string;
    rating?: number;
  }) => fetchAPI('/testimonials', { method: 'POST', body: JSON.stringify(data) }),
};

// ===== CONTACT =====
export const contactAPI = {
  submit: (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) => fetchAPI('/contact', { method: 'POST', body: JSON.stringify(data) }),
};

// ===== BOOKINGS =====
export const bookingsAPI = {
  create: (data: {
    name: string;
    email: string;
    phone?: string;
    country?: string;
    timezone?: string;
    preferredDate?: string;
    preferredTime?: string;
    serviceSlug?: string;
    type?: string;
    notes?: string;
  }) => fetchAPI('/bookings', { method: 'POST', body: JSON.stringify(data) }),
};

// ===== PLANS =====
export const plansAPI = {
  getAll: () => fetchAPI<any[]>('/subscriptions/plans'),
};

// ===== ANALYTICS =====
export const analyticsAPI = {
  track: (data: {
    event: string;
    page?: string;
    metadata?: any;
    locale?: string;
    sessionId?: string;
  }) =>
    fetchAPI('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(data),
    }).catch(() => {}), // Silent fail for analytics
};

export default fetchAPI;

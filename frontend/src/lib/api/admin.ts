import api from './client';

// ==================== Types ====================

export interface DashboardStats {
  users: { total: number; newThisMonth: number; students: number };
  subscriptions: { active: number };
  bookings: { total: number; pending: number };
  sessions: { total: number; upcoming: number };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthPercent: string;
  };
  contacts: { total: number; unread: number };
  blog: { total: number; published: number };
  testimonials: { pending: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ChartDataPoint {
  month: string;
  revenue?: number;
  count?: number;
}

// ==================== Dashboard ====================

export const adminApi = {
  // Dashboard
  getDashboardStats: () => api.get<DashboardStats>('/admin/dashboard'),

  getRecentBookings: (limit = 10) =>
    api.get('/admin/recent-bookings', { limit }),

  getRecentContacts: (limit = 10) =>
    api.get('/admin/recent-contacts', { limit }),

  getRecentPayments: (limit = 10) =>
    api.get('/admin/recent-payments', { limit }),

  getUpcomingSessions: (limit = 10) =>
    api.get('/admin/upcoming-sessions', { limit }),

  getRevenueChart: (months = 12) =>
    api.get<ChartDataPoint[]>('/admin/revenue-chart', { months }),

  getUserGrowthChart: (months = 12) =>
    api.get<ChartDataPoint[]>('/admin/user-growth', { months }),

  // ==================== Users ====================

  getUsers: (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean | string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => api.get('/users', params),

  getUserById: (id: string) => api.get(`/users/${id}`),

  createUser: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
    locale?: string;
  }) => api.post('/users', data),

  updateUser: (id: string, data: Record<string, any>) =>
    api.patch(`/users/${id}`, data),

  toggleUserActive: (id: string) => api.patch(`/users/${id}/toggle-active`),

  deleteUser: (id: string) => api.del(`/users/${id}`),

  getUserStats: () => api.get('/users/stats'),

  // ==================== Bookings ====================

  getBookings: (params: Record<string, any> = {}) =>
    api.get('/bookings', params),

  getBookingById: (id: string) => api.get(`/bookings/${id}`),

  updateBooking: (id: string, data: Record<string, any>) =>
    api.patch(`/bookings/${id}`, data),

  updateBookingStatus: (id: string, data: Record<string, any>) =>
    api.patch(`/bookings/${id}/status`, data),

  deleteBooking: (id: string) => api.del(`/bookings/${id}`),

  // ==================== Sessions ====================

  getSessions: (params: Record<string, any> = {}) =>
    api.get('/sessions', params),

  getSessionById: (id: string) => api.get(`/sessions/${id}`),

  getUpcomingSessionsList: () => api.get('/sessions/upcoming'),

  createSession: (data: Record<string, any>) => api.post('/sessions', data),

  updateSession: (id: string, data: Record<string, any>) =>
    api.patch(`/sessions/${id}`, data),

  deleteSession: (id: string) => api.del(`/sessions/${id}`),

  // ==================== Payments ====================

  getPayments: (params: Record<string, any> = {}) =>
    api.get('/payments', params),

  getPaymentById: (id: string) => api.get(`/payments/${id}`),

  getRevenueStats: () => api.get('/payments/revenue'),

  createPayment: (data: Record<string, any>) => api.post('/payments', data),

  updatePayment: (id: string, data: Record<string, any>) =>
    api.patch(`/payments/${id}`, data),

  markPaymentPaid: (id: string) => api.patch(`/payments/${id}/mark-paid`),

  refundPayment: (id: string) => api.patch(`/payments/${id}/refund`),

  // ==================== Subscriptions ====================

  getSubscriptions: (params: Record<string, any> = {}) =>
    api.get('/subscriptions', params),

  getSubscriptionById: (id: string) => api.get(`/subscriptions/${id}`),

  createSubscription: (data: Record<string, any>) =>
    api.post('/subscriptions', data),

  updateSubscription: (id: string, data: Record<string, any>) =>
    api.patch(`/subscriptions/${id}`, data),

  cancelSubscription: (id: string) =>
    api.patch(`/subscriptions/${id}/cancel`),

  // Plans
  getPlans: () => api.get('/subscriptions/plans'),

  getAllPlans: () => api.get('/subscriptions/plans/all'),

  createPlan: (data: Record<string, any>) =>
    api.post('/subscriptions/plans', data),

  updatePlan: (id: string, data: Record<string, any>) =>
    api.patch(`/subscriptions/plans/${id}`, data),

  deletePlan: (id: string) => api.del(`/subscriptions/plans/${id}`),

  // ==================== Blog ====================

  getBlogPosts: (params: Record<string, any> = {}) =>
    api.get('/blog', params),

  getBlogPostById: (id: string) => api.get(`/blog/${id}`),

  getBlogPostBySlug: (slug: string) => api.get(`/blog/slug/${slug}`),

  createBlogPost: (data: Record<string, any>) => api.post('/blog', data),

  updateBlogPost: (id: string, data: Record<string, any>) =>
    api.patch(`/blog/${id}`, data),

  publishBlogPost: (id: string) => api.patch(`/blog/${id}/publish`),

  unpublishBlogPost: (id: string) => api.patch(`/blog/${id}/unpublish`),

  deleteBlogPost: (id: string) => api.del(`/blog/${id}`),

  // ==================== Testimonials ====================

  getTestimonials: (params: Record<string, any> = {}) =>
    api.get('/testimonials', params),

  getTestimonialById: (id: string) => api.get(`/testimonials/${id}`),

  createTestimonial: (data: Record<string, any>) =>
    api.post('/testimonials', data),

  updateTestimonial: (id: string, data: Record<string, any>) =>
    api.patch(`/testimonials/${id}`, data),

  approveTestimonial: (id: string) =>
    api.patch(`/testimonials/${id}/approve`),

  rejectTestimonial: (id: string) =>
    api.patch(`/testimonials/${id}/reject`),

  toggleFeaturedTestimonial: (id: string) =>
    api.patch(`/testimonials/${id}/toggle-featured`),

  deleteTestimonial: (id: string) => api.del(`/testimonials/${id}`),

  // ==================== Contacts ====================

  getContacts: (params: Record<string, any> = {}) =>
    api.get('/contact', params),

  getContactById: (id: string) => api.get(`/contact/${id}`),

  updateContact: (id: string, data: Record<string, any>) =>
    api.patch(`/contact/${id}`, data),

  deleteContact: (id: string) => api.del(`/contact/${id}`),
};
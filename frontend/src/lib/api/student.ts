import api from "./client";

export const studentApi = {
  // Profile
  getMe: () => api.get("/users/me"),
  updateMe: (data: any) => api.patch("/users/me", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch("/users/me/password", data),

  // Sessions
  getMySessions: (params?: any) => api.get("/sessions/my", params),
  getSessionById: (id: string) => api.get(`/sessions/${id}`),

  // Assignments
  getMyAssignments: (status?: string) =>
    api.get("/assignments/my", status ? { status } : {}),

  submitAssignment: (assignmentId: string, data: {
    content?: string;
    linkUrl?: string;
    fileUrl?: string;
  }) => api.post(`/assignments/${assignmentId}/submit`, data),

  // Subscription
  getMySubscription: () => api.get("/subscriptions/my"),

  // Payments
  getMyPayments: (params?: any) => api.get("/payments/my", params),

  // Plans
  getPlans: () => api.get("/subscriptions/plans"),
};

export default studentApi;
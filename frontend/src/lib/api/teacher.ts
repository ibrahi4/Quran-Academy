import api from './client';

export const teacherApi = {
  // Dashboard
  getDashboard: () => api.get('/teacher/dashboard'),

  // Sessions
  getSessions: (params: { status?: string; from?: string; to?: string } = {}) =>
    api.get('/teacher/sessions', params),

  // Session Reports (replaces completeSession)
  submitReport: (data: {
    sessionId: string;
    studentAttended: boolean;
    teacherAttended: boolean;
    studentLateMins?: number;
    teacherLateMins?: number;
    lessonSummary?: string;
    teacherNotes?: string;
    nextLessonFocus?: string;
    privateAdminNote?: string;
    participationScore?: number;
    recitationScore?: number;
    tajweedScore?: number;
    memorizationScore?: number;
    overallScore?: number;
    evaluationNotes?: string;
    isTrialAssessment?: boolean;
    recommendedLevel?: string;
    recommendedPlanNotes?: string;
  }) => api.post('/session-reports', data),

  getMyReports: (status?: string) =>
    api.get('/session-reports/my', status ? { status } : {}),

  getReportBySession: (sessionId: string) =>
    api.get(`/session-reports/by-session/${sessionId}`),

  // Assignments
  createAssignment: (data: {
    title: string;
    instructions: string;
    studentId: string;
    reportId?: string;
    sessionId?: string;
    dueDate?: string;
    maxScore?: number;
  }) => api.post('/assignments', data),

  getMyAssignments: (status?: string) =>
    api.get('/assignments/teacher', status ? { status } : {}),

  getPendingSubmissions: () => api.get('/assignments/pending-submissions'),

  reviewSubmission: (submissionId: string, data: {
    score?: number;
    feedback?: string;
    revisionRequested?: boolean;
  }) => api.patch(`/assignments/submissions/${submissionId}/review`, data),

  // Students
  getMyStudents: () => api.get('/teacher/my-students'),

  // Schedule
  getWeeklySchedule: (startDate?: string) =>
    api.get('/teacher/weekly-schedule', startDate ? { startDate } : {}),

  checkAvailability: (date: string, duration?: number) =>
    api.get('/teacher/check-availability', { date, duration: duration || 60 }),

  getAvailableSlots: (date: string) =>
    api.get('/teacher/available-slots', { date }),

  // Earnings
  getEarnings: (month?: string) =>
    api.get('/teacher/earnings', month ? { month } : {}),

  // Wallet
  getMyWallet: () => api.get('/wallet/me'),

  getMyTransactions: (params: {
    page?: number;
    limit?: number;
    type?: string;
    from?: string;
    to?: string;
  } = {}) => api.get('/wallet/me/transactions', params),
};

export default teacherApi;
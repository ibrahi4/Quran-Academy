export interface SessionStudent {
  id: string;
  level?: string;
  timezone?: string;
  country?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  };
}

export type SessionStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED";

export interface Session {
  id: string;
  title: string;
  date: string;
  duration: number;
  status: SessionStatus;
  platform?: string;
  meetingLink?: string;
  notes?: string;
  teacherNotes?: string;
  studentAttended?: boolean;
  teacherAttended?: boolean;
  studentLateMins?: number;
  teacherLateMins?: number;
  completedAt?: string;
  bookingId?: string;
  booking?: { type?: string } | null;
  student: SessionStudent;
}

export interface ReportSummary {
  id: string;
  sessionId: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "APPROVED"
    | "REJECTED"
    | "CHANGES_REQUESTED";
  isTrialAssessment?: boolean;
}
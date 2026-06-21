-- CreateEnum
CREATE TYPE "SessionReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentSubmissionStatus" AS ENUM ('SUBMITTED', 'LATE', 'GRADED', 'RETURNED_FOR_REVISION');

-- CreateTable
CREATE TABLE "session_reports" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "SessionReportStatus" NOT NULL DEFAULT 'DRAFT',
    "studentAttended" BOOLEAN NOT NULL DEFAULT true,
    "teacherAttended" BOOLEAN NOT NULL DEFAULT true,
    "studentLateMins" INTEGER NOT NULL DEFAULT 0,
    "teacherLateMins" INTEGER NOT NULL DEFAULT 0,
    "lessonSummary" TEXT,
    "teacherNotes" TEXT,
    "nextLessonFocus" TEXT,
    "privateAdminNote" TEXT,
    "participationScore" INTEGER,
    "recitationScore" INTEGER,
    "tajweedScore" INTEGER,
    "memorizationScore" INTEGER,
    "overallScore" INTEGER,
    "evaluationNotes" TEXT,
    "isTrialAssessment" BOOLEAN NOT NULL DEFAULT false,
    "recommendedLevel" "StudentLevel",
    "recommendedPlanNotes" TEXT,
    "adminDecisionNote" TEXT,
    "reviewedByAdminId" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "reportId" TEXT,
    "sessionId" TEXT,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "maxScore" INTEGER NOT NULL DEFAULT 100,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "content" TEXT,
    "fileUrl" TEXT,
    "linkUrl" TEXT,
    "status" "AssignmentSubmissionStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER,
    "feedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByTeacherId" TEXT,
    "revisionRequested" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_reports_sessionId_key" ON "session_reports"("sessionId");

-- CreateIndex
CREATE INDEX "session_reports_teacherId_status_idx" ON "session_reports"("teacherId", "status");

-- CreateIndex
CREATE INDEX "session_reports_studentId_status_idx" ON "session_reports"("studentId", "status");

-- CreateIndex
CREATE INDEX "session_reports_status_createdAt_idx" ON "session_reports"("status", "createdAt");

-- CreateIndex
CREATE INDEX "assignments_studentId_status_idx" ON "assignments"("studentId", "status");

-- CreateIndex
CREATE INDEX "assignments_teacherId_status_idx" ON "assignments"("teacherId", "status");

-- CreateIndex
CREATE INDEX "assignments_dueDate_idx" ON "assignments"("dueDate");

-- CreateIndex
CREATE INDEX "assignment_submissions_studentId_status_idx" ON "assignment_submissions"("studentId", "status");

-- CreateIndex
CREATE INDEX "assignment_submissions_assignmentId_status_idx" ON "assignment_submissions"("assignmentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_assignmentId_studentId_key" ON "assignment_submissions"("assignmentId", "studentId");

-- AddForeignKey
ALTER TABLE "session_reports" ADD CONSTRAINT "session_reports_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_reports" ADD CONSTRAINT "session_reports_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_reports" ADD CONSTRAINT "session_reports_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "session_reports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

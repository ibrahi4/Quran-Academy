-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "studentAttended" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "studentLateMins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "teacherAttended" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "teacherLateMins" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "teacherNotes" TEXT;

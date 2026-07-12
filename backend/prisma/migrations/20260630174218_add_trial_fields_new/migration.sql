-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "currentLevel" "StudentLevel",
ADD COLUMN     "nativeLanguage" TEXT,
ADD COLUMN     "parentName" TEXT,
ADD COLUMN     "parentPhone" TEXT,
ADD COLUMN     "parentRelation" TEXT;

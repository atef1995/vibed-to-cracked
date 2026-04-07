-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "experienceLevel" TEXT NOT NULL DEFAULT 'beginner',
ADD COLUMN     "learningGoals" TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

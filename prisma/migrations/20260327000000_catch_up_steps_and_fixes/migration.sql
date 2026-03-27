-- Catch-up migration: captures schema changes applied via db push
-- after the mentorship_sessions migration.
--
-- Includes: TutorialStep, TutorialStepProgress tables,
-- Tutorial.exerciseSlug column, MentorshipSession.description NOT NULL.

-- CreateTable
CREATE TABLE "tutorial_steps" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mdxFile" TEXT,
    "validationType" TEXT NOT NULL DEFAULT 'both',
    "validationConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorial_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutorial_step_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "userCode" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorial_step_progress_pkey" PRIMARY KEY ("id")
);

-- AlterTable (tutorials)
ALTER TABLE "tutorials" ADD COLUMN "exerciseSlug" TEXT;

-- AlterTable (mentorship_sessions)
ALTER TABLE "mentorship_sessions" ALTER COLUMN "description" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_steps_tutorialId_slug_key" ON "tutorial_steps"("tutorialId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_steps_tutorialId_order_key" ON "tutorial_steps"("tutorialId", "order");

-- CreateIndex
CREATE INDEX "tutorial_steps_tutorialId_order_idx" ON "tutorial_steps"("tutorialId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_step_progress_userId_stepId_key" ON "tutorial_step_progress"("userId", "stepId");

-- CreateIndex
CREATE INDEX "tutorial_step_progress_userId_idx" ON "tutorial_step_progress"("userId");

-- CreateIndex
CREATE INDEX "tutorial_step_progress_stepId_idx" ON "tutorial_step_progress"("stepId");

-- AddForeignKey
ALTER TABLE "tutorial_steps" ADD CONSTRAINT "tutorial_steps_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "tutorials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_step_progress" ADD CONSTRAINT "tutorial_step_progress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "tutorial_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_step_progress" ADD CONSTRAINT "tutorial_step_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

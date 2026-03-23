-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailUnsubscribed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailUnsubscribedAt" TIMESTAMP(3),
ADD COLUMN     "githubAccessToken" TEXT,
ADD COLUMN     "githubProfileUrl" TEXT,
ADD COLUMN     "githubUsername" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "tutorial_feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tutorialId" TEXT NOT NULL,
    "quizId" TEXT,
    "rating" INTEGER NOT NULL,
    "helpful" BOOLEAN,
    "difficulty" TEXT,
    "completion" TEXT,
    "feedback" TEXT,
    "tags" JSONB,
    "quizHelpful" BOOLEAN,
    "improvementAreas" JSONB,
    "positiveAspects" JSONB,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutorial_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_projects" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "githubRepoUrl" TEXT NOT NULL,
    "githubOwner" TEXT NOT NULL,
    "githubRepo" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "estimatedHours" INTEGER NOT NULL,
    "features" JSONB NOT NULL,
    "prTemplate" TEXT NOT NULL,
    "requiredChecks" JSONB NOT NULL,
    "reviewCriteria" JSONB NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "badgeId" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "requiredPlan" TEXT NOT NULL DEFAULT 'FREE',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contribution_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_submissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "githubPrUrl" TEXT NOT NULL,
    "githubPrNumber" INTEGER NOT NULL,
    "githubBranch" TEXT NOT NULL,
    "githubForkUrl" TEXT NOT NULL,
    "prStatus" TEXT NOT NULL DEFAULT 'OPEN',
    "prTitle" TEXT NOT NULL,
    "prDescription" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "featureTitle" TEXT NOT NULL,
    "ciPassed" BOOLEAN NOT NULL DEFAULT false,
    "lintPassed" BOOLEAN NOT NULL DEFAULT false,
    "testsPassed" BOOLEAN NOT NULL DEFAULT false,
    "peerReviewsNeeded" INTEGER NOT NULL DEFAULT 2,
    "peerReviewsReceived" INTEGER NOT NULL DEFAULT 0,
    "mentorReviewStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "codeQuality" DOUBLE PRECISION,
    "implementsSpec" BOOLEAN NOT NULL DEFAULT false,
    "followsStandards" BOOLEAN NOT NULL DEFAULT false,
    "grade" DOUBLE PRECISION,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mergedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contribution_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_reviews" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PEER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "filesReviewed" INTEGER NOT NULL DEFAULT 0,
    "commentsAdded" INTEGER NOT NULL DEFAULT 0,
    "githubReviewUrl" TEXT,
    "codeQualityScore" DOUBLE PRECISION,
    "functionalityScore" DOUBLE PRECISION,
    "documentationScore" DOUBLE PRECISION,
    "bestPracticesScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "strengths" TEXT,
    "improvements" TEXT,
    "suggestions" TEXT,
    "xpAwarded" INTEGER NOT NULL DEFAULT 25,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contribution_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "sentCount" INTEGER NOT NULL,
    "failedCount" INTEGER NOT NULL,
    "recipientType" TEXT,
    "sentBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cheat_sheets" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'intermediate',
    "fileFormat" TEXT NOT NULL DEFAULT 'PDF',
    "fileSize" TEXT NOT NULL DEFAULT '0 MB',
    "downloadUrl" TEXT NOT NULL,
    "previewUrl" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "requiredPlan" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "keywords" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cheat_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailsSent" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "completedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "source" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tutorial_feedback_tutorialId_idx" ON "tutorial_feedback"("tutorialId");

-- CreateIndex
CREATE INDEX "tutorial_feedback_rating_idx" ON "tutorial_feedback"("rating");

-- CreateIndex
CREATE INDEX "tutorial_feedback_userId_idx" ON "tutorial_feedback"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tutorial_feedback_userId_tutorialId_key" ON "tutorial_feedback"("userId", "tutorialId");

-- CreateIndex
CREATE UNIQUE INDEX "contribution_projects_slug_key" ON "contribution_projects"("slug");

-- CreateIndex
CREATE INDEX "contribution_submissions_userId_idx" ON "contribution_submissions"("userId");

-- CreateIndex
CREATE INDEX "contribution_submissions_projectId_idx" ON "contribution_submissions"("projectId");

-- CreateIndex
CREATE INDEX "contribution_submissions_prStatus_idx" ON "contribution_submissions"("prStatus");

-- CreateIndex
CREATE UNIQUE INDEX "contribution_submissions_userId_projectId_featureId_key" ON "contribution_submissions"("userId", "projectId", "featureId");

-- CreateIndex
CREATE INDEX "contribution_reviews_submissionId_idx" ON "contribution_reviews"("submissionId");

-- CreateIndex
CREATE INDEX "contribution_reviews_reviewerId_idx" ON "contribution_reviews"("reviewerId");

-- CreateIndex
CREATE INDEX "contribution_reviews_type_idx" ON "contribution_reviews"("type");

-- CreateIndex
CREATE INDEX "email_logs_type_idx" ON "email_logs"("type");

-- CreateIndex
CREATE INDEX "email_logs_createdAt_idx" ON "email_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "cheat_sheets_slug_key" ON "cheat_sheets"("slug");

-- CreateIndex
CREATE INDEX "cheat_sheets_category_idx" ON "cheat_sheets"("category");

-- CreateIndex
CREATE INDEX "cheat_sheets_difficulty_idx" ON "cheat_sheets"("difficulty");

-- CreateIndex
CREATE INDEX "cheat_sheets_isPremium_idx" ON "cheat_sheets"("isPremium");

-- CreateIndex
CREATE INDEX "cheat_sheets_published_idx" ON "cheat_sheets"("published");

-- CreateIndex
CREATE INDEX "cheat_sheets_createdAt_idx" ON "cheat_sheets"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "course_subscribers_email_key" ON "course_subscribers"("email");

-- CreateIndex
CREATE INDEX "course_subscribers_email_idx" ON "course_subscribers"("email");

-- CreateIndex
CREATE INDEX "course_subscribers_status_idx" ON "course_subscribers"("status");

-- CreateIndex
CREATE INDEX "course_subscribers_createdAt_idx" ON "course_subscribers"("createdAt");

-- AddForeignKey
ALTER TABLE "tutorial_feedback" ADD CONSTRAINT "tutorial_feedback_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_feedback" ADD CONSTRAINT "tutorial_feedback_tutorialId_fkey" FOREIGN KEY ("tutorialId") REFERENCES "tutorials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutorial_feedback" ADD CONSTRAINT "tutorial_feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_submissions" ADD CONSTRAINT "contribution_submissions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "contribution_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_submissions" ADD CONSTRAINT "contribution_submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_reviews" ADD CONSTRAINT "contribution_reviews_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "contribution_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_reviews" ADD CONSTRAINT "contribution_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

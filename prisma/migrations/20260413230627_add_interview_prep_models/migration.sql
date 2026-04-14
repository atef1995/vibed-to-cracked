-- CreateTable
CREATE TABLE "interview_prep_guides" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "cultureBreakdown" TEXT NOT NULL,
    "interviewerTips" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_prep_guides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_walkthroughs" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "modelAnswer" TEXT NOT NULL,
    "scoringRubric" JSONB NOT NULL DEFAULT '{}',
    "commonMistakes" JSONB NOT NULL DEFAULT '[]',
    "followUpQuestions" JSONB NOT NULL DEFAULT '[]',
    "timeGuidance" TEXT NOT NULL,
    "approaches" JSONB NOT NULL DEFAULT '[]',
    "requiredPlan" TEXT NOT NULL DEFAULT 'FREE',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_walkthroughs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prep_study_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walkthroughId" TEXT NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "studied" BOOLEAN NOT NULL DEFAULT false,
    "studyCount" INTEGER NOT NULL DEFAULT 0,
    "lastStudiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prep_study_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_prep_guides_companyId_key" ON "interview_prep_guides"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "question_walkthroughs_questionId_key" ON "question_walkthroughs"("questionId");

-- CreateIndex
CREATE INDEX "question_walkthroughs_questionId_idx" ON "question_walkthroughs"("questionId");

-- CreateIndex
CREATE INDEX "prep_study_progress_userId_idx" ON "prep_study_progress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "prep_study_progress_userId_walkthroughId_key" ON "prep_study_progress"("userId", "walkthroughId");

-- AddForeignKey
ALTER TABLE "interview_prep_guides" ADD CONSTRAINT "interview_prep_guides_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "interview_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_walkthroughs" ADD CONSTRAINT "question_walkthroughs_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "interview_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prep_study_progress" ADD CONSTRAINT "prep_study_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prep_study_progress" ADD CONSTRAINT "prep_study_progress_walkthroughId_fkey" FOREIGN KEY ("walkthroughId") REFERENCES "question_walkthroughs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

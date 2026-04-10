-- AlterTable
ALTER TABLE "users" ADD COLUMN     "interviewCredits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "interview_companies" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT NOT NULL,
    "interviewStyle" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_questions" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "question" TEXT NOT NULL,
    "followUps" JSONB NOT NULL DEFAULT '[]',
    "evaluationCriteria" JSONB NOT NULL DEFAULT '{}',
    "category" TEXT NOT NULL,
    "starterCode" TEXT,
    "expectedApproach" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "reportedYear" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_interviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "interviewType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "overallScore" DOUBLE PRECISION,
    "feedback" JSONB,
    "questionsAsked" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "isPreview" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mock_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_interview_rounds" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionId" TEXT,
    "questionText" TEXT NOT NULL,
    "responseText" TEXT,
    "responseCode" TEXT,
    "responseType" TEXT NOT NULL DEFAULT 'TEXT',
    "score" DOUBLE PRECISION,
    "feedback" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_interview_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_credit_packs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripePriceId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_credit_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_credit_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interview_credit_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "interview_companies_slug_key" ON "interview_companies"("slug");

-- CreateIndex
CREATE INDEX "interview_companies_published_idx" ON "interview_companies"("published");

-- CreateIndex
CREATE INDEX "interview_questions_companyId_idx" ON "interview_questions"("companyId");

-- CreateIndex
CREATE INDEX "interview_questions_type_idx" ON "interview_questions"("type");

-- CreateIndex
CREATE INDEX "interview_questions_published_idx" ON "interview_questions"("published");

-- CreateIndex
CREATE INDEX "mock_interviews_userId_idx" ON "mock_interviews"("userId");

-- CreateIndex
CREATE INDEX "mock_interviews_companyId_idx" ON "mock_interviews"("companyId");

-- CreateIndex
CREATE INDEX "mock_interviews_status_idx" ON "mock_interviews"("status");

-- CreateIndex
CREATE INDEX "mock_interview_rounds_interviewId_idx" ON "mock_interview_rounds"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "interview_credit_packs_slug_key" ON "interview_credit_packs"("slug");

-- CreateIndex
CREATE INDEX "interview_credit_transactions_userId_createdAt_idx" ON "interview_credit_transactions"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "interview_questions" ADD CONSTRAINT "interview_questions_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "interview_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "interview_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interview_rounds" ADD CONSTRAINT "mock_interview_rounds_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "mock_interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interview_rounds" ADD CONSTRAINT "mock_interview_rounds_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "interview_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_credit_transactions" ADD CONSTRAINT "interview_credit_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

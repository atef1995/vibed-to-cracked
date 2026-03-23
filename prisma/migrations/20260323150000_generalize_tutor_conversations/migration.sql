-- Generalize TutorConversation: replace tutorialId FK with contentType + contentId
-- This allows the tutor to work with tutorials, challenges, and exercises

-- Step 1: Add new columns with defaults so existing rows are valid
ALTER TABLE "tutor_conversations" ADD COLUMN "contentType" TEXT NOT NULL DEFAULT 'tutorial';
ALTER TABLE "tutor_conversations" ADD COLUMN "contentId" TEXT NOT NULL DEFAULT '';

-- Step 2: Migrate existing data — copy tutorialId into contentId
UPDATE "tutor_conversations" SET "contentId" = "tutorialId" WHERE "contentId" = '';

-- Step 3: Drop the old foreign key and indexes
ALTER TABLE "tutor_conversations" DROP CONSTRAINT IF EXISTS "tutor_conversations_tutorialId_fkey";
DROP INDEX IF EXISTS "tutor_conversations_tutorialId_idx";
DROP INDEX IF EXISTS "tutor_conversations_userId_tutorialId_key";

-- Step 4: Drop the old column
ALTER TABLE "tutor_conversations" DROP COLUMN "tutorialId";

-- Step 5: Remove defaults (column should be required with no default going forward)
ALTER TABLE "tutor_conversations" ALTER COLUMN "contentType" DROP DEFAULT;
ALTER TABLE "tutor_conversations" ALTER COLUMN "contentId" DROP DEFAULT;

-- Step 6: Create new indexes and unique constraint
CREATE UNIQUE INDEX "tutor_conversations_userId_contentType_contentId_key" ON "tutor_conversations"("userId", "contentType", "contentId");
CREATE INDEX "tutor_conversations_contentType_contentId_idx" ON "tutor_conversations"("contentType", "contentId");

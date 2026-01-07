/**
 * Backfill XP Transactions from ContributionReview records
 *
 * This script creates XpTransaction records from existing ContributionReview
 * data where XP was awarded. This provides historical XP data for the
 * weekly/monthly leaderboard filters.
 *
 * Run with: npx tsx scripts/backfillXpTransactions.ts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client";

async function backfillXpTransactions() {
  console.log("Starting XP transaction backfill...\n");

  const adapter = new PrismaPg({
    connectionString:
      process.env.DATABASE_URL ||
      "postgresql://localhost:5432/vibed_to_cracked",
  });
  const prisma = new PrismaClient({ adapter });

  try {
    // Get all completed contribution reviews with XP awarded
    const reviews = await prisma.contributionReview.findMany({
      where: {
        status: "COMPLETED",
        xpAwarded: { gt: 0 },
      },
      select: {
        id: true,
        reviewerId: true,
        xpAwarded: true,
        type: true,
        submissionId: true,
        createdAt: true,
      },
    });

    console.log(
      `Found ${reviews.length} completed reviews with XP to backfill\n`
    );

    if (reviews.length === 0) {
      console.log("No reviews to backfill. Exiting.");
      return;
    }

    // Check for existing XP transactions to avoid duplicates
    const existingTransactions = await prisma.xpTransaction.findMany({
      where: {
        reason: "CONTRIBUTION_REVIEW",
      },
      select: {
        metadata: true,
      },
    });

    const existingReviewIds = new Set(
      existingTransactions
        .map((t) => {
          const meta = t.metadata as { reviewId?: string } | null;
          return meta?.reviewId;
        })
        .filter(Boolean)
    );

    console.log(
      `Found ${existingReviewIds.size} existing XP transactions for reviews\n`
    );

    let created = 0;
    let skipped = 0;

    for (const review of reviews) {
      // Skip if already backfilled
      if (existingReviewIds.has(review.id)) {
        skipped++;
        continue;
      }

      await prisma.xpTransaction.create({
        data: {
          userId: review.reviewerId,
          amount: review.xpAwarded,
          reason: "CONTRIBUTION_REVIEW",
          metadata: {
            reviewId: review.id,
            reviewType: review.type,
            submissionId: review.submissionId,
            backfilled: true,
          },
          createdAt: review.createdAt,
        },
      });

      created++;

      if (created % 100 === 0) {
        console.log(`Progress: ${created} transactions created...`);
      }
    }

    console.log(`\nBackfill complete!`);
    console.log(`  Created: ${created} new XP transactions`);
    console.log(`  Skipped: ${skipped} (already existed)`);
  } catch (error) {
    console.error("Error during backfill:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backfillXpTransactions()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateChallengePremiumStatus() {
  console.log("🔧 Updating challenge premium status...");

  try {
    // Update medium challenges to be premium
    await prisma.challenge.updateMany({
      where: {
        difficulty: "MEDIUM",
      },
      data: {
        isPremium: true,
        requiredPlan: "VIBED",
      },
    });

    console.log(" Updated MEDIUM challenges to VIBED");

    // Update hard challenges to be pro (if any exist in the future)
    await prisma.challenge.updateMany({
      where: {
        difficulty: "HARD",
      },
      data: {
        isPremium: true,
        requiredPlan: "CRACKED",
      },
    });

    console.log(" Updated HARD challenges to CRACKED");

    // Verify the changes
    const challenges = await prisma.challenge.findMany({
      select: {
        title: true,
        difficulty: true,
        isPremium: true,
        requiredPlan: true,
      },
      orderBy: { order: "asc" },
    });

    console.log("\n📊 Updated challenge premium status:");
    challenges.forEach((challenge) => {
      const icon = challenge.isPremium ? "💎" : "🆓";
      console.log(
        `   ${icon} ${challenge.title} (${challenge.difficulty}) - ${challenge.requiredPlan}`
      );
    });

    // Count by premium status
    const freeCount = await prisma.challenge.count({
      where: { isPremium: false },
    });
    const premiumCount = await prisma.challenge.count({
      where: { isPremium: true },
    });

    console.log(`\n Summary:`);
    console.log(`   - FREE challenges: ${freeCount}`);
    console.log(`   - VIBED/CRACKED challenges: ${premiumCount}`);
  } catch (error) {
    console.error("❌ Error updating premium status:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateChallengePremiumStatus()
  .then(() => {
    console.log("\n✨ Premium status updated successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Update failed:", error);
    process.exit(1);
  });

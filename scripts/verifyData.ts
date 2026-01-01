import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyData() {
  try {
    console.log("🔍 Verifying database restoration...\n");

    const [
      skillCount,
      categoryCount,
      tutorialCount,
      challengeCount,
      projectCount,
      achievementCount,
      quizCount
    ] = await Promise.all([
      prisma.skill.count(),
      prisma.category.count(),
      prisma.tutorial.count(),
      prisma.challenge.count(),
      prisma.project.count(),
      prisma.achievement.count(),
      prisma.quiz.count()
    ]);

    console.log("📊 Data Summary:");
    console.log(`   Skills: ${skillCount}`);
    console.log(`   Categories: ${categoryCount}`);
    console.log(`   Tutorials: ${tutorialCount}`);
    console.log(`   Quizzes: ${quizCount}`);
    console.log(`   Challenges: ${challengeCount}`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Achievements: ${achievementCount}\n`);

    // Check a few specific items
    const sampleSkill = await prisma.skill.findFirst({
      where: { slug: "html-basics" }
    });

    const sampleCategory = await prisma.category.findFirst({
      where: { slug: "fundamentals" }
    });

    const sampleTutorial = await prisma.tutorial.findFirst({
      include: { category: true }
    });

    console.log("🔎 Sample Data Check:");
    console.log(`   Sample Skill: ${sampleSkill?.name || "Not found"}`);
    console.log(`   Sample Category: ${sampleCategory?.title || "Not found"}`);
    console.log(`   Sample Tutorial: ${sampleTutorial?.title || "Not found"} (Category: ${sampleTutorial?.category?.title || "Unknown"})`);

    if (skillCount > 0 && categoryCount > 0 && tutorialCount > 0 && challengeCount > 0) {
      console.log("\n Database restoration completed successfully!");
      console.log("🎉 All essential data has been restored.");
    } else {
      console.log("\n⚠️ Some data may be missing. Please check the seeding process.");
    }

  } catch (error) {
    console.error("❌ Error verifying data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateQuizNavigationForSlugs() {
  try {
    console.log("🔄 Starting quiz navigation update for slug-based routing...");

    // Get all tutorials ordered by their order field
    const tutorials = await prisma.tutorial.findMany({
      orderBy: { order: 'asc' },
      include: { quizzes: true },
    });

    console.log("📋 Found tutorials:");
    tutorials.forEach(tutorial => {
      console.log(`${tutorial.order}. ${tutorial.title} (${tutorial.slug}) - ID: ${tutorial.id}`);
    });

    // Create a mapping for navigation
    const tutorialNavigation = tutorials.map((tutorial, index) => {
      const nextTutorial = tutorials[index + 1];
      const prevTutorial = tutorials[index - 1];
      
      return {
        id: tutorial.id,
        slug: tutorial.slug,
        order: tutorial.order,
        title: tutorial.title,
        next: nextTutorial ? {
          id: nextTutorial.id,
          slug: nextTutorial.slug,
          title: nextTutorial.title
        } : null,
        prev: prevTutorial ? {
          id: prevTutorial.id,
          slug: prevTutorial.slug,
          title: prevTutorial.title
        } : null
      };
    });

    console.log("\\n🗺️ Tutorial Navigation Map:");
    tutorialNavigation.forEach(nav => {
      console.log(`${nav.title} (${nav.slug})`);
      console.log(`  ← Prev: ${nav.prev?.title || 'None'} (${nav.prev?.slug || 'N/A'})`);
      console.log(`  → Next: ${nav.next?.title || 'None'} (${nav.next?.slug || 'N/A'})`);
      console.log("");
    });

    console.log(" Quiz navigation mapping completed!");
    console.log("\\n📝 To use this in your quiz pages:");
    console.log("1. Fetch tutorial by quiz ID");
    console.log("2. Use tutorial.slug for navigation");
    console.log("3. Use tutorial.order to find next/prev tutorials");

  } catch (error) {
    console.error("❌ Error updating quiz navigation:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateQuizNavigationForSlugs()
  .then(() => {
    console.log("🎉 Quiz navigation update completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Failed to update quiz navigation:", error);
    process.exit(1);
  });

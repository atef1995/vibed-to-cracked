import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client";

/**
 * Update category durations based on actual tutorial estimated times
 *
 * Run with: npx tsx scripts/updateCategoryDurations.ts
 */

function formatDuration(totalMinutes: number): string {
  const totalHours = totalMinutes / 60;

  if (totalHours < 1) {
    return `${Math.round(totalMinutes)} min`;
  }

  if (totalHours < 8) {
    return totalHours < 2
      ? `${totalHours.toFixed(1)} hours`
      : `${Math.round(totalHours)} hours`;
  }

  // Convert to weeks (assuming ~8 hours per week)
  const weeks = totalHours / 8;
  if (weeks < 2) {
    return `${weeks.toFixed(1)} weeks`;
  }

  // For larger durations, show a range (e.g., "8-12 weeks")
  const minWeeks = Math.floor(weeks);
  const maxWeeks = Math.ceil(weeks * 1.3); // Add ~30% buffer for varying pace
  return `${minWeeks}-${maxWeeks} weeks`;
}

async function updateCategoryDurations() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Updating category durations based on tutorial times...\n");

    // Get all categories with their tutorials
    const categories = await prisma.category.findMany({
      where: { published: true },
      include: {
        tutorials: {
          where: { published: true },
          select: { estimatedTime: true, title: true },
        },
      },
      orderBy: { order: "asc" },
    });

    for (const category of categories) {
      const totalMinutes = category.tutorials.reduce(
        (sum, tutorial) => sum + (tutorial.estimatedTime || 0),
        0
      );
      const totalHours = (totalMinutes / 60).toFixed(1);
      const newDuration = formatDuration(totalMinutes);

      console.log(`${category.title}:`);
      console.log(`  Tutorials: ${category.tutorials.length}`);
      console.log(`  Total: ${totalMinutes} min (${totalHours} hrs)`);
      console.log(`  Old duration: "${category.duration}"`);
      console.log(`  New duration: "${newDuration}"`);

      // Update the category duration
      await prisma.category.update({
        where: { id: category.id },
        data: { duration: newDuration },
      });

      console.log(`  Updated!\n`);
    }

    console.log("All category durations updated successfully!");
  } catch (error) {
    console.error("Error updating category durations:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateCategoryDurations();

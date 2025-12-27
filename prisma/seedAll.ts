import { PrismaClient } from "@prisma/client";
import { seedCategories } from "./seedCategories";
import { seedTutorials } from "./seedTutorials";
import seedHtmlTutorials from "./seedHtmlTutorials";
import seedCssTutorials from "./seedCssTutorials";
import { seedSkills } from "./seeds/skillSeeds";
import { seedTypescriptOOP } from "./seeds/typescriptOOPSeeds";
import { seedExercises } from "./seedExercises";
import seedDsaTutorials from "./seedDsaTutorials";

const prisma = new PrismaClient();

async function seedAll() {
  try {
    console.log("🚀 Starting complete database seeding...");
    
    // First seed skills (independent)
    console.log("📚 Seeding skills...");
    await seedSkills();
    
    // Then seed categories
    console.log("📂 Seeding categories...");
    await seedCategories();
    
    // Then seed tutorials (which depend on categories)
    console.log("📖 Seeding tutorials...");
    await seedTutorials();
    
    // Seed HTML tutorials
    console.log("🌐 Seeding HTML tutorials...");
    await seedHtmlTutorials();
    
    // Seed CSS tutorials
    console.log("🎨 Seeding CSS tutorials...");
    await seedCssTutorials();
    
    // Seed DSA tutorials
    console.log("📊 Seeding DSA tutorials...");
    await seedDsaTutorials();
    
    // Seed TypeScript OOP tutorials and related content
    console.log("🔷 Seeding TypeScript OOP tutorials...");
    await seedTypescriptOOP();
    
    
    // Seed exercises
    console.log("💪 Seeding exercises...");
    await seedExercises();
    
    console.log("🎉 Complete seeding finished successfully!");
  } catch (error) {
    console.error("❌ Error during complete seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the complete seeding
seedAll().catch((e) => {
  console.error(e);
  process.exit(1);
});

export { seedAll };
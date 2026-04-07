import { getPrismaClient } from "./dbSeeds/seeds/utils/prisma-client";

const prisma = getPrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    data: { onboardingCompleted: true },
  });
  console.log(`Set onboardingCompleted=true for ${result.count} existing users`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

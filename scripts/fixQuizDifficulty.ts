import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  difficulty?: "easy" | "medium" | "hard";
}

// Simple heuristic to assign difficulty based on question characteristics
function assignDifficulty(
  question: Question,
  index: number,
  total: number
): "easy" | "medium" | "hard" {
  // If question already has difficulty, keep it
  if (question.difficulty) {
    return question.difficulty;
  }

  // Distribute questions: first third easy, middle third medium, last third hard
  const position = index / total;

  // Also consider question length and number of options as hints
  const questionLength = question.question?.length || 0;
  const hasCodeBlock =
    (question.question || "").includes("```") ||
    (question.question || "").includes("`");
  const optionsLength = (question.options || []).reduce(
    (sum, opt) => sum + (opt?.length || 0),
    0
  );

  // Longer questions with code tend to be harder
  let complexityScore = 0;
  if (hasCodeBlock) complexityScore += 2;
  if (questionLength > 200) complexityScore += 1;
  if (optionsLength > 150) complexityScore += 1;

  // Combine position and complexity
  if (position < 0.33 && complexityScore < 2) {
    return "easy";
  } else if (position > 0.66 || complexityScore >= 3) {
    return "hard";
  } else {
    return "medium";
  }
}

async function fixQuizDifficulty() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Checking quizzes for missing difficulty...\n");

    const quizzes = await prisma.quiz.findMany();
    let totalFixed = 0;
    let totalMissing = 0;

    for (const quiz of quizzes) {
      const questions = quiz.questions as Question[];
      const missing = questions.filter((q) => !q.difficulty);

      if (missing.length > 0) {
        totalMissing += missing.length;
        console.log(
          `${quiz.title}: ${missing.length}/${questions.length} missing difficulty`
        );

        // Fix the questions
        const fixedQuestions = questions.map((q, idx) => ({
          ...q,
          difficulty: assignDifficulty(q, idx, questions.length),
        }));

        // Update the quiz
        await prisma.quiz.update({
          where: { id: quiz.id },
          data: { questions: fixedQuestions },
        });

        totalFixed += missing.length;
        console.log(`  -> Fixed ${missing.length} questions`);
      }
    }

    console.log(`\nTotal: ${totalMissing} questions were missing difficulty`);
    console.log(`Fixed: ${totalFixed} questions`);
  } finally {
    await prisma.$disconnect();
  }
}

fixQuizDifficulty().catch(console.error);

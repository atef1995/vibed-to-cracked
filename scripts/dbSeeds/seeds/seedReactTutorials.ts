import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from "../../../src/generated/client";

let prisma: InstanceType<typeof PrismaClient> | null = null;

function getPrismaClient() {
  if (!prisma) {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/vibed_to_cracked',
    });
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}

export async function seedReactTutorials(customPrisma?: InstanceType<typeof PrismaClient>) {
  const client = customPrisma || getPrismaClient();
  console.log("⚛️ Seeding React tutorials...");

  try {
    // First, ensure the React category exists
    let reactCategory = await client.category.findUnique({
      where: { slug: "react" },
    });

    if (!reactCategory) {
      reactCategory = await client.category.create({
        data: {
          slug: "react",
          title: "React",
          description: "Master React, the most popular JavaScript library for building user interfaces",
          difficulty: "intermediate",
          topics: ["React", "Components", "State", "Hooks", "JSX"],
          duration: "8-12 weeks",
          iconBg: "bg-blue-100 dark:bg-blue-900",
          iconColor: "text-blue-600 dark:text-blue-400",
          badgeBg: "bg-blue-100 dark:bg-blue-900",
          badgeColor: "text-blue-800 dark:text-blue-200",
          dotColor: "bg-blue-600",
          order: 4,
          published: true,
        },
      });
      console.log("✅ Created React category");
    }

    // Delete existing React tutorials to start fresh
    const deleted = await client.tutorial.deleteMany({
      where: { categoryId: reactCategory.id },
    });
    console.log(`🗑️ Deleted ${deleted.count} existing React tutorials`);

    // React Tutorials - Improved progression
    const reactTutorials = [
      {
        slug: "what-is-react",
        title: "React Fundamentals: What is React and Why Should You Care?",
        description:
          "Discover what React is, why it's everywhere, and why learning it will level up your JavaScript skills",
        mdxFile: "react/01-what-is-react",
        category: "react",
        estimatedTime: 25.0,
        difficulty: 1,
        order: 1,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "jsx-syntax",
        title: "JSX Syntax: Writing HTML in JavaScript",
        description:
          "Master JSX syntax, expressions, and how React transforms JSX into real DOM elements",
        mdxFile: "react/02-jsx-syntax",
        category: "react",
        estimatedTime: 30.0,
        difficulty: 1,
        order: 2,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "components-and-props",
        title: "Components and Props: Building Reusable UI Blocks",
        description:
          "Learn to create functional components, pass data with props, and build your first reusable UI elements",
        mdxFile: "react/03-components-and-props",
        category: "react",
        estimatedTime: 40.0,
        difficulty: 1,
        order: 3,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "state-and-usestate",
        title: "State with useState: Making Components Interactive",
        description:
          "Learn how to manage component state with the useState hook and create truly interactive UIs",
        mdxFile: "react/04-state-and-usestate",
        category: "react",
        estimatedTime: 40.0,
        difficulty: 2,
        order: 4,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "conditional-rendering",
        title: "Conditional Rendering: Showing and Hiding UI Based on State",
        description:
          "Learn different patterns for conditional rendering in React - ternaries, && operator, and early returns",
        mdxFile: "react/05-conditional-rendering",
        category: "react",
        estimatedTime: 30.0,
        difficulty: 2,
        order: 5,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "lists-and-keys",
        title: "Rendering Lists: Keys, Mapping, and Dynamic Content",
        description:
          "Master rendering lists efficiently with proper key usage and understand React's reconciliation",
        mdxFile: "react/06-lists-and-keys",
        category: "react",
        estimatedTime: 35.0,
        difficulty: 2,
        order: 6,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "forms-and-inputs",
        title: "Forms in React: Controlled Components and User Input",
        description:
          "Master React forms, controlled vs uncontrolled inputs, validation, and handling submissions",
        mdxFile: "react/07-forms-and-inputs",
        category: "react",
        estimatedTime: 45.0,
        difficulty: 2,
        order: 7,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "useeffect-and-side-effects",
        title: "useEffect: Side Effects, Data Fetching, and Cleanup",
        description:
          "Learn to handle side effects like API calls, subscriptions, and DOM manipulation with useEffect",
        mdxFile: "react/08-useeffect-and-side-effects",
        category: "react",
        estimatedTime: 45.0,
        difficulty: 2,
        order: 8,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "styling-react-components",
        title: "Styling React: CSS, Tailwind, and CSS-in-JS",
        description:
          "Explore different approaches to styling React components - from CSS modules to Tailwind to styled-components",
        mdxFile: "react/09-styling-react-components",
        category: "react",
        estimatedTime: 40.0,
        difficulty: 2,
        order: 9,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "custom-hooks-and-useref",
        title: "Custom Hooks and useRef: Reusable Logic and DOM Access",
        description:
          "Build custom hooks to share logic between components and use useRef for DOM manipulation",
        mdxFile: "react/10-custom-hooks-and-useref",
        category: "react",
        estimatedTime: 50.0,
        difficulty: 3,
        order: 10,
        published: true,
        isPremium: true,
        requiredPlan: "VIBED",
      },
      {
        slug: "context-api",
        title: "Context API: Global State Without Prop Drilling",
        description:
          "Learn to use React Context for sharing state across your app and when to use it vs other solutions",
        mdxFile: "react/11-context-api",
        category: "react",
        estimatedTime: 45.0,
        difficulty: 3,
        order: 11,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "performance-optimization",
        title: "React Performance: Memoization, Profiling, and Optimization",
        description:
          "Master React.memo, useMemo, useCallback, and learn to identify and fix performance bottlenecks",
        mdxFile: "react/12-performance-optimization",
        category: "react",
        estimatedTime: 55.0,
        difficulty: 3,
        order: 12,
        published: true,
        isPremium: true,
        requiredPlan: "CRACKED",
      },
    ];

    // Upsert React tutorials
    for (const tutorial of reactTutorials) {
      const { category, ...tutorialData } = tutorial; // Remove the category string property
      await client.tutorial.upsert({
        where: { slug: tutorial.slug },
        update: {
          ...tutorialData,
          categoryId: reactCategory.id, // Connect to the React category
        },
        create: {
          ...tutorialData,
          categoryId: reactCategory.id, // Connect to the React category
        },
      });
    }

    console.log(`✅ Successfully seeded ${reactTutorials.length} React tutorials`);
  } catch (error) {
    console.error("❌ Error seeding React tutorials:", error);
    throw error;
  }
}

// Allow running as standalone script
  seedReactTutorials()
    .then(() => {
      console.log("🎉 React tutorial seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to seed React tutorials:", error);
      process.exit(1);
    })
    .finally(async () => {
      if (prisma) await prisma.$disconnect();
    });


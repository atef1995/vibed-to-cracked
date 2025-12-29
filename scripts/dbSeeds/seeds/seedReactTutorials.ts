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

    // React Tutorials
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
        slug: "jsx-and-components",
        title: "JSX Deep Dive: Writing Your First React Components",
        description:
          "Master JSX syntax, build functional components, and understand how to pass data with props",
        mdxFile: "react/02-jsx-and-components",
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
          "Master React components and props to create reusable, composable UI elements",
        mdxFile: "react/03-components-and-props",
        category: "react",
        estimatedTime: 40.0,
        difficulty: 2,
        order: 3,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "state-and-usestate",
        title: "State Management with useState: Making Components Interactive",
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
        slug: "react-hooks-deep-dive",
        title: "React Hooks Deep Dive: useEffect, useRef, and Custom Hooks",
        description:
          "Explore advanced React hooks and learn how to build custom hooks for reusable logic",
        mdxFile: "react/05-react-hooks-deep-dive",
        category: "react",
        estimatedTime: 50.0,
        difficulty: 3,
        order: 5,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "forms-and-controlled-components",
        title: "Forms in React: Building Controlled Components and Handling Input",
        description:
          "Master React forms, controlled components, validation, and user input handling",
        mdxFile: "react/06-forms-and-controlled-components",
        category: "react",
        estimatedTime: 45.0,
        difficulty: 2,
        order: 6,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "conditional-rendering",
        title: "Conditional Rendering: Showing and Hiding Components Based on State",
        description:
          "Learn different patterns for conditional rendering in React and when to use each one",
        mdxFile: "react/07-conditional-rendering",
        category: "react",
        estimatedTime: 35.0,
        difficulty: 2,
        order: 7,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "lists-and-keys",
        title: "Rendering Lists in React: Keys, Performance, and Best Practices",
        description:
          "Master rendering lists efficiently with proper key usage and learn React's reconciliation algorithm",
        mdxFile: "react/08-lists-and-keys",
        category: "react",
        estimatedTime: 40.0,
        difficulty: 2,
        order: 8,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "styling-react-components",
        title: "Styling React Components: CSS, Tailwind, and CSS-in-JS",
        description:
          "Learn different approaches to styling React components, from CSS files to Tailwind to styled-components",
        mdxFile: "react/09-styling-react-components",
        category: "react",
        estimatedTime: 45.0,
        difficulty: 2,
        order: 9,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "component-composition",
        title: "Component Composition Patterns: Building Complex UIs from Simple Parts",
        description:
          "Learn composition patterns like compound components, render props, and higher-order components",
        mdxFile: "react/10-component-composition",
        category: "react",
        estimatedTime: 50.0,
        difficulty: 3,
        order: 10,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "performance-optimization",
        title: "React Performance: Optimization Techniques and Profiling",
        description:
          "Learn memo, useMemo, useCallback, and code splitting to optimize React application performance",
        mdxFile: "react/11-performance-optimization",
        category: "react",
        estimatedTime: 55.0,
        difficulty: 3,
        order: 11,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
      },
      {
        slug: "context-api",
        title: "Global State with Context API: Avoiding Prop Drilling",
        description:
          "Learn to use React Context for global state management and when to use it instead of Redux",
        mdxFile: "react/12-context-api",
        category: "react",
        estimatedTime: 45.0,
        difficulty: 3,
        order: 12,
        published: true,
        isPremium: false,
        requiredPlan: "FREE",
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


import type { Tutorial, Category, Quiz } from "../generated/client";

export interface TutorialNavigationData {
  current: {
    id: string;
    slug: string;
    title: string;
    order: number;
  };
  prev: {
    id: string;
    slug: string;
    title: string;
    order: number;
    difficulty: number;
    estimatedTime: number;
  } | null;
  next: {
    id: string;
    slug: string;
    title: string;
    order: number;
    difficulty: number;
    estimatedTime: number;
  } | null;
  category: {
    slug: string;
    title: string;
  } | null;
  totalInCategory: number;
  currentPosition: number;
}

/**
 * Tutorial with associated category
 */
export type TutorialWithCategory = Tutorial & {
  category: Category;
};

/**
 * Tutorial with category and quizzes
 */
export type TutorialWithQuiz = Tutorial & {
  category: Category;
  quizzes: Quiz[];
};

/**
 * Tutorial with all related data
 */
export type TutorialWithAll = Tutorial & {
  category: Category;
  quizzes: Quiz[];
};

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Zap,
  Code,
  Database,
  Layout,
  Palette,
  Server,
  Shuffle,
  Play,
  Trophy,
  Flame,
  BookOpen,
} from "lucide-react";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useCategories } from "@/hooks/useTutorialQueries";
import { PageLayout } from "@/components/ui/PageLayout";

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  javascript: Code,
  fundamentals: Code,
  react: Zap,
  css: Palette,
  html: Layout,
  "data-structures": Database,
  nodejs: Server,
  dom: Layout,
  oop: Code,
  async: Zap,
  advanced: Code,
  github: Server,
};

// Gradient mapping for categories
const CATEGORY_GRADIENTS: Record<string, string> = {
  javascript: "from-yellow-400 to-orange-500",
  fundamentals: "from-yellow-400 to-orange-500",
  react: "from-cyan-400 to-blue-500",
  css: "from-pink-400 to-purple-500",
  html: "from-orange-400 to-red-500",
  "data-structures": "from-green-400 to-emerald-500",
  nodejs: "from-lime-400 to-green-500",
  dom: "from-blue-400 to-indigo-500",
  oop: "from-violet-400 to-purple-500",
  async: "from-teal-400 to-cyan-500",
  advanced: "from-red-400 to-pink-500",
  github: "from-gray-400 to-slate-500",
};

export default function QuizChallengePage() {
  const router = useRouter();
  const { data: quizzes, isLoading: quizzesLoading } = useQuizzes();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories(
    1,
    20
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState(10);

  const isLoading = quizzesLoading || categoriesLoading;
  const categories = categoriesData?.data || [];

  // Build category options from DB categories
  const categoryOptions = [
    {
      id: "mix",
      name: "Mix It Up!",
      icon: Shuffle,
      gradient: "from-purple-500 via-pink-500 to-red-500",
      description: "Random questions from all categories",
    },
    ...categories.map((cat) => ({
      id: cat.slug,
      name: cat.title,
      icon: CATEGORY_ICONS[cat.slug] || BookOpen,
      gradient: CATEGORY_GRADIENTS[cat.slug] || "from-gray-400 to-slate-500",
      description: cat.topics.slice(0, 3).join(", "),
    })),
  ];

  // Filter to only show categories that have quizzes
  const availableCategories = categoryOptions.filter((cat) => {
    if (cat.id === "mix") return true;
    if (!quizzes) return false;
    return quizzes.some(
      (q) =>
        q.slug.toLowerCase().includes(cat.id) ||
        q.title.toLowerCase().includes(cat.name.toLowerCase())
    );
  });

  const handleStartGame = () => {
    if (!selectedCategory) return;
    router.push(
      `/quiz-challenge/play?category=${selectedCategory}&count=${questionCount}`
    );
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="inline-block mb-4"
        >
          <div className="w-20 h-20 mx-auto bg-linear-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.4)]">
            <Trophy className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-black text-white mb-3"
        >
          Quiz Challenge
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-300 text-lg max-w-md mx-auto"
        >
          Pick a category, answer fast, build your streak! 🔥
        </motion.p>
      </div>

      {/* Category Selection */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Choose Your Battle
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableCategories.map((category, index) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;

              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    relative p-4 rounded-2xl text-left transition-all duration-300
                    ${
                      isSelected
                        ? `bg-linear-to-br ${category.gradient} shadow-[0_0_30px_rgba(168,85,247,0.4)]`
                        : "bg-white/10 hover:bg-white/15"
                    }
                  `}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="selected-border"
                      className="absolute inset-0 rounded-2xl border-2 border-white/50"
                    />
                  )}

                  <Icon
                    className={`w-8 h-8 mb-2 ${
                      isSelected ? "text-white" : "text-gray-300"
                    }`}
                  />
                  <h3
                    className={`font-bold text-sm md:text-base ${
                      isSelected ? "text-white" : "text-gray-200"
                    }`}
                  >
                    {category.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 line-clamp-2 ${
                      isSelected ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    {category.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Question Count Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            How Many Questions?
          </h2>

          <div className="flex flex-wrap gap-3">
            {[5, 10, 15, 20].map((count) => (
              <motion.button
                key={count}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setQuestionCount(count)}
                className={`
                  px-6 py-3 rounded-xl font-bold text-lg transition-all
                  ${
                    questionCount === count
                      ? "bg-linear-to-r from-green-400 to-emerald-500 text-white shadow-[0_0_20px_rgba(52,211,153,0.4)]"
                      : "bg-white/10 text-gray-300 hover:bg-white/20"
                  }
                `}
              >
                {count}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            whileHover={{ scale: selectedCategory ? 1.02 : 1 }}
            whileTap={{ scale: selectedCategory ? 0.98 : 1 }}
            onClick={handleStartGame}
            disabled={!selectedCategory || isLoading}
            className={`
              w-full py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3
              transition-all duration-300
              ${
                selectedCategory
                  ? "bg-linear-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] cursor-pointer"
                  : "bg-white/10 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap className="w-6 h-6" />
                </motion.div>
                Loading...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                {selectedCategory ? "Start Challenge!" : "Select a Category"}
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Stats Preview */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 p-4 bg-white/5 rounded-xl"
          >
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>
                Category:{" "}
                <span className="text-white font-medium">
                  {categoryOptions.find((c) => c.id === selectedCategory)?.name}
                </span>
              </span>
              <span>
                Questions:{" "}
                <span className="text-white font-medium">{questionCount}</span>
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </PageLayout>
  );
}

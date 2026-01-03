"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trophy,
  Flame,
  Sparkles,
  RotateCcw,
  Home,
  Zap,
  Share2,
  BookOpen,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { TutorialWithCategory } from "@/types/tutorial";
import { useQuizzes, Question } from "@/hooks/useQuizzes";
import { PageLayout } from "@/components/ui/PageLayout";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizChallengePlayPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get("category") || "mix";
  const questionCount = parseInt(searchParams.get("count") || "10", 10);

  // Fetch all quizzes
  const { data: quizzes, isLoading, error } = useQuizzes();

  // State for reshuffling questions
  const [shuffleKey, setShuffleKey] = useState(0);

  // Filter and randomize questions based on category
  const gameQuestions = useMemo(() => {
    if (!quizzes || quizzes.length === 0) return [];

    const allQuestions: (Question & {
      quizTitle: string;
      quizCategory: string;
      shuffledOptions: string[];
      correctIndex: number;
    })[] = [];

    quizzes.forEach((quiz) => {
      // Filter by category if not "mix"
      if (category !== "mix") {
        const matchesCategory =
          quiz.slug.toLowerCase().includes(category.toLowerCase()) ||
          quiz.title.toLowerCase().includes(category.toLowerCase());
        if (!matchesCategory) return;
      }

      // Derive category from quiz slug/title
      const quizCategory = quiz.slug.split("-")[0] || "general";

      // Add questions with quiz title and category for context
      quiz.questions.forEach((q) => {
        // Skip questions with missing or invalid data
        if (!q.options || !Array.isArray(q.options) || q.options.length === 0)
          return;
        if (
          q.correct === undefined ||
          q.correct < 0 ||
          q.correct >= q.options.length
        )
          return;

        // Shuffle options and track correct answer's new index
        const correctAnswer = q.options[q.correct];
        const shuffledOptions = shuffleArray([...q.options]);
        const correctIndex = shuffledOptions.indexOf(correctAnswer);

        allQuestions.push({
          ...q,
          quizTitle: quiz.title,
          quizCategory,
          shuffledOptions,
          correctIndex,
        });
      });
    });

    // Shuffle and take requested count
    return shuffleArray(allQuestions).slice(0, questionCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizzes, category, questionCount, shuffleKey]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [wrongCategories, setWrongCategories] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<
    TutorialWithCategory[]
  >([]);

  // Fetch tutorial recommendations based on wrong answers when quiz is complete
  useEffect(() => {
    if (!isComplete) return;

    async function fetchRecommendations() {
      try {
        // Get unique categories where user got answers wrong
        const uniqueWrongCategories = [...new Set(wrongCategories)];

        if (uniqueWrongCategories.length > 0) {
          // Fetch tutorials from categories user struggled with
          const fetchPromises = uniqueWrongCategories
            .slice(0, 2)
            .map((cat) =>
              fetch(`/api/tutorials/category/${cat}?limit=2`).then((res) =>
                res.ok ? res.json() : null
              )
            );
          const results = await Promise.all(fetchPromises);
          const tutorials = results
            .filter(Boolean)
            .flatMap((data) => data.data || [])
            .slice(0, 3);
          setRecommendations(tutorials);
        } else if (category === "mix") {
          // Perfect score on mix - fetch random tutorials
          const response = await fetch("/api/tutorials?limit=3");
          if (response.ok) {
            const data = await response.json();
            setRecommendations(data.data || []);
          }
        } else {
          // Perfect score on specific category - fetch from that category
          const response = await fetch(
            `/api/tutorials/category/${category}?limit=3`
          );
          if (response.ok) {
            const data = await response.json();
            setRecommendations(data.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    }

    fetchRecommendations();
  }, [isComplete, category]);

  const currentQuestion = gameQuestions[currentQuestionIndex];
  const totalQuestions = gameQuestions.length;
  const progress =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  // Fire confetti for correct answers
  const fireConfetti = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ["#22c55e", "#10b981", "#34d399", "#6ee7b7"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ["#22c55e", "#10b981", "#34d399", "#6ee7b7"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  // Fire sad particles for wrong answers
  const fireSadEffect = useCallback(() => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#ef4444", "#dc2626", "#b91c1c"],
      gravity: 2,
      scalar: 0.8,
    });
  }, []);

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;

    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === currentQuestion?.correctIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
      fireConfetti();
    } else {
      setStreak(0);
      fireSadEffect();
      // Track the category of the wrong answer for recommendations
      if (currentQuestion?.quizCategory) {
        setWrongCategories((prev) => [...prev, currentQuestion.quizCategory]);
      }
    }

    // Show explanation after delay
    setTimeout(() => {
      setShowExplanation(true);
    }, 800);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setShowExplanation(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setIsComplete(true);
      if (score >= totalQuestions * 0.7) {
        // Celebrate if passed
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
        });
      }
    }
  };

  const handleRestart = () => {
    // Reshuffle questions for a new game by changing shuffleKey
    setShuffleKey((prev) => prev + 1);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowExplanation(false);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setIsComplete(false);
    setWrongCategories([]);
    setRecommendations([]);
  };

  const handleShare = async () => {
    const text = `🎮 I scored ${score}/${totalQuestions} (${Math.round(
      (score / totalQuestions) * 100
    )}%) on the Quiz Challenge!\n🔥 Max streak: ${maxStreak}\n\nThink you can beat me?`;

    if (navigator.share) {
      try {
        await navigator.share({ text, url: window.location.href });
      } catch {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-16 h-16 text-yellow-400" />
        </motion.div>
      </div>
    );
  }

  if (error || gameQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-2xl mb-4">
            {error
              ? "Something went wrong 😢"
              : "No questions found for this category 🤔"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/quiz-challenge")}
            className="px-6 py-3 bg-white/10 backdrop-blur rounded-xl text-white font-bold"
          >
            Try Another Category
          </motion.button>
        </div>
      </div>
    );
  }

  // Completion Screen
  if (isComplete) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const isPerfect = percentage === 100;
    const passed = percentage >= 70;
    const emoji = isPerfect ? "🏆" : passed ? "🎉" : "😅";
    const title = isPerfect ? "PERFECT!" : passed ? "CRUSHED IT!" : "Almost!";

    return (
      <PageLayout className="flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md w-full"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            className="mb-6"
          >
            {passed ? (
              <Trophy className="w-28 h-28 mx-auto text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]" />
            ) : (
              <XCircle className="w-28 h-28 mx-auto text-red-400 drop-shadow-[0_0_30px_rgba(248,113,113,0.5)]" />
            )}
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            {emoji} {title}
          </h1>

          {/* Main Score */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 mb-6">
            <div className="text-6xl md:text-7xl font-black bg-linear-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
              {percentage}%
            </div>
            <p className="text-gray-300 text-lg">
              {score} out of {totalQuestions} correct
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-2xl font-bold text-white">
                  {maxStreak}
                </span>
              </div>
              <p className="text-gray-400 text-sm">Best Streak</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{score}</span>
              </div>
              <p className="text-gray-400 text-sm">Total Score</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="w-full py-4 bg-linear-to-r from-blue-500 to-cyan-500 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3"
            >
              <Share2 className="w-6 h-6" />
              Share Results
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRestart}
              className="w-full py-4 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-6 h-6" />
              Retry
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/quiz-challenge")}
              className="w-full py-4 bg-white/10 backdrop-blur rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3"
            >
              <Home className="w-6 h-6" />
              Change Category
            </motion.button>
          </div>

          {/* Tutorial Recommendations */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 w-full max-w-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                {wrongCategories.length > 0
                  ? "Brush up on these topics"
                  : "Keep learning"}
              </h3>
              <div className="space-y-3">
                {recommendations.map((tutorial) => (
                  <Link
                    key={tutorial.id}
                    href={`/tutorials/category/${tutorial.category.slug}/${tutorial.slug}`}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 hover:border-blue-400/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-1">
                            {tutorial.category.title}
                          </p>
                          <h4 className="font-semibold text-white truncate">
                            {tutorial.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {tutorial.estimatedTime} min
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 shrink-0" />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
              <Link
                href="/tutorials"
                className="mt-4 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                <span>Explore all tutorials</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </motion.div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="p-4 pt-6">
        {/* Progress Bar */}
        <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-linear-to-r from-green-400 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2">
            <span className="text-white font-bold">
              {currentQuestionIndex + 1}/{totalQuestions}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Streak Counter */}
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-linear-to-r from-orange-500 to-red-500 rounded-full px-4 py-2"
              >
                <Flame className="w-5 h-5 text-white" />
                <span className="text-white font-bold">{streak}</span>
              </motion.div>
            )}

            {/* Score */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Section */}
      <div className="flex-1 flex flex-col justify-center p-4 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 mb-8"
              animate={showResult ? { scale: [1, 1.02, 1] } : {}}
            >
              {/* Category & Difficulty Badges */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/50">
                  {currentQuestion?.quizCategory}
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full border ${
                    currentQuestion?.difficulty === "easy"
                      ? "bg-green-500/30 text-green-200 border-green-500/50"
                      : currentQuestion?.difficulty === "medium"
                      ? "bg-yellow-500/30 text-yellow-200 border-yellow-500/50"
                      : "bg-red-500/30 text-red-200 border-red-500/50"
                  }`}
                >
                  {currentQuestion?.difficulty}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center leading-tight">
                {currentQuestion?.question}
              </h2>
            </motion.div>

            {/* Options */}
            <div className="space-y-4">
              {currentQuestion?.shuffledOptions.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const showAsCorrect = showResult && isCorrect;
                const showAsWrong = showResult && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    whileHover={!showResult ? { scale: 1.02 } : {}}
                    whileTap={!showResult ? { scale: 0.98 } : {}}
                    animate={
                      showAsCorrect
                        ? {
                            scale: [1, 1.05, 1],
                            transition: { duration: 0.3 },
                          }
                        : showAsWrong
                        ? {
                            x: [0, -10, 10, -10, 10, 0],
                            transition: { duration: 0.4 },
                          }
                        : {}
                    }
                    className={`
                      w-full p-5 md:p-6 rounded-2xl text-left font-semibold text-lg md:text-xl
                      transition-all duration-300 flex items-center gap-4
                      ${
                        showAsCorrect
                          ? "bg-linear-to-r from-green-500 to-emerald-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                          : showAsWrong
                          ? "bg-linear-to-r from-red-500 to-rose-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                          : showResult && !isSelected
                          ? "bg-white/5 text-gray-400"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }
                    `}
                  >
                    <span
                      className={`
                      w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0
                      ${
                        showAsCorrect
                          ? "bg-white/30"
                          : showAsWrong
                          ? "bg-white/30"
                          : "bg-white/10"
                      }
                    `}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showAsCorrect && (
                      <CheckCircle2 className="w-8 h-8 text-white shrink-0" />
                    )}
                    {showAsWrong && (
                      <XCircle className="w-8 h-8 text-white shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && currentQuestion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 p-5 bg-white/10 backdrop-blur rounded-2xl"
                >
                  <p className="text-gray-200 text-base md:text-lg">
                    <span className="font-bold text-yellow-400">💡 </span>
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Next Button */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="p-4 pb-8"
          >
            <motion.button
              onClick={handleNextQuestion}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-bold text-xl flex items-center justify-center gap-3"
            >
              {currentQuestionIndex < totalQuestions - 1 ? (
                <>
                  Next Question
                  <ChevronRight className="w-6 h-6" />
                </>
              ) : (
                <>
                  See Results
                  <Trophy className="w-6 h-6" />
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

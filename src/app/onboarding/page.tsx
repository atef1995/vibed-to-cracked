"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useMood } from "@/components/providers/MoodProvider";
import { MOODS } from "@/lib/moods";
import { MoodId } from "@/types/mood";
import { MoodCard } from "@/components/MoodCard";
import getMoodColors from "@/lib/getMoodColors";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Code2,
  Layout,
  Server,
  Binary,
  Briefcase,
  Rocket,
  Coffee,
  Clock,
  Zap,
  Target,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

const EXPERIENCE_LEVELS = [
  {
    id: "complete-beginner",
    label: "Complete Beginner",
    description: "Never written a line of code",
    icon: Sparkles,
  },
  {
    id: "some-basics",
    label: "Know Some Basics",
    description: "Familiar with HTML, CSS, or basic JS",
    icon: Code2,
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Built small projects before",
    icon: Layout,
  },
  {
    id: "advanced",
    label: "Advanced",
    description: "Looking for specific topics to sharpen",
    icon: Target,
  },
] as const;

const LEARNING_GOALS = [
  {
    id: "web-fundamentals",
    label: "Web Fundamentals",
    description: "HTML, CSS, JavaScript basics",
    icon: BookOpen,
  },
  {
    id: "frontend",
    label: "Frontend",
    description: "React, CSS, interactive UIs",
    icon: Layout,
  },
  {
    id: "backend",
    label: "Backend",
    description: "Node.js, APIs, databases",
    icon: Server,
  },
  {
    id: "dsa",
    label: "Data Structures & Algorithms",
    description: "Problem solving, interview prep",
    icon: Binary,
  },
  {
    id: "career-switch",
    label: "Career Switch",
    description: "Structured path to a dev job",
    icon: Briefcase,
  },
  {
    id: "side-projects",
    label: "Side Projects",
    description: "Build real things for fun or profit",
    icon: Rocket,
  },
] as const;

const TIME_OPTIONS = [
  { id: 15, label: "Casual", description: "15 min/day", icon: Coffee },
  { id: 30, label: "Steady", description: "30 min/day", icon: Clock },
  { id: 60, label: "Dedicated", description: "1 hour/day", icon: Zap },
  { id: 120, label: "Intensive", description: "2+ hours/day", icon: Target },
] as const;

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { currentMood, setMood } = useMood();
  const moodColors = getMoodColors(currentMood.id);

  const [step, setStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<MoodId>(
    (currentMood.id as MoodId) || MoodId.CHILL
  );
  const [experienceLevel, setExperienceLevel] = useState("");
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/onboarding");
    }
    if (session?.user?.onboardingCompleted) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const firstName = session.user.name?.split(" ")[0] || "there";

  const handleMoodSelect = async (moodId: MoodId) => {
    setSelectedMood(moodId);
    try {
      await setMood(moodId);
    } catch {
      // Mood will be saved during final submit
    }
  };

  const toggleGoal = (goalId: string) => {
    setLearningGoals((prev) => {
      if (prev.includes(goalId)) return prev.filter((g) => g !== goalId);
      if (prev.length >= 3) return prev;
      return [...prev, goalId];
    });
  };

  const canAdvance = () => {
    switch (step) {
      case 0:
        return true; // Welcome — always can advance
      case 1:
        return !!selectedMood;
      case 2:
        return !!experienceLevel;
      case 3:
        return learningGoals.length > 0;
      case 4:
        return !!dailyGoalMinutes;
      default:
        return false;
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: selectedMood,
          experienceLevel,
          learningGoals,
          dailyGoalMinutes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error("Onboarding failed:", data.error);
        return;
      }

      await update();
      router.push("/dashboard?onboarded=true");
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else handleComplete();
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div
      className={`min-h-screen bg-linear-to-br ${moodColors.gradient} flex flex-col`}
    >
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full ${moodColors.button} transition-all duration-500 ease-out`}
          style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-6 animate-fade-in">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${moodColors.badge} text-sm font-medium`}
              >
                <Sparkles className="h-4 w-4" />
                Welcome
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Hey {firstName}, welcome to Vibed to Cracked
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                A few quick questions so we can set up your learning path. Takes
                about 30 seconds.
              </p>
            </div>
          )}

          {/* Step 1: Mood */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  How do you like to learn?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your mood changes quiz difficulty, time limits, and the whole
                  platform vibe.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(MOODS).map((mood) => (
                  <MoodCard
                    key={mood.id}
                    mood={mood}
                    variant="selector"
                    isSelected={selectedMood === mood.id}
                    onClick={() => handleMoodSelect(mood.id as MoodId)}
                    showDescription={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Experience Level */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Where are you starting from?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  This helps us recommend the right tutorials for you.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXPERIENCE_LEVELS.map((level) => {
                  const Icon = level.icon;
                  const isSelected = experienceLevel === level.id;
                  return (
                    <button
                      key={level.id}
                      onClick={() => setExperienceLevel(level.id)}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? `${moodColors.border} ${moodColors.bg} shadow-md`
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2
                          className={`absolute top-3 right-3 h-5 w-5 ${moodColors.text}`}
                        />
                      )}
                      <Icon
                        className={`h-6 w-6 mb-3 ${isSelected ? moodColors.text : "text-gray-400 dark:text-gray-500"}`}
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {level.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {level.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Learning Goals */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  What do you want to learn?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Pick up to 3. We&#39;ll prioritize these in your study plan.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LEARNING_GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = learningGoals.includes(goal.id);
                  const isDisabled =
                    !isSelected && learningGoals.length >= 3;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      disabled={isDisabled}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? `${moodColors.border} ${moodColors.bg} shadow-md`
                          : isDisabled
                            ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-50 cursor-not-allowed"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2
                          className={`absolute top-3 right-3 h-5 w-5 ${moodColors.text}`}
                        />
                      )}
                      <Icon
                        className={`h-6 w-6 mb-3 ${isSelected ? moodColors.text : "text-gray-400 dark:text-gray-500"}`}
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {goal.label}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {goal.description}
                      </p>
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                {learningGoals.length}/3 selected
              </p>
            </div>
          )}

          {/* Step 4: Daily Commitment */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  How much time do you have?
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  No wrong answer. You can always change this later.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TIME_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = dailyGoalMinutes === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setDailyGoalMinutes(option.id)}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? `${moodColors.border} ${moodColors.bg} shadow-md`
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2
                          className={`absolute top-3 right-3 h-5 w-5 ${moodColors.text}`}
                        />
                      )}
                      <Icon
                        className={`h-6 w-6 mb-3 ${isSelected ? moodColors.text : "text-gray-400 dark:text-gray-500"}`}
                      />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {option.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10">
            {step > 0 ? (
              <button
                onClick={back}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={next}
              disabled={!canAdvance() || isSubmitting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 min-w-32 justify-center ${
                canAdvance() && !isSubmitting
                  ? `${moodColors.button} hover:opacity-90 active:scale-95`
                  : "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step === TOTAL_STEPS - 1 ? (
                <>
                  Start Learning
                  <Sparkles className="h-4 w-4" />
                </>
              ) : step === 0 ? (
                <>
                  Let&#39;s go
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Step indicator dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step
                    ? `w-6 ${moodColors.button}`
                    : i < step
                      ? `w-2 ${moodColors.button} opacity-50`
                      : "w-2 bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

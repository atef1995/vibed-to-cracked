"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Waves,
  Wind,
  Heart,
  Zap,
  Flame,
  Rocket,
  Dumbbell,
  Settings,
  Target,
  Sparkles,
  Stars,
  Trophy,
  Droplets,
  Code2,
  Check,
  MessageCircle,
  Bot,
  Play,
  Monitor,
  Video,
  ArrowRight,
  BookOpen,
  Brain,
} from "lucide-react";
import { MOODS } from "@/lib/moods";
import { getMoodIcon } from "@/lib/getMoodIcon";
import { MoodCard } from "@/components/MoodCard";
import CrackedGlitch from "@/components/ui/CrackedGlitch";
import { useCategories } from "@/hooks/useTutorialQueries";

const TUTOR_CONVERSATIONS = [
  [
    {
      role: "user" as const,
      text: "What does .map() actually do under the hood?",
    },
    {
      role: "tutor" as const,
      text: ".map() creates a new array by calling your function on every element. Think of it like a factory line \u2014 each item goes in, gets transformed, and comes out the other side.",
    },
    { role: "user" as const, text: "How is it different from forEach then?" },
    {
      role: "tutor" as const,
      text: ".map() returns the new array, forEach returns nothing. Need the results? Use .map(). Just want side effects? forEach.",
    },
  ],
  [
    {
      role: "user" as const,
      text: "I keep getting 'Cannot read property of undefined' \u2014 what's going on?",
    },
    {
      role: "tutor" as const,
      text: "You're trying to access a property on something that doesn't exist yet. Add a console.log() right before the error line to see what's actually there.",
    },
    {
      role: "user" as const,
      text: "Oh! My API response has data nested inside a .data property.",
    },
    {
      role: "tutor" as const,
      text: "Classic one. Use optional chaining: response?.data?.users keeps it safe. You'll never have to guess about nested data again.",
    },
  ],
  [
    {
      role: "user" as const,
      text: "When should I use async/await vs .then() chains?",
    },
    {
      role: "tutor" as const,
      text: "async/await is almost always cleaner. Reads top to bottom like regular code. .then() chains get messy fast, especially with error handling.",
    },
    {
      role: "user" as const,
      text: "But what about running multiple requests at once?",
    },
    {
      role: "tutor" as const,
      text: "Promise.all() works with both styles. The real win with await is readability \u2014 your future self will thank you when debugging at 2am.",
    },
  ],
];

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [backgroundElements, setBackgroundElements] = useState<
    Array<{ left: string; top: string }>
  >([]);

  // AI Tutor animated chat state
  const tutorSectionRef = useRef<HTMLDivElement>(null);
  const tutorInView = useInView(tutorSectionRef, { once: false, amount: 0.3 });
  const [convoIdx, setConvoIdx] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<
    (typeof TUTOR_CONVERSATIONS)[0]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const animationRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Fetch categories using existing hook
  const { data: categoriesData } = useCategories(1, 20);
  const categories = categoriesData?.data || [];

  // Filter categories by difficulty level from DB
  const beginnerCategories = categories
    .filter((c) => c.difficulty === "beginner")
    .sort((a, b) => a.order - b.order);
  const intermediateCategories = categories
    .filter((c) => c.difficulty === "intermediate")
    .sort((a, b) => a.order - b.order);
  const advancedCategories = categories
    .filter((c) => c.difficulty === "advanced")
    .sort((a, b) => a.order - b.order);

  // Generate random positions only on client side to avoid hydration mismatch
  useEffect(() => {
    const elements = [...Array(6)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setBackgroundElements(elements);
  }, []);

  // Animated tutor chat — plays through messages when section is in view
  const playConversation = useCallback((index: number) => {
    const convo = TUTOR_CONVERSATIONS[index];
    animationRef.current.forEach(clearTimeout);
    animationRef.current = [];
    setVisibleMessages([]);
    setIsTyping(false);

    let delay = 600;
    convo.forEach((msg, i) => {
      if (msg.role === "tutor") {
        // Show typing indicator before tutor message
        const typingTimer = setTimeout(() => setIsTyping(true), delay);
        animationRef.current.push(typingTimer);
        delay += 1400;
        const msgTimer = setTimeout(() => {
          setIsTyping(false);
          setVisibleMessages((prev) => [...prev, msg]);
        }, delay);
        animationRef.current.push(msgTimer);
        delay += 1200;
      } else {
        const msgTimer = setTimeout(() => {
          setVisibleMessages((prev) => [...prev, msg]);
        }, delay);
        animationRef.current.push(msgTimer);
        delay += 1000;
      }
    });

    // Cycle to next conversation after all messages shown
    const cycleTimer = setTimeout(() => {
      const next = (index + 1) % TUTOR_CONVERSATIONS.length;
      setConvoIdx(next);
    }, delay + 3000);
    animationRef.current.push(cycleTimer);
  }, []);

  useEffect(() => {
    if (tutorInView) {
      playConversation(convoIdx);
    } else {
      animationRef.current.forEach(clearTimeout);
      animationRef.current = [];
      setVisibleMessages([]);
      setIsTyping(false);
    }
    return () => {
      animationRef.current.forEach(clearTimeout);
      animationRef.current = [];
    };
  }, [tutorInView, convoIdx, playConversation]);

  const handleMoodClick = (moodId: string) => {
    setSelectedMood(moodId);
    setShowAnimation(true);

    // Store selected mood in the format expected by MoodProvider
    const moodPreferences = {
      selectedMood: moodId,
    };
    localStorage.setItem("mood-preferences", JSON.stringify(moodPreferences));

    // Also store the selected mood separately for the sign-in callback
    localStorage.setItem("selectedMood", moodId);

    // Show animation for 2 seconds before redirecting
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  };

  const getMoodAnimation = (moodId: string) => {
    switch (moodId) {
      case "chill":
        return {
          particles: [Waves, Wind, Heart],
          message: "Entering Chill Mode...",
          color: "from-blue-400 to-cyan-300",
          animation: "float",
        };
      case "rush":
        return {
          particles: [Zap, Flame, Rocket],
          message: "Rush Mode Activated!",
          color: "from-orange-400 to-red-400",
          animation: "bounce",
        };
      case "grind":
        return {
          particles: [Dumbbell, Settings, Target],
          message: "Grind Mode Engaged!",
          color: "from-red-500 to-red-500",
          animation: "pulse",
        };
      default:
        return {
          particles: [Sparkles, Stars, Trophy],
          message: "Let's Go!",
          color: "from-blue-400 to-red-400",
          animation: "bounce",
        };
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundElements.map((element, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-linear-to-r from-blue-200/20 to-red-200/20 dark:from-blue-800/20 dark:to-red-800/20 blur-xl"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              left: element.left,
              top: element.top,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-10 pb-6">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            From <span className="text-blue-600">Vibed</span> to{" "}
            <CrackedGlitch
              className="text-red-600"
              size="large"
              intensity="medium"
            />
          </motion.h1>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Become a full-stack web developer and build 10 real portfolio
            projects in 12 weeks. Tell us your goals and we build a learning
            path that fits your energy level.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard"
                className="inline-block border-2 border-transparent/5 bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer text-center whitespace-nowrap"
              >
                Start Learning
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/free-course"
                className="inline-block border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
              >
                Get Free Course
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Quick Feature Nav Strip — visible without scrolling */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {[
            {
              icon: BookOpen,
              label: "Tutorials",
              desc: "Step-by-step lessons",
              href: "/tutorials",
              color: "blue",
            },
            {
              icon: Brain,
              label: "Quizzes",
              desc: "Test your knowledge",
              href: "/quiz",
              color: "green",
            },
            {
              icon: Code2,
              label: "Exercises",
              desc: "Practice coding",
              href: "/exercises",
              color: "orange",
            },
            {
              icon: Video,
              label: "Mock Interviews",
              desc: "AI interview prep",
              href: "/mock-interview",
              color: "violet",
            },
          ].map((item) => (
            <motion.div key={item.label} whileHover={{ y: -2 }}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-md transition-all group`}
              >
                <div
                  className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.color === "blue"
                      ? "bg-blue-100 dark:bg-blue-900/30"
                      : item.color === "green"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : item.color === "orange"
                          ? "bg-orange-100 dark:bg-orange-900/30"
                          : "bg-violet-100 dark:bg-violet-900/30"
                  }`}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      item.color === "blue"
                        ? "text-blue-600 dark:text-blue-400"
                        : item.color === "green"
                          ? "text-green-600 dark:text-green-400"
                          : item.color === "orange"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-violet-600 dark:text-violet-400"
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Platform Demo Showcase */}
        <motion.div
          className="mb-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-2xl bg-gray-900 aspect-video group">
            {/* Replace this div's contents with a <video> or <img> tag */}
            {/* Example: <video src="/demo.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover" /> */}
            {/* Example: <img src="/demo.gif" alt="Platform demo" className="w-full h-full object-cover" /> */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80">
              <video
                src="/vtc.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            {/* Fake browser chrome */}
            <div className="absolute top-0 inset-x-0 h-8 bg-gray-800 flex items-center px-3 gap-1.5 pointer-events-none">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-gray-500">
                vibed-to-cracked.com
              </span>
            </div>
          </div>
        </motion.div>

        {/* Mood Selection Preview */}
        <motion.div
          id="mood-selection"
          className="mb-12 relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            Choose Your Learning Vibe
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.values(MOODS).map((mood, index) => (
              <motion.div
                key={mood.id}
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: 0.6 + index * 0.1,
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.2 },
                }}
                className="relative"
              >
                <MoodCard
                  mood={mood}
                  variant="homepage"
                  onClick={handleMoodClick}
                  showClickIndicator={true}
                />

                {/* Idle animations for each mood */}
                <motion.div
                  className="absolute -top-2 -right-2 text-blue-500"
                  animate={{
                    y:
                      mood.id === "chill"
                        ? [-5, 5, -5]
                        : mood.id === "rush"
                          ? [-10, 0, -10]
                          : [-3, 3, -3],
                    rotate:
                      mood.id === "chill"
                        ? [-5, 5, -5]
                        : mood.id === "rush"
                          ? [0, 10, 0]
                          : [0, 0, 0],
                  }}
                  transition={{
                    duration:
                      mood.id === "chill" ? 3 : mood.id === "rush" ? 1.5 : 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {mood.id === "chill" ? (
                    <Droplets className="w-6 h-6 text-blue-400" />
                  ) : mood.id === "rush" ? (
                    <Zap className="w-6 h-6 text-orange-400" />
                  ) : (
                    <Flame className="w-6 h-6 text-red-400" />
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Animation Overlay */}
          <AnimatePresence>
            {showAnimation && selectedMood && (
              <motion.div
                className="fixed backdrop-blur-sm inset-0 z-50 flex items-center justify-center bg-black/80 transition-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-center text-white"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    duration: 0.5,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                >
                  {/* Animated Background */}
                  <motion.div
                    className={`absolute  h-full w-full inset-0 rounded-full bg-linear-to-r ${
                      getMoodAnimation(selectedMood).color
                    } opacity-20`}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 0.5] }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />

                  {/* Mood Icon */}
                  <motion.div
                    className="text-8xl mb-6 relative z-10"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.2,
                      type: "spring",
                      stiffness: 150,
                    }}
                  >
                    {(() => {
                      const Icon = getMoodIcon(
                        MOODS[selectedMood as keyof typeof MOODS]?.icon ||
                          "Cloud"
                      );
                      return <Icon className="w-12 h-12" />;
                    })()}
                  </motion.div>

                  {/* Animated Particles */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(8)].map((_, i) => {
                      const ParticleIcon =
                        getMoodAnimation(selectedMood).particles[i % 3];
                      return (
                        <motion.div
                          key={i}
                          className="absolute"
                          style={{
                            left: `${20 + i * 10}%`,
                            top: `${30 + (i % 3) * 20}%`,
                          }}
                          initial={{
                            opacity: 0,
                            scale: 0,
                            x: 0,
                            y: 0,
                          }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                            x: [0, i % 2 ? 50 : -50],
                            y: [0, i % 2 ? -50 : 50],
                          }}
                          transition={{
                            duration: 1.5,
                            delay: 0.5 + i * 0.1,
                            ease: "easeOut",
                          }}
                        >
                          <ParticleIcon className="w-8 h-8 text-white" />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Message */}
                  <motion.h2
                    className="text-4xl font-bold mb-4 relative z-10"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    {getMoodAnimation(selectedMood).message}
                  </motion.h2>

                  {/* Loading indicator */}
                  <motion.div
                    className="flex justify-center space-x-2 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-white rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 0.6,
                          delay: i * 0.2,
                          repeat: Infinity,
                          repeatType: "loop",
                        }}
                      />
                    ))}
                  </motion.div>

                  <motion.p
                    className="text-lg mt-4 opacity-75 relative z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                  >
                    Preparing your personalized experience...
                  </motion.p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Curriculum Roadmap Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Your Learning Path to Mastery
          </motion.h2>
          <motion.p
            className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            A structured curriculum that takes you from complete beginner to
            job-ready developer
          </motion.p>

          <div className="max-w-5xl mx-auto">
            {/* Beginner Level */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                  Level 1: Beginner
                </div>
                <div className="h-px flex-1 bg-linear-to-r from-green-300 to-transparent dark:from-green-700"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {beginnerCategories.map((category, idx) => (
                  <motion.div
                    key={category.slug}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {category.title}
                      </h3>
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {category.topics.slice(0, 3).join(", ")}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {category.duration}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Intermediate Level */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-semibold">
                  Level 2: Intermediate
                </div>
                <div className="h-px flex-1 bg-linear-to-r from-blue-300 to-transparent dark:from-blue-700"></div>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                {intermediateCategories.map((category, idx) => (
                  <motion.div
                    key={category.slug}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {category.title}
                      </h3>
                      <Check className="w-5 h-5 text-blue-500 shrink-0" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {category.topics.slice(0, 3).join(", ")}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {category.duration}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Advanced Level */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-semibold">
                  Level 3: Advanced
                </div>
                <div className="h-px flex-1 bg-linear-to-r from-red-300 to-transparent dark:from-red-700"></div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {advancedCategories.map((category, idx) => (
                  <motion.div
                    key={category.slug}
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {category.title}
                      </h3>
                      <Check className="w-5 h-5 text-red-500 shrink-0" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {category.topics.slice(0, 3).join(", ")}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {category.duration}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Total Duration */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-linear-to-r from-blue-600 to-red-600 text-white px-6 py-3 rounded-lg font-semibold">
                <Trophy className="w-5 h-5" />
                Complete Curriculum: 40-60 hours to job-ready skills
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* AI Tutor Section */}
        <motion.div
          ref={tutorSectionRef}
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Your Personal AI Tutor, Always On
          </motion.h2>
          <motion.p
            className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Stuck on a concept? Highlight any code or text and get instant,
            context-aware explanations tailored to your mood and skill level.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            {/* Left: Animated chat */}
            <motion.div
              className="relative bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-2xl"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Chat header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-gray-800">
                <Bot className="w-5 h-5 text-blue-400" />
                <span className="text-sm font-medium text-gray-200">
                  AI Tutor
                </span>
                <span className="ml-auto text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  Online
                </span>
              </div>
              {/* Animated messages */}
              <div className="p-4 space-y-3 min-h-55">
                <AnimatePresence mode="popLayout">
                  {visibleMessages.map((msg, i) => (
                    <motion.div
                      key={`${convoIdx}-${i}`}
                      className={`flex gap-2 ${msg.role === "tutor" ? "justify-end" : ""}`}
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <div
                        className={`rounded-lg px-3 py-2 max-w-[85%] ${
                          msg.role === "user"
                            ? "bg-blue-600/20 border border-blue-500/30"
                            : "bg-gray-700"
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            msg.role === "user"
                              ? "text-blue-100"
                              : "text-gray-200"
                          }`}
                        >
                          {msg.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      className="flex items-center gap-1 text-gray-500 text-xs pl-1"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse" />
                      <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                      <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]" />
                      <span className="ml-1">Typing...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Conversation indicator dots */}
              <div className="flex justify-center gap-1.5 pb-3">
                {TUTOR_CONVERSATIONS.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                      i === convoIdx ? "bg-blue-400" : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
            </motion.div>

            {/* Right: Feature bullets + dynamic stats */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {[
                {
                  icon: MessageCircle,
                  title: "Context-Aware Answers",
                  desc: "The tutor reads the tutorial, challenge, or exercise you're on and gives answers specific to what you're learning.",
                },
                {
                  icon: Sparkles,
                  title: "Mood-Adaptive Personality",
                  desc: "Chill mode gets a patient Zen tutor. Rush mode gets rapid-fire Bolt. Grind mode gets the no-nonsense Forge.",
                },
                {
                  icon: Code2,
                  title: "Highlight-to-Ask",
                  desc: "Select any code or text on the page and ask about it directly. No copy-pasting into ChatGPT.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="flex gap-4 items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-600/10 dark:bg-blue-400/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}

              {/* Topic tags */}
              <motion.div
                className="pt-4 border-t border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Works across all content
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Tutorials",
                    "Practice Challenges",
                    "Exercises",
                    "Code Examples",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Mock Interview Feature Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ace Your Next Tech Interview
          </motion.h2>
          <motion.p
            className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Practice with AI interviewers using real questions from Google,
            Meta, Amazon, and more. Get scored on technical accuracy,
            communication, and problem-solving.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            {/* Left: Interview preview card */}
            <motion.div
              className="relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-xl"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              {/* Header bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <Video className="w-5 h-5 text-violet-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Mock Interview Session
                </span>
                <span className="ml-auto text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                  Live
                </span>
              </div>
              {/* Interview content */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Google Frontend Interview
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Senior Engineer Level
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    &quot;Can you explain the difference between event bubbling
                    and event capturing? Give me a practical example.&quot;
                  </p>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Target className="w-4 h-4" /> 5 rounds
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Trophy className="w-4 h-4" /> AI scored
                    </span>
                  </div>
                  <span className="text-violet-600 dark:text-violet-400 font-semibold">
                    8.5/10
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Right: Feature bullets + CTA */}
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              {[
                {
                  icon: Sparkles,
                  title: "Real Company Questions",
                  desc: "Practice with actual interview questions from FAANG companies, startups, and everything in between.",
                },
                {
                  icon: MessageCircle,
                  title: "AI-Powered Feedback",
                  desc: "Get detailed scores on technical accuracy, code quality, communication, and problem-solving approach.",
                },
                {
                  icon: Target,
                  title: "Multiple Difficulty Levels",
                  desc: "From junior to senior roles. Pick your target company and seniority level for tailored questions.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  className="flex gap-4 items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                >
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-violet-600/10 dark:bg-violet-400/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Link
                  href="/mock-interview"
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Try Mock Interview <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why <span className="text-blue-600">Vibed</span> to{" "}
            <CrackedGlitch
              className="text-red-600"
              size="small"
              intensity="low"
            />
            ?
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Trophy,
                title: "Build 10+ Portfolio Projects",
                description:
                  "Create real-world projects that impress employers and land you interviews",
              },
              {
                icon: Target,
                title: "Job-Ready in 12 Weeks",
                description:
                  "Structured learning path from beginner to employable developer",
              },
              {
                icon: Zap,
                title: "Learn at Your Own Pace",
                description:
                  "Mood-adaptive content adjusts to your energy level - no burnout",
              },
              {
                icon: Code2,
                title: "Master Modern JavaScript",
                description:
                  "From basics to advanced - ES6+, async/await, APIs, and Node.js",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.2 },
                }}
              >
                <motion.div
                  className="flex justify-center mb-4"
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 },
                  }}
                >
                  <feature.icon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </motion.div>
                <h3 className="text-gray-900 dark:text-gray-100 text-xl font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Feature Showcase Gallery */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            See It In Action
          </motion.h2>
          <motion.p
            className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Real screenshots and recordings from the platform
          </motion.p>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: "Mood-Adaptive Learning",
                description:
                  "Pick your vibe and the entire experience adapts -- content tone, tutor personality, and UI feel.",
                // Replace placeholder with: src="/showcase/mood-system.gif" or a video
                mediaSrc: "/moods.mp4" as string | null,
              },
              {
                title: "Interactive Code Editor",
                description:
                  "Write and run JavaScript right in the browser. No setup, no installs, instant feedback.",
                mediaSrc: "/task-interactive.mp4" as string | null,
              },
              {
                title: "AI Tutor Conversations",
                description:
                  "Highlight code, ask questions, get contextual answers on any tutorial or challenge.",
                mediaSrc: "/ai-tutor.mp4" as string | null,
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                {/* Media area -- replace placeholder with <img> or <video> */}
                <div className="relative aspect-video bg-gray-100 dark:bg-gray-900">
                  {item.mediaSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <video
                      src={item.mediaSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <Monitor className="w-10 h-10 text-gray-400 dark:text-gray-600 mb-2" />
                      <span className="text-xs text-gray-400 dark:text-gray-600">
                        Add video or GIF
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Free Course Promotion */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-linear-to-r from-orange-500 to-pink-500 rounded-2xl p-8 md:p-12 text-white shadow-xl">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-semibold mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                Limited Time Offer
              </motion.div>
              <motion.h2
                className="text-3xl md:text-4xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Not Ready to Commit? Start with Our Free Course!
              </motion.h2>
              <motion.p
                className="text-xl mb-6 text-orange-100"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Get our 5-day JavaScript crash course delivered to your inbox —
                absolutely free. No credit card required.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link
                  href="/free-course"
                  className="inline-block bg-white text-orange-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Get Free Course →
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Choose Us Over Alternatives?
          </motion.h2>
          <motion.p
            className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            See how we stack up against other learning options
          </motion.p>

          <div className="max-w-5xl mx-auto overflow-x-auto">
            <motion.table
              className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <thead className="bg-linear-to-r from-blue-600 to-red-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold">
                    YouTube/Free
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Bootcamps
                  </th>
                  <th className="px-6 py-4 text-center font-semibold bg-white/20">
                    Vibed to Cracked
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  {
                    feature: "Structured Curriculum",
                    youtube: false,
                    bootcamp: true,
                    us: true,
                  },
                  {
                    feature: "Mood-Adaptive Learning",
                    youtube: false,
                    bootcamp: false,
                    us: true,
                  },
                  {
                    feature: "Learn at Your Pace",
                    youtube: true,
                    bootcamp: false,
                    us: true,
                  },
                  {
                    feature: "Portfolio Projects",
                    youtube: false,
                    bootcamp: true,
                    us: true,
                  },
                  {
                    feature: "Interactive Code Editor",
                    youtube: false,
                    bootcamp: true,
                    us: true,
                  },
                  {
                    feature: "AI Tutor on Every Page",
                    youtube: false,
                    bootcamp: false,
                    us: true,
                  },
                  {
                    feature: "AI Mock Interview Prep",
                    youtube: false,
                    bootcamp: false,
                    us: true,
                  },
                  {
                    feature: "Progress Tracking",
                    youtube: false,
                    bootcamp: true,
                    us: true,
                  },
                  {
                    feature: "Cost",
                    youtube: "Free",
                    bootcamp: "$15k-20k",
                    us: "$9.98/mo",
                  },
                  {
                    feature: "Time Commitment",
                    youtube: "Self-paced",
                    bootcamp: "3-6 months full-time",
                    us: "12 weeks part-time",
                  },
                ].map((row, idx) => (
                  <motion.tr
                    key={row.feature}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.youtube === "boolean" ? (
                        row.youtube ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {row.youtube}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof row.bootcamp === "boolean" ? (
                        row.bootcamp ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {row.bootcamp}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center bg-blue-50 dark:bg-blue-900/20">
                      {typeof row.us === "boolean" ? (
                        row.us ? (
                          <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )
                      ) : (
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          {row.us}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center bg-white dark:bg-gray-900 rounded-2xl p-12 shadow-lg"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.2 },
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4"
          >
            <div className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Early Adopter Pricing Active
            </div>
          </motion.div>
          <motion.h2
            className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Ready to Transform Yourself From Vibe Coding To Cracked?
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Master Web development with mood-adaptive learning and a personal AI
            tutor that actually helps you when you&apos;re stuck.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/dashboard"
                className="inline-block bg-linear-to-r from-blue-600 to-red-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started Free
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/tutorials"
                className="inline-block border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Browse Tutorials
              </Link>
            </motion.div>
          </motion.div>
          <motion.p
            className="text-sm text-gray-500 dark:text-gray-400 mt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Try 5 tutorials free without signup • No credit card required
          </motion.p>
          <motion.div
            className="flex flex-wrap justify-center items-center gap-6 mt-8 text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Secure payment via Stripe</span>
            </div>
          </motion.div>
          <motion.p
            className="text-xs text-gray-400 dark:text-gray-500 mt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            Can&apos;t afford premium?{" "}
            <Link
              href="/free-access"
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
            >
              Request free access
            </Link>{" "}
            - we believe everyone deserves to learn!
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

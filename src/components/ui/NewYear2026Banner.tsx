"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PartyPopper, Sparkles, Star, Gift, Rocket } from "lucide-react";

interface NewYear2026BannerProps {
  onClose?: () => void;
  variant?: "banner" | "hero";
}

// Confetti particle component
const ConfettiParticle = ({
  delay,
  color,
  left,
}: {
  delay: number;
  color: string;
  left: string;
}) => (
  <motion.div
    className={`absolute w-3 h-3 ${color} rounded-sm`}
    style={{ left }}
    initial={{ top: -20, rotate: 0, opacity: 1 }}
    animate={{
      top: "100%",
      rotate: 360,
      opacity: [1, 1, 0],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "linear",
    }}
  />
);

// Firework burst component
const FireworkBurst = ({
  x,
  y,
  color,
  delay,
}: {
  x: string;
  y: string;
  color: string;
  delay: number;
}) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1.5, 0],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 1.5,
      delay,
      repeat: Infinity,
      repeatDelay: 3,
    }}
  >
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className={`absolute w-2 h-2 ${color} rounded-full`}
        initial={{ x: 0, y: 0 }}
        animate={{
          x: Math.cos((i * Math.PI) / 4) * 40,
          y: Math.sin((i * Math.PI) / 4) * 40,
          opacity: [1, 0],
        }}
        transition={{
          duration: 0.8,
          delay: delay + 0.3,
          repeat: Infinity,
          repeatDelay: 3.7,
        }}
      />
    ))}
  </motion.div>
);

export const NewYear2026Banner: React.FC<NewYear2026BannerProps> = ({
    onClose,
  variant = "banner",
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem("newyear2026-dismissed");
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("newyear2026-dismissed", "true");
    onClose?.();
  };

  if (!mounted || !isVisible) return null;

  // Confetti colors
  const confettiColors = [
    "bg-yellow-400",
    "bg-pink-500",
    "bg-blue-500",
    "bg-green-400",
    "bg-purple-500",
    "bg-red-500",
    "bg-orange-400",
    "bg-cyan-400",
  ];

  if (variant === "hero") {
    return (
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-linear-to-r from-purple-600 via-pink-500 to-orange-500 p-8 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <ConfettiParticle
              key={i}
              delay={i * 0.3}
              color={confettiColors[i % confettiColors.length]}
              left={`${(i * 5) % 100}%`}
            />
          ))}
        </div>

        {/* Fireworks */}
        <FireworkBurst x="10%" y="20%" color="bg-yellow-300" delay={0} />
        <FireworkBurst x="85%" y="30%" color="bg-pink-300" delay={1} />
        <FireworkBurst x="50%" y="10%" color="bg-cyan-300" delay={2} />

        {/* Sparkle effects */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`sparkle-${i}`}
            className="absolute"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180],
            }}
            transition={{
              duration: 2,
              delay: i * 0.5,
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-6 h-6 text-yellow-200" />
          </motion.div>
        ))}

        <div className="relative z-10 text-center text-white">
          <motion.div
            className="flex items-center justify-center gap-3 mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <PartyPopper className="w-10 h-10" />
            <h2 className="text-4xl md:text-5xl font-bold">
              Happy New Year 2026!
            </h2>
            <PartyPopper className="w-10 h-10 scale-x-[-1]" />
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl mb-4 text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            New Year, New Code, New You!
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 text-sm md:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              <Gift className="w-4 h-4" /> New Tutorials Coming
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              <Rocket className="w-4 h-4" /> Level Up in 2026
            </span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              <Star className="w-4 h-4" /> Build Amazing Projects
            </span>
          </motion.div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
          aria-label="Close banner"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    );
  }

  // Default banner variant
  return (
    <AnimatePresence>
      <motion.div
        className="relative overflow-hidden bg-linear-to-r from-purple-600 via-pink-500 to-orange-500 text-white py-3 px-4"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Mini confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 ${
                confettiColors[i % confettiColors.length]
              } rounded-full`}
              style={{ left: `${i * 10}%` }}
              animate={{
                y: ["-10px", "60px"],
                opacity: [1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto flex items-center justify-center gap-4 relative z-10">
          <Sparkles className="w-5 h-5" />

          <p className="text-center font-medium">
            <span className="hidden sm:inline">
              Happy New Year 2026! Start your coding journey fresh —{" "}
            </span>
            <span className="sm:hidden">2026 is here! </span>
            <span className="font-bold">New Year, New Code!</span>
          </p>

          <Sparkles className="w-5 h-5" />

          <button
            onClick={handleClose}
            className="absolute right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewYear2026Banner;

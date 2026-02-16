"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMoodColors } from "@/hooks/useMoodColors";

interface CartIconProps {
  itemCount: number;
  className?: string;
}

export function CartIcon({ itemCount, className = "" }: CartIconProps) {
  const router = useRouter();
  const moodColors = useMoodColors();

  return (
    <button
      onClick={() => router.push("/store/cart")}
      className={`relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />

      {itemCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center"
          style={{ backgroundColor: moodColors.gradient }}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}

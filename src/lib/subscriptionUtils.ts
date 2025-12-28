import React from "react";
import { Crown, Zap, Settings, type LucideIcon } from "lucide-react";
import { Plan } from "@/lib/subscriptionConstants";

export const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "Never";
  // Convert string to Date if needed
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

export const formatPrice = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

export const getPlanIcon = (plan: Plan): LucideIcon => {
  switch (plan) {
    case "CRACKED":
      return Zap;
    case "VIBED":
      return Crown;
    default:
      return Settings;
  }
};

export const getPlanIconWithStyles = (plan: Plan): React.ReactElement => {
  const IconComponent = getPlanIcon(plan);
  
  switch (plan) {
    case "CRACKED":
      return React.createElement(IconComponent, { className: "w-5 h-5 text-purple-500" });
    case "VIBED":
      return React.createElement(IconComponent, { className: "w-5 h-5 text-yellow-500" });
    default:
      return React.createElement(IconComponent, { className: "w-5 h-5 text-gray-500" });
  }
};

export const getPlanColor = (plan: Plan) => {
  switch (plan) {
    case "CRACKED":
      return "from-purple-500 to-pink-500";
    case "VIBED":
      return "from-yellow-400 to-orange-500";
    default:
      return "from-gray-400 to-gray-600";
  }
};

/**
 * Converts a subscription end date to ISO string format
 * Handles Date objects, ISO strings, and null/undefined values
 * @param date - The date to convert (Date | string | undefined | null)
 * @returns ISO string or undefined
 */
export const toSubscriptionEndDateISO = (
  date: Date | string | undefined | null
): string | undefined => {
  if (!date) return undefined;
  if (date instanceof Date) return date.toISOString();
  return date; // Already a string
};
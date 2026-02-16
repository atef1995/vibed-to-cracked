"use client";

import { OrderStatus } from "@/generated/client";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({
  status,
  className = "",
}: OrderStatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case "PENDING":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/30",
          text: "text-yellow-800 dark:text-yellow-200",
          label: "Pending",
        };
      case "PAID":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          text: "text-blue-800 dark:text-blue-200",
          label: "Paid",
        };
      case "PROCESSING":
        return {
          bg: "bg-purple-100 dark:bg-purple-900/30",
          text: "text-purple-800 dark:text-purple-200",
          label: "Processing",
        };
      case "SHIPPED":
        return {
          bg: "bg-indigo-100 dark:bg-indigo-900/30",
          text: "text-indigo-800 dark:text-indigo-200",
          label: "Shipped",
        };
      case "DELIVERED":
        return {
          bg: "bg-green-100 dark:bg-green-900/30",
          text: "text-green-800 dark:text-green-200",
          label: "Delivered",
        };
      case "CANCELLED":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          text: "text-red-800 dark:text-red-200",
          label: "Cancelled",
        };
      case "REFUNDED":
        return {
          bg: "bg-gray-100 dark:bg-gray-900/30",
          text: "text-gray-800 dark:text-gray-200",
          label: "Refunded",
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-900/30",
          text: "text-gray-800 dark:text-gray-200",
          label: status,
        };
    }
  };

  const styles = getStatusStyles();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.bg} ${styles.text} ${className}`}
    >
      {styles.label}
    </span>
  );
}

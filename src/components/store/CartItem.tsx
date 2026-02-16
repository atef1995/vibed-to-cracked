"use client";

import { useState } from "react";
import Image from "next/image";
import { Trash2, Plus, Minus, Package } from "lucide-react";
import { useMoodColors } from "@/hooks/useMoodColors";

interface CartItemProps {
  item: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      currency: string;
      images: string[];
      stock: number;
      slug: string;
    };
  };
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export default function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: CartItemProps) {
  const SALE_DISCOUNT_RATE = 0.1;
  const [imageError, setImageError] = useState(false);
  const moodColors = useMoodColors();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const originalUnitPrice = item.product.price;
  const discountedUnitPrice = originalUnitPrice * (1 - SALE_DISCOUNT_RATE);
  const itemTotal = discountedUnitPrice * item.quantity;
  const originalItemTotal = originalUnitPrice * item.quantity;
  const mainImage =
    item.product.images && item.product.images.length > 0
      ? item.product.images[0]
      : null;

  const maxQuantity = Math.min(item.product.stock, 10);

  return (
    <div
      className={`
        flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-2 
        border-gray-200 dark:border-gray-700 transition-opacity
        ${isUpdating ? "opacity-50" : ""}
      `}
    >
      {/* Product Image */}
      <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        {mainImage && !imageError ? (
          <Image
            src={mainImage}
            alt={item.product.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
          {item.product.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatPrice(discountedUnitPrice, item.product.currency)} each
          <span className="ml-2 line-through text-gray-400 dark:text-gray-500">
            {formatPrice(originalUnitPrice, item.product.currency)}
          </span>
        </p>

        {/* Stock Warning */}
        {item.quantity > item.product.stock && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Only {item.product.stock} in stock
          </p>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1 || isUpdating}
            className="p-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>

          <span className="w-8 text-center font-semibold text-gray-900 dark:text-gray-100">
            {item.quantity}
          </span>

          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={item.quantity >= maxQuantity || isUpdating}
            className="p-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Item Total */}
        <p className="text-lg font-bold" style={{ color: moodColors.text }}>
          {formatPrice(itemTotal, item.product.currency)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-through">
          {formatPrice(originalItemTotal, item.product.currency)}
        </p>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item.id)}
          disabled={isUpdating}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Remove
        </button>
      </div>
    </div>
  );
}

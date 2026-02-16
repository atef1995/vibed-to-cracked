"use client";

import { useState } from "react";
import Image from "next/image";
import { ShoppingCart, Package, Tag } from "lucide-react";
import { useMoodColors } from "@/hooks/useMoodColors";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  type: "PHYSICAL" | "DIGITAL";
  stock: number;
  published: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onClick?: () => void;
  isAddingToCart?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  onClick,
  isAddingToCart = false,
}: ProductCardProps) {
  const SALE_DISCOUNT_RATE = 0.1;
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const moodColors = useMoodColors();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const originalPrice = product.price;
  const salePrice = originalPrice * (1 - SALE_DISCOUNT_RATE);

  const mainImage =
    product.images && product.images.length > 0 ? product.images[0] : null;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 transition-all duration-300
        ${
          isOutOfStock
            ? "opacity-60 cursor-not-allowed"
            : "cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1"
        }
        bg-white dark:bg-gray-800
        border-gray-200 dark:border-gray-700
      `}
      onClick={!isOutOfStock ? onClick : undefined}
      onMouseEnter={() => !isOutOfStock && setIsHovered(true)}
      onMouseLeave={() => !isOutOfStock && setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {mainImage && !imageError ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300 dark:text-gray-600" />
          </div>
        )}

        {/* Stock Badge */}
        {isOutOfStock ? (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Out of Stock
          </div>
        ) : isLowStock ? (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Only {product.stock} left
          </div>
        ) : null}

        {/* Type Badge */}
        <div className="absolute top-2 left-2 bg-gray-900/80 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {product.type}
        </div>

        <div className="absolute bottom-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          10% OFF
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Price and Action */}
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-2xl font-bold"
              style={{ color: moodColors.text }}
            >
              {formatPrice(salePrice, product.currency)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
              {formatPrice(originalPrice, product.currency)}
            </p>
          </div>

          {onAddToCart && !isOutOfStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product.id);
              }}
              disabled={isAddingToCart}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                flex items-center gap-2
                ${
                  isAddingToCart
                    ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                    : "hover:shadow-lg dark:hover:bg-gray-700 active:scale-95 cursor-pointer"
                }
              `}
            >
              <ShoppingCart className="w-4 h-4" />
              {isAddingToCart ? "Adding..." : "Add to Cart"}
            </button>
          )}
        </div>

        {/* Stock Info */}
        {!isOutOfStock && product.stock > 5 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {product.stock} in stock
          </p>
        )}
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && !isOutOfStock && (
        <div
          className="absolute inset-0 pointer-events-none border-2 rounded-xl transition-opacity duration-300"
          style={{ borderColor: moodColors.border, opacity: 0.5 }}
        />
      )}
    </div>
  );
}

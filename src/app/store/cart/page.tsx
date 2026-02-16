"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Package, Trash2 } from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { useMoodColors } from "@/hooks/useMoodColors";
import CartItem from "@/components/store/CartItem";

interface CartData {
  id: string;
  items: Array<{
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
  }>;
}

export default function CartPage() {
  const SALE_DISCOUNT_RATE = 0.1;
  const FREE_SHIPPING_ITEM_THRESHOLD = 5;
  const moodColors = useMoodColors();
  const router = useRouter();

  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/store/cart");

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      setCart(data.data?.cart || null);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;

    setUpdatingItem(itemId);
    try {
      const response = await fetch(`/api/store/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update quantity");
      }

      await fetchCart();
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert(err instanceof Error ? err.message : "Failed to update quantity");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItem(itemId);
    try {
      const response = await fetch(`/api/store/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      await fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item. Please try again.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    try {
      const response = await fetch("/api/store/cart", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear cart");
      }

      await fetchCart();
    } catch (err) {
      console.error("Error clearing cart:", err);
      alert("Failed to clear cart. Please try again.");
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      // Validate stock before checkout
      const stockValidation = await fetch("/api/store/cart/validate");
      if (!stockValidation.ok) {
        const error = await stockValidation.json();
        throw new Error(
          error.error?.message || error.error || "Some items are out of stock"
        );
      }

      // Create checkout session
      const response = await fetch("/api/store/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message ||
            error.error ||
            "Failed to create checkout session"
        );
      }

      const data = await response.json();

      // Redirect to Stripe checkout
      if (data.data?.url) {
        window.location.href = data.data.url;
      }
    } catch (err) {
      console.error("Error during checkout:", err);
      alert(
        err instanceof Error ? err.message : "Failed to proceed to checkout"
      );
      setIsCheckingOut(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const calculateSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  };

  const calculateDiscountedSubtotal = () => {
    return calculateSubtotal() * (1 - SALE_DISCOUNT_RATE);
  };

  const calculateTotalQuantity = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const hasStockIssues = () => {
    if (!cart || !cart.items) return false;
    return cart.items.some((item) => item.quantity > item.product.stock);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading cart...
          </p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {error}
          </h2>
          <button
            onClick={fetchCart}
            className="mt-4 px-6 py-2 rounded-lg font-medium transition-all duration-200"
            style={{ backgroundColor: moodColors.gradient, color: "white" }}
          >
            Try Again
          </button>
        </div>
      </PageLayout>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;
  const subtotal = calculateSubtotal();
  const discountedSubtotal = calculateDiscountedSubtotal();
  const totalQuantity = calculateTotalQuantity();
  const isFreeShippingEligible = totalQuantity > FREE_SHIPPING_ITEM_THRESHOLD;
  const itemsUntilFreeShipping = Math.max(
    0,
    FREE_SHIPPING_ITEM_THRESHOLD + 1 - totalQuantity
  );

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/store")}
          className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Store
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Shopping Cart
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isEmpty
                ? "Your cart is empty"
                : `${cart.items.length} item${cart.items.length !== 1 ? "s" : ""} in your cart`}
            </p>
          </div>

          {!isEmpty && (
            <button
              onClick={handleClearCart}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-2 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {isEmpty && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Add some products to get started
          </p>
          <button
            onClick={() => router.push("/store")}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
            style={{ backgroundColor: moodColors.gradient, color: "white" }}
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* Cart Items */}
      {!isEmpty && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                10% OFF is active on all products.
              </p>
              <p className="text-sm text-green-700/90 dark:text-green-300/90 mt-1">
                {isFreeShippingEligible
                  ? "You unlocked free shipping."
                  : `Add ${itemsUntilFreeShipping} more item${itemsUntilFreeShipping === 1 ? "" : "s"} to unlock free shipping.`}
              </p>
            </div>
            {cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
                isUpdating={updatingItem === item.id}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal (before sale)</span>
                  <span className="line-through">
                    {formatPrice(
                      subtotal,
                      cart.items[0]?.product.currency || "usd"
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                  <span>Sale discount (10%)</span>
                  <span>
                    -
                    {formatPrice(
                      subtotal - discountedSubtotal,
                      cart.items[0]?.product.currency || "usd"
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal (after sale)</span>
                  <span>
                    {formatPrice(
                      discountedSubtotal,
                      cart.items[0]?.product.currency || "usd"
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Shipping</span>
                  <span>
                    {isFreeShippingEligible ? "Free" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span style={{ color: moodColors.text }}>
                      {formatPrice(
                        discountedSubtotal,
                        cart.items[0]?.product.currency || "usd"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {hasStockIssues() && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Some items exceed available stock. Please adjust quantities.
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut || hasStockIssues()}
                className="w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:bg-gray-700/50 active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: hasStockIssues()
                    ? "#9CA3AF"
                    : moodColors.gradient,
                  color: "white",
                }}
              >
                {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
              </button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                Secure checkout powered by Stripe
              </p>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

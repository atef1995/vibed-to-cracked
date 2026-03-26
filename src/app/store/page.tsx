"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Package } from "lucide-react";
import { PageLayout } from "@/components/ui/PageLayout";
import { ContentGrid } from "@/components/ui/ContentGrid";
import Pagination from "@/components/ui/Pagination";
import { useMoodColors } from "@/hooks/useMoodColors";
import {
  MoodImpactIndicator,
  QuickMoodSwitcher,
} from "@/components/ui/MoodImpactIndicator";
import ProductCard from "@/components/store/ProductCard";
import Button from "@/components/ui/Button";
import { BUTTON_COLOR } from "@/types/button";
import { useContentFilters } from "@/hooks/useContentFilters";
import { ContentSearchBar } from "@/components/ui/ContentSearchBar";
import {
  ContentFilterBar,
  FilterPills,
} from "@/components/ui/ContentFilterBar";
import { ContentEmptyState } from "@/components/ui/ContentEmptyState";
import { useQuery } from "@tanstack/react-query";

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

export default function StorePage() {
  const moodColors = useMoodColors();
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const {
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilter,
    clearFilters,
    hasActiveFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    queryParams,
  } = useContentFilters({
    defaultPageSize: 6,
    filterKeys: ["type"],
  });

  // Fetch products via TanStack Query
  const {
    data: productsData,
    isLoading: loading,
    error,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["store-products", queryParams.toString()],
    queryFn: async () => {
      const response = await fetch(`/api/store/products?${queryParams}`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      return data.data || {};
    },
  });

  const products: Product[] = productsData?.products ?? [];
  const totalItems = productsData?.total ?? 0;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Fetch cart count
  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/store/cart");
      if (response.ok) {
        const data = await response.json();
        const count =
          data.data?.cart?.items?.reduce(
            (sum: number, item: { quantity: number }) => sum + item.quantity,
            0
          ) || 0;
        setCartCount(count);
      }
    } catch (err) {
      console.error("Error fetching cart count:", err);
    }
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCart(productId);
    try {
      const response = await fetch("/api/store/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }

      await fetchCartCount();
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleProductClick = (slug: string) => {
    router.push(`/store/${slug}`);
  };

  const typeOptions = [
    { value: "PHYSICAL", label: "Physical" },
    { value: "DIGITAL", label: "Digital" },
  ];

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Store
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Support your learning with exclusive merch and resources
            </p>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => router.push("/store/cart")}
            className="relative px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 hover:shadow-lg"
            style={{ backgroundColor: moodColors.gradient, color: "white" }}
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mood Impact Indicator */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <MoodImpactIndicator context="dashboard" />
          <QuickMoodSwitcher />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <ContentSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search products..."
          className="max-w-md"
        />
        <ContentFilterBar
          hasActiveFilters={hasActiveFilters}
          onClear={clearFilters}
        >
          <FilterPills
            options={typeOptions}
            value={filters.type || ""}
            onChange={(val) => setFilter("type", val)}
            allLabel="All"
          />
        </ContentFilterBar>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Loading products...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : "Failed to load products"}
          </p>
          <Button
            onClick={() => refetchProducts()}
            className="mt-4 px-6 py-2 rounded-lg font-medium transition-all duration-200"
            color={BUTTON_COLOR.TRANSPARENT}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && products.length > 0 && (
        <>
          <ContentGrid>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.slug)}
                onAddToCart={handleAddToCart}
                isAddingToCart={addingToCart === product.id}
              />
            ))}
          </ContentGrid>

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={setPage}
              itemsPerPage={pageSize}
              showSizeSelector
              onSizeChange={setPageSize}
            />
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <ContentEmptyState
          icon={Package}
          title="No products found"
          subtitle={
            hasActiveFilters
              ? "Try adjusting your search or filters"
              : "Check back soon for new products"
          }
          hasFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      )}
    </PageLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Package, Search, Filter } from "lucide-react";
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

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Fetch products
  useEffect(() => {
    fetchProducts();
    fetchCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchTerm, selectedType]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedType) params.append("type", selectedType);

      const response = await fetch(`/api/store/products?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      const payload = data.data || {};
      setProducts(payload.products || []);
      setTotalItems(payload.total || 0);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

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
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg font-medium transition-all duration-200"
            style={{ backgroundColor: moodColors.gradient, color: "white" }}
          >
            Search
          </button>
        </form>

        {/* Type Filter */}
        <div className="flex gap-2 items-center">
          <Filter className="w-5 h-5 text-gray-500" />
          <button
            onClick={() => setSelectedType(null)}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
              selectedType === null
                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType("PHYSICAL")}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
              selectedType === "PHYSICAL"
                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Physical
          </button>
          <button
            onClick={() => setSelectedType("DIGITAL")}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
              selectedType === "DIGITAL"
                ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Digital
          </button>
        </div>
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
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button
            onClick={fetchProducts}
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
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              showSizeSelector
              onSizeChange={handleItemsPerPageChange}
            />
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {searchTerm || selectedType
              ? "Try adjusting your search or filters"
              : "Check back soon for new products"}
          </p>
        </div>
      )}
    </PageLayout>
  );
}

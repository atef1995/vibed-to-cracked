"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "./useDebounce";

export interface ContentFiltersConfig {
  debounceMs?: number;
  defaultPageSize?: number;
  syncToUrl?: boolean;
  filterKeys?: string[];
}

export interface ContentFiltersReturn {
  search: string;
  setSearch: (value: string) => void;
  debouncedSearch: string;
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  hasActiveFilters: boolean;
  queryParams: URLSearchParams;
}

const DEFAULTS: Required<ContentFiltersConfig> = {
  debounceMs: 350,
  defaultPageSize: 9,
  syncToUrl: true,
  filterKeys: [],
};

export function useContentFilters(
  config?: ContentFiltersConfig
): ContentFiltersReturn {
  const opts = { ...DEFAULTS, ...config };
  const router = useRouter();
  const searchParams = useSearchParams();
  const initializing = useRef(true);

  // Read initial state from URL when syncToUrl is enabled
  const initialSearch = opts.syncToUrl ? searchParams.get("search") || "" : "";
  const initialPage = opts.syncToUrl
    ? Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1)
    : 1;
  const initialPageSize = opts.syncToUrl
    ? parseInt(searchParams.get("pageSize") || "", 10) || opts.defaultPageSize
    : opts.defaultPageSize;

  const initialFilters: Record<string, string> = {};
  if (opts.syncToUrl) {
    for (const key of opts.filterKeys) {
      const val = searchParams.get(key);
      if (val) initialFilters[key] = val;
    }
  }

  const [search, setSearchRaw] = useState(initialSearch);
  const [filters, setFilters] =
    useState<Record<string, string>>(initialFilters);
  const [page, setPageRaw] = useState(initialPage);
  const [pageSize, setPageSizeRaw] = useState(initialPageSize);

  const debouncedSearch = useDebounce(search, opts.debounceMs);

  const setSearch = useCallback((value: string) => {
    setSearchRaw(value);
    setPageRaw(1);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      if (!value) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
    setPageRaw(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchRaw("");
    setFilters({});
    setPageRaw(1);
  }, []);

  const setPage = useCallback((p: number) => {
    setPageRaw(Math.max(1, p));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeRaw(size);
    setPageRaw(1);
  }, []);

  const hasActiveFilters = useMemo(
    () => search.length > 0 || Object.keys(filters).length > 0,
    [search, filters]
  );

  // Build query params for API calls — uses debounced search
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    params.set("page", page.toString());
    params.set("limit", pageSize.toString());
    return params;
  }, [debouncedSearch, filters, page, pageSize]);

  // Sync state to URL
  useEffect(() => {
    if (!opts.syncToUrl) return;

    // Skip the first render to avoid replacing the URL on mount
    if (initializing.current) {
      initializing.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    if (page > 1) params.set("page", page.toString());
    if (pageSize !== opts.defaultPageSize)
      params.set("pageSize", pageSize.toString());

    const qs = params.toString();
    const newUrl = qs ? `?${qs}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [
    debouncedSearch,
    filters,
    page,
    pageSize,
    opts.syncToUrl,
    opts.defaultPageSize,
    router,
  ]);

  return {
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilter,
    clearFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    hasActiveFilters,
    queryParams,
  };
}

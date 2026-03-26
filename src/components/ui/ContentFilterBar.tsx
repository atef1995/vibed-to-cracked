"use client";

import React from "react";

/* ---------- FilterBar container ---------- */

interface ContentFilterBarProps {
  children: React.ReactNode;
  hasActiveFilters?: boolean;
  onClear?: () => void;
  className?: string;
}

export function ContentFilterBar({
  children,
  hasActiveFilters,
  onClear,
  className = "",
}: ContentFilterBarProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {children}
      {hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

/* ---------- FilterPills ---------- */

export interface FilterPillOption {
  value: string;
  label: string;
}

interface FilterPillsProps {
  options: FilterPillOption[];
  value: string;
  onChange: (value: string) => void;
  allLabel?: string;
  activeColor?: string;
}

export function FilterPills({
  options,
  value,
  onChange,
  allLabel = "All",
  activeColor = "bg-blue-600 text-white",
}: FilterPillsProps) {
  const inactiveClasses =
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700";

  return (
    <>
      <button
        onClick={() => onChange("")}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          !value ? activeColor : inactiveClasses
        }`}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            value === opt.value ? activeColor : inactiveClasses
          }`}
        >
          {opt.label}
        </button>
      ))}
    </>
  );
}

/* ---------- FilterDropdown ---------- */

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterPillOption[];
  allLabel?: string;
  title?: string;
  className?: string;
}

export function FilterDropdown({
  value,
  onChange,
  options,
  allLabel = "All",
  title,
  className = "",
}: FilterDropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      title={title}
      className={`rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white ${className}`}
    >
      <option value="">{allLabel}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

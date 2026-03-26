"use client";

import { Search } from "lucide-react";

interface ContentSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ContentSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: ContentSearchBarProps) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
      />
    </div>
  );
}

"use client";

import React from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme as useNextTheme,
} from "next-themes";

// Re-export useTheme so existing imports keep working
export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  return {
    theme: (theme ?? "system") as "light" | "dark" | "system",
    setTheme,
    resolvedTheme: (resolvedTheme ?? "light") as "light" | "dark",
  };
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

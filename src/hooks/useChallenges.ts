"use client";

import { useQuery } from "@tanstack/react-query";

interface ChallengeFilters {
  type?: string;
  difficulty?: string;
}

// Fetch all challenges from API
async function fetchAllChallenges() {
  const response = await fetch("/api/challenges");
  const data = await response.json();
  return data.challenges || [];
}

// Fetch filtered challenges from API
async function fetchFilteredChallenges(filters: ChallengeFilters) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.difficulty) params.set("difficulty", filters.difficulty);

  const response = await fetch(`/api/challenges?${params.toString()}`);
  const data = await response.json();
  return data.challenges || [];
}

// Hook for fetching all challenges
export const useChallenges = () => {
  return useQuery({
    queryKey: ["challenges"],
    queryFn: fetchAllChallenges,
    staleTime: 5 * 60 * 1000, // 5 minutes - challenges don't change often
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// Hook for fetching filtered challenges
export const useFilteredChallenges = (filters: ChallengeFilters) => {
  return useQuery({
    queryKey: ["challenges", "filtered", filters],
    queryFn: () => fetchFilteredChallenges(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!(filters.type || filters.difficulty), // Only run if there are actual filters
  });
};

// Hook that automatically chooses between all challenges or filtered based on filters
export const useChallengesWithFilters = (filters: ChallengeFilters) => {
  const hasFilters = !!(
    (filters.type && filters.type !== "all") ||
    (filters.difficulty && filters.difficulty !== "all")
  );

  const allChallengesQuery = useChallenges();
  const filteredChallengesQuery = useFilteredChallenges({
    type: filters.type === "all" ? undefined : filters.type,
    difficulty: filters.difficulty === "all" ? undefined : filters.difficulty,
  });

  // Return the appropriate query based on whether filters are applied
  if (hasFilters) {
    return {
      data: filteredChallengesQuery.data || [],
      isLoading: filteredChallengesQuery.isLoading,
      error: filteredChallengesQuery.error,
      isError: filteredChallengesQuery.isError,
      refetch: filteredChallengesQuery.refetch,
    };
  }

  return {
    data: allChallengesQuery.data || [],
    isLoading: allChallengesQuery.isLoading,
    error: allChallengesQuery.error,
    isError: allChallengesQuery.isError,
    refetch: allChallengesQuery.refetch,
  };
};

export type { ChallengeFilters };

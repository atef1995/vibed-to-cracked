/**
 * TTL (Time-To-Live) Cache Utility
 *
 * Simple in-memory cache with automatic expiration.
 * Used for caching expensive database queries like leaderboard rankings.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttlMs: number;
  private maxSize: number;

  constructor(ttlSeconds: number = 300, maxSize: number = 100) {
    this.ttlMs = ttlSeconds * 1000;
    this.maxSize = maxSize;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp >= this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateAll(): void {
    this.cache.clear();
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp >= this.ttlMs) {
        this.cache.delete(key);
      }
    }

    // If still over max size, remove oldest entries
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries()).sort(
        (a, b) => a[1].timestamp - b[1].timestamp
      );
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2));
      for (const [key] of toRemove) {
        this.cache.delete(key);
      }
    }
  }
}

// Leaderboard cache - 5 minute TTL, max 50 entries (one per filter combination)
export const leaderboardCache = new TTLCache<unknown>(300, 50);

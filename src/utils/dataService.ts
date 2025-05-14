import { supabase } from './supabase';

/**
 * Central data service for improved caching and data fetching
 * This provides a consistent interface for data operations with built-in
 * caching and error handling while maintaining the existing fallback mechanisms.
 */

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_ENABLED = true; // Can be toggled to disable cache entirely

// Cache storage
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  key: string;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();

  // Get an item from cache if it exists and is not expired
  get<T>(key: string): T | null {
    if (!CACHE_ENABLED) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  // Store an item in cache
  set<T>(key: string, data: T): void {
    if (!CACHE_ENABLED) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
  }

  // Remove an item from cache
  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clear cache by prefix
  clearByPrefix(prefix: string): void {
    for (const [key] of this.cache) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear entire cache
  clear(): void {
    this.cache.clear();
  }
}

// Create a singleton cache instance
const cache = new DataCache();

/**
 * Fetches data from Supabase with caching
 * @param tableName The table to query
 * @param options Query options
 * @returns The query results
 */
export async function fetchFromTable<T = any>(
  tableName: string,
  options: {
    select?: string;
    match?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
    skipCache?: boolean;
    cacheKey?: string;
  } = {}
): Promise<T> {
  const {
    select = '*',
    match = {},
    order,
    limit,
    single = false,
    skipCache = false,
    cacheKey,
  } = options;

  // Generate a cache key based on parameters
  const key = cacheKey || `${tableName}:${select}:${JSON.stringify(match)}:${JSON.stringify(order)}:${limit}:${single}`;

  // Check cache first (unless explicitly skipped)
  if (!skipCache) {
    const cachedData = cache.get<T>(key);
    if (cachedData) {
      console.log(`Cache hit: ${key}`);
      return cachedData;
    }
  }

  // Start building the query
  let query = supabase.from(tableName).select(select);

  // Apply match conditions
  Object.entries(match).forEach(([column, value]) => {
    if (value === null) {
      query = query.is(column, null);
    } else if (Array.isArray(value)) {
      query = query.in(column, value);
    } else {
      query = query.eq(column, value);
    }
  });

  // Apply order if specified
  if (order) {
    query = query.order(order.column, { ascending: order.ascending ?? true });
  }

  // Apply limit if specified
  if (limit) {
    query = query.limit(limit);
  }

  // Execute query
  const { data, error } = single
    ? await query.single()
    : await query;

  if (error) throw error;

  // Store in cache
  if (!skipCache && data) {
    cache.set(key, data);
  }

  return data as T;
}

/**
 * Inserts data into a Supabase table and updates cache
 * @param tableName The table to insert into
 * @param data The data to insert
 * @param options Options for the insert operation
 * @returns The inserted data
 */
export async function insertIntoTable<T = any>(
  tableName: string,
  data: Record<string, any> | Record<string, any>[],
  options: {
    returning?: string;
    cachePrefix?: string;
  } = {}
): Promise<T> {
  const { returning = '*', cachePrefix = tableName } = options;

  const { data: result, error } = await supabase
    .from(tableName)
    .insert(data)
    .select(returning);

  if (error) throw error;

  // Clear any cached data for this table
  cache.clearByPrefix(cachePrefix);

  return result as T;
}

/**
 * Updates data in a Supabase table and updates cache
 * @param tableName The table to update
 * @param data The data to update
 * @param match The conditions to match for the update
 * @param options Options for the update operation
 * @returns The updated data
 */
export async function updateInTable<T = any>(
  tableName: string,
  data: Record<string, any>,
  match: Record<string, any>,
  options: {
    returning?: string;
    cachePrefix?: string;
  } = {}
): Promise<T> {
  const { returning = '*', cachePrefix = tableName } = options;

  let query = supabase.from(tableName).update(data);

  // Apply match conditions
  Object.entries(match).forEach(([column, value]) => {
    if (value === null) {
      query = query.is(column, null);
    } else if (Array.isArray(value)) {
      query = query.in(column, value);
    } else {
      query = query.eq(column, value);
    }
  });

  const { data: result, error } = await query.select(returning);

  if (error) throw error;

  // Clear any cached data for this table
  cache.clearByPrefix(cachePrefix);

  return result as T;
}

/**
 * Deletes data from a Supabase table and updates cache
 * @param tableName The table to delete from
 * @param match The conditions to match for deletion
 * @param options Options for the delete operation
 * @returns True if successful
 */
export async function deleteFromTable(
  tableName: string,
  match: Record<string, any>,
  options: {
    cachePrefix?: string;
  } = {}
): Promise<boolean> {
  const { cachePrefix = tableName } = options;

  let query = supabase.from(tableName).delete();

  // Apply match conditions
  Object.entries(match).forEach(([column, value]) => {
    if (value === null) {
      query = query.is(column, null);
    } else if (Array.isArray(value)) {
      query = query.in(column, value);
    } else {
      query = query.eq(column, value);
    }
  });

  const { error } = await query;

  if (error) throw error;

  // Clear any cached data for this table
  cache.clearByPrefix(cachePrefix);

  return true;
}

/**
 * Helper function to create a retry wrapper around any async function
 * @param fn The function to wrap with retry logic
 * @param options Retry options
 * @returns A function that will retry on failure
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: boolean;
    retryCondition?: (error: any) => boolean;
  } = {}
): T {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = true,
    retryCondition = () => true
  } = options;

  const retryFn = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        // Check if we should retry based on the error
        if (!retryCondition(error)) throw error;
        
        // If this was the last attempt, don't wait
        if (attempt === maxRetries - 1) break;
        
        // Wait before retrying (with exponential backoff if enabled)
        const waitTime = backoff ? delay * Math.pow(2, attempt) : delay;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError;
  };
  
  return retryFn as T;
}

/**
 * Clears all cached data
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Checks if the network is currently online
 * @returns True if online, false if offline
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Registers a callback for online/offline status changes
 * @param callback Function to call when status changes
 * @returns A function to unregister the callback
 */
export function onNetworkStatusChange(
  callback: (online: boolean) => void
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

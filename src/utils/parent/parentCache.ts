
// Cache utility functions for parent information

// Cache for parent info to prevent excessive database calls
const parentInfoCache = new Map<string, {data: any, timestamp: number}>();
const CACHE_TTL = 300000; // 5 minutes cache time
const CACHE_ERROR_LOCK = new Map<string, number>(); // Prevent hammering the database on errors
const ERROR_LOCK_TIME = 5000; // 5 seconds lock time after errors

/**
 * Get cached parent info if available and valid
 */
export function getCachedParentInfo(userId: string) {
  const cachedInfo = parentInfoCache.get(userId);
  if (cachedInfo && (Date.now() - cachedInfo.timestamp) < CACHE_TTL) {
    console.log("Using cached parent info for user:", userId);
    return cachedInfo.data;
  }
  return null;
}

/**
 * Check if there is an error lock for the user
 */
export function hasErrorLock(userId: string) {
  const errorLockTime = CACHE_ERROR_LOCK.get(userId);
  return errorLockTime && (Date.now() - errorLockTime) < ERROR_LOCK_TIME;
}

/**
 * Set error lock for a user
 */
export function setErrorLock(userId: string) {
  CACHE_ERROR_LOCK.set(userId, Date.now());
}

/**
 * Update the parent info cache
 */
export function updateParentCache(userId: string, parentInfo: any) {
  parentInfoCache.set(userId, {
    data: parentInfo,
    timestamp: Date.now()
  });
}

/**
 * Clear cache for a specific parent
 */
export function clearParentCache(parentId: string) {
  console.log("Clearing parent cache for:", parentId);
  parentInfoCache.delete(parentId);
  CACHE_ERROR_LOCK.delete(parentId);
}

/**
 * Clear all parent cache
 */
export function clearAllParentCache() {
  console.log("Clearing all parent cache");
  parentInfoCache.clear();
  CACHE_ERROR_LOCK.clear();
}

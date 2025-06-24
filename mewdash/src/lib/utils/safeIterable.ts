/**
 * Safely converts a value to an iterable array for use in {#each} blocks
 * Prevents "{#each} only works with iterable values" errors
 */
export function safeIterable<T>(value: any): T[] {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  // Try to convert iterables to arrays
  if (value && typeof value[Symbol.iterator] === "function") {
    try {
      return Array.from(value);
    } catch (e) {
      console.warn("Failed to convert iterable to array:", e);
      return [];
    }
  }

  // Handle objects by converting to entries or values
  if (typeof value === "object") {
    try {
      return Object.values(value);
    } catch (e) {
      console.warn("Failed to convert object to array:", e);
      return [];
    }
  }

  // Fallback: wrap single values in array
  return [value];
}

/**
 * Safely get array length, returns 0 for non-arrays
 */
export function safeLength(value: any): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "object" && value.length !== undefined) {
    return value.length;
  }

  return 0;
}


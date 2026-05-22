// lib/utils/sanitize.ts
import DOMPurify from "dompurify";

/**
 * Escapes HTML entities to prevent XSS attacks
 * @param str The string to escape
 * @returns The escaped string
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return str.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
}

/**
 * Detects and removes Zalgo text (excessive combining characters)
 * Zalgo text uses combining diacritical marks (U+0300-U+036F and others)
 * @param text The text to check and clean
 * @param maxCombiningChars Maximum allowed combining characters per base character (default: 2)
 * @returns Cleaned text with excessive combining characters removed
 */
export function removeZalgoText(text: string, maxCombiningChars: number = 2): string {
  if (!text) return "";

  // Unicode ranges for combining characters (diacritical marks)
  // NOTE: No 'g' flag - we test one character at a time
  const combiningCharsRegex = /[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/u;

  let result = "";
  let consecutiveCombining = 0;

  for (const char of text) {
    // Check if current character is a combining character
    if (combiningCharsRegex.test(char)) {
      consecutiveCombining++;

      // Only keep combining characters if under the limit
      if (consecutiveCombining <= maxCombiningChars) {
        result += char;
      }
      // Otherwise skip (removes excessive combining chars)
    } else {
      // Reset counter for non-combining characters
      consecutiveCombining = 0;
      result += char;
    }
  }

  return result;
}

/**
 * Checks if text contains excessive Zalgo (for validation/rejection)
 * @param text The text to check
 * @param threshold Maximum allowed combining characters per base character
 * @returns True if text contains excessive Zalgo
 */
export function containsZalgo(text: string, threshold: number = 2): boolean {
  if (!text) return false;

  // NOTE: No 'g' flag - we test one character at a time
  const combiningCharsRegex = /[\u0300-\u036F\u1AB0-\u1AFF\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/u;
  let consecutiveCombining = 0;

  for (const char of text) {
    if (combiningCharsRegex.test(char)) {
      consecutiveCombining++;
      if (consecutiveCombining > threshold) {
        return true; // Zalgo detected
      }
    } else {
      consecutiveCombining = 0;
    }
  }

  return false;
}

/**
 * Sanitizes user input using DOMPurify to prevent XSS attacks
 * OWASP Recommendation: Use DOMPurify instead of regex-based sanitization
 * @param input The input string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // First remove Zalgo text
  const cleanedZalgo = removeZalgoText(input, 2);

  // Then use DOMPurify for robust HTML sanitization
  // Configure to strip all HTML tags for plain text contexts
  const cleaned = DOMPurify.sanitize(cleanedZalgo, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
    KEEP_CONTENT: true, // Keep text content
  });

  return cleaned.trim();
}

/**
 * Validates and sanitizes form question text
 * @param text The question text
 * @returns Sanitized question text
 */
export function sanitizeQuestionText(text: string): string {
  const sanitized = sanitizeInput(text);

  // Additional validation for question text
  if (sanitized.length === 0) {
    throw new Error("Question text cannot be empty");
  }

  if (sanitized.length > 500) {
    throw new Error("Question text cannot exceed 500 characters");
  }

  return sanitized;
}

/**
 * Validates and sanitizes form answer text
 * @param text The answer text
 * @returns Sanitized answer text
 */
export function sanitizeAnswerText(text: string): string {
  return sanitizeInput(text);
}

/**
 * Validates email format
 * @param email The email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates URL format
 * URL Validation - Canonicalize input, allow-list http/https only
 * @param url The URL to validate
 * @returns True if valid
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitizes and validates a URL path for use in href attributes
 * Prevents javascript:, data:, and other dangerous protocols
 * @param urlPath The URL path to sanitize (can be relative or absolute)
 * @param baseUrl Optional base URL for validation (e.g., window.location.origin)
 * @returns Sanitized URL path or null if invalid
 */
export function sanitizeUrlPath(
  urlPath: string,
  baseUrl?: string,
): string | null {
  if (!urlPath) return null;

  // Remove any whitespace
  const trimmed = urlPath.trim();

  // If it's a relative path starting with /, validate it doesn't contain dangerous protocols
  if (trimmed.startsWith("/")) {
    // Check for protocol smuggling attempts
    if (
      trimmed.toLowerCase().includes("javascript:") ||
      trimmed.toLowerCase().includes("data:") ||
      trimmed.toLowerCase().includes("vbscript:")
    ) {
      return null;
    }
    return trimmed;
  }

  // If it's an absolute URL, validate it with baseUrl if provided
  if (baseUrl) {
    try {
      const fullUrl = new URL(trimmed, baseUrl);
      if (fullUrl.protocol !== "http:" && fullUrl.protocol !== "https:") {
        return null;
      }
      // Return the pathname + search + hash (relative to origin)
      return fullUrl.pathname + fullUrl.search + fullUrl.hash;
    } catch {
      return null;
    }
  }

  // If no baseUrl provided, validate as absolute URL
  if (isValidUrl(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Validates number within range
 * @param value The number value
 * @param min Minimum value (optional)
 * @param max Maximum value (optional)
 * @returns True if valid
 */
export function isValidNumber(
  value: number,
  min?: number,
  max?: number,
): boolean {
  if (Number.isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  return !(max !== undefined && value > max);
}

/**
 * Sanitizes and validates form name
 * @param name The form name
 * @returns Sanitized form name
 */
export function sanitizeFormName(name: string): string {
  const sanitized = sanitizeInput(name);

  if (sanitized.length === 0) {
    throw new Error("Form name cannot be empty");
  }

  if (sanitized.length > 255) {
    throw new Error("Form name cannot exceed 255 characters");
  }

  return sanitized;
}

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

  return str.replace(/[&<>"'\/]/g, (char) => htmlEscapes[char]);
}

/**
 * Sanitizes user input using DOMPurify to prevent XSS attacks
 * OWASP Recommendation: Use DOMPurify instead of regex-based sanitization
 * @param input The input string to sanitize
 * @returns The sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Use DOMPurify for robust HTML sanitization
  // Configure to strip all HTML tags for plain text contexts
  const cleaned = DOMPurify.sanitize(input, {
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
  const sanitized = sanitizeInput(text);

  if (sanitized.length > 5000) {
    throw new Error("Answer text cannot exceed 5000 characters");
  }

  return sanitized;
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
  if (isNaN(value)) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
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

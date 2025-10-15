import { authenticateUser } from "$lib/server/discordApi";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
  try {
    // Skip authentication for auth-related endpoints to prevent interference
    const pathname = event.url.pathname;
    if (
      pathname.startsWith("/api/discord/callback") ||
      pathname.startsWith("/api/discord/login") ||
      pathname.startsWith("/api/discord/logout")
    ) {
      return resolve(event);
    }

    // Get user authentication

    event.locals.user = await authenticateUser(event, event.cookies);

    const response = await resolve(event);

    // Content-Security-Policy for defense-in-depth
    // Helps mitigate XSS attacks even if output encoding fails
    const cspDirectives = [
      "default-src 'self'",
      // Note: 'unsafe-inline' for scripts is needed for Svelte's generated hydration code
      // Consider implementing nonce-based CSP for stronger security in the future
      "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' challenges.cloudflare.com kit.fontawesome.com",
      "style-src 'self' 'unsafe-inline' kit.fontawesome.com", // unsafe-inline needed for Svelte component styles
      "img-src 'self' data: https: blob:", // Allow images from CDNs and data URLs
      "font-src 'self' data: kit.fontawesome.com ka-p.fontawesome.com",
      "connect-src 'self' ws: wss: https:", // Allow WebSocket connections to bot API
      "frame-src 'self' challenges.cloudflare.com", // Allow Turnstile CAPTCHA
      "object-src 'none'", // Block plugins
      "base-uri 'self'", // Prevent base tag hijacking
      "form-action 'self'", // Restrict form submissions
      "frame-ancestors 'none'", // Prevent clickjacking
    ].join("; ");

    response.headers.set("Content-Security-Policy", cspDirectives);

    // Additional security headers
    response.headers.set("X-Frame-Options", "DENY"); // Prevent clickjacking
    response.headers.set("X-Content-Type-Options", "nosniff"); // Prevent MIME sniffing
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin"); // Privacy
    response.headers.set(
      "Permissions-Policy",
      "geolocation=(), microphone=(), camera=()",
    ); // Restrict permissions

    // Ensure auth headers aren't cached
    response.headers.set("Cache-Control", "no-store");

    return response;
  } catch (error) {
    event.locals.user = null;
    return resolve(event);
  }
};
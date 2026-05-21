import { env } from "$env/dynamic/public";
import * as Sentry from "@sentry/sveltekit";

const dsn = env.PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: env.PUBLIC_SENTRY_ENVIRONMENT ?? "production",
  tracesSampleRate: 0.1,
});

/** Reports uncaught client-side errors to Sentry. */
export const handleError = Sentry.handleErrorWithSentry();

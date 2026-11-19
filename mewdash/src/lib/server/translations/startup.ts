import { logger } from "$lib/logger";
import { databaseConfigured, ensureDatabase } from "$lib/server/db";
import { refreshIfDue, refreshOverlay } from "./overlay";
import { registerDashCatalog } from "./register";

const tickEveryMs = 60_000;

let started = false;
let registered = false;
let registering = false;

async function register(): Promise<void> {
  if (registered || registering) return;
  registering = true;
  try {
    const result = await registerDashCatalog();
    registered = true;
    await refreshOverlay();
    if (result.skipped) logger.info("Dashboard translations are up to date");
    else logger.info(`Registered ${result.strings} dashboard strings and ${result.baselines} built-in translations in ${Math.round(result.milliseconds)} ms`);
  } catch (error) {
    logger.error("Registering the dashboard translations failed, trying again in a minute:", error);
  } finally {
    registering = false;
  }
}

async function tick(): Promise<void> {
  if (!databaseConfigured()) return;
  try {
    if (await ensureDatabase()) {
      await register();
      refreshIfDue();
    }
  } catch (error) {
    logger.error("Translation start up check failed:", error);
  }
}

/**
 * Registers the dashboard's catalog once the database is migrated, in the background, and keeps
 * the approved translations in memory current. Nothing here holds up the server or fails it, and
 * a database that comes up late is picked up on the next check.
 */
export function startTranslations(): void {
  if (started) return;
  started = true;
  void tick();
  setInterval(() => void tick(), tickEveryMs).unref();
}

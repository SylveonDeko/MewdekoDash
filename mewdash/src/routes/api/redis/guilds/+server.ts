// routes/api/redis/guilds/+server.ts
import type { RequestHandler } from "@sveltejs/kit";
import Redis from "ioredis";
import { error, json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";
import { REDIS_URL, DISCORD_CLIENT_ID, USE_REDIS } from "$env/static/private";
import { logger } from "$lib/logger";

export const GET: RequestHandler = async ({}) => {
  if (USE_REDIS === "true") {
    const redis = new Redis(REDIS_URL);
    try {
      const data = await redis.get(`${DISCORD_CLIENT_ID}_topguilds`);
      if (data) {
        redis.disconnect();
        const guilds = JSON.parse(data);
        return json(guilds);
      }
    } catch (err) {
      logger.error("Redis error:", err);
      redis.disconnect();
    }
  }

  try {
    const filePath = path.resolve("src/lib/backupInfo/topGuilds.json");
    const fileData = await fs.readFile(filePath, "utf-8");
    const guilds = JSON.parse(fileData);
    return json(guilds);
  } catch (fileErr) {
    logger.error("File read error:", fileErr);
    throw error(500, "Failed to fetch guild data from backup file.");
  }
};

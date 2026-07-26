// routes/api/redis/guilds/+server.ts
import type { RequestHandler } from "@sveltejs/kit";
import Redis from "ioredis";
import { error, json } from "@sveltejs/kit";
import fs from "fs/promises";
import path from "path";
import { env } from "$env/dynamic/private";
import { logger } from "$lib/logger";

export const GET: RequestHandler = async ({}) => {
  if (env.USE_REDIS === "true") {
    const redis = new Redis(env.REDIS_URL);
    try {
      const data = await redis.get(`${env.DISCORD_CLIENT_ID}_topguilds`);
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
    error(500, "Failed to fetch guild data from backup file.");
  }
};

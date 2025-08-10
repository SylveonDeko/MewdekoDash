import Redis from "ioredis";
import { REDIS_URL, USE_REDIS, DISCORD_CLIENT_ID } from "$env/static/private";
import { logger } from "$lib/logger";
import type { DiscordUser } from "$lib/types/discord";
import { nanoid } from "nanoid";

// Session expiry time (24 hours)
const SESSION_TTL = 24 * 60 * 60; // seconds

export class RedisSessionManager {
  private redis: Redis | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = USE_REDIS === "true";
    if (this.enabled) {
      try {
        this.redis = new Redis(REDIS_URL);
        logger.info("Redis session manager initialized");
      } catch (error) {
        logger.error("Failed to initialize Redis:", error);
        this.enabled = false;
      }
    }
  }

  private getSessionKey(sessionId: string): string {
    return `${DISCORD_CLIENT_ID}_session:${sessionId}`;
  }

  async createSession(user: DiscordUser, tokens: {
    accessToken: string;
    refreshToken: string;
    accessExpiry: Date;
  }): Promise<string | null> {
    if (!this.enabled || !this.redis) return null;

    try {
      const sessionId = nanoid(32);
      const sessionData = {
        user,
        tokens: {
          ...tokens,
          accessExpiry: tokens.accessExpiry.toISOString()
        },
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };

      await this.redis.setex(
        this.getSessionKey(sessionId),
        SESSION_TTL,
        JSON.stringify(sessionData)
      );

      return sessionId;
    } catch (error) {
      logger.error("Failed to create Redis session:", error);
      return null;
    }
  }

  async getSession(sessionId: string): Promise<{
    user: DiscordUser;
    tokens: {
      accessToken: string;
      refreshToken: string;
      accessExpiry: Date;
    };
  } | null> {
    if (!this.enabled || !this.redis || !sessionId) return null;

    try {
      const data = await this.redis.get(this.getSessionKey(sessionId));
      if (!data) return null;

      const sessionData = JSON.parse(data);
      
      // Update last accessed time and extend TTL
      sessionData.lastAccessed = new Date().toISOString();
      await this.redis.setex(
        this.getSessionKey(sessionId),
        SESSION_TTL,
        JSON.stringify(sessionData)
      );

      return {
        user: sessionData.user,
        tokens: {
          ...sessionData.tokens,
          accessExpiry: new Date(sessionData.tokens.accessExpiry)
        }
      };
    } catch (error) {
      logger.error("Failed to get Redis session:", error);
      return null;
    }
  }

  async updateSession(sessionId: string, tokens: {
    accessToken: string;
    refreshToken: string;
    accessExpiry: Date;
  }): Promise<boolean> {
    if (!this.enabled || !this.redis || !sessionId) return false;

    try {
      const data = await this.redis.get(this.getSessionKey(sessionId));
      if (!data) return false;

      const sessionData = JSON.parse(data);
      sessionData.tokens = {
        ...tokens,
        accessExpiry: tokens.accessExpiry.toISOString()
      };
      sessionData.lastAccessed = new Date().toISOString();

      await this.redis.setex(
        this.getSessionKey(sessionId),
        SESSION_TTL,
        JSON.stringify(sessionData)
      );

      return true;
    } catch (error) {
      logger.error("Failed to update Redis session:", error);
      return false;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.enabled || !this.redis || !sessionId) return;

    try {
      await this.redis.del(this.getSessionKey(sessionId));
    } catch (error) {
      logger.error("Failed to delete Redis session:", error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      this.redis.disconnect();
    }
  }
}

// Singleton instance
export const sessionManager = new RedisSessionManager();
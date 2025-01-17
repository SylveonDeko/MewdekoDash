import { authenticateUser } from '$lib/server/discordApi';
import type { Handle } from '@sveltejs/kit';
import { logger } from "$lib/logger";
import { COOKIE_ENCRYPTION_PASSWORD } from '$env/static/private';
import CryptoJS from 'crypto-js';
import JSONbig from 'json-bigint';
import { api } from '$lib/api';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const GUILD_CACHE_COOKIE = 'encrypted_mutual_guilds';
const GUILD_TIMESTAMP_COOKIE = 'guild_cache_timestamp';

export const handle: Handle = async ({ event, resolve }) => {
  try {
    logger.debug('Current path:', event.url.pathname);

    // Get user authentication
    const user = await authenticateUser(event, event.cookies);
    logger.debug('Auth state:', !!user);
    event.locals.user = user;

    // Handle guild data
    if (user) {
      try {
        // Check for cached guilds
        const encryptedGuilds = event.cookies.get(GUILD_CACHE_COOKIE);
        const cacheTimestamp = event.cookies.get(GUILD_TIMESTAMP_COOKIE);

        let guilds = null;
        const now = Date.now();
        const cacheExpired = !cacheTimestamp || (now - parseInt(cacheTimestamp)) > CACHE_DURATION;

        if (encryptedGuilds && !cacheExpired) {
          // Decrypt and parse cached guilds
          try {
            const bytes = CryptoJS.AES.decrypt(encryptedGuilds, COOKIE_ENCRYPTION_PASSWORD);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
            guilds = JSONbig.parse(decryptedData);
            logger.debug('Using cached guilds');
          } catch (decryptError) {
            logger.error('Failed to decrypt guild cache:', decryptError);
            // Invalid cache, will fetch fresh data
          }
        }

        if (!guilds || cacheExpired) {
          try {
            guilds = await api.getMutualGuilds(BigInt(user.id));

            // Encrypt and cache the new guild data
            const encryptedData = CryptoJS.AES.encrypt(
              JSONbig.stringify(guilds),
              COOKIE_ENCRYPTION_PASSWORD
            ).toString();

            event.cookies.set(GUILD_CACHE_COOKIE, encryptedData, {
              path: '/',
              maxAge: CACHE_DURATION / 1000,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });

            event.cookies.set(GUILD_TIMESTAMP_COOKIE, now.toString(), {
              path: '/',
              maxAge: CACHE_DURATION / 1000,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax'
            });

            logger.debug('Cached fresh guild data');
          } catch (fetchError) {
            logger.error('Error fetching mutual guilds:', fetchError);
          }
        }

        event.locals.guilds = guilds;
      } catch (error) {
        logger.error('Error handling guild data:', error);
        event.locals.guilds = null;
      }
    } else {
      event.locals.guilds = null;
    }

    const response = await resolve(event);

    // Ensure auth headers aren't cached
    if (response.headers) {
      response.headers.set('Cache-Control', 'no-store');
    }

    return response;
  } catch (error) {
    logger.error('Auth error in hook:', error);
    event.locals.user = null;
    return resolve(event);
  }
};
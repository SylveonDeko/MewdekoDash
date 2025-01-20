import { writable } from "svelte/store";
import ColorThief from "colorthief";
import { logger } from "$lib/logger";

type RGB = [number, number, number];

interface MusicPlayerColors {
  background: string;
  foreground: string;
  accent: string;
  text: string;
}

const DEFAULT_COLORS: MusicPlayerColors = {
  background: "#1a1a1a",
  foreground: "#3b82f6",
  accent: "#8b5cf6",
  text: "#ffffff"
};

function createMusicPlayerColorStore() {
  const { subscribe, set, update } = writable<MusicPlayerColors>(DEFAULT_COLORS);

  // Cache for processed image URLs
  const processedUrls = new Map<string, string>();

  async function getProxiedImageUrl(originalUrl: string): Promise<string> {
    if (processedUrls.has(originalUrl)) {
      return processedUrls.get(originalUrl)!;
    }

    const isSameDomain = originalUrl.startsWith(window.location.origin);
    if (isSameDomain) {
      return originalUrl;
    }

    try {
      const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(originalUrl)}`;
      processedUrls.set(originalUrl, proxiedUrl);
      return proxiedUrl;
    } catch (error) {
      logger.error("Failed to proxy image:", error);
      return originalUrl;
    }
  }

  async function extractColors(imageUrl: string): Promise<MusicPlayerColors> {
    if (typeof window === "undefined") {
      return DEFAULT_COLORS;
    }

    try {
      const proxiedUrl = await getProxiedImageUrl(imageUrl);

      const img = new Image();
      img.crossOrigin = "anonymous";

      const imageLoadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (error) => {
          logger.error("Failed to load image:", error);
          reject(new Error("Failed to load image"));
        };

        // Add timestamp to bypass cache
        img.src = `${proxiedUrl}${proxiedUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
      });

      // Set a timeout for image loading
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Image loading timeout")), 5000);
      });

      await Promise.race([imageLoadPromise, timeoutPromise]);

      const colorThief = new ColorThief();
      let palette: RGB[];

      try {
        palette = colorThief.getPalette(img, 3) as RGB[];
      } catch (error) {
        logger.error("ColorThief failed to extract colors:", error);
        return DEFAULT_COLORS;
      }

      if (!palette || palette.length < 2) {
        return DEFAULT_COLORS;
      }

      const rgbToHex = (r: number, g: number, b: number): string =>
        "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");

      const darkenColor = (color: RGB): string => {
        return rgbToHex(
          Math.round(color[0] * 0.1),
          Math.round(color[1] * 0.1),
          Math.round(color[2] * 0.1)
        );
      };

      // Calculate perceived brightness to determine if we need light or dark text
      const getBrightness = ([r, g, b]: RGB): number => {
        return (r * 299 + g * 587 + b * 114) / 1000;
      };

      const mainColor = palette[0];
      const brightness = getBrightness(mainColor);
      const textColor = brightness > 128 ? "#000000" : "#ffffff";

      return {
        background: darkenColor(palette[0]),
        foreground: rgbToHex(...palette[0]),
        accent: rgbToHex(...palette[1]),
        text: textColor
      };
    } catch (error) {
      logger.error("Error extracting colors for music player:", error);
      return DEFAULT_COLORS;
    }
  }

  return {
    subscribe,
    reset: () => set(DEFAULT_COLORS),
    updateFromArtwork: async (imageUrl: string) => {
      if (!imageUrl) {
        set(DEFAULT_COLORS);
        return;
      }

      try {
        const colors = await extractColors(imageUrl);
        set(colors);
      } catch (err) {
        logger.error("Failed to extract colors for music player:", err);
        set(DEFAULT_COLORS);
      }
    }
  };
}

export const musicPlayerColors = createMusicPlayerColorStore();
// In a new file like musicPlayerColorStore.ts
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

  async function extractColors(imageUrl: string): Promise<MusicPlayerColors> {
    if (typeof window === "undefined") {
      return DEFAULT_COLORS;
    }

    try {
      const img = new window.Image();
      img.crossOrigin = "Anonymous";

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
      });

      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(img, 2) as RGB[];

      if (!palette || palette.length < 2) {
        throw new Error("Could not extract enough colors from image");
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

      return {
        background: darkenColor(palette[0]),
        foreground: rgbToHex(...palette[0]),
        accent: rgbToHex(...palette[1]),
        text: "#ffffff"
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
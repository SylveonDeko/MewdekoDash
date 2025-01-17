// lib/stores/colorStore.ts
import { writable } from 'svelte/store';
import type ColorThief from 'colorthief';
import { logger } from "$lib/logger";

interface Colors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
}

const defaultColors: Colors = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  text: '#ffffff',
  muted: '#9ca3af',
  gradientStart: '#3b82f6',
  gradientMid: '#8b5cf6',
  gradientEnd: '#ec4899'
};

function createColorStore() {
  const { subscribe, set, update } = writable<Colors>(defaultColors);
  let colorThief: typeof ColorThief;

  // Function to convert RGB to HSL
  function rgbToHsl(r: number, g: number, b: number) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  }

  // Function to convert RGB to HEX
  function rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  // Function to adjust color lightness
  function adjustLightness(rgb: number[], lightness: number) {
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    return `hsl(${hsl[0]}, ${hsl[1]}%, ${lightness}%)`;
  }

  return {
    subscribe,
    reset: () => set(defaultColors),
    extractFromImage: async (imageUrl: string) => {
      if (!imageUrl) {
        set(defaultColors);
        return;
      }

      try {
        if (!colorThief) {
          const ColorThiefModule = await import('colorthief');
          colorThief = ColorThiefModule.default;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        const thief = new colorThief();
        const dominantColor = thief.getColor(img);
        const palette = thief.getPalette(img);

        const primaryHex = rgbToHex(...dominantColor);
        const secondaryHex = rgbToHex(...palette[1]);
        const accentHex = rgbToHex(...palette[2]);

        update(colors => ({
          primary: primaryHex,
          secondary: secondaryHex,
          accent: accentHex,
          text: adjustLightness(dominantColor, 95),
          muted: adjustLightness(dominantColor, 60),
          gradientStart: primaryHex,
          gradientMid: secondaryHex,
          gradientEnd: accentHex
        }));
      } catch (err) {
        logger.error('Failed to extract colors:', err);
        set(defaultColors);
      }
    }
  };
}

export const colorStore = createColorStore();
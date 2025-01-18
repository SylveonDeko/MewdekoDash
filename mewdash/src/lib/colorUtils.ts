import ColorThief from 'colorthief';
import { logger } from "$lib/logger";

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
}

const DEFAULT_PALETTE: ColorPalette = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  text: '#ffffff',
  muted: '#9ca3af',
  gradientStart: '#3b82f6',
  gradientMid: '#8b5cf6',
  gradientEnd: '#ec4899'
};

type RGB = [number, number, number];

function adjustLightness(rgb: RGB, lightness: number) {
  const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  return `hsl(${hsl[0]}, ${hsl[1]}%, ${lightness}%)`;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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

export async function extractColors(imageUrl: string): Promise<ColorPalette> {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return DEFAULT_PALETTE;
  }

  try {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";

    // Create a loading promise
    const loadImage = new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });

    // Add timeout to prevent hanging
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Image loading timeout')), 5000);
    });

    // Race between image loading and timeout
    await Promise.race([loadImage, timeout]);

    // Only proceed if ColorThief is available
    if (typeof ColorThief === 'undefined') {
      throw new Error('ColorThief is not available');
    }

    const colorThief = new ColorThief();
    const palette = colorThief.getPalette(img, 3) as RGB[];

    if (!palette || palette.length < 3) {
      throw new Error('Could not extract enough colors from image');
    }

    const rgbToHex = (r: number, g: number, b: number): string =>
      '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

    const adjustLightness = (color: RGB, percentage: number): string => {
      const factor = percentage / 100;
      const adjusted: RGB = [
        Math.min(255, Math.max(0, Math.round(color[0] * factor))),
        Math.min(255, Math.max(0, Math.round(color[1] * factor))),
        Math.min(255, Math.max(0, Math.round(color[2] * factor)))
      ];
      return rgbToHex(...adjusted);
    };

    return {
      primary: rgbToHex(...palette[0]),
      secondary: rgbToHex(...palette[1]),
      accent: rgbToHex(...palette[2]),
      text: adjustLightness(palette[0], 90),
      muted: adjustLightness(palette[0], 70),
      gradientStart: rgbToHex(...palette[0]),
      gradientMid: rgbToHex(...palette[1]),
      gradientEnd: rgbToHex(...palette[2])
    };
  } catch (error) {
    logger.error('Error extracting colors:', error);
    return DEFAULT_PALETTE;
  }
}
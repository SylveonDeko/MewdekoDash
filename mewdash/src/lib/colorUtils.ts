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
  try {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const colorThief = new ColorThief();
    const palette = colorThief.getPalette(img) as RGB[];

    const rgbToHex = (r: number, g: number, b: number) =>
      '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

    const adjustBrightness = (color: RGB, factor: number): string => {
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
      text: adjustLightness(palette[0], 90), // Using 90% lightness for text
      muted: adjustLightness(palette[0], 70), // Using 70% lightness for muted
      gradientStart: rgbToHex(...palette[0]),
      gradientMid: rgbToHex(...palette[1]),
      gradientEnd: rgbToHex(...palette[2])
    };
  } catch (error) {
    logger.error('Error extracting colors:', error);
    // Fallback colors
    return {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      text: '#ffffff',
      muted: '#9ca3af',
      gradientStart: '#3b82f6',
      gradientMid: '#8b5cf6',
      gradientEnd: '#ec4899'
    };
  }
}
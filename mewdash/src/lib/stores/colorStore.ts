import { writable, get } from "svelte/store";
import ColorThief from "colorthief";
import { logger } from "$lib/logger";

// Types
type RGB = [number, number, number];
type HSL = [number, number, number];

interface ColorPalette {
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
  gradientStart: '#3a86ff',
  gradientMid: '#8338ec',
  gradientEnd: '#ff006e'
};

function createColorStore() {
  const store = writable<ColorPalette>(DEFAULT_PALETTE);
  let currentPalette = DEFAULT_PALETTE;

  // Update current palette when store changes
  store.subscribe(value => {
    currentPalette = value;
  });

  // Color conversion and contrast utilities
  function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      const channel = c / 255;
      return channel <= 0.03928
          ? channel / 12.92
          : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function getContrastRatio(l1: number, l2: number): number {
    const lightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return (lightest + 0.05) / (darkest + 0.05);
  }

  function rgbToHsl(r: number, g: number, b: number): HSL {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    } else {
      s = 0;
    }

    return [h * 360, s * 100, l * 100];
  }

  function hslToRgb(h: number, s: number, l: number): RGB {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  function hexToRgb(hex: string): RGB {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  }

  function hslToString(h: number, s: number, l: number): string {
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }

  // Improved contrast adjustment function working in HSL space
  function adjustForContrast(color: RGB, bgLuminance: number, minContrast = 4.5): RGB {
    let [r, g, b] = color;
    let [h, s, l] = rgbToHsl(r, g, b);
    let currentLuminance = getLuminance(r, g, b);
    let contrast = getContrastRatio(currentLuminance, bgLuminance);

    // Determine whether to lighten or darken
    const shouldLighten = currentLuminance < bgLuminance;

    // If contrast is already good, return the original color
    if (contrast >= minContrast) {
      return [r, g, b];
    }

    // First try adjusting saturation to improve contrast
    // Reduce saturation if lightening, increase if darkening
    const saturationStep = shouldLighten ? -5 : 5;
    let newS = s;
    let attempts = 0;

    while (contrast < minContrast && newS >= 0 && newS <= 100 && attempts < 10) {
      newS = Math.max(0, Math.min(100, newS + saturationStep));
      attempts++;

      // Convert back to RGB to check contrast
      const newColor = hslToRgb(h, newS, l);
      const newLuminance = getLuminance(...newColor);
      contrast = getContrastRatio(newLuminance, bgLuminance);

      if (contrast >= minContrast) {
        return newColor;
      }
    }

    // If saturation adjustment didn't work enough, adjust lightness
    const lightnessStep = shouldLighten ? 5 : -5;
    let newL = l;
    attempts = 0;

    while (contrast < minContrast && attempts < 20) {
      newL = Math.max(0, Math.min(100, newL + lightnessStep));
      attempts++;

      // Convert back to RGB to check contrast
      const newColor = hslToRgb(h, newS, newL); // Use the adjusted saturation
      const newLuminance = getLuminance(...newColor);
      contrast = getContrastRatio(newLuminance, bgLuminance);

      // Break if we hit lightness limits
      if (newL <= 0 || newL >= 100) break;
    }

    return hslToRgb(h, newS, newL);
  }

  function getTextColor(backgroundColor: RGB): string {
    const bgLuminance = getLuminance(...backgroundColor);
    // For better readability, we'll use a higher contrast threshold for text
    const whiteContrast = getContrastRatio(1, bgLuminance);
    const blackContrast = getContrastRatio(0, bgLuminance);

    // For dark UI background, we need to be more aggressive in ensuring light text
    // Dark text on dark backgrounds is particularly problematic
    const isLightBackground = bgLuminance > 0.5;

    // Force white text on dark UI unless the background is very light
    if (!isLightBackground) {
      // On dark backgrounds, always return white for better readability
      return '#ffffff';
    }

    // For light backgrounds, use standard contrast comparison but with higher threshold
    return whiteContrast >= blackContrast * 1.2 ? '#ffffff' : '#000000';
  }

  function createMutedColor(color: RGB, textColor: string): string {
    const [h, s, l] = rgbToHsl(...color);

    // For dark UI themes, text follows a different contrast pattern
    // We want muted text that's still readable on dark backgrounds

    if (textColor === '#ffffff') {
      // For dark backgrounds with white text, create a light gray with some color tint
      // The muted color should be significantly lighter than the background but not pure white
      const newSaturation = Math.min(s * 0.4, 15); // Very low saturation for muted effect
      const newLightness = Math.max(Math.min(l + 30, 75), 65); // Ensure it's light enough but not too light

      return hslToString(h, newSaturation, newLightness);
    } else {
      // For light backgrounds with dark text (rare in dark UI), make a darker muted color
      const newSaturation = Math.min(s * 0.5, 20);
      const newLightness = Math.max(l - 15, 30); // Darker but still visible

      return hslToString(h, newSaturation, newLightness);
    }
  }

  // Improved color extraction with harmony considerations
  async function extractColors(imageUrl: string): Promise<ColorPalette> {
    if (typeof window === "undefined") {
      return DEFAULT_PALETTE;
    }

    try {
      const img = new window.Image();
      img.crossOrigin = "Anonymous";

      const loadImage = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
      });

      // Add timeout to prevent hanging
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Image loading timeout")), 5000);
      });

      // Race between image loading and timeout
      await Promise.race([loadImage, timeout]);

      const colorThief = new ColorThief();
      // Extract more colors for better selection
      const palette = colorThief.getPalette(img, 5) as RGB[];

      if (!palette || palette.length < 3) {
        throw new Error("Could not extract enough colors from image");
      }

      // Dark theme background luminance (rgb(18, 24, 40))
      const BG_LUMINANCE = getLuminance(18, 24, 40);

      // Create a scoring function that prioritizes colorfulness and vibrance
      // This is critical for anime/cartoon images that have a lot of white but important color accents
      const colorScore = (color: RGB): number => {
        const [h, s, l] = rgbToHsl(...color);

        // Calculate colorfulness score
        // Higher saturation = more colorful
        const saturationScore = s / 100;

        // Penalize extremely light or dark colors
        // We want colors in the middle range for better visibility
        const lightnessScore = 1 - Math.abs(l - 50) / 50;

        // Bonus for non-grayscale colors (has actual hue)
        const hueBonus = s > 15 ? 1 : 0;

        // Combine scores with weights
        return (saturationScore * 0.6) + (lightnessScore * 0.3) + (hueBonus * 0.1);
      };

      // Sort colors by our comprehensive scoring function
      const sortedColors = [...palette].sort((a, b) => {
        return colorScore(b) - colorScore(a);
      });

      // Log the top colors for debugging
      logger.debug("Top extracted colors:",
          sortedColors.slice(0, 3).map(color => {
            const hex = rgbToHex(...color);
            const [h, s, l] = rgbToHsl(...color);
            return `${hex} (h:${Math.round(h)}° s:${Math.round(s)}% l:${Math.round(l)}%)`;
          })
      );

      // Use the most saturated color for primary
      const primary = sortedColors[0];

      // Find a color that's harmonious with primary for secondary
      const [extractedPrimaryHue] = rgbToHsl(...primary);
      let bestSecondary = sortedColors[1];
      let bestScore = 0;

      // Look for colors that are either analogous or complementary to primary
      for (let i = 1; i < sortedColors.length; i++) {
        const [h] = rgbToHsl(...sortedColors[i]);
        const hueDiff = Math.abs((h - extractedPrimaryHue + 180) % 360 - 180);

        // Score higher if close to 30° (analogous) or 180° (complementary)
        const analogousScore = Math.max(0, 1 - Math.abs(hueDiff - 30) / 15);
        const complementaryScore = Math.max(0, 1 - Math.abs(hueDiff - 180) / 15);
        const score = Math.max(analogousScore, complementaryScore);

        if (score > bestScore) {
          bestScore = score;
          bestSecondary = sortedColors[i];
        }
      }

      // For accent, choose a color that contrasts well with both primary and secondary
      let bestAccent = sortedColors[2];
      bestScore = 0;

      for (let i = 2; i < sortedColors.length; i++) {
        const [h, s, l] = rgbToHsl(...sortedColors[i]);
        const primaryHueDiff = Math.abs((h - extractedPrimaryHue + 180) % 360 - 180);
        const secondaryHue = rgbToHsl(...bestSecondary)[0];
        const secondaryHueDiff = Math.abs((h - secondaryHue + 180) % 360 - 180);

        // Score higher if distinct from both primary and secondary
        // We want accent to stand out, so prioritize colors with hue difference
        const distinctScore = (Math.min(primaryHueDiff, 360 - primaryHueDiff) +
            Math.min(secondaryHueDiff, 360 - secondaryHueDiff)) / 360;

        // Prefer more saturated colors for accent
        const saturationScore = s / 100;

        // Combine scores with weights
        const score = distinctScore * 0.7 + saturationScore * 0.3;

        if (score > bestScore) {
          bestScore = score;
          bestAccent = sortedColors[i];
        }
      }

      // If we couldn't find good harmony, create one by adjusting hues
      if (bestScore < 0.3) {
        const [pH, pS, pL] = rgbToHsl(...primary);

        // Create a complementary or triadic color scheme
        const secondaryHueValue = (pH + 180) % 360; // Complementary
        const accentHueValue = (pH + 120) % 360;    // Triadic

        bestSecondary = hslToRgb(secondaryHueValue, pS, pL);
        bestAccent = hslToRgb(accentHueValue, pS, pL);
      }

      // Detect if we're dealing with a predominantly light image
      // This helps us adjust our approach for very light anime/cartoon avatars
      const isLightImage = palette.reduce((count, color) => {
        const lum = getLuminance(...color);
        return count + (lum > 0.6 ? 1 : 0);
      }, 0) >= Math.floor(palette.length * 0.6);

      // For anime-style images, we need to ensure we have some color even if the image is predominantly white
      // Check if we have any vibrant colors at all in our top colors
      const hasVibrantColors = sortedColors.slice(0, 3).some(color => {
        const [, s, l] = rgbToHsl(...color);
        // A color is vibrant if it has reasonable saturation and isn't too light or dark
        return s > 40 && l > 25 && l < 85;
      });

      // If we don't have vibrant colors but the image is anime-like, force vibrant colors
      // This is crucial for white anime characters with small color accents
      if (!hasVibrantColors && isLightImage) {
        // If it's an anime character with no vibrant colors, use default anime-friendly palette
        // Common anime/manga color schemes often use these colors
        // Brighter, more saturated colors for anime characters
        const animePrimary = hexToRgb('#5D4EF7');      // Vibrant blue-purple
        const animeSecondary = hexToRgb('#FF3A8C');    // Vibrant hot pink
        const animeAccent = hexToRgb('#FFA000');       // Bright golden (for eyes/accents)

        // Use these colors instead of the extracted ones
        sortedColors.unshift(animeAccent, animeSecondary, animePrimary);

        logger.debug("Using anime-friendly color palette");
      }

      // For light images, we need more aggressive contrast enhancement
      const contrastTarget = isLightImage ? 5.5 : 4.5;

      // Adjust colors for contrast with both the main background and card backgrounds
      // This ensures text is readable everywhere
      const adjustedPrimary = adjustForContrast(primary, BG_LUMINANCE, contrastTarget);
      const adjustedSecondary = adjustForContrast(bestSecondary, BG_LUMINANCE, contrastTarget);
      const adjustedAccent = adjustForContrast(bestAccent, BG_LUMINANCE, contrastTarget);

      // Determine text color based on adjusted primary color
      const textColor = getTextColor(adjustedPrimary);

      // Create more sophisticated gradient colors with controlled saturation and lightness
      const [primaryHsl, secondaryHsl, accentHsl] = [
        rgbToHsl(...adjustedPrimary),
        rgbToHsl(...adjustedSecondary),
        rgbToHsl(...adjustedAccent)
      ];

      // For anime/light images on dark backgrounds, we need more vibrant gradients
      // Prioritize the actual colors from the image rather than just adjusting lightness/saturation

      // Extract base hues from our colors
      // For anime-style images, we need to ensure colors are extremely vibrant
      // Use a much higher baseline saturation and appropriate lightness

      // Default saturation/lightness values for gradients
      let gradientSaturation = isLightImage ? 90 : 70;
      const gradientLightness = isLightImage ? 60 : 55;

      // For anime characters, we need even more dramatic colors for the gradients
      // If we detected a mostly white/light image, increase saturation further
      if (isLightImage) {
        gradientSaturation = 95; // Maximum saturation for anime images
      }

      // Create gradient colors with better color separation
      const gradientStart = hslToString(primaryHsl[0], gradientSaturation, gradientLightness);

      // Make mid gradient a complementary or analogous color to ensure visible difference
      const midHue = (primaryHsl[0] + 150) % 360; // Off-complementary for better effect
      const gradientMid = hslToString(midHue, gradientSaturation, gradientLightness);

      // Make end gradient a triadic color to complete the palette
      const endHue = (primaryHsl[0] + 210) % 360; // Triadic relationship
      const gradientEnd = hslToString(endHue, gradientSaturation, gradientLightness);

      // Log the gradient colors for debugging
      logger.debug("Gradient colors:", {
        start: gradientStart,
        mid: gradientMid,
        end: gradientEnd
      });

      return {
        primary: rgbToHex(...adjustedPrimary),
        secondary: rgbToHex(...adjustedSecondary),
        accent: rgbToHex(...adjustedAccent),
        text: textColor,
        muted: createMutedColor(adjustedPrimary, textColor),
        gradientStart,
        gradientMid,
        gradientEnd
      };
    } catch (error) {
      logger.error("Error extracting colors:", error);
      return DEFAULT_PALETTE;
    }
  }

  return {
    subscribe: store.subscribe,

    // Get current colors synchronously
    get current(): ColorPalette {
      return currentPalette;
    },

    // Get individual colors synchronously
    getColor(key: keyof ColorPalette): string {
      return currentPalette[key];
    },

    // Set a specific color
    setColor(key: keyof ColorPalette, value: string): void {
      const newPalette = { ...currentPalette, [key]: value };
      store.set(newPalette);
    },

    // Set multiple colors at once
    setColors(colors: Partial<ColorPalette>): void {
      const newPalette = { ...currentPalette, ...colors };
      store.set(newPalette);
    },

    // Get CSS variables string
    getCssVars(): string {
      return `
        --color-primary: ${currentPalette.primary};
        --color-secondary: ${currentPalette.secondary};
        --color-accent: ${currentPalette.accent};
        --color-text: ${currentPalette.text};
        --color-muted: ${currentPalette.muted};
        --gradient-start: ${currentPalette.gradientStart};
        --gradient-mid: ${currentPalette.gradientMid};
        --gradient-end: ${currentPalette.gradientEnd};
      `.trim();
    },

    // Reset to default palette
    reset(): void {
      store.set(DEFAULT_PALETTE);
    },

    // Extract colors from image
    async extractFromImage(imageUrl: string): Promise<void> {
      if (!imageUrl) {
        store.set(DEFAULT_PALETTE);
        return;
      }

      try {
        const palette = await extractColors(imageUrl);
        store.set(palette);
      } catch (err) {
        logger.error('Failed to extract colors:', err);
        store.set(DEFAULT_PALETTE);
      }
    }
  };
}

export const colorStore = createColorStore();
import { writable } from "svelte/store";
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

// Dark UI constants - representing the background color of your UI
 // rgb(18, 24, 40) - your dark UI background
const DARK_BG_LUMINANCE = 0.03; // Pre-calculated luminance for performance
let currentPalette = DEFAULT_PALETTE;


function createColorStore() {
  const store = writable<ColorPalette>(DEFAULT_PALETTE);

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

  function hslToString(h: number, s: number, l: number): string {
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }

  // Improved text color selection based on background

  // Improved contrast adjustment function for dark UI theme context
  function adjustForContrast(color: RGB, minContrast = 4.5): RGB {
    let [r, g, b] = color;
    let [h, s, l] = rgbToHsl(r, g, b);
    let currentLuminance = getLuminance(r, g, b);
    let contrast = getContrastRatio(currentLuminance, DARK_BG_LUMINANCE);

    // For dark UI, we need to ensure colors are visible against the dark background
    if (contrast >= minContrast) {
      return [r, g, b];
    }

    // For dark UI, we generally need to lighten colors
    // First try boosting saturation to maintain color vibrancy
    let newS = Math.min(s + 15, 100);
    let attempts = 0;

    while (contrast < minContrast && attempts < 5) {
      attempts++;

      // Convert back to RGB to check contrast
      const newColor = hslToRgb(h, newS, l);
      const newLuminance = getLuminance(...newColor);
      contrast = getContrastRatio(newLuminance, DARK_BG_LUMINANCE);

      if (contrast >= minContrast) {
        return newColor;
      }
    }

    // If saturation adjustment didn't work enough, increase lightness
    attempts = 0;
    let newL = l;
    const lightnessStep = 5;

    while (contrast < minContrast && attempts < 20) {
      newL = Math.min(95, newL + lightnessStep);
      attempts++;

      // Convert back to RGB to check contrast
      const newColor = hslToRgb(h, newS, newL);
      const newLuminance = getLuminance(...newColor);
      contrast = getContrastRatio(newLuminance, DARK_BG_LUMINANCE);

      // Break if we hit lightness limits or contrast is good enough
      if (newL >= 95 || contrast >= minContrast) break;
    }

    return hslToRgb(h, newS, newL);
  }

  function createMutedColor(color: RGB, textColor: string): string {
    const [h, s, l] = rgbToHsl(...color);
    const backgroundLuminance = getLuminance(...color);

    // Create a muted version that's between the background and text color
    if (textColor === "#ffffff" || textColor === "#f0f0f0") {
      // For white text, create a lighter muted color
      const newSaturation = Math.min(s * 0.6, 30);
      let newLightness = Math.max(l + 20, 60); // Lighter than background

      // Ensure minimum contrast ratio of 3.0 for muted text against background
      let attempts = 0;
      while (attempts < 10) {
        const testColor = hslToRgb(h, newSaturation, newLightness);
        const testLuminance = getLuminance(...testColor);
        const contrast = getContrastRatio(testLuminance, backgroundLuminance);

        if (contrast >= 3.0) break;

        newLightness = Math.min(newLightness + 5, 85);
        attempts++;
      }

      return hslToString(h, newSaturation, newLightness);
    } else {
      // For black text, create a darker muted color
      const newSaturation = Math.min(s * 0.5, 25);
      let newLightness = Math.min(l - 20, 40); // Darker than background

      // Ensure minimum contrast ratio of 3.0 for muted text against background
      let attempts = 0;
      while (attempts < 10) {
        const testColor = hslToRgb(h, newSaturation, newLightness);
        const testLuminance = getLuminance(...testColor);
        const contrast = getContrastRatio(testLuminance, backgroundLuminance);

        if (contrast >= 3.0) break;

        newLightness = Math.max(newLightness - 5, 15);
        attempts++;
      }

      return hslToString(h, newSaturation, newLightness);
    }
  }

  // Enhanced color score function for anime/cartoon images with better accent handling
  function scoreColor(color: RGB): number {
    const [h, s, l] = rgbToHsl(...color);

    // Cartoon colors should be vibrant - prioritize saturation
    const saturationScore = s / 100;

    // We want middle-range lightness for visibility on dark UI
    // but not too dark (below 30%) or too light (above 80%)
    const lightnessScore = 1 - Math.abs(l - 55) / 55;

    // Bonus for non-grayscale colors (has actual hue)
    const colorfulness = s > 20 ? 1 : s / 20;

    // Accent color bonus - certain hue ranges get a boost for anime characters
    // Yellow-orange-red (eyes, mouth, accents) and blue-purple (hair, clothing) ranges
    let accentBonus = 0;

    // Check for warm accent colors (amber eyes, orange mouth, pink cheeks)
    // Hue ranges: yellow (40-60), orange (20-40), red (0-20, 340-360)
    if ((h >= 0 && h <= 60) || (h >= 340 && h <= 360)) {
      // Higher bonus for more saturated warm colors
      accentBonus = Math.min(0.5, (s / 100) * 0.5);
    }

    // Check for cool accent colors (blue hair elements, clothing)
    // Hue ranges: blue (180-240), purple (240-300)
    if (h >= 180 && h <= 300) {
      // Higher bonus for more saturated cool colors
      accentBonus = Math.min(0.3, (s / 100) * 0.3);
    }

    // Combine scores with weights prioritizing saturation and accents for anime
    return (saturationScore * 0.5) + (lightnessScore * 0.2) + (colorfulness * 0.1) + (accentBonus * 0.2);
  }

  // Enhanced detection for anime/cartoon characters with better handling for light characters
  function isLikelyCartoon(palette: RGB[]): boolean {
    // Anime/cartoon images typically have:
    // 1. Some very saturated colors (even if small areas like eyes)
    // 2. Distinct color areas rather than gradual transitions
    // 3. Often have skin tones in limited ranges
    // 4. For anime specifically, eye colors are often distinctive

    let highSaturationCount = 0;
    let distinctColorCount = new Set();
    let hasSkinTones = false;
    let hasEyeColors = false;
    let hasAnimeColorPattern = false;

    for (const color of palette) {
      const [h, s, l] = rgbToHsl(...color);

      // Count high saturation colors - lower threshold to catch more anime images
      if (s > 50) {
        highSaturationCount++;
      }

      // Count distinct hue regions
      const hueRegion = Math.floor(h / 30);
      distinctColorCount.add(hueRegion);

      // Check for typical anime skin tones (light peachy colors)
      if ((h >= 10 && h <= 40) && s < 40 && l > 70) {
        hasSkinTones = true;
      }

      // Check for typical anime eye colors
      // Yellow-gold, amber, red, blue, green, purple
      if (((h >= 35 && h <= 55) || // Gold/amber
          (h >= 0 && h <= 10) ||  // Red
          (h >= 200 && h <= 240) || // Blue
          (h >= 90 && h <= 150) || // Green
          (h >= 250 && h <= 290)) && // Purple
        s > 50 && l > 30 && l < 75) {
        hasEyeColors = true;
      }

      // Check for common anime color patterns
      // White/light hair + colorful eyes + clothing color
      if ((l > 80 && s < 20) || // White/light hair or skin
        (s > 70 && l > 50 && l < 65) || // Vibrant eyes/accessories
        (s > 50 && l > 40 && l < 70)) { // Clothing colors
        hasAnimeColorPattern = true;
      }
    }

    // Enhanced cartoon detection logic
    // Multiple conditions to catch different anime styles
    return (highSaturationCount >= 1 && distinctColorCount.size >= 3) || // Traditional detection
      (hasSkinTones && hasEyeColors) || // Character face detection
      (hasAnimeColorPattern && distinctColorCount.size >= 2); // Simplified anime pattern
  }

  // Create optimized cartoon-friendly colors

  // Enhanced color extraction with improved accent handling for anime/cartoon avatars
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
      // Extract more colors for better accent detection
      const palette = colorThief.getPalette(img, 12) as RGB[]; // Increased from 8 to 12 colors

      if (!palette || palette.length < 3) {
        throw new Error("Could not extract enough colors from image");
      }

      // Check if this is likely a cartoon/anime image
      const isCartoonImage = isLikelyCartoon(palette);

      // For cartoon images, we need special handling
      if (isCartoonImage) {
        logger.debug("Detected cartoon/anime style image");

        // Analyze extracted colors
        const colorAnalysis = palette.map(color => {
          const [h, s, l] = rgbToHsl(...color);
          return { color, h, s, l, score: scoreColor(color) };
        });

        // Log color analysis for debugging
        logger.debug("Anime color analysis:",
          colorAnalysis.map(({ color, h, s, l, score }) =>
            `${rgbToHex(...color)} (h:${Math.round(h)}° s:${Math.round(s)}% l:${Math.round(l)}%) score:${score.toFixed(2)}`
          )
        );

        // Sort colors by score
        const scoredColors = colorAnalysis.sort((a, b) => b.score - a.score);

        // Get top colors (will include accent colors like eyes due to enhanced scoring)
        const topColors = scoredColors.slice(0, 5); // Take top 5 colors for more diversity

        // Find warm and cool accent colors
        const warmAccents = colorAnalysis.filter(({ h, s }) =>
          ((h >= 0 && h <= 60) || (h >= 340 && h <= 360)) && s > 50
        ).sort((a, b) => b.score - a.score);

        const coolAccents = colorAnalysis.filter(({ h, s }) =>
          (h >= 180 && h <= 300) && s > 40
        ).sort((a, b) => b.score - a.score);

        // Ensure we have both warm and cool colors
        let primary, secondary, accent;

        if (warmAccents.length > 0 && coolAccents.length > 0) {
          // If we have both warm and cool colors, use them for contrast
          primary = coolAccents[0].color;
          secondary = warmAccents[0].color;
          accent = (warmAccents[1] || coolAccents[1] || scoredColors[2]).color;
        } else {
          // Otherwise, use the top scored colors
          primary = topColors[0].color;
          secondary = topColors[1].color;
          accent = topColors[2].color;

          // Check if we have mostly warm or cool colors
          const [primaryHue] = rgbToHsl(...primary);

          // If palette is heavily skewed to one temperature, create better contrast
          if ((primaryHue >= 0 && primaryHue <= 60) || (primaryHue >= 300 && primaryHue <= 360)) {
            // Primary is warm, make secondary cool
            secondary = hslToRgb((primaryHue + 180) % 360, 85, 60);
          } else {
            // Primary is cool, make accent warm
            accent = hslToRgb((primaryHue + 180) % 360, 85, 60);
          }
        }

        // Special handling for anime eye colors - often golden/amber
        const eyeColorCandidates = colorAnalysis.filter(({ h, s, l }) =>
          // Yellow/golden hue range typical for anime eyes
          ((h >= 35 && h <= 55) || (h >= 0 && h <= 30 && s > 70)) &&
          // Not too dark or light
          l > 40 && l < 75 &&
          // Reasonably saturated
          s > 50
        );

        // If we found likely eye colors, prioritize them for accent
        if (eyeColorCandidates.length > 0) {
          accent = eyeColorCandidates[0].color;
          logger.debug("Found anime eye color:", rgbToHex(...accent));
        }

        // Adjust colors for better contrast with dark background
        const adjustedPrimary = adjustForContrast(primary, 4.5);
        const adjustedSecondary = adjustForContrast(secondary, 4.5);
        const adjustedAccent = adjustForContrast(accent, 4.5);

        // Log our choices
        logger.debug("Selected anime palette colors:", {
          primary: rgbToHex(...adjustedPrimary),
          secondary: rgbToHex(...adjustedSecondary),
          accent: rgbToHex(...adjustedAccent)
        });

        // For dark UI, always use white text since text sits on dark backgrounds, not on the primary color
        const textColor = "#ffffff";
        const muted = createMutedColor(adjustedPrimary, textColor);

        // Create gradient colors with intentional color separation
        const [primaryHsl, secondaryHsl, accentHsl] = [
          rgbToHsl(...adjustedPrimary),
          rgbToHsl(...adjustedSecondary),
          rgbToHsl(...adjustedAccent)
        ];

        // Use higher saturation for gradients to make them pop
        const gradientSaturation = 90;
        const gradientLightness = 65;

        const gradientStart = hslToString(primaryHsl[0], gradientSaturation, gradientLightness);
        const gradientMid = hslToString(secondaryHsl[0], gradientSaturation, gradientLightness);
        const gradientEnd = hslToString(accentHsl[0], gradientSaturation, gradientLightness);

        return {
          primary: rgbToHex(...adjustedPrimary),
          secondary: rgbToHex(...adjustedSecondary),
          accent: rgbToHex(...adjustedAccent),
          text: textColor,
          muted: muted,
          gradientStart,
          gradientMid,
          gradientEnd
        };
      }

      // Generic image handling (non-cartoon)
      // Sort colors by score
      const sortedColors = [...palette].sort((a, b) =>
        scoreColor(b) - scoreColor(a)
      );

      // Log the top colors for debugging
      logger.debug("Top extracted colors:",
        sortedColors.slice(0, 3).map(color => {
          const hex = rgbToHex(...color);
          const [h, s, l] = rgbToHsl(...color);
          return `${hex} (h:${Math.round(h)}° s:${Math.round(s)}% l:${Math.round(l)}%)`;
        })
      );

      // Use the top colors for our palette
      const primary = sortedColors[0];
      const secondary = sortedColors[1] || sortedColors[0];
      const accent = sortedColors[2] || sortedColors[0];

      // Always adjust for contrast with dark background
      const adjustedPrimary = adjustForContrast(primary);
      const adjustedSecondary = adjustForContrast(secondary);
      const adjustedAccent = adjustForContrast(accent);

      // Determine text color based on contrast with our dark background
      const textColor = "#ffffff"; // Almost always white for dark UI

      // Extract HSL values for gradient creation
      const [primaryHsl, secondaryHsl, accentHsl] = [
        rgbToHsl(...adjustedPrimary),
        rgbToHsl(...adjustedSecondary),
        rgbToHsl(...adjustedAccent)
      ];

      // Create visually distinct gradients
      const gradientSaturation = 80;
      const gradientLightness = 60;

      const gradientStart = hslToString(primaryHsl[0], gradientSaturation, gradientLightness);
      const gradientMid = hslToString(secondaryHsl[0], gradientSaturation, gradientLightness);
      const gradientEnd = hslToString(accentHsl[0], gradientSaturation, gradientLightness);

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
    // Set a specific color
    // Set multiple colors at once
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

    // Extract colors from image (server icon or fallback to bot avatar)
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
    },

    // Extract colors from server icon specifically
    async extractFromServerIcon(iconUrl: string | null | undefined): Promise<void> {
      if (!iconUrl) {
        store.set(DEFAULT_PALETTE);
        return;
      }

      try {
        const palette = await extractColors(iconUrl);
        store.set(palette);
      } catch (err) {
        logger.error("Failed to extract colors from server icon:", err);
        store.set(DEFAULT_PALETTE);
      }
    }
  };
}

export const colorStore = createColorStore();
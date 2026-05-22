import { writable } from "svelte/store";
import { logger } from "$lib/logger";
// @ts-ignore - ColorThief doesn't have proper types
import ColorThief from "colorthief";

// Types
type RGB = [number, number, number];
type HSL = [number, number, number];

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  muted: string;
  background: string;
  gradientStart: string;
  gradientMid: string;
  gradientEnd: string;
}

const DEFAULT_PALETTE: ColorPalette = {
  primary: "#3b82f6",
  secondary: "#8b5cf6",
  accent: "#ec4899",
  text: "#ffffff",
  muted: "#9ca3af",
  background: "#121828",
  gradientStart: "#3a86ff",
  gradientMid: "#8338ec",
  gradientEnd: "#ff006e",
};

// Dark UI constants - representing the background color of your UI
// rgb(18, 24, 40) - your dark UI background
const DARK_BG_LUMINANCE = 0.03; // Pre-calculated luminance for performance
let currentPalette = DEFAULT_PALETTE;

function createColorStore() {
  // Try to load colors from sessionStorage to prevent flash
  let initialPalette = DEFAULT_PALETTE;
  if (typeof globalThis.window !== "undefined" && globalThis.sessionStorage) {
    try {
      const stored = globalThis.sessionStorage.getItem("mewdeko-colors");
      if (stored) {
        initialPalette = JSON.parse(stored);
      }
    } catch (err) {
      logger.debug("Failed to read stored colors, using default", err);
    }
  }

  const store = writable<ColorPalette>(initialPalette);

  // Update current palette and persist when store changes
  store.subscribe((value) => {
    currentPalette = value;
    // Persist to session storage
    if (typeof globalThis.window !== "undefined" && globalThis.sessionStorage) {
      try {
        globalThis.sessionStorage.setItem("mewdeko-colors", JSON.stringify(value));
      } catch (err) {
        logger.debug("Failed to persist colors to sessionStorage", err);
      }
    }
  });

  // Color conversion and contrast utilities
  function getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
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
    let h = 0,
      s,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
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
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function rgbToHex(r: number, g: number, b: number): string {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
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
    return (
      saturationScore * 0.5 +
      lightnessScore * 0.2 +
      colorfulness * 0.1 +
      accentBonus * 0.2
    );
  }

  // Enhanced detection for anime/cartoon characters with better handling for light characters
  /**
   * Whether an HSL color falls in the light peachy range typical of anime skin.
   */
  function isAnimeSkinTone(h: number, s: number, l: number): boolean {
    return h >= 10 && h <= 40 && s < 40 && l > 70;
  }

  /**
   * Whether an HSL color matches a distinctive anime eye colour (gold, amber,
   * red, blue, green or purple at a reasonable saturation and lightness).
   */
  function isAnimeEyeColor(h: number, s: number, l: number): boolean {
    const inEyeHueRange =
      (h >= 35 && h <= 55) ||
      (h >= 0 && h <= 10) ||
      (h >= 200 && h <= 240) ||
      (h >= 90 && h <= 150) ||
      (h >= 250 && h <= 290);
    return inEyeHueRange && s > 50 && l > 30 && l < 75;
  }

  /**
   * Whether an HSL color matches a common anime palette band: light hair/skin,
   * vibrant accessories, or mid-tone clothing.
   */
  function isAnimeColorBand(h: number, s: number, l: number): boolean {
    return (
      (l > 80 && s < 20) ||
      (s > 70 && l > 50 && l < 65) ||
      (s > 50 && l > 40 && l < 70)
    );
  }

  function isLikelyCartoon(palette: RGB[]): boolean {
    let highSaturationCount = 0;
    const distinctColorCount = new Set<number>();
    let hasSkinTones = false;
    let hasEyeColors = false;
    let hasAnimeColorPattern = false;

    for (const color of palette) {
      const [h, s, l] = rgbToHsl(...color);

      if (s > 50) highSaturationCount++;
      distinctColorCount.add(Math.floor(h / 30));
      if (isAnimeSkinTone(h, s, l)) hasSkinTones = true;
      if (isAnimeEyeColor(h, s, l)) hasEyeColors = true;
      if (isAnimeColorBand(h, s, l)) hasAnimeColorPattern = true;
    }

    return (
      (highSaturationCount >= 1 && distinctColorCount.size >= 3) ||
      (hasSkinTones && hasEyeColors) ||
      (hasAnimeColorPattern && distinctColorCount.size >= 2)
    );
  }

  /**
   * Builds a colour palette tuned for cartoon/anime artwork, favouring vivid
   * warm/cool accent contrast and prominent eye colours.
   */
  function buildCartoonPalette(palette: RGB[]): ColorPalette {
    const colorAnalysis = palette.map((color) => {
      const [h, s, l] = rgbToHsl(...color);
      return { color, h, s, l, score: scoreColor(color) };
    });

    const scoredColors = colorAnalysis.sort((a, b) => b.score - a.score);
    const topColors = scoredColors.slice(0, 5);

    const warmAccents = colorAnalysis
      .filter(
        ({ h, s }) => ((h >= 0 && h <= 60) || (h >= 340 && h <= 360)) && s > 50,
      )
      .sort((a, b) => b.score - a.score);

    const coolAccents = colorAnalysis
      .filter(({ h, s }) => h >= 180 && h <= 300 && s > 40)
      .sort((a, b) => b.score - a.score);

    let primary, secondary, accent;

    if (warmAccents.length > 0 && coolAccents.length > 0) {
      primary = coolAccents[0].color;
      secondary = warmAccents[0].color;
      accent = (warmAccents[1] || coolAccents[1] || scoredColors[2]).color;
    } else {
      primary = topColors[0].color;
      secondary = topColors[1].color;
      accent = topColors[2].color;

      const [primaryHue] = rgbToHsl(...primary);

      if (
        (primaryHue >= 0 && primaryHue <= 60) ||
        (primaryHue >= 300 && primaryHue <= 360)
      ) {
        secondary = hslToRgb((primaryHue + 180) % 360, 85, 60);
      } else {
        accent = hslToRgb((primaryHue + 180) % 360, 85, 60);
      }
    }

    const eyeColorCandidates = colorAnalysis.filter(
      ({ h, s, l }) =>
        ((h >= 35 && h <= 55) || (h >= 0 && h <= 30 && s > 70)) &&
        l > 40 &&
        l < 75 &&
        s > 50,
    );

    if (eyeColorCandidates.length > 0) {
      accent = eyeColorCandidates[0].color;
    }

    const adjustedPrimary = adjustForContrast(primary, 4.5);
    const adjustedSecondary = adjustForContrast(secondary, 4.5);
    const adjustedAccent = adjustForContrast(accent, 4.5);

    const textColor = "#ffffff";
    const [primaryHsl, secondaryHsl, accentHsl] = [
      rgbToHsl(...adjustedPrimary),
      rgbToHsl(...adjustedSecondary),
      rgbToHsl(...adjustedAccent),
    ];

    const gradientSaturation = 90;
    const gradientLightness = 65;

    return {
      primary: rgbToHex(...adjustedPrimary),
      secondary: rgbToHex(...adjustedSecondary),
      accent: rgbToHex(...adjustedAccent),
      text: textColor,
      muted: createMutedColor(adjustedPrimary, textColor),
      background: "#121828",
      gradientStart: hslToString(primaryHsl[0], gradientSaturation, gradientLightness),
      gradientMid: hslToString(secondaryHsl[0], gradientSaturation, gradientLightness),
      gradientEnd: hslToString(accentHsl[0], gradientSaturation, gradientLightness),
    };
  }

  /**
   * Builds a colour palette for generic (non-cartoon) imagery from the
   * highest-scoring extracted colours.
   */
  function buildGenericPalette(palette: RGB[]): ColorPalette {
    const sortedColors = [...palette].sort(
      (a, b) => scoreColor(b) - scoreColor(a),
    );

    const primary = sortedColors[0];
    const secondary = sortedColors[1] || sortedColors[0];
    const accent = sortedColors[2] || sortedColors[0];

    const adjustedPrimary = adjustForContrast(primary);
    const adjustedSecondary = adjustForContrast(secondary);
    const adjustedAccent = adjustForContrast(accent);

    const textColor = "#ffffff";
    const [primaryHsl, secondaryHsl, accentHsl] = [
      rgbToHsl(...adjustedPrimary),
      rgbToHsl(...adjustedSecondary),
      rgbToHsl(...adjustedAccent),
    ];

    const gradientSaturation = 80;
    const gradientLightness = 60;

    return {
      primary: rgbToHex(...adjustedPrimary),
      secondary: rgbToHex(...adjustedSecondary),
      accent: rgbToHex(...adjustedAccent),
      text: textColor,
      muted: createMutedColor(adjustedPrimary, textColor),
      background: "#121828",
      gradientStart: hslToString(primaryHsl[0], gradientSaturation, gradientLightness),
      gradientMid: hslToString(secondaryHsl[0], gradientSaturation, gradientLightness),
      gradientEnd: hslToString(accentHsl[0], gradientSaturation, gradientLightness),
    };
  }

  /**
   * Loads an image and derives a colour palette from it, dispatching to the
   * cartoon or generic builder. Returns the default palette on any failure.
   */
  async function extractColors(imageUrl: string): Promise<ColorPalette> {
    if (typeof globalThis.window === "undefined") {
      return DEFAULT_PALETTE;
    }

    try {
      const img = new globalThis.Image();
      img.crossOrigin = "Anonymous";

      const loadImage = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = imageUrl;
      });

      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Image loading timeout")), 5000);
      });

      await Promise.race([loadImage, timeout]);

      // @ts-ignore - ColorThief type issues
      const colorThief = new (ColorThief as any)();
      const palette = colorThief.getPalette(img, 12) as RGB[];

      if (!palette || palette.length < 3) {
        throw new Error("Could not extract enough colors from image");
      }

      return isLikelyCartoon(palette)
        ? buildCartoonPalette(palette)
        : buildGenericPalette(palette);
    } catch (error) {
      return DEFAULT_PALETTE;
    }
  }

  // Halloween state management

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

    // Halloween special: Swap primary and secondary colors (with animation)
    halloweenSwap(): void {
      const current = { ...currentPalette };

      // Add transition class to body for smooth color change
      if (typeof globalThis.window !== "undefined" && document.body) {
        document.body.classList.add("halloween-color-transition");

        // Remove the class after transition completes
        setTimeout(() => {
          document.body.classList.remove("halloween-color-transition");
        }, 2000);
      }

      // Swap primary and secondary
      const newPalette: ColorPalette = {
        ...current,
        primary: current.secondary,
        secondary: current.primary,
        // Also swap gradients for full effect
        gradientStart: current.gradientEnd,
        gradientEnd: current.gradientStart,
      };

      store.set(newPalette);
      // Mark that Halloween swap is active (to persist across server switches)
      if (typeof globalThis.window !== "undefined" && globalThis.sessionStorage) {
        sessionStorage.setItem("mewdeko-halloween-active", "true");
      }
    },

    // Check if Halloween swap is currently active
    isHalloweenActive(): boolean {
      if (typeof globalThis.window === "undefined" || !globalThis.sessionStorage) return false;

      // Auto-clear if it's no longer Halloween
      if (
        !this.isHalloween() &&
        sessionStorage.getItem("mewdeko-halloween-active") === "true"
      ) {
        // Clear the Halloween state
        sessionStorage.removeItem("mewdeko-halloween-active");
        sessionStorage.removeItem("mewdeko-halloween-triggered");
        return false;
      }

      return sessionStorage.getItem("mewdeko-halloween-active") === "true";
    },

    // Check if it's Halloween (October 31)
    isHalloween(): boolean {
      // Check for debug mode from localStorage or URL params
      if (typeof globalThis.window !== "undefined") {
        // Check localStorage for debug flag
        if (localStorage.getItem("mewdeko-halloween-debug") === "true") {
          return true;
        }

        // Check URL params for testing
        const params = new URLSearchParams(globalThis.location.search);
        if (params.get("halloween") === "test") {
          return true;
        }
      }

      const now = new Date();
      return now.getMonth() === 9 && now.getDate() === 31; // October is month 9 (0-indexed)
    },

    // Enable Halloween debug mode (for testing)
    enableHalloweenDebug(): void {
      if (typeof globalThis.window !== "undefined" && globalThis.localStorage) {
        localStorage.setItem("mewdeko-halloween-debug", "true");
      }
    },

    // Disable Halloween debug mode
    disableHalloweenDebug(): void {
      if (typeof globalThis.window !== "undefined") {
        if (globalThis.localStorage) {
          localStorage.removeItem("mewdeko-halloween-debug");
        }
        if (globalThis.sessionStorage) {
          sessionStorage.removeItem("mewdeko-halloween-active");
        }
      }
    },

    // Reset to default palette
    reset(): void {
      store.set(DEFAULT_PALETTE);
      // Also clear session storage
      if (typeof globalThis.window !== "undefined" && globalThis.sessionStorage) {
        try {
          globalThis.sessionStorage.removeItem("mewdeko-colors");
        } catch (err) {
          logger.debug("Failed to clear colors from sessionStorage", err);
        }
      }
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

        // If Halloween is active, swap the colors after extraction
        if (this.isHalloweenActive()) {
          this.applyHalloweenSwap();
        }
      } catch (err) {
        store.set(DEFAULT_PALETTE);
      }
    },

    // Extract colors from server icon specifically
    async extractFromServerIcon(
      iconUrl: string | null | undefined,
    ): Promise<void> {
      if (!iconUrl) {
        store.set(DEFAULT_PALETTE);
        return;
      }

      try {
        const palette = await extractColors(iconUrl);
        store.set(palette);

        // If Halloween is active, swap the colors after extraction
        if (this.isHalloweenActive()) {
          this.applyHalloweenSwap();
        }
      } catch (err) {
        store.set(DEFAULT_PALETTE);
      }
    },

    // Apply Halloween swap without animation (for server switches)
    applyHalloweenSwap(): void {
      const current = { ...currentPalette };

      // Swap primary and secondary
      const newPalette: ColorPalette = {
        ...current,
        primary: current.secondary,
        secondary: current.primary,
        // Also swap gradients for full effect
        gradientStart: current.gradientEnd,
        gradientEnd: current.gradientStart,
      };

      store.set(newPalette);    },
  };
}

export const colorStore = createColorStore();
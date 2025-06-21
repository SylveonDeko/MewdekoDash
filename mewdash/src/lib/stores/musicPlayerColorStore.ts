import { get, writable } from "svelte/store";
import ColorThief from "colorthief";
import { logger } from "$lib/logger";

// Types
type RGB = [number, number, number];
type HSL = [number, number, number];

interface MusicPlayerColors {
  background: string;
  foreground: string;
  accent: string;
  text: string;
  gradientStart: string;
  gradientEnd: string;
  controlsHighlight: string; // New: for primary controls like play/pause
  [key: string]: string; // Index signature for dynamic access
}

const DEFAULT_COLORS: MusicPlayerColors = {
  background: "#1a1a1a",
  foreground: "#3b82f6",
  accent: "#8b5cf6",
  text: "#ffffff",
  gradientStart: "#111111",
  gradientEnd: "#1a1a1a",
  controlsHighlight: "#4f94ff"
};

// Dark UI constants - representing the music player background
const DARK_BG: RGB = [26, 26, 26]; // rgb(26, 26, 26) - music player background
const DARK_BG_LUMINANCE = 0.05; // Pre-calculated luminance for performance

function createMusicPlayerColorStore() {
  // Set up the store
  const store = writable<MusicPlayerColors>(DEFAULT_COLORS);

  // Cache for processed image URLs
  const processedUrls = new Map<string, string>();

  // Animation state for transitions
  let currentColors = DEFAULT_COLORS;
  let targetColors = DEFAULT_COLORS;
  let transitionInProgress = false;
  let animationId: number | null = null;
  let transitionDuration = 700; // Default transition time in ms
  let skipTransitionsUntil = 0; // Timestamp to skip transitions until

  // Easing function for smooth transitions (ease-in-out)
  const easeInOut = (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  // Color conversion and utility functions
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
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }

  function hexToRgb(hex: string): RGB {
    hex = hex.replace(/^#/, "");
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
  }

  // For color transitions: Parse hex colors
  function parseHexColor(hex: string): RGB | null {
    // Remove # if present
    hex = hex.replace(/^#/, "");

    // Handle different hex formats
    let r, g, b;
    if (hex.length === 3) {
      // Short format (#rgb)
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else if (hex.length === 6) {
      // Long format (#rrggbb)
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      return null; // Invalid format
    }

    return [r, g, b];
  }

  // Convert HSL to hex
  function hslToHex(h: number, s: number, l: number): string {
    const rgb = hslToRgb(h, s, l);
    return rgbToHex(...rgb);
  }

  // Improved text color selection for dark backgrounds
  function getTextColor(backgroundColor: RGB): string {
    const bgLuminance = getLuminance(...backgroundColor);

    // For music player, we want white text in most cases
    // Only use black text if the background is very light
    const isVeryLightBackground = bgLuminance > 0.7;

    return isVeryLightBackground ? "#000000" : "#ffffff";
  }

  function detectEyeColors(palette: RGB[]): RGB[] {
    // Common anime eye colors fall in these hue ranges
    const eyeColorRanges = [
      { name: "amber/gold", hueRange: [35, 55], minSat: 60, minLight: 40, maxLight: 70 },
      { name: "red/ruby", hueRange: [350, 10], minSat: 70, minLight: 40, maxLight: 60 },
      { name: "blue", hueRange: [200, 240], minSat: 50, minLight: 40, maxLight: 70 },
      { name: "green", hueRange: [90, 150], minSat: 50, minLight: 40, maxLight: 70 },
      { name: "purple/violet", hueRange: [250, 290], minSat: 50, minLight: 30, maxLight: 70 }
    ];

    const potentialEyeColors: { color: RGB, score: number }[] = [];

    for (const color of palette) {
      const [h, s, l] = rgbToHsl(...color);

      // Check each eye color range
      for (const range of eyeColorRanges) {
        const inHueRange = (
          (h >= range.hueRange[0] && h <= range.hueRange[1]) ||
          // Handle wrap-around for red hues
          (range.name === "red/ruby" && (h >= 350 || h <= 10))
        );

        if (inHueRange &&
          s >= range.minSat &&
          l >= range.minLight &&
          l <= range.maxLight) {
          // Calculate a score based on how closely it matches ideal eye color
          const saturationScore = s / 100; // Higher saturation is better
          const lightnessScore = 1 - Math.abs((range.minLight + range.maxLight) / 2 - l) / ((range.maxLight - range.minLight) / 2);

          // Bonus for exact hue matches to common anime eye colors
          let hueBonus = 0;
          if ((h >= 40 && h <= 50) || // Gold/amber
            (h >= 355 || h <= 5) || // Red
            (h >= 220 && h <= 230) || // Blue
            (h >= 110 && h <= 130) || // Green
            (h >= 270 && h <= 280)) { // Purple
            hueBonus = 0.3;
          }

          const totalScore = saturationScore * 0.4 + lightnessScore * 0.3 + hueBonus;
          potentialEyeColors.push({ color, score: totalScore });
        }
      }
    }

    // Sort by score and return top colors
    return potentialEyeColors
      .sort((a, b) => b.score - a.score)
      .map(item => item.color);
  }

  function createHarmoniousColors(baseHue: number, scheme: "complementary" | "triadic" | "analogous" = "complementary"): {
    primary: HSL,
    secondary: HSL,
    accent: HSL
  } {
    const baseSaturation = 85;
    const baseLightness = 55;

    let secondaryHue: number, accentHue: number;

    switch (scheme) {
      case "complementary":
        secondaryHue = (baseHue + 180) % 360;
        accentHue = (baseHue + 90) % 360; // Split complementary
        break;
      case "triadic":
        secondaryHue = (baseHue + 120) % 360;
        accentHue = (baseHue + 240) % 360;
        break;
      case "analogous":
      default:
        secondaryHue = (baseHue + 30) % 360;
        accentHue = (baseHue + 60) % 360;
        break;
    }

    return {
      primary: [baseHue, baseSaturation, baseLightness],
      secondary: [secondaryHue, baseSaturation - 5, baseLightness - 5],
      accent: [accentHue, baseSaturation - 10, baseLightness + 5]
    };
  }

  function createVisualHierarchy(baseColor: RGB): {
    main: string,
    highlight: string,
    subtle: string
  } {
    const [h, s, l] = rgbToHsl(...baseColor);

    // Create a more saturated version for primary controls (play/pause)
    const highlightSaturation = Math.min(s + 15, 100);
    const highlightLightness = Math.min(l + 10, 95);

    // Create a more subtle version for secondary elements
    const subtleSaturation = Math.max(s - 15, 20);
    const subtleLightness = Math.max(l - 10, 30);

    return {
      main: hslToHex(h, s, l),
      highlight: hslToHex(h, highlightSaturation, highlightLightness),
      subtle: hslToHex(h, subtleSaturation, subtleLightness)
    };
  }

  function createSubtleGradient(baseColor: RGB): {
    start: string,
    end: string
  } {
    const [h, s, l] = rgbToHsl(...baseColor);

    // Create a darker, less saturated version for gradient start
    const startSaturation = Math.max(s * 0.5, 15);
    const startLightness = Math.max(l * 0.15, 5);

    // Create a slightly lighter version for gradient end
    const endSaturation = Math.max(s * 0.6, 20);
    const endLightness = Math.max(l * 0.2, 10);

    return {
      start: hslToHex(h, startSaturation, startLightness),
      end: hslToHex(h, endSaturation, endLightness)
    };
  }

  // Improved contrast adjustment for dark UI
  function adjustForContrast(color: RGB, minContrast = 4.5): RGB {
    let [r, g, b] = color;
    let [h, s, l] = rgbToHsl(r, g, b);
    let currentLuminance = getLuminance(r, g, b);
    let contrast = getContrastRatio(currentLuminance, DARK_BG_LUMINANCE);

    // For dark music player UI, ensure colors are visible
    if (contrast >= minContrast) {
      return [r, g, b];
    }

    // For dark UI, boost saturation first
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

  // Darken colors for music player background
  function darkenColor(color: RGB, factor = 0.1): string {
    return rgbToHex(
      Math.round(color[0] * factor),
      Math.round(color[1] * factor),
      Math.round(color[2] * factor)
    );
  }

  // Enhanced color scoring function
  function scoreColor(color: RGB): number {
    const [h, s, l] = rgbToHsl(...color);

    // Album art colors should be vibrant
    const saturationScore = s / 100;

    // We want middle-range lightness for visibility
    const lightnessScore = 1 - Math.abs(l - 55) / 55;

    // Bonus for non-grayscale colors
    const colorfulness = s > 20 ? 1 : s / 20;

    // Accent color bonus - certain hue ranges get a boost
    let accentBonus = 0;

    // Check for warm colors (often dominant in album art)
    if ((h >= 0 && h <= 60) || (h >= 340 && h <= 360)) {
      accentBonus = Math.min(0.5, (s / 100) * 0.5);
    }

    // Check for cool accent colors
    if (h >= 180 && h <= 300) {
      accentBonus = Math.min(0.3, (s / 100) * 0.3);
    }

    // Combine scores with weights
    return (saturationScore * 0.5) + (lightnessScore * 0.2) + (colorfulness * 0.1) + (accentBonus * 0.2);
  }

  // Detection for anime/cartoon album artwork
  function isLikelyCartoon(palette: RGB[]): boolean {
    let highSaturationCount = 0;
    let distinctColorCount = new Set();
    let hasVibrantColors = false;

    for (const color of palette) {
      const [h, s, l] = rgbToHsl(...color);

      // Count high saturation colors
      if (s > 50) {
        highSaturationCount++;
      }

      // Count distinct hue regions
      const hueRegion = Math.floor(h / 30);
      distinctColorCount.add(hueRegion);

      // Check for vibrant colors (anime tends to have these)
      if (s > 70 && l > 40 && l < 80) {
        hasVibrantColors = true;
      }
    }

    // If we have some saturated colors and distinct color regions,
    // it's likely a cartoon/anime image or vibrant album art
    return (highSaturationCount >= 2 && distinctColorCount.size >= 3) || hasVibrantColors;
  }

  // NEW: Function to interpolate between two hex colors for transitions
  function interpolateHexColors(color1: string, color2: string, progress: number): string {
    const rgb1 = parseHexColor(color1);
    const rgb2 = parseHexColor(color2);

    if (!rgb1 || !rgb2) return color1;

    const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * progress);
    const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * progress);
    const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * progress);

    return rgbToHex(r, g, b);
  }

  function interpolateColorPalettes(palette1: MusicPlayerColors, palette2: MusicPlayerColors, progress: number): MusicPlayerColors {
    const result = {} as MusicPlayerColors;

    for (const key in palette1) {
      if (typeof palette1[key] === "string" && typeof palette2[key] === "string") {
        result[key] = interpolateHexColors(palette1[key] as string, palette2[key] as string, progress);
      } else {
        // For non-color properties, just use target
        result[key] = palette2[key];
      }
    }

    return result;
  }

  function animateColorTransition() {
    const startTime = performance.now();

    // Clear any existing animation
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    // Check if we should skip this transition
    if (performance.now() < skipTransitionsUntil) {
      // Skip animation and jump to end
      store.set(targetColors);
      currentColors = { ...targetColors };
      transitionInProgress = false;
      return;
    }

    function updateFrame(currentTime: number) {
      // Calculate raw progress (0 to 1)
      const rawProgress = Math.min((currentTime - startTime) / transitionDuration, 1);

      // Apply easing function
      const progress = easeInOut(rawProgress);

      // Calculate interpolated colors
      const interpolatedColors = interpolateColorPalettes(currentColors, targetColors, progress);

      // Update the store
      store.set(interpolatedColors);

      // Continue animation if not complete
      if (rawProgress < 1) {
        animationId = requestAnimationFrame(updateFrame);
      } else {
        // Animation complete
        animationId = null;
        currentColors = { ...targetColors };
        transitionInProgress = false;
      }
    }

    // Start the animation loop
    transitionInProgress = true;
    animationId = requestAnimationFrame(updateFrame);
  }

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
        // Extract more colors for better analysis
        palette = colorThief.getPalette(img, 10) as RGB[]; // Increased to get more colors for eye detection
      } catch (error) {
        logger.error("ColorThief failed to extract colors:", error);
        return DEFAULT_COLORS;
      }

      if (!palette || palette.length < 2) {
        return DEFAULT_COLORS;
      }

      // Check if this is a cartoon/anime style album art
      const isCartoonArt = isLikelyCartoon(palette);

      // ENHANCEMENT 1: Enhanced anime eye color detection
      // Check for anime eye colors if it's cartoon art
      let eyeColors: RGB[] = [];
      if (isCartoonArt) {
        eyeColors = detectEyeColors(palette);
      }

      // Analyze extracted colors
      const colorAnalysis = palette.map(color => {
        const [h, s, l] = rgbToHsl(...color);
        return { color, h, s, l, score: scoreColor(color) };
      });

      // Sort colors by score
      const scoredColors = colorAnalysis.sort((a, b) => b.score - a.score);

      // Select primary color - prioritize eye colors for anime art
      let primaryColor: RGB;
      if (isCartoonArt && eyeColors.length > 0) {
        primaryColor = eyeColors[0]; // Use the highest-scored eye color
        //logger.debug("Using anime eye color as primary:", rgbToHex(...primaryColor));
      } else {
        primaryColor = scoredColors[0].color;
      }

      const primaryHsl = rgbToHsl(...primaryColor);
      let colorScheme: "complementary" | "triadic" | "analogous";

      // Determine best color scheme based on image characteristics
      const hasManyDistinctColors = new Set(palette.map(c => Math.floor(rgbToHsl(...c)[0] / 30))).size >= 4;
      const hasStrongSaturation = palette.some(c => rgbToHsl(...c)[1] > 80);

      if (isCartoonArt && hasManyDistinctColors) {
        colorScheme = "triadic"; // Anime art often looks good with triadic
      } else if (hasStrongSaturation) {
        colorScheme = "complementary"; // Strong colors work with complementary
      } else {
        colorScheme = "analogous"; // Subtle images work with analogous
      }

      // Create harmonious color palette
      const harmoniousColors = createHarmoniousColors(primaryHsl[0], colorScheme);

      // Convert to RGB
      const foregroundColor = hslToRgb(...harmoniousColors.primary);
      const accentColor = hslToRgb(...harmoniousColors.accent);

      // Adjust colors for better contrast
      const adjustedForeground = adjustForContrast(foregroundColor, 4.5);
      const adjustedAccent = adjustForContrast(accentColor, 4.5);

      const hierarchy = createVisualHierarchy(adjustedForeground);

      const gradient = createSubtleGradient(primaryColor);

      const textColor = getTextColor(adjustedForeground);

      return {
        background: darkenColor(primaryColor, 0.1),
        foreground: hierarchy.main,
        accent: rgbToHex(...adjustedAccent),
        text: textColor,
        gradientStart: gradient.start,
        gradientEnd: gradient.end,
        controlsHighlight: hierarchy.highlight
      };
    } catch (error) {
      logger.error("Error extracting colors for music player:", error);
      return DEFAULT_COLORS;
    }
  }

  // Update colors with smooth transitions
  async function updateFromArtwork(imageUrl: string): Promise<void> {
    if (!imageUrl) {
      // Save current colors before setting defaults
      currentColors = get(store);
      targetColors = DEFAULT_COLORS;
      animateColorTransition();
      return;
    }

    try {
      // Track current colors before extracting new ones
      currentColors = get(store);

      // Extract colors from the new artwork
      const newColors = await extractColors(imageUrl);

      // Set target colors for the transition
      targetColors = newColors;

      // Check if we're already in a transition
      if (transitionInProgress) {
        // If already in transition, immediately update to new target
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }

      // Start transition to new colors
      animateColorTransition();

    } catch (err) {
      logger.error("Failed to extract colors from artwork:", err);
      store.set(DEFAULT_COLORS);
    }
  }

  // Skip transitions for a duration (useful when skipping tracks rapidly)
  function skipTransitions(duration: number = 1000): void {
    skipTransitionsUntil = performance.now() + duration;

    // If in the middle of a transition, cancel it and jump to target
    if (transitionInProgress && animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
      store.set(targetColors);
      currentColors = { ...targetColors };
      transitionInProgress = false;
    }
  }

  // Set transition duration
  function setTransitionDuration(duration: number): void {
    transitionDuration = duration;
  }

  // Clean up any animations on component destruction
  function cleanup(): void {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  return {
    subscribe: store.subscribe,

    // Expose methods for animations and color management
    updateFromArtwork,
    skipTransitions,
    setTransitionDuration,
    cleanup,
    reset: () => {
      currentColors = get(store);
      targetColors = DEFAULT_COLORS;
      animateColorTransition();
    },
    // Access the current colors
    get current(): MusicPlayerColors {
      return get(store);
    }
  };
}

export const musicPlayerColors = createMusicPlayerColorStore();
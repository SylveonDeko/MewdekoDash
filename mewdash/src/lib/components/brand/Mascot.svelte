<script lang="ts">
  import { untrack } from "svelte";
  import { cubicInOut } from "svelte/easing";
  import { Tween } from "svelte/motion";
  import { colorStore } from "$lib/stores/colorStore";
  import MascotTool from "./MascotTool.svelte";
  import { buildTails, DEFAULT_TOOLS, type MascotExpression, type MascotToolName } from "./mascotGeometry";

  /**
   * Mewdeko's nine-tailed cat. Its fur takes the page's color while its outline, goggles, face and tools look
   * the same everywhere. Each tail carries one part of the bot on its tip, and the tails turn around the cat
   * like a wheel to bring one of them to the top.
   */
  interface Props {
    /** Fur color. Follows the page's primary color when left out. */
    color?: string | null;
    /** The whole cat, or its head alone for small spots. */
    variant?: "full" | "head";
    /** Whether the tails carry their tools. */
    tools?: boolean;
    /** What the tails carry, in the order they come to the top. A tail swaps tools behind the cat when the list is longer than nine. */
    toolSet?: MascotToolName[];
    /** How many slots the tails have turned. Changing it turns them smoothly. Fractions are part way between slots. */
    turn?: number;
    /** Whether the tails track every small change to the turn, for tying them to scrolling. */
    follow?: boolean;
    /** Where the tails are right now, part way through a turn. Bind it to move other things with them. */
    position?: number;
    /** Spoken description. Null hides it from assistive technology. */
    label?: string | null;
    /**
     * Size of one sprite pixel in drawing units. Any value above zero draws the cat as pixel art through an
     * SVG filter, so it stays vector and carries the same pixel grid at every display size. Zero draws it smooth.
     */
    pixel?: number;
    /** The face it pulls. Open eyes blink now and then on their own. */
    expression?: MascotExpression;
    class?: string;
  }

  let {
    color = null,
    variant = "full",
    tools = true,
    toolSet = DEFAULT_TOOLS,
    turn = 0,
    follow = false,
    position = $bindable(0),
    label = "Mewdeko's nine-tailed cat mascot",
    pixel = 0,
    expression = "neutral",
    class: className = ""
  }: Props = $props();

  const uid = $props.id();
  const INK = "#1b2238";
  const CREAM = "#fff1d6";
  const NATURAL = "#ffb020";
  const TURN_MS = 700;

  let skin = $derived(buildSkin(color ?? $colorStore.primary));
  position = untrack(() => turn);
  let tails = $derived(variant === "full" ? buildTails(position, toolSet) : []);

  /** The drawing's bounds, which the pixel grid covers in full. */
  const BOX = { full: [-160, -175, 810, 635], head: [100, 18, 280, 250] } as const;
  const box = $derived(BOX[variant]);

  /** Colors snap to this many steps per channel in pixel mode, so neighboring cells share a path. */
  const LEVELS = 32;
  /** Each cell is drawn this many canvas pixels wide when sampling, and takes the color at its center. */
  const SAMPLE = 5;

  /** The largest a pixel-art cell gets on screen, in CSS pixels, so a big cat gets a finer grid rather than bigger blocks. */
  const MAX_CELL_CSS = 2.25;

  /** The smooth drawing, kept unrendered in pixel mode as the picture the grid samples. */
  let sourceEl = $state<SVGSVGElement | null>(null);
  /** The visible cat, measured to size its grid. */
  let svgEl = $state<SVGSVGElement | null>(null);
  /** The cat's width on screen in CSS pixels, or zero before it is measured. */
  let hostWidth = $state(0);
  /** One path per color, each a set of whole cells, once the drawing has been sampled. */
  let pixelPaths = $state<{ fill: string; d: string }[]>([]);

  /**
   * One cell in drawing units: the requested size, made finer when the cat is drawn large, and rounded to a
   * quarter unit so small resizes do not resample.
   */
  let cell = $derived(
    pixel > 0 && hostWidth > 0
      ? Math.max(1, Math.round(Math.min(pixel, (MAX_CELL_CSS * box[2]) / hostWidth) * 4) / 4)
      : pixel
  );

  $effect(() => {
    if (pixel <= 0 || !svgEl) return;
    const element = svgEl;
    const measure = () => {
      hostWidth = element.getBoundingClientRect().width;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  });

  $effect(() => {
    if (pixel <= 0 || !sourceEl || hostWidth <= 0) return;
    const source = sourceEl;
    const size = cell;
    const columns = Math.ceil(box[2] / size);
    const rows = Math.ceil(box[3] / size);
    const [left, top] = box;
    const canvas = document.createElement("canvas");
    canvas.width = columns * SAMPLE;
    canvas.height = rows * SAMPLE;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    let frame = 0;
    let busy = false;
    let dirty = false;
    let stopped = false;

    const sample = async () => {
      if (busy) {
        dirty = true;
        return;
      }
      busy = true;
      dirty = false;
      try {
        const markup = new XMLSerializer().serializeToString(source)
          .replace("<svg", `<svg width="${canvas.width}" height="${canvas.height}"`);
        const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
        const image = new Image();
        image.src = url;
        await image.decode();
        URL.revokeObjectURL(url);
        if (stopped) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const step = 255 / (LEVELS - 1);
        const snap = (value: number) => Math.round(Math.round(value / step) * step);
        const paths = new Map<string, string[]>();

        for (let row = 0; row < rows; row++) {
          let runColor = "";
          let runStart = 0;
          const flush = (end: number) => {
            if (!runColor) return;
            const parts = paths.get(runColor) ?? [];
            const x = +(left + runStart * size).toFixed(2);
            const y = +(top + row * size).toFixed(2);
            const width = +((end - runStart) * size).toFixed(2);
            parts.push(`M${x} ${y}h${width}v${size}h-${width}z`);
            paths.set(runColor, parts);
          };
          for (let column = 0; column < columns; column++) {
            const middle = (SAMPLE - 1) / 2;
            const at = ((row * SAMPLE + middle) * canvas.width + column * SAMPLE + middle) * 4;
            const color = data[at + 3] < 128
              ? ""
              : `rgb(${snap(data[at])},${snap(data[at + 1])},${snap(data[at + 2])})`;
            if (color !== runColor) {
              flush(column);
              runColor = color;
              runStart = column;
            }
          }
          flush(columns);
        }

        pixelPaths = [...paths].map(([fill, parts]) => ({ fill, d: parts.join("") }));
      } catch {
        pixelPaths = [];
      } finally {
        busy = false;
        if (dirty && !stopped) schedule();
      }
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        void sample();
      });
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(source, { subtree: true, attributes: true, childList: true, characterData: true });
    return () => {
      stopped = true;
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  });

  /**
   * Line width for the face and whiskers. Pixel mode samples one point per cell, so thin lines would break
   * into dots there; they are drawn a set number of cells wide instead.
   * @param width The width in smooth mode
   * @param cells The least width in pixel mode, counted in cells
   */
  function line(width: number, cells = 2) {
    return pixel > 0 ? Math.max(width, cell * cells) : width;
  }

  /** An eye as the face defines it, before blinking or closing. */
  type EyeDesign =
    | { kind: "open"; rx: number; ry: number; cy: number; spark: boolean }
    | { kind: "up" }
    | { kind: "down" }
    | { kind: "star" };
  /** An eye as drawn on this frame. */
  type EyeShape =
    | { kind: "open"; rx: number; ry: number; cy: number; spark: boolean; lit: boolean }
    | { kind: "arc"; d: string }
    | { kind: "star"; size: number };
  /** A line mouth as two quadratic curves: start, control, middle, control, end. Every line mouth uses this layout so one can morph into another. */
  type MouthLine = [number, number, number, number, number, number, number, number, number, number];

  const OPEN_EYE: EyeDesign = { kind: "open", rx: 16, ry: 21, cy: 176, spark: false };
  /** Arcs as half width, baseline and control height. Closing eyes all meet in the same soft curve. */
  const UP_ARC = [15, 182, 160];
  const DOWN_ARC = [14, 176, 190];
  const CLOSED_ARC = [14, 184, 190];
  /** Past this much shut, an open eye or star is drawn as the closing arc. */
  const ARC_FROM = 0.85;
  const LINE_MOUTHS: Partial<Record<MascotExpression, MouthLine>> = {
    neutral: [221, 210, 230.5, 223, 240, 210, 249.5, 223, 259, 210],
    vibing: [221, 210, 230.5, 223, 240, 210, 249.5, 223, 259, 210],
    look: [221, 210, 230.5, 223, 240, 210, 249.5, 223, 259, 210],
    wink: [224, 212, 233, 218, 241, 216, 250, 213, 258, 206],
    determined: [228, 215, 234, 213, 240, 213, 246, 213, 252, 215],
    sad: [226, 218, 232, 211, 240, 210, 248, 211, 254, 218]
  };
  /** The small mouth every face passes through while the eyes are shut. */
  const SMALL_MOUTH: MouthLine = [232, 212, 236, 215, 240, 215, 244, 215, 248, 212];

  /** The expression on screen, which trails the requested one while the eyes are shut. */
  let face: MascotExpression = $state(untrack(() => expression));
  /** True from the moment the old face starts closing until the new one is in place. */
  let changing = $state(false);
  /** How far the eyes are shut, from 0 open to 1 closed. */
  const shut = new Tween(0, { easing: cubicInOut });
  const mouthLine = new Tween<MouthLine>(untrack(() => LINE_MOUTHS[face] ?? SMALL_MOUTH), { easing: cubicInOut });
  /** Counts face changes, so one that was overtaken by a newer change stops where it is. */
  let changeCount = 0;

  /** Whether the visitor asked for less motion. */
  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Changes face: the eyes ease shut while the mouth shrinks to the small shape, the face swaps while they are
   * closed, and they ease open on the new one while its mouth grows into place.
   * @param target The face to end on
   */
  async function changeFace(target: MascotExpression) {
    const id = ++changeCount;
    const fromLine = LINE_MOUTHS[face] !== undefined && !changing;
    changing = true;
    void mouthLine.set(SMALL_MOUTH, { duration: fromLine ? 130 : 0 });
    await shut.set(1, { duration: 130 * (1 - shut.current) });
    if (id !== changeCount) return;
    face = target;
    changing = false;
    const toLine = LINE_MOUTHS[target];
    if (toLine) void mouthLine.set(toLine, { duration: 160 });
    await shut.set(0, { duration: 170 });
  }

  $effect(() => {
    const target = expression;
    if (untrack(() => face) === target && !untrack(() => changing)) return;
    if (reducedMotion()) {
      changeCount++;
      face = target;
      changing = false;
      void shut.set(0, { duration: 0 });
      void mouthLine.set(LINE_MOUTHS[target] ?? SMALL_MOUTH, { duration: 0 });
      return;
    }
    void changeFace(target);
  });

  /** Blinks every few seconds at a random pace, unless the face is busy changing. */
  $effect(() => {
    if (reducedMotion()) return;
    let timer = 0;
    const wait = () => {
      timer = window.setTimeout(() => {
        wait();
        if (changing || shut.target !== 0) return;
        void shut.set(1, { duration: 70 }).then(() => {
          if (!changing) void shut.set(0, { duration: 110 });
        });
      }, 2500 + Math.random() * 3500);
    };
    wait();
    return () => clearTimeout(timer);
  });

  /**
   * Draws an arc eye between two arc shapes.
   * @param cx Eye center
   * @param from The arc when open
   * @param t How far towards the closed arc, 0 to 1
   */
  function arcPath(cx: number, from: number[], t: number) {
    const [half, base, control] = from.map((value, i) => value + (CLOSED_ARC[i] - value) * t);
    return `M${(cx - half).toFixed(1)} ${base.toFixed(1)} Q${cx} ${control.toFixed(1)} ${(cx + half).toFixed(1)} ${base.toFixed(1)}`;
  }

  /**
   * The shape of each eye, left then right, for the face on screen and how far it is shut. Open eyes squash
   * towards the closing line and lose their highlights; stars shrink; arcs bend into the closing curve.
   */
  let eyes = $derived.by((): [EyeShape, EyeShape] => {
    const design = ((): [EyeDesign, EyeDesign] => {
      switch (face) {
        case "happy":
          return [{ kind: "up" }, { kind: "up" }];
        case "vibing":
          return [{ kind: "down" }, { kind: "down" }];
        case "starry":
          return [{ kind: "star" }, { kind: "star" }];
        case "wink":
          return [{ kind: "up" }, OPEN_EYE];
        case "excited":
          return [
            { kind: "open", rx: 18, ry: 23, cy: 176, spark: true },
            { kind: "open", rx: 18, ry: 23, cy: 176, spark: true }
          ];
        case "surprised":
          return [
            { kind: "open", rx: 14, ry: 17, cy: 176, spark: false },
            { kind: "open", rx: 14, ry: 17, cy: 176, spark: false }
          ];
        case "look":
          return [
            { kind: "open", rx: 16, ry: 21, cy: 170, spark: true },
            { kind: "open", rx: 16, ry: 21, cy: 170, spark: true }
          ];
        case "sad":
          return [
            { kind: "open", rx: 15, ry: 19, cy: 180, spark: true },
            { kind: "open", rx: 15, ry: 19, cy: 180, spark: true }
          ];
        default:
          return [OPEN_EYE, OPEN_EYE];
      }
    })();
    const s = shut.current;
    return design.map((eye, side): EyeShape => {
      const cx = side === 0 ? 202 : 278;
      if (eye.kind === "up") return { kind: "arc", d: arcPath(cx, UP_ARC, s) };
      if (eye.kind === "down") return { kind: "arc", d: arcPath(cx, DOWN_ARC, s) };
      if (s >= ARC_FROM) {
        return { kind: "arc", d: arcPath(cx, [14, CLOSED_ARC[1], CLOSED_ARC[1]], (s - ARC_FROM) / (1 - ARC_FROM)) };
      }
      const t = s / ARC_FROM;
      if (eye.kind === "star") return { kind: "star", size: 1 - 0.75 * t };
      return {
        kind: "open",
        rx: eye.rx,
        ry: Math.max(2, eye.ry * (1 - t)),
        cy: eye.cy + (CLOSED_ARC[1] - eye.cy) * t,
        spark: eye.spark && s < 0.3,
        lit: s < 0.3
      };
    }) as [EyeShape, EyeShape];
  });

  /** Which mouth to draw: the morphing line, or one of the filled shapes. */
  let mouth = $derived(
    changing || LINE_MOUTHS[face]
      ? "line"
      : face === "surprised"
        ? "o"
        : "open"
  );

  let mouthPath = $derived.by(() => {
    const [x0, y0, c1x, c1y, mx, my, c2x, c2y, x1, y1] = mouthLine.current.map((value) => value.toFixed(1));
    return `M${x0} ${y0} Q${c1x} ${c1y} ${mx} ${my} Q${c2x} ${c2y} ${x1} ${y1}`;
  });

  /**
   * Points for a five-pointed star eye.
   * @param cx Center x
   * @param cy Center y
   * @param size Scale, 1 for full size
   */
  function starPoints(cx: number, cy: number, size: number) {
    return Array.from({ length: 10 }, (_, i) => {
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = (i % 2 === 0 ? 21 : 9.5) * size;
      return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
    }).join(" ");
  }

  let goal = untrack(() => turn);
  let chasing = 0;
  /** True while the tails turn. The rough line filter comes off the tails then, since moving shapes crawl through its fixed noise. */
  let moving = $state(false);

  /**
   * Turns the tails towards the requested position. A plain change eases there over a fixed time. When
   * following, the tails stay a fraction behind the requested position every frame, which lets a hand on the
   * scroll bar drag them round and stop them part way. Anyone who asked for less motion gets a jump when not
   * following.
   */
  $effect(() => {
    const target = turn;
    goal = target;
    const from = untrack(() => position);
    if (from === target) return;

    if (follow) {
      if (chasing) return;
      moving = true;
      chasing = requestAnimationFrame(function chase() {
        const gap = goal - position;
        if (Math.abs(gap) < 0.002) {
          position = goal;
          chasing = 0;
          moving = false;
          return;
        }
        position += gap * 0.3;
        chasing = requestAnimationFrame(chase);
      });
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      position = target;
      return;
    }

    const started = performance.now();
    moving = true;
    let frame = requestAnimationFrame(function step(now: number) {
      const t = Math.min(1, (now - started) / TURN_MS);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      position = from + (target - from) * eased;
      if (t < 1) frame = requestAnimationFrame(step);
      else moving = false;
    });
    return () => {
      cancelAnimationFrame(frame);
      moving = false;
    };
  });

  $effect(() => () => cancelAnimationFrame(chasing));

  /**
   * Splits a hex color into hue, saturation and lightness.
   * @param hex A six digit hex color
   */
  function toHsl(hex: string): [number, number, number] | null {
    const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) return null;
    const value = parseInt(match[1], 16);
    const r = ((value >> 16) & 255) / 255;
    const g = ((value >> 8) & 255) / 255;
    const b = (value & 255) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }

  /**
   * Builds a hex color from hue, saturation and lightness.
   * @param h Hue in degrees
   * @param s Saturation from 0 to 1
   * @param l Lightness from 0 to 1
   */
  function toHex(h: number, s: number, l: number): string {
    const a = s * Math.min(l, 1 - l);
    const channel = (n: number) => {
      const k = (n + h / 30) % 12;
      const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(c * 255).toString(16).padStart(2, "0");
    };
    return `#${channel(0)}${channel(8)}${channel(4)}`;
  }

  /**
   * The cat's colors for a page color. Very dark, pale or grey colors are pulled into a range that stays
   * visible on the dark page, and the goggle lenses lighten when the fur itself turns blue. The tails further
   * back are a little darker and shifted in hue, since darkening alone turns warm colors muddy.
   * @param source The page color
   */
  function buildSkin(source: string) {
    const hsl = toHsl(source) ?? toHsl(NATURAL)!;
    const h = hsl[0];
    const s = Math.max(hsl[1], 0.55);
    const l = Math.min(Math.max(hsl[2], 0.52), 0.66);
    return {
      body: toHex(h, s, l),
      back: toHex((h + 354) % 360, s, l - 0.02),
      far: toHex((h + 348) % 360, s, l - 0.06),
      light: toHex(h, s, Math.min(l + 0.2, 0.9)),
      lens: h > 165 && h < 250 ? "#e3f7ff" : "#7fe0ff"
    };
  }
</script>

<svg xmlns="http://www.w3.org/2000/svg"
     bind:this={svgEl}
     viewBox={box.join(" ")}
     class="mascot {className}"
     class:swaying={variant === "head" && face === "vibing" && !changing}
     role={label ? "img" : undefined}
     aria-label={label ?? undefined}
     aria-hidden={label ? undefined : "true"}>
  {#if pixel > 0}
    <defs>
      <svg xmlns="http://www.w3.org/2000/svg" bind:this={sourceEl} viewBox={box.join(" ")}>
        {@render drawing(false)}
      </svg>
    </defs>
    <g class="pixel-art" class:ready={pixelPaths.length > 0} shape-rendering="crispEdges">
      {#each pixelPaths as path (path.fill)}
        <path fill={path.fill} d={path.d} />
      {/each}
    </g>
  {:else}
    {@render drawing(true)}
  {/if}
</svg>

{#snippet drawing(rough: boolean)}
  <defs>
    <filter id="{uid}-rough" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
    </filter>
    <filter id="{uid}-rough-small" x="-15%" y="-15%" width="130%" height="130%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="5" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3.500" />
    </filter>
  </defs>
  {#if variant === "full"}
    <g stroke-linecap="round" stroke-linejoin="round">
      <g filter={rough && !moving ? `url(#${uid}-rough)` : undefined}>
        {#each tails as tail (tail.index)}
          <g opacity={tail.shown}>
            <path d={tail.outline} fill={skin.back} />
            <path d={tail.outline} fill={skin.far} opacity={tail.depth} />
            <path d={tail.tip} fill={CREAM} />
            <path d={tail.outline} fill="none" stroke={INK} stroke-width="7" />
          </g>
        {/each}
      </g>

      {#if tools}
        {#each tails as tail (tail.index)}
          {#if tail.padOpacity > 0.02}
            <ellipse cx={tail.padX} cy={tail.padY} rx="40" ry="15" fill={CREAM} stroke={INK} stroke-width="7"
                     opacity={tail.padOpacity} />
          {/if}
          <g transform="translate({tail.toolX} {tail.toolY}) rotate({tail.toolAngle}) scale({1 + 0.15 * tail.featured})"
             opacity={tail.shown}>
            <g filter={rough ? `url(#${uid}-rough-small)` : undefined}>
              <MascotTool tool={tail.tool} />
            </g>
          </g>
        {/each}
      {/if}
    </g>
  {/if}
  <g filter={rough && variant === "full" ? `url(#${uid}-rough)` : undefined} stroke-linecap="round" stroke-linejoin="round">
    {#if variant === "full"}
      <path d="M206 250 C 178 276 160 322 172 344 C 182 364 298 364 308 344 C 320 322 302 276 274 250 Z"
            fill={skin.body} stroke={INK} stroke-width="7" />
      <path d="M216 262 Q240 252 264 262 Q260 290 240 294 Q220 290 216 262 Z" fill={CREAM} />
      <path d="M196 356 Q194 338 212 336 Q230 338 228 356 Z" fill={skin.body} stroke={INK} stroke-width="6" />
      <path d="M252 356 Q250 338 268 336 Q286 338 284 356 Z" fill={skin.body} stroke={INK} stroke-width="6" />
      <path d="M207 346 L207 355 M217 346 L217 355 M263 346 L263 355 M273 346 L273 355" stroke={INK} stroke-width="3.500" />
    {/if}

    <path d="M136 106 Q130 54 150 32 Q182 42 206 64 Z" fill={skin.body} stroke={INK} stroke-width="7" />
    <path d="M344 106 Q350 54 330 32 Q298 42 274 64 Z" fill={skin.body} stroke={INK} stroke-width="7" />
    <path d="M152 90 Q149 60 158 47 Q174 53 187 66 Z" fill="#ff8fb1" />
    <path d="M328 90 Q331 60 322 47 Q306 53 293 66 Z" fill="#ff8fb1" />
    <ellipse cx="240" cy="158" rx="114" ry="100" fill={skin.body} stroke={INK} stroke-width="7" />
    <path d="M166 100 Q186 76 222 70" fill="none" stroke={skin.light} stroke-width="9" />
    <path d="M130 124 Q240 68 350 124" fill="none" stroke={INK} stroke-width="16" />
    <circle cx="198" cy="98" r="30" fill={skin.lens} stroke={INK} stroke-width="11" />
    <circle cx="282" cy="98" r="30" fill={skin.lens} stroke={INK} stroke-width="11" />
    <path d="M230 96 L250 96" stroke={INK} stroke-width="10" />
    <path d="M183 92 a17 17 0 0 1 17 -11" fill="none" stroke="#ffffff" stroke-width="5" />
    <path d="M267 92 a17 17 0 0 1 17 -11" fill="none" stroke="#ffffff" stroke-width="5" />
    {#each eyes as eye, side (side)}
      {@const cx = side === 0 ? 202 : 278}
      {#if eye.kind === "open"}
        <ellipse {cx} cy={eye.cy} rx={eye.rx} ry={eye.ry} fill={INK} />
        {#if eye.lit}
          <circle cx={cx + 6} cy={eye.cy - 8} r="6.500" fill="#ffffff" />
        {/if}
        {#if eye.spark}
          <circle cx={cx - 5} cy={eye.cy + 8} r="3" fill="#ffffff" />
        {/if}
      {:else if eye.kind === "arc"}
        <path d={eye.d} fill="none" stroke={INK} stroke-width={line(7)} />
      {:else if eye.kind === "star"}
        <polygon points={starPoints(cx, 176, eye.size)} fill="#ffd166" stroke={INK} stroke-width="5" />
      {/if}
    {/each}
    {#if face === "determined" && !changing && shut.current < 0.2}
      <path d="M180 150 L224 150 L224 172 L180 160 Z" fill={skin.body} />
      <path d="M300 150 L256 150 L256 172 L300 160 Z" fill={skin.body} />
      <path d="M185 161 L220 170 M295 161 L260 170" fill="none" stroke={INK} stroke-width={line(6)} />
    {/if}
    <ellipse cx="166" cy="204" rx="17" ry="9" fill="#ff6b8b" opacity="0.55" />
    <ellipse cx="314" cy="204" rx="17" ry="9" fill="#ff6b8b" opacity="0.55" />
    <path d="M150 193 L112 183 M150 204 L110 205 M152 215 L116 226" fill="none" stroke="#ffffff" stroke-width={line(4.5, 1.4)} />
    <path d="M330 193 L368 183 M330 204 L370 205 M328 215 L364 226" fill="none" stroke="#ffffff" stroke-width={line(4.5, 1.4)} />
    <path d="M234 198 L246 198 L240 205 Z" fill="#ff6b8b" stroke="#ff6b8b" stroke-width="3" />
    {#if mouth === "open"}
      <path d="M222 208 Q240 238 258 208 Z" fill={INK} stroke={INK} stroke-width="5" />
      <path d="M230 222 Q240 232 250 222 Q240 216 230 222 Z" fill="#ff8fb1" />
    {:else if mouth === "o"}
      <ellipse cx="240" cy="217" rx="7" ry="9" fill={INK} />
    {:else}
      <path d={mouthPath} fill="none" stroke={INK} stroke-width={line(6)} />
    {/if}
  </g>
{/snippet}

<style>
  .mascot {
    display: block;
    overflow: visible;
  }

  .pixel-art {
    opacity: 0;
    transition: opacity 180ms ease-out;
  }

  .pixel-art.ready {
    opacity: 1;
  }

  .swaying {
    transform-origin: 50% 85%;
    animation: sway 1.1s ease-in-out infinite alternate;
  }

  @keyframes sway {
    from {
      transform: rotate(-7deg) translateY(0);
    }
    50% {
      transform: rotate(0deg) translateY(-4%);
    }
    to {
      transform: rotate(7deg) translateY(0);
    }
  }

  .mascot :global(path),
  .mascot :global(ellipse),
  .mascot :global(circle) {
    transition: fill 600ms ease;
  }

  @media (prefers-reduced-motion: reduce) {
    .swaying {
      animation: none;
    }

    .mascot :global(path),
    .mascot :global(ellipse),
    .mascot :global(circle) {
      transition: none;
    }
  }
</style>

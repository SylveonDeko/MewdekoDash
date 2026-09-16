// lib/components/logs/ansi.ts

/** One run of text with the SGR styling that was active when it was written. */
export interface AnsiSpan {
  text: string;
  color?: string;
  background?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/** Serilog's level tags as they appear in the console template. */
export type LogLevel = "VRB" | "DBG" | "INF" | "WRN" | "ERR" | "FTL";

export const LOG_LEVELS: LogLevel[] = ["VRB", "DBG", "INF", "WRN", "ERR", "FTL"];

/** Any escape sequence, so a line can be reduced to plain text for searching and level detection. */
const ANSI_PATTERN = /\x1b\[[0-9;?]*[ -/]*[@-~]/g;

/** Only the SGR (colour and style) sequences; other control sequences are dropped. */
const SGR_PATTERN = /\x1b\[([0-9;]*)m/g;

const LEVEL_PATTERN = /\[(VRB|DBG|INF|WRN|ERR|FTL)\]/;

/**
 * The 16 standard colours, tuned to stay readable on the near black panel the viewer uses.
 * Index 0 (black) and 8 (bright black) are lifted to greys for the same reason.
 */
const BASIC_COLORS = [
  "#6b7280",
  "#f87171",
  "#4ade80",
  "#fbbf24",
  "#60a5fa",
  "#e879f9",
  "#22d3ee",
  "#e5e7eb",
  "#9ca3af",
  "#fca5a5",
  "#86efac",
  "#fde68a",
  "#93c5fd",
  "#f0abfc",
  "#67e8f9",
  "#ffffff",
];

/** Resolves an xterm 256 colour index to a CSS colour. */
export function paletteColor(index: number): string | undefined {
  if (!Number.isInteger(index) || index < 0 || index > 255) return undefined;
  if (index < 16) return BASIC_COLORS[index];

  if (index < 232) {
    const cube = index - 16;
    const r = Math.floor(cube / 36);
    const g = Math.floor((cube % 36) / 6);
    const b = cube % 6;
    const step = (v: number) => (v === 0 ? 0 : 55 + v * 40);
    return `rgb(${step(r)}, ${step(g)}, ${step(b)})`;
  }

  const grey = 8 + (index - 232) * 10;
  return `rgb(${grey}, ${grey}, ${grey})`;
}

/** Removes every escape sequence, leaving the text a person would read. */
export function stripAnsi(text: string): string {
  return text.replace(ANSI_PATTERN, "");
}

/** Pulls the Serilog level tag out of a line, or null for continuation lines such as stack traces. */
export function detectLevel(plain: string): LogLevel | null {
  const match = LEVEL_PATTERN.exec(plain);
  return match ? (match[1] as LogLevel) : null;
}

interface Style {
  color?: string;
  background?: string;
  bold?: boolean;
  dim?: boolean;
  italic?: boolean;
  underline?: boolean;
}

/**
 * Applies one SGR parameter list to a style. Handles resets, intensity and the three colour forms
 * (16 colour, 256 colour and 24 bit); anything else is ignored rather than corrupting the run.
 */
function applySgr(params: number[], style: Style): Style {
  const next: Style = { ...style };
  for (let i = 0; i < params.length; i++) {
    const code = params[i];
    if (code === 0) {
      return {};
    } else if (code === 1) {
      next.bold = true;
    } else if (code === 2) {
      next.dim = true;
    } else if (code === 3) {
      next.italic = true;
    } else if (code === 4) {
      next.underline = true;
    } else if (code === 22) {
      next.bold = false;
      next.dim = false;
    } else if (code === 23) {
      next.italic = false;
    } else if (code === 24) {
      next.underline = false;
    } else if (code >= 30 && code <= 37) {
      next.color = BASIC_COLORS[code - 30];
    } else if (code >= 90 && code <= 97) {
      next.color = BASIC_COLORS[code - 90 + 8];
    } else if (code === 39) {
      next.color = undefined;
    } else if (code >= 40 && code <= 47) {
      next.background = BASIC_COLORS[code - 40];
    } else if (code >= 100 && code <= 107) {
      next.background = BASIC_COLORS[code - 100 + 8];
    } else if (code === 49) {
      next.background = undefined;
    } else if (code === 38 || code === 48) {
      const target = code === 38 ? "color" : "background";
      const mode = params[i + 1];
      if (mode === 5 && i + 2 < params.length) {
        next[target] = paletteColor(params[i + 2]);
        i += 2;
      } else if (mode === 2 && i + 4 < params.length) {
        const [r, g, b] = params.slice(i + 2, i + 5);
        next[target] = `rgb(${r}, ${g}, ${b})`;
        i += 4;
      } else {
        break;
      }
    }
  }
  return next;
}

/** Splits a raw line into styled runs. Lines without escapes come back as a single unstyled span. */
export function parseAnsi(text: string): AnsiSpan[] {
  if (!text.includes("\x1b[")) return [{ text }];

  const spans: AnsiSpan[] = [];
  let style: Style = {};
  let last = 0;

  const push = (chunk: string) => {
    if (!chunk) return;
    const previous = spans[spans.length - 1];
    if (previous && sameStyle(previous, style)) {
      previous.text += chunk;
    } else {
      spans.push({ text: chunk, ...style });
    }
  };

  SGR_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SGR_PATTERN.exec(text)) !== null) {
    push(text.slice(last, match.index));
    last = match.index + match[0].length;
    const params = match[1] === "" ? [0] : match[1].split(";").map((p) => Number.parseInt(p, 10) || 0);
    style = applySgr(params, style);
  }
  push(text.slice(last));

  return spans.map((span) => ({ ...span, text: stripAnsi(span.text) })).filter((span) => span.text);
}

function sameStyle(a: Style, b: Style): boolean {
  return (
    a.color === b.color &&
    a.background === b.background &&
    !!a.bold === !!b.bold &&
    !!a.dim === !!b.dim &&
    !!a.italic === !!b.italic &&
    !!a.underline === !!b.underline
  );
}

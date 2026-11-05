#!/usr/bin/env node
/**
 * Flags inline styles that paint a solid theme colour (primary, secondary or accent) as a background without
 * setting the matching readable text colour (onPrimary, onSecondary, onAccent). Theme colours come from server
 * icons, so white text on them is unreadable whenever the icon is light.
 *
 *   node check-contrast.js
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "src");
const solidFill = /background(?:-color)?\s*:\s*\$?\{\s*\$colorStore\.(primary|secondary|accent)\s*\}\s*(?:;|"|`|$)/;
const readableText = {
  primary: /\$colorStore\.onPrimary/,
  secondary: /\$colorStore\.onSecondary/,
  accent: /\$colorStore\.onAccent/,
};

function* svelteFiles(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* svelteFiles(path);
    else if (name.endsWith(".svelte")) yield path;
  }
}

/** Style strings: style="..." attributes and template literals, which can span several lines. */
function* styleBlocks(source) {
  const pattern = /style=(["'])([\s\S]*?)\1|`([^`]*)`/g;
  for (const match of source.matchAll(pattern)) {
    const text = match[2] ?? match[3];
    const line = source.slice(0, match.index).split("\n").length;
    yield { text, line };
  }
}

const problems = [];
for (const file of svelteFiles(root)) {
  const source = readFileSync(file, "utf8");
  for (const { text, line } of styleBlocks(source)) {
    for (const part of text.split(/;(?=\s*background)/)) {
      const fill = solidFill.exec(part);
      if (fill && !readableText[fill[1]].test(text)) {
        problems.push(`${relative(join(root, ".."), file)}:${line}: solid ${fill[1]} background without $colorStore.on${fill[1][0].toUpperCase()}${fill[1].slice(1)} text`);
      }
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} solid theme fills without readable text. Use $colorStore.onPrimary (or onSecondary/onAccent) for text on a solid fill, or $colorStore.selectedSurface and selectedBorder for selected states.`);
  process.exit(1);
}
console.log("✅ Every solid theme fill sets readable text.");

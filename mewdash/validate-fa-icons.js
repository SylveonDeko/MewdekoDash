#!/usr/bin/env node

/**
 * Font Awesome utility duo validator.
 *
 * `fa-utility-duo` is its own webfont with far fewer glyphs than the free
 * `fa-regular` set, so an icon with a free regular style does not imply utility
 * duo support. Icons outside the font render as blank boxes. This scans `src/`
 * for utility duo usages that are not in the shipped font's allowlist.
 *
 * Usage:
 *   node validate-fa-icons.js          exits 1 on any unsupported icon
 *   node validate-fa-icons.js --list   prints the allowlist
 *
 * This file is committed and runs in CI. The interactive search tool that
 * queries the Font Awesome API with a personal token stays local only
 * (fa-icon-search.js, see FA-ICON-SEARCH-README.md) and delegates here.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Allowlist extracted from the shipped utility duo webfont. */
export const UTILITY_DUO_ICONS = new Set(
  JSON.parse(fs.readFileSync(path.join(__dirname, "fa-utility-duo-icons.json"), "utf8")).icons
);

/** Whether an icon id exists in the utility duo font. */
export function supportsUtilityDuo(iconId) {
  return UTILITY_DUO_ICONS.has(iconId);
}

/**
 * Scans the source tree for utility duo icon names that are not in the font.
 * Covers the inline `fa-utility-duo fa-regular fa-x` class strings and the
 * `icon="fa-x"` props consumed by DashboardPageLayout, StatCard and FeatureCard.
 * Returns the process exit code.
 */
export function validateSources(rootDir = __dirname) {
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(svelte|ts|js)$/.test(entry.name)) files.push(full);
    }
  };
  const srcDir = path.join(rootDir, "src");
  if (fs.existsSync(srcDir)) walk(srcDir);

  const patterns = [
    /fa-utility-duo\s+fa-regular\s+fa-([a-z0-9-]+)/g,
    /\bicon="fa-([a-z0-9-]+)"/g
  ];

  const bad = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, idx) => {
      for (const re of patterns) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(line)) !== null) {
          if (!supportsUtilityDuo(m[1])) {
            bad.push({ file: path.relative(rootDir, file), line: idx + 1, icon: m[1] });
          }
        }
      }
    });
  }

  if (bad.length === 0) {
    console.log("\n✅ No unsupported utility duo icons found.\n");
    return 0;
  }

  console.log(`\n❌ ${bad.length} unsupported utility duo icon usage(s):\n`);
  const byIcon = {};
  for (const b of bad) (byIcon[b.icon] ||= []).push(`${b.file}:${b.line}`);
  for (const icon of Object.keys(byIcon).sort()) {
    console.log(`   fa-${icon}`);
    byIcon[icon].forEach((loc) => console.log(`      ${loc}`));
  }
  console.log("");
  return 1;
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const args = process.argv.slice(2);
  if (args.includes("--list")) {
    console.log([...UTILITY_DUO_ICONS].sort().join("\n"));
    process.exit(0);
  }
  process.exit(validateSources());
}

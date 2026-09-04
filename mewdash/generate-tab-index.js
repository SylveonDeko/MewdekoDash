#!/usr/bin/env node
/**
 * Extracts the tab and sub-tab definitions out of every dashboard page and writes
 * them to src/lib/config/dashboardTabIndex.json, which the command palette loads so
 * settings inside pages are findable before the page has ever been opened.
 *
 * The pages stay the single source of truth: this only reads them. Run with
 * --check to fail when the committed index is stale (for CI).
 *
 *   node generate-tab-index.js
 *   node generate-tab-index.js --check
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const pagesDir = path.join(root, "src/routes/dashboard");
const outFile = path.join(root, "src/lib/config/dashboardTabIndex.json");

/**
 * Finds the array literal that follows a declaration and returns its source text,
 * matching brackets so nested objects and arrays do not end it early.
 */
function readArrayLiteral(source, fromIndex) {
  const start = source.indexOf("[", fromIndex);
  if (start === -1) return null;

  let depth = 0;
  let inString = null;

  for (let i = start; i < source.length; i++) {
    const char = source[i];
    const prev = source[i - 1];

    if (inString) {
      if (char === inString && prev !== "\\") inString = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      inString = char;
      continue;
    }

    if (char === "[") depth++;
    if (char === "]") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }

  return null;
}

/**
 * Pulls {id, label, icon} entries out of an array literal. Labels built with a
 * template literal keep only their static head, so "Ignored Channels (${n})"
 * indexes as "Ignored Channels".
 */
function parseEntries(arraySource) {
  const entries = [];
  // Interpolations carry braces of their own, which would otherwise cut objects short.
  const flattened = arraySource.replace(/\$\{[^{}]*\}/g, "");
  const objectPattern = /\{[^{}]*\}/g;
  let match;

  while ((match = objectPattern.exec(flattened)) !== null) {
    const body = match[0];
    const id = body.match(/\bid:\s*["'`]([^"'`]+)["'`]/);
    const label = body.match(/\blabel:\s*["'`]([^"'`]*)/);
    const icon = body.match(/\bicon:\s*["'`]([^"'`]+)["'`]/);

    if (!id || !label) continue;

    const cleanLabel = label[1]
      .replace(/\s*\(\s*\)\s*$/, "")
      .replace(/\s*\($/, "")
      .trim();
    if (!cleanLabel) continue;

    entries.push({
      id: id[1],
      label: cleanLabel,
      icon: icon ? icon[1] : "fa-gear",
    });
  }

  return entries;
}

/**
 * Locates a tabs or subTabs array however the page happens to declare it: a const,
 * a $derived, or inline on the DashboardPageLayout element.
 */
function extractCollection(source, name) {
  const declarations = [
    new RegExp(`(?:const|let)\\s+${name}\\s*=\\s*\\$derived(?:\\.by)?\\s*\\(`),
    new RegExp(`(?:const|let)\\s+${name}\\s*=`),
    new RegExp(`\\b${name}=\\{\\[`),
  ];

  for (const pattern of declarations) {
    const match = source.match(pattern);
    if (!match) continue;

    const arraySource = readArrayLiteral(source, match.index);
    if (!arraySource) continue;

    const entries = parseEntries(arraySource);
    if (entries.length) return entries;
  }

  return [];
}

function build() {
  const index = {};

  for (const dir of fs.readdirSync(pagesDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;

    const pageFile = path.join(pagesDir, dir.name, "+page.svelte");
    if (!fs.existsSync(pageFile)) continue;

    const source = fs.readFileSync(pageFile, "utf8");
    const tabs = extractCollection(source, "tabs");
    const subTabs = extractCollection(source, "subTabs");

    if (!tabs.length && !subTabs.length) continue;

    index[`/dashboard/${dir.name}`] = subTabs.length ? { tabs, subTabs } : { tabs };
  }

  return index;
}

const index = build();
const serialized = `${JSON.stringify(index, null, 2)}\n`;
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  const existing = fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf8") : "";
  if (existing !== serialized) {
    console.error("dashboardTabIndex.json is stale. Run: node generate-tab-index.js");
    process.exit(1);
  }
  console.log("dashboardTabIndex.json is up to date.");
  process.exit(0);
}

fs.writeFileSync(outFile, serialized);

const pageCount = Object.keys(index).length;
const tabCount = Object.values(index).reduce(
  (total, entry) => total + entry.tabs.length + (entry.subTabs?.length ?? 0),
  0,
);
console.log(`Indexed ${tabCount} tabs across ${pageCount} dashboard pages.`);

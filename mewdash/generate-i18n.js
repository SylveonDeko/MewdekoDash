#!/usr/bin/env node
/**
 * Builds the typed message accessors in src/lib/i18n/generated/messages.ts from the per-module
 * catalogs in src/lib/i18n/<locale>/<module>.json. This mirrors the bot's localization source
 * generator: one JSON file per feature, snake_case keys, and a compile-time error whenever a
 * component references a key that does not exist.
 *
 * en-US is the source locale. Every other locale folder is validated against it (unknown keys
 * and mismatched placeholders are reported) but only en-US decides which accessors exist.
 *
 *   node generate-i18n.js          # (re)write messages.ts, normalise JSON key order
 *   node generate-i18n.js --check  # fail when messages.ts is stale or a catalog is malformed
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.join(root, "src/lib/i18n");
const sourceLocale = "en-US";
const outFile = path.join(i18nDir, "generated/messages.ts");
const checkOnly = process.argv.includes("--check");

const keyPattern = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const placeholderPattern = /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g;

/** Lists the locale folders, en-US first. */
function listLocales() {
  return fs
    .readdirSync(i18nDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== "generated")
    .map((d) => d.name)
    .sort((a, b) => (a === sourceLocale ? -1 : b === sourceLocale ? 1 : a.localeCompare(b)));
}

/** Reads every module catalog of a locale as { module: { key: text } }. */
function readLocale(locale) {
  const dir = path.join(i18nDir, locale);
  const modules = {};
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith(".json")) continue;
    const moduleName = file.slice(0, -".json".length);
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(`${locale}/${file}: invalid JSON (${err.message})`);
    }
    modules[moduleName] = { file: path.join(dir, file), raw, entries: parsed };
  }
  return modules;
}

function placeholdersOf(text) {
  return [...new Set([...text.matchAll(placeholderPattern)].map((m) => m[1]))].sort();
}

/** snake_case -> camelCase for the accessor name; the JSON key itself stays snake_case. */
function accessorName(key) {
  return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function moduleIdentifier(moduleName) {
  // `_common` -> `common`, `role-menus` -> `roleMenus`
  return moduleName.replace(/^_/, "").replace(/[-_]([a-z0-9])/g, (_, c) => c.toUpperCase());
}

const errors = [];
let rewroteJson = false;

const locales = listLocales();
if (!locales.includes(sourceLocale)) {
  console.error(`Missing source locale folder ${i18nDir}/${sourceLocale}`);
  process.exit(1);
}

const source = readLocale(sourceLocale);

// Validate and normalise every catalog.
for (const locale of locales) {
  const modules = locale === sourceLocale ? source : readLocale(locale);
  for (const [moduleName, { file, raw, entries }] of Object.entries(modules)) {
    if (!/^_?[a-z][a-z0-9-]*$/.test(moduleName)) {
      errors.push(`${locale}/${moduleName}.json: module names are lowercase, digits and dashes`);
    }
    if (Array.isArray(entries) || typeof entries !== "object" || entries === null) {
      errors.push(`${locale}/${moduleName}.json: must be a flat object`);
      continue;
    }
    for (const [key, text] of Object.entries(entries)) {
      if (!keyPattern.test(key)) errors.push(`${locale}/${moduleName}.json: key "${key}" is not snake_case`);
      if (typeof text !== "string") errors.push(`${locale}/${moduleName}.json: "${key}" must be a string`);
    }
    if (locale !== sourceLocale) {
      const sourceEntries = source[moduleName]?.entries;
      if (!sourceEntries) {
        errors.push(`${locale}/${moduleName}.json: no such module in ${sourceLocale}`);
      } else {
        for (const [key, text] of Object.entries(entries)) {
          const pluralBase = /^(.*)_(zero|two|few|many)$/.exec(key)?.[1];
          const sourceKey = !(key in sourceEntries) && pluralBase && `${pluralBase}_other` in sourceEntries
            ? `${pluralBase}_other`
            : key;
          if (!(sourceKey in sourceEntries)) {
            errors.push(`${locale}/${moduleName}.json: "${key}" does not exist in ${sourceLocale}`);
          } else if (typeof text === "string") {
            const want = placeholdersOf(sourceEntries[sourceKey]).join(",");
            const have = placeholdersOf(text).join(",");
            if (want !== have) {
              errors.push(`${locale}/${moduleName}.json: "${key}" placeholders {${have}} differ from ${sourceLocale} {${want}}`);
            }
          }
        }
      }
    }

    // Keep keys sorted so parallel edits merge cleanly.
    const sorted = Object.fromEntries(Object.entries(entries).sort(([a], [b]) => a.localeCompare(b)));
    const normalised = JSON.stringify(sorted, null, 2) + "\n";
    if (normalised !== raw) {
      if (checkOnly) errors.push(`${locale}/${moduleName}.json: keys are not sorted (run node generate-i18n.js)`);
      else {
        fs.writeFileSync(file, normalised);
        rewroteJson = true;
      }
    }
  }
}

// Duplicate check (--check only): a text lives under exactly one key across all en-US catalogs.
// Exempt: values whose keys are all in features.json / placeholders.json (feature names and
// placeholder descriptions are semantic), and the _common words below, which are generic words
// that also happen to be a feature category or placeholder category name.
const commonTwinsOfCanonicalKeys = new Set([
  "channel", // placeholders.category_channel
  "import", // features.import_name
  "members", // features.category_members
  "messages", // features.category_messages
  "settings", // features.settings_name, features.category_settings
  "user", // placeholders.category_user
  "user_id", // placeholders.user_id, placeholders.xp_user_id
  "username", // placeholders.user_name
]);
// Same English word, different meaning: other languages need a different word for each, so these
// keys may share text with another key.
const homographKeys = new Set([
  "_common.departed", // "Left" as in left the server; _common.left is the direction
  "owner.docker_op_up", // the `docker compose up` operation; _common.up is the direction
]);
if (checkOnly) {
  const canonicalModules = new Set(["features", "placeholders"]);
  const byValue = new Map();
  for (const [moduleName, { entries }] of Object.entries(source)) {
    for (const [key, text] of Object.entries(entries)) {
      if (typeof text !== "string") continue;
      if (!byValue.has(text)) byValue.set(text, []);
      byValue.get(text).push({ moduleName, key });
    }
  }
  for (const [text, owners] of byValue) {
    if (owners.filter((o) => !homographKeys.has(o.moduleName + "." + o.key)).length < 2) continue;
    if (owners.every((o) => canonicalModules.has(o.moduleName))) continue;
    const rest = owners.filter((o) => !(o.moduleName === "_common" && commonTwinsOfCanonicalKeys.has(o.key)));
    if (rest.every((o) => canonicalModules.has(o.moduleName))) continue;
    errors.push(`duplicate text ${JSON.stringify(text)} under ${owners.map((o) => o.moduleName + "." + o.key).join(", ")} (fold into one key; shared text lives in _common)`);
  }
}

if (errors.length) {
  for (const e of errors) console.error("i18n: " + e);
  process.exit(1);
}

// Emit the typed accessors.
const lines = [];
lines.push("/* eslint-disable */");
lines.push("// AUTO-GENERATED by generate-i18n.js from src/lib/i18n/en-US/*.json. Do not edit by hand.");
lines.push("// Add or change text in the JSON catalogs and run `node generate-i18n.js`.");
lines.push('import { t } from "../runtime.svelte";');
lines.push("");
lines.push("type P = string | number;");
lines.push("");
lines.push("export const m = {");

for (const moduleName of Object.keys(source).sort()) {
  const { entries } = source[moduleName];
  lines.push(`  ${moduleIdentifier(moduleName)}: {`);
  for (const key of Object.keys(entries).sort()) {
    const text = entries[key];
    const params = placeholdersOf(text);
    const fallback = JSON.stringify(text);
    const doc = text.length > 90 ? text.slice(0, 87) + "..." : text;
    lines.push(`    /** ${doc.replace(/\*\//g, "* /")} */`);
    if (params.length === 0) {
      lines.push(`    ${accessorName(key)}: () => t(${JSON.stringify(moduleName)}, ${JSON.stringify(key)}, ${fallback}),`);
    } else {
      const type = `{ ${params.map((p) => `${p}: P`).join("; ")} }`;
      lines.push(`    ${accessorName(key)}: (p: ${type}) => t(${JSON.stringify(moduleName)}, ${JSON.stringify(key)}, ${fallback}, p),`);
    }
  }
  lines.push("  },");
}
lines.push("} as const;");
lines.push("");
lines.push("/** Module names that exist in the source locale, for loading other locales lazily later. */");
lines.push(`export const modules = ${JSON.stringify(Object.keys(source).sort())} as const;`);
lines.push("");

const output = lines.join("\n");
const current = fs.existsSync(outFile) ? fs.readFileSync(outFile, "utf8") : null;

if (checkOnly) {
  if (current !== output) {
    console.error("i18n: src/lib/i18n/generated/messages.ts is stale. Run `node generate-i18n.js`.");
    process.exit(1);
  }
  console.log("i18n: catalogs and generated accessors are up to date.");
} else {
  if (current !== output) {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, output);
  }
  const total = Object.values(source).reduce((n, { entries }) => n + Object.keys(entries).length, 0);
  console.log(
    `i18n: ${Object.keys(source).length} modules, ${total} messages${rewroteJson ? " (normalised JSON key order)" : ""}.`
  );
}

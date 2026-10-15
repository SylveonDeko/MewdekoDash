# Dashboard localization

User-facing text lives in per-module JSON catalogs, the same way the bot keeps
`data/strings/responses/<locale>/<module>.json`. Components never contain English prose.

```
src/lib/i18n/
  en-US/
    _common.json      shared text: Save, Cancel, Loading..., Yes, No, select placeholders, any text used twice
    music.json        one file per feature; name matches the route folder
    tickets.json
  generated/
    messages.ts       built by `node generate-i18n.js` (also runs in `npm run check|dev|build`)
  runtime.ts          placeholder formatting and the locale hook for future translations
```

The wiki is localized by folder instead: `src/lib/content/wiki/<locale>/<slug>.md`. Only `en-US` exists today.

## Using messages

```svelte
<script lang="ts">
  import { m } from "$lib/i18n";
</script>

<h2>{m.music.ttsSettingsTitle()}</h2>
<input placeholder={m.common.searchPlaceholder()} />
<p>{m.music.queueCount({ count: queue.length })}</p>
```

- Accessor path is `m.<module>.<camelCaseKey>()`. The JSON key stays `snake_case`; the generator camel-cases it.
- `_common` is reached as `m.common`.
- Every accessor is a function. Placeholders in the text become a required typed parameter object.
- A key that does not exist is a type error from `npm run check`.

## Writing catalog entries

- **Key names**: `snake_case`, prefixed by the area of the page they belong to, for example
  `tts_volume`, `tts_volume_hint`, `queue_empty`, `notify_saved`. Keep sibling keys together by prefix.
- **Placeholders**: `{name}` with a meaningful name, never positional. `"{user} joined {channel}"`.
- **One message per sentence or label.** Never split a sentence into fragments and glue them in
  markup. If a sentence contains a bold word or a link, put the whole sentence in one key with
  inline HTML and render with `{@html m.x.key()}`, and only do this when it is unavoidable.
- **Plurals**: use two keys (`item_one`, `item_other`) chosen in the component, with the number
  passed as `{count}`. Do not invent a plural syntax inside the string. Languages with more forms
  add `item_few` / `item_many` (or `_two` / `_zero`) in their own catalog only; the runtime picks
  the right one from `count` with `Intl.PluralRules`, so components never change.
- **Do not localize**: Discord-side names, API error payloads (the bot localizes those), code,
  slugs, CSS, icon classes, log messages, `logger.*` calls, developer comments.
- **One text, one key.** Any text used in more than one place is a single key, never a copy in
  another catalog. Shared text lives in `_common.json` (`m.common`), feature names in
  `features.json`, placeholder descriptions in `placeholders.json`. Those last two are semantic and
  may repeat a generic `_common` word (for example `features.settings_name` and `_common.settings`);
  the allowlist for that is in `generate-i18n.js`. The fold is enforced by review: before adding a
  key, grep the catalogs for the text first and reuse the existing key. Name `_common` keys by
  meaning, not by slugified English: `*_placeholder`, `aria_*`, `notify_*`, `*_fallback`,
  `<thing>_count`, `<thing>_one` / `<thing>_other`, `*_lower` for a lowercase variant.
- Keys in a file are kept sorted; the generator rewrites the file in sorted order.

## What counts as user-facing

Markup text nodes, `placeholder`, `title`, `aria-label`, `alt`, button labels, tab labels,
notification and toast messages, confirm dialog text, empty-state copy, hints, table headers,
and text in TypeScript config such as `wizardFeatures.ts` or `navigationItems.ts`. For TS config
files, store the accessor function on the object (`label: m.nav.music`) or call it at render
time, so the text is not frozen at module load when locales arrive later.

## Page tabs

`generate-tab-index.js` reads the `tabs` and `subTabs` arrays out of every page's source for the
command palette. Keep each tab's `label` a direct accessor call so it can be resolved:

```ts
const tabs = $derived([
  { id: "music", label: m.music.tabMusic(), icon: "fa-music" },
]);
```

Do not store the label in a variable first, and do not build it with string concatenation. A label
with a parameter, such as `m.counting.tabChannels({ count })`, is fine: the generator drops the
placeholder and indexes the static part. Run `node generate-tab-index.js` after converting a page
and make sure the page still appears in `src/lib/config/dashboardTabIndex.json`.

## Category keys versus labels

Feature categories ("Community", "Security", ...) are stable English keys. Search filters and the
Dashboard Access page group by them, so `category=` props and `category:` fields stay literal.
Anything shown to a person goes through `categoryLabel(key)` from `$lib/config/navigationItems`,
and search also matches on that translated label. Never pass a translated string as a category key.

## Patterns that came up

- **Meaningless `aria-label`s** such as `"Button action"` or `"Navigate"`: replace with a real
  label that says what the button does, as a key.
- **A sentence followed by code tokens** ("Available placeholders: `%user.name%` ..."): localize
  the lead-in sentence only; the tokens stay in markup.
- **Keyboard shortcut rows**: the key cap (`Ctrl+←`) stays literal; the description is a key.
- **Labels with a built-in hint** ("Previous Track (Ctrl+←)"): one key, hint included.
- **Decorative skin text** that is `aria-hidden` (lamp labels, marquee padding): leave as is.
- **Brand and platform names** (YouTube, Spotify): leave as is.
- **A local variable named `m`** collides with the import. Rename the local.
- **Fallbacks for API data** ("Unknown Title"): localize the fallback, never the data.

## Switching locales at runtime

The active locale is a Svelte state rune in `runtime.svelte.ts`. Any `m.x.y()` call made while
rendering a template, or inside `$derived`/`$effect`, re-runs when `setLocale()` is called, so the
whole page changes language with no refresh. Text only stays stale when it was copied into plain
data first: a `{ ...catalogObject }` spread, a module-scope `const` holding a message, a string
stored into `$state` at event time. Keep text in accessors until render time.

On the server, `hooks.server.ts` resolves the locale per request (cookie `locale`, then
`Accept-Language`) and runs the request inside it, so concurrent requests in different languages
never share state. It also fills `<html lang>`.

## Adding a locale

Create `src/lib/i18n/<locale>/<module>.json` with the same keys. The generator validates every
other locale against `en-US` (unknown keys and placeholder mismatches fail the build). The folder
is picked up automatically: `availableLocales()` lists it, the server resolver accepts it, and
`setLocale("<locale>")` loads it on demand in the browser. Missing keys fall back to English. For
the wiki, add `src/lib/content/wiki/<locale>/<slug>.md`; untranslated articles fall back too.

## Checking

Run `node generate-i18n.js --check` before committing. It fails on stale output, unsorted keys,
placeholder mismatches and on any text that appears under more than one key across the en-US
catalogs (features/placeholders exceptions aside). To list duplicates by hand:

```sh
node -e 'const fs=require("fs"),d="src/lib/i18n/en-US/",m={};for(const f of fs.readdirSync(d))for(const[k,v]of Object.entries(JSON.parse(fs.readFileSync(d+f))))(m[v]??=[]).push(f+":"+k);for(const[v,k]of Object.entries(m))k.length>1&&console.log(JSON.stringify(v),k.join(" "))'
```

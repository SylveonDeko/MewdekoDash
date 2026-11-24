<!-- routes/translate/manage/transfer/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { itemErrorMessage, translationErrorMessage } from "$lib/translate/client";
  import type { ExportFormat, ExportScope, ImportSummary, SourceSummary } from "$lib/translate/records";
  import { translationLimits, translationSourceLocale } from "$lib/translate/rules";
  import { localeLabel, wikiCall } from "$lib/wiki/client";

  let { data } = $props();

  let catalog = $state<string | null>(null);
  let locale = $state<string | null>(null);
  let format = $state<ExportFormat>("json");
  let scope = $state<ExportScope>("approved");

  let content = $state("");
  let fileFormat = $state<"json" | "csv">("json");
  let fileName = $state("");
  let summary = $state<ImportSummary | SourceSummary | null>(null);
  let busy = $state(false);
  let error = $state<string | null>(null);
  let done = $state<string | null>(null);

  const chosenCatalog = $derived(catalog ?? data.catalogs[0] ?? null);
  const chosenLocale = $derived(locale ?? data.locales[0] ?? translationSourceLocale);
  const isSource = $derived(chosenLocale === translationSourceLocale);

  const catalogOptions = $derived(data.catalogs.map((c) => ({ id: c, name: catalogLabel(c) })));
  const languageOptions = $derived([
    { id: translationSourceLocale, name: m.translate.languageSource() },
    ...data.locales.map((l) => ({ id: l, name: localeLabel(l) })),
  ]);
  const formatOptions = $derived([
    { id: "json", name: "JSON" },
    { id: "csv", name: "CSV" },
    { id: "resource", name: m.translate.formatResource() },
  ]);
  const scopeOptions = $derived([
    { id: "approved", name: m.translate.scopeApproved() },
    { id: "all", name: m.translate.scopeAll() },
  ]);

  const exportUrl = $derived(
    chosenCatalog ? `/api/translations/export?${new URLSearchParams({ catalog: chosenCatalog, locale: chosenLocale, format, scope })}` : "",
  );
  const savable = $derived(summary === null ? 0 : "added" in summary ? summary.added + summary.changed : summary.valid);

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const quiet = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);

  function catalogLabel(value: string): string {
    return value === "bot" ? m.translate.catalogBot() : value === "dash" ? m.translate.catalogDash() : value;
  }

  function clear() {
    summary = null;
    content = "";
    fileName = "";
    error = null;
    done = null;
  }

  async function choose(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    clear();
    if (!file) return;
    if (file.size > translationLimits.importChars) {
      error = translationErrorMessage("import_too_large");
      input.value = "";
      return;
    }
    fileName = file.name;
    fileFormat = file.name.toLowerCase().endsWith(".csv") ? "csv" : "json";
    content = await file.text();
  }

  async function run(apply: boolean) {
    if (busy || !content || !chosenCatalog) return;
    busy = true;
    error = null;
    const path = isSource ? "source" : "import";
    const body = isSource
      ? { catalog: chosenCatalog, format: fileFormat, content }
      : { catalog: chosenCatalog, locale: chosenLocale, format: fileFormat, content };
    const result = await wikiCall<ImportSummary | SourceSummary>("POST", `/api/translations/${path}${apply ? "?apply=true" : ""}`, body);
    busy = false;
    if (!result.ok || !result.data) {
      error = translationErrorMessage(result.error);
      return;
    }
    if (apply) {
      done = isSource ? m.translate.sourceDone({ count: savable }) : m.translate.bulkSaved({ count: savable });
      summary = null;
      content = "";
      fileName = "";
      return;
    }
    summary = result.data;
  }
</script>

<div class="space-y-8">
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div>
      <span id="transfer-language-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.language()}</span>
      <DiscordSelector type="custom" options={languageOptions} selected={chosenLocale} clearable={false}
                       ariaLabelledby="transfer-language-label"
                       onchange={(d) => { if (typeof d.selected === "string") { locale = d.selected; clear(); } }} />
    </div>
    {#if data.catalogs.length > 1}
      <div>
        <span id="transfer-catalog-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.translate.catalogAria()}</span>
        <DiscordSelector type="custom" options={catalogOptions} selected={chosenCatalog} clearable={false}
                         ariaLabelledby="transfer-catalog-label"
                         onchange={(d) => { if (typeof d.selected === "string") { catalog = d.selected; clear(); } }} />
      </div>
    {/if}
  </div>

  <section class="space-y-3">
    <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{m.translate.exportTitle()}</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <span id="transfer-format-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.translate.exportFormatAria()}</span>
        <DiscordSelector type="custom" options={formatOptions} selected={format} clearable={false}
                         ariaLabelledby="transfer-format-label"
                         onchange={(d) => { if (typeof d.selected === "string") format = d.selected as ExportFormat; }} />
      </div>
      {#if !isSource}
        <div>
          <span id="transfer-scope-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.translate.exportScopeAria()}</span>
          <DiscordSelector type="custom" options={scopeOptions} selected={scope} clearable={false}
                           ariaLabelledby="transfer-scope-label"
                           onchange={(d) => { if (typeof d.selected === "string") scope = d.selected as ExportScope; }} />
        </div>
      {/if}
    </div>
    {#if format === "resource"}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.translate.exportResourceHint()}</p>
    {/if}
    {#if exportUrl}
      <a href={exportUrl} download class="inline-flex items-center justify-center gap-2 px-5 rounded-lg min-h-[50px] font-semibold w-full sm:w-auto"
         style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};">
        <i class="fa-solid fa-arrow-down-to-line" aria-hidden="true"></i>{m.translate.exportDownload()}
      </a>
    {/if}
  </section>

  <section class="space-y-3">
    <h2 class="text-base font-semibold" style="color: {$colorStore.text}">{isSource ? m.translate.sourceTitle() : m.translate.importTitle()}</h2>
    <p class="text-sm" style="color: {$colorStore.muted}">{isSource ? m.translate.sourceHint() : m.translate.importHint()}</p>

    <div class="flex flex-wrap items-center gap-3">
      <label class="inline-flex items-center justify-center gap-2 px-5 rounded-lg min-h-[50px] font-medium cursor-pointer w-full sm:w-auto" style={quiet}>
        <i class="fa-solid fa-arrow-up-from-line" aria-hidden="true"></i>{m.translate.importFile()}
        <input type="file" class="sr-only" accept=".json,.csv,application/json,text/csv" onchange={choose}>
      </label>
      {#if fileName}
        <span class="text-sm break-all" style="color: {$colorStore.muted}">{fileName}</span>
      {/if}
    </div>

    {#if content && summary === null}
      <button type="button" class="px-5 rounded-lg min-h-[50px] font-semibold w-full sm:w-auto" disabled={busy}
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={() => run(false)}>{m.translate.importCheck()}</button>
    {/if}

    {#if error}
      <p class="text-sm text-red-400" role="alert">{error}</p>
    {/if}
    {#if done}
      <p class="text-sm" style="color: {$colorStore.muted}" role="status">{done}</p>
    {/if}

    {#if summary}
      <div class="space-y-3">
        <p class="text-sm" style="color: {$colorStore.text}">
          {#if "added" in summary}
            {m.translate.sourceSummary({ total: summary.total, added: summary.added, changed: summary.changed, unchanged: summary.unchanged, failed: summary.failed })}
          {:else}
            {m.translate.importSummary({ total: summary.total, valid: summary.valid, unchanged: summary.unchanged, empty: summary.empty, failed: summary.failed })}
          {/if}
        </p>
        {#if savable === 0}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.translate.importNone()}</p>
        {:else}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.translate.importSamples()}</p>
          <ul>
            {#each summary.samples as sample (sample.key)}
              <li class="py-3 space-y-1" style="border-top: 1px solid {$colorStore.primary}20;">
                <code class="block text-xs break-all" style="color: {$colorStore.muted}">{sample.key}</code>
                {#if sample.current}
                  <p class="text-sm whitespace-pre-wrap break-words" style="color: {$colorStore.muted}">{sample.current}</p>
                {/if}
                <p class="whitespace-pre-wrap break-words" style="color: {$colorStore.text}">{sample.text}</p>
              </li>
            {/each}
          </ul>
          <button type="button" class="px-5 rounded-lg min-h-[50px] font-semibold w-full sm:w-auto" disabled={busy}
                  style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={() => run(true)}>
            {isSource ? m.translate.sourceApply({ count: savable }) : m.translate.importApply({ count: savable })}
          </button>
        {/if}
        {#if summary.problems.length > 0}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.translate.importProblems()}</p>
          <ul>
            {#each summary.problems as problem, index (`${index}-${problem.key}`)}
              <li class="py-2" style="border-top: 1px solid {$colorStore.primary}20;">
                <code class="block text-xs break-all" style="color: {$colorStore.muted}">{problem.key}</code>
                <p class="text-sm text-red-400">{itemErrorMessage(problem.error)}</p>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </section>
</div>

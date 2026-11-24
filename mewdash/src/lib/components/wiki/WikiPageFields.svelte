<!-- lib/components/wiki/WikiPageFields.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { wikiLimits } from "$lib/wiki/validation";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import WikiIconSelect from "./WikiIconSelect.svelte";

  interface Props {
    slug: string;
    category: string;
    icon: string;
    dashboardHref: string;
    moduleName: string;
    related: string[];
    categories: string[];
    pages: Array<{ slug: string; title: string }>;
    ownSlug?: string;
    idPrefix: string;
    onslugedit?: () => void;
  }

  let {
    slug = $bindable(),
    category = $bindable(),
    icon = $bindable(),
    dashboardHref = $bindable(),
    moduleName = $bindable(),
    related = $bindable(),
    categories,
    pages,
    ownSlug = "",
    idPrefix,
    onslugedit,
  }: Props = $props();

  const field = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  const categoryOptions = $derived(categories.map((name) => ({ id: name, name })));
  const relatedOptions = $derived(pages.filter((p) => p.slug !== ownSlug).map((p) => ({ id: p.slug, name: p.title })));
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <label for="{idPrefix}-slug" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.fieldSlug()}</label>
    <input id="{idPrefix}-slug" type="text" bind:value={slug} oninput={() => onslugedit?.()} maxlength={wikiLimits.slugMax}
           autocomplete="off" autocapitalize="none" spellcheck="false"
           class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
  </div>

  <div>
    <span id="{idPrefix}-category-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.category()}</span>
    <DiscordSelector
      type="custom"
      options={categoryOptions}
      selected={category}
      clearable={false}
      searchable={false}
      ariaLabelledby="{idPrefix}-category-label"
      onchange={(e) => { category = typeof e.selected === "string" ? e.selected : category; }}
    />
  </div>

  <WikiIconSelect bind:icon {idPrefix} />

  <div>
    <label for="{idPrefix}-module" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.module()}</label>
    <input id="{idPrefix}-module" type="text" bind:value={moduleName} maxlength={wikiLimits.moduleMax} autocomplete="off"
           class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
  </div>

  <div class="sm:col-span-2">
    <label for="{idPrefix}-href" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.fieldDashboardPage()}</label>
    <input id="{idPrefix}-href" type="text" bind:value={dashboardHref} maxlength={wikiLimits.hrefMax} autocomplete="off"
           autocapitalize="none" spellcheck="false" placeholder="/dashboard/afk"
           class="w-full p-3 rounded-lg border min-h-[50px]" style={field}>
  </div>

  <div class="sm:col-span-2">
    <span id="{idPrefix}-related-label" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.wikiManage.fieldRelated()}</span>
    <DiscordSelector
      type="custom"
      options={relatedOptions}
      selected={related}
      multiple
      ariaLabelledby="{idPrefix}-related-label"
      onchange={(e) => { related = Array.isArray(e.selected) ? e.selected.slice(0, wikiLimits.relatedMax) : []; }}
    />
  </div>
</div>

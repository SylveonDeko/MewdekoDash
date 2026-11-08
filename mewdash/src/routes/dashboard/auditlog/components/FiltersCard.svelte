<script lang="ts">
  import { m } from "$lib/i18n";
  import { AuditAction } from "$lib/api/auditlog/models";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { actionMeta, PAGE_SIZES, type AuditFilters } from "./auditModel";

  interface Props {
    filters: AuditFilters;
    sectionOptions: Array<{ id: string; name: string }>;
    members: Array<{ id: string; name: string }>;
    onchange: () => void;
  }

  let { filters = $bindable(), sectionOptions, members, onchange }: Props = $props();

  const actionOptions = $derived(
    Object.values(AuditAction)
      .filter((value): value is number => typeof value === "number")
      .map((value) => ({ id: String(value), name: actionMeta()[value as AuditAction].label }))
  );
  const sizeOptions = PAGE_SIZES.map((size) => ({ id: String(size), name: String(size) }));
  const dirty = $derived(
    filters.action !== null || filters.section !== null || filters.userId !== null || filters.from !== "" || filters.to !== ""
  );

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function reset() {
    filters.action = null;
    filters.section = null;
    filters.userId = null;
    filters.from = "";
    filters.to = "";
    onchange();
  }
</script>

{#snippet label(id: string, text: string)}
  <span id={id} class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{text}</span>
{/snippet}

<PluginCard title={m.common.filters()} alwaysOpen>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div class="min-w-0">
      {@render label("audit-action", m.common.action())}
      <DiscordSelector
        type="custom"
        customIcon="fa-filter"
        options={actionOptions}
        selected={filters.action}
        placeholder={m.common.allActions()}
        searchable={false}
        ariaLabelledby="audit-action"
        onchange={({ selected }) => {
          filters.action = typeof selected === "string" && selected !== "" ? selected : null;
          onchange();
        }}
      />
    </div>
    <div class="min-w-0">
      {@render label("audit-section", m.auditlog.pageColSection())}
      <DiscordSelector
        type="custom"
        customIcon="fa-layer-group"
        options={sectionOptions}
        selected={filters.section}
        placeholder={m.auditlog.pageFilterSectionPlaceholder()}
        ariaLabelledby="audit-section"
        onchange={({ selected }) => {
          filters.section = typeof selected === "string" && selected !== "" ? selected : null;
          onchange();
        }}
      />
    </div>
    <div class="min-w-0">
      {@render label("audit-user", m.common.user())}
      <DiscordSelector
        type="user"
        options={members}
        selected={filters.userId}
        placeholder={m.auditlog.filterAnyUser()}
        ariaLabelledby="audit-user"
        onchange={({ selected }) => {
          filters.userId = typeof selected === "string" && selected !== "" ? selected : null;
          onchange();
        }}
      />
    </div>
    <div class="min-w-0">
      {@render label("audit-size", m.auditlog.filterPageSize())}
      <DiscordSelector
        type="custom"
        options={sizeOptions}
        selected={String(filters.pageSize)}
        searchable={false}
        clearable={false}
        customIcon="fa-list-ul"
        ariaLabelledby="audit-size"
        onchange={({ selected }) => {
          if (typeof selected !== "string") return;
          filters.pageSize = Number(selected);
          onchange();
        }}
      />
    </div>
    <div class="min-w-0">
      <label for="audit-from" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.from()}</label>
      <input
        id="audit-from"
        type="date"
        max={filters.to || undefined}
        bind:value={filters.from}
        onchange={onchange}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </div>
    <div class="min-w-0">
      <label for="audit-to" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.auditlog.filterTo()}</label>
      <input
        id="audit-to"
        type="date"
        min={filters.from || undefined}
        bind:value={filters.to}
        onchange={onchange}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </div>
  </div>

  {#if dirty}
    <button
      type="button"
      class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={reset}
    >
      {m.auditlog.filterClear()}
    </button>
  {/if}
</PluginCard>

<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { SavedEmbed } from "$lib/api/embeds/models";

  interface Props {
    guildName: string | null;
    loggedIn: boolean;
    guildEmbeds: SavedEmbed[];
    userEmbeds: SavedEmbed[];
    loading: boolean;
    saveName: string;
    saveShared: boolean;
    saving: boolean;
    onsave: () => void;
    onload: (saved: SavedEmbed) => void;
    onoverwrite: (saved: SavedEmbed) => void;
    ondelete: (saved: SavedEmbed) => void;
  }

  let {
    guildName,
    loggedIn,
    guildEmbeds,
    userEmbeds,
    loading,
    saveName = $bindable(),
    saveShared = $bindable(),
    saving,
    onsave,
    onload,
    onoverwrite,
    ondelete
  }: Props = $props();
</script>

{#snippet list(items: SavedEmbed[], empty: string)}
  {#if loading}
    <p class="text-sm" style="color: {$colorStore.muted};">{m.common.loading()}</p>
  {:else if items.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted};">{empty}</p>
  {:else}
    {#each items as saved (saved.id)}
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border"
        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
      >
        <span class="text-sm font-medium truncate" style="color: {$colorStore.text};">{saved.embedName}</span>
        <div class="grid grid-cols-3 gap-2 shrink-0">
          <button
            type="button"
            aria-label={m.embedbuilder.pageSavedLoadAria()}
            class="min-h-[44px] px-3 rounded-lg text-sm font-medium"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            onclick={() => onload(saved)}
          >
            {m.common.load()}
          </button>
          <button
            type="button"
            aria-label={m.embedbuilder.pageSavedOverwriteAria()}
            class="min-h-[44px] px-3 rounded-lg text-sm font-medium"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            onclick={() => onoverwrite(saved)}
          >
            {m.embedbuilder.pageSavedOverwrite()}
          </button>
          <button
            type="button"
            aria-label={m.embedbuilder.pageSavedDeleteAria()}
            class="min-h-[44px] px-3 rounded-lg text-sm font-medium"
            style="background: #ED424520; color: #ED4245; border: 1px solid #ED424530;"
            onclick={() => ondelete(saved)}
          >
            {m.common.delete()}
          </button>
        </div>
      </div>
    {/each}
  {/if}
{/snippet}

<div class="space-y-6">
  <div class="p-4 rounded-lg border space-y-3" style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;">
    <h3 class="text-base font-semibold" style="color: {$colorStore.text};">{m.embedbuilder.fullscreenSaveHeading()}</h3>
    <div class="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        class="flex-1 min-w-0 px-3 py-2 rounded-lg border min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        placeholder={m.embedbuilder.fullscreenSaveNamePlaceholder()}
        aria-label={m.embedbuilder.fullscreenSaveNamePlaceholder()}
        bind:value={saveName}
      />
      <button
        type="button"
        aria-label={m.common.saveEmbed()}
        class="px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 min-h-[50px]"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={saving || !saveName.trim()}
        onclick={onsave}
      >
        <i class="fa-solid fa-floppy-disk" aria-hidden="true"></i>
        {saving ? m.common.saving() : m.common.save()}
      </button>
    </div>
    {#if guildName}
      <label class="flex items-center gap-3 text-sm min-h-[44px]" style="color: {$colorStore.text};">
        <input type="checkbox" class="size-5" bind:checked={saveShared} />
        {m.embedbuilder.personaShareWithEveryone({ server: guildName })}
      </label>
    {/if}
  </div>

  {#if guildName}
    <div class="space-y-2">
      <h3 class="text-base font-semibold" style="color: {$colorStore.text};">
        {m.embedbuilder.pageSavedSharedHeading({ server: guildName, count: guildEmbeds.length })}
      </h3>
      {@render list(guildEmbeds, m.embedbuilder.pageSavedSharedEmpty())}
    </div>
  {/if}

  <div class="space-y-2">
    <h3 class="text-base font-semibold" style="color: {$colorStore.text};">
      {m.embedbuilder.fullscreenMineHeading({ count: userEmbeds.length })}
    </h3>
    {#if !loggedIn}
      <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.pageSavedLogin()}</p>
    {:else}
      {@render list(userEmbeds, m.embedbuilder.fullscreenMineEmpty())}
    {/if}
  </div>
</div>

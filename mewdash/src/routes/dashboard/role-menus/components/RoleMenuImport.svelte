<script lang="ts">
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import {
    roleMenusApi,
    RoleMenuStyle,
    type RoleMenu,
    type RoleMenuImportSource,
    type RoleMenuLookups
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import { DEFAULT_NAME, emojiImageUrl, NAME_LENGTH } from "../roleMenuDefaults";

  /** Inputs for the Move older setups tab. */
  interface Props {
    /** Older emoji role setups that can be moved */
    sources: RoleMenuImportSource[];
    /** Channels, roles, and emojis from the bot */
    lookups: RoleMenuLookups | null;
    /** Called with the new menu and the source it came from after a successful move */
    onmoved: (menu: RoleMenu, sourceId: number) => void;
    /** Called with a message when a move fails */
    onerror: (message: string) => void;
  }

  let { sources, lookups, onmoved, onerror }: Props = $props();

  /** Per-source move settings. */
  interface MoveSettings {
    style: number;
    channelId: string | null;
    name: string;
    copyMessage: boolean;
    retireOriginal: boolean;
    busy: boolean;
  }

  let settings = $state<Record<number, MoveSettings>>({});

  $effect(() => {
    for (const source of sources) {
      if (!settings[source.id]) {
        settings[source.id] = {
          style: RoleMenuStyle.Dropdown,
          channelId: source.channelId.toString(),
          name: "",
          copyMessage: true,
          retireOriginal: true,
          busy: false
        };
      }
    }
  });

  /**
   * Channels a source's menu can be posted in, plus its own channel so the selector can show it.
   * @param source The older setup
   */
  function channelOptionsFor(source: RoleMenuImportSource) {
    const own = settings[source.id]?.channelId ?? source.channelId.toString();
    return (lookups?.channels ?? [])
      .filter((c) => c.canPost || c.id.toString() === own)
      .map((c) => ({ id: c.id.toString(), name: c.name }));
  }

  /**
   * Moves one older setup into a new role menu.
   * @param source The older setup
   */
  async function move(source: RoleMenuImportSource) {
    const entry = settings[source.id];
    if (!$currentGuild?.id || !entry || entry.busy) return;
    entry.busy = true;
    try {
      const menu = await roleMenusApi.importSetup($currentGuild.id, {
        sourceId: source.id,
        style: entry.style,
        channelId: entry.channelId ? BigInt(entry.channelId) : null,
        name: entry.name.trim() || null,
        copyMessage: entry.copyMessage,
        retireOriginal: entry.retireOriginal
      });
      onmoved(menu, source.id);
    } catch (err: any) {
      logger.error("Failed to move an older setup:", err);
      onerror(err?.message || "Couldn't save the menu.");
    } finally {
      entry.busy = false;
    }
  }
</script>

<div class="w-full space-y-6" in:fade={{ duration: 200 }}>
  <p class="text-sm" style="color: {$colorStore.muted}">
    Older setups had members add an emoji under a message to get a role. Move one to a role menu and members pick from a
    dropdown or buttons instead.
  </p>

  {#if sources.length === 0}
    <div class="rounded-2xl border p-6 md:p-8 shadow-2xl text-center"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                border-color: {$colorStore.primary}30;">
      <i class="fa-utility-duo fa-regular fa-arrow-right-arrow-left"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.primary}; font-size: 48px; opacity: 0.5;"></i>
      <h3 class="text-lg font-semibold mt-4 mb-2" style="color: {$colorStore.text}">Nothing to move</h3>
      <p class="text-sm" style="color: {$colorStore.muted}">
        Older emoji role setups made with the old command show up here.
      </p>
    </div>
  {:else}
    {#each sources as source, index (source.id)}
      {@const entry = settings[source.id]}
      <div class="relative rounded-2xl border p-6 md:p-8 shadow-2xl"
           style="z-index: {sources.length - index}; background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex flex-wrap items-center gap-3 mb-4">
          <i class="fa-utility-duo fa-regular fa-comment"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">
            {source.channelName ? `#${source.channelName}` : "Deleted channel"}
          </h2>
          {#if source.exclusive}
            <span class="text-xs px-2 py-1 rounded-lg font-medium"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary};">Pick one</span>
          {/if}
          <a href={source.jumpUrl}
             target="_blank"
             rel="noopener noreferrer"
             class="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium min-h-[44px] transition-all hover:scale-[1.02]"
             style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;">
            <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
            Open in Discord
          </a>
        </div>

        <div class="flex flex-wrap gap-2 mb-6">
          {#each source.pairs as pair, pairIndex (`${pair.roleId.toString()}-${pairIndex}`)}
            {@const url = emojiImageUrl(pair.emoji)}
            <span class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                  style="background: {pair.roleExists ? $colorStore.primary + '20' : $colorStore.muted + '20'};
                         color: {pair.roleExists ? $colorStore.primary : $colorStore.muted};">
              {#if url}
                <img src={url} alt="" class="w-4 h-4" />
              {:else if pair.emoji}
                <span>{pair.emoji}</span>
              {/if}
              {#if pair.roleExists}
                <span>@{pair.roleName ?? pair.roleId.toString()}</span>
              {:else}
                <span class="line-through">deleted role</span>
              {/if}
            </span>
          {/each}
        </div>

        {#if entry}
          <div class="space-y-4">
            <div>
              <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Menu type</span>
              <div class="flex flex-wrap gap-2">
                {#each [{ value: RoleMenuStyle.Dropdown, label: "Dropdown", icon: "fa-square-caret-down" }, { value: RoleMenuStyle.Buttons, label: "Buttons", icon: "fa-grip" }] as choice (choice.value)}
                  <button
                    type="button"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium min-h-[44px] transition-all hover:scale-[1.02]"
                    style="background: {entry.style === choice.value ? $colorStore.primary + '20' : $colorStore.primary + '08'};
                           border-color: {entry.style === choice.value ? $colorStore.primary : $colorStore.primary + '30'};
                           color: {entry.style === choice.value ? $colorStore.primary : $colorStore.text};"
                    aria-pressed={entry.style === choice.value}
                    onclick={() => { entry.style = choice.value; }}
                  >
                    <i class="fa-solid {choice.icon}" aria-hidden="true"></i>
                    {choice.label}
                  </button>
                {/each}
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div class="relative z-10">
                <span id="rm-import-{source.id}-channel" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                  Post in
                </span>
                <div class="min-h-[44px]">
                  <DiscordSelector
                    type="channel"
                    options={channelOptionsFor(source)}
                    selected={entry.channelId}
                    placeholder="Pick a channel"
                    ariaLabelledby="rm-import-{source.id}-channel"
                    onchange={(detail) => {
                      entry.channelId = typeof detail.selected === "string" && detail.selected ? detail.selected : null;
                    }}
                  />
                </div>
              </div>

              <div>
                <label for="rm-import-{source.id}-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                  Name
                </label>
                <input id="rm-import-{source.id}-name"
                       type="text"
                       bind:value={entry.name}
                       maxlength={NAME_LENGTH}
                       placeholder={DEFAULT_NAME}
                       class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                       style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                >
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ToggleRow
                checked={entry.copyMessage}
                title="Copy the original message"
                subtitle="Uses the text and embeds from the old message"
                colors={$colorStore}
                onchange={(checked) => { entry.copyMessage = checked; }}
              />
              <ToggleRow
                checked={entry.retireOriginal}
                title="Retire the old setup"
                subtitle="Stops the old emoji setup and clears its emojis. If the bot posted the original message, it's deleted."
                colors={$colorStore}
                onchange={(checked) => { entry.retireOriginal = checked; }}
              />
            </div>

            <button
              type="button"
              class="flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition-all hover:scale-[1.02] min-h-[44px] font-medium disabled:opacity-50 disabled:hover:scale-100"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={() => move(source)}
              disabled={entry.busy}
              aria-busy={entry.busy}
            >
              <i class="fa-solid {entry.busy ? 'fa-spinner fa-spin' : 'fa-arrow-right-arrow-left'}" aria-hidden="true"></i>
              Move to a role menu
            </button>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>

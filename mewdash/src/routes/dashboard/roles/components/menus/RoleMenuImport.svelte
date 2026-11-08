<script lang="ts">
  import { m } from "$lib/i18n";
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
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { DEFAULT_NAME, emojiImageUrl, NAME_LENGTH } from "../../roleMenuDefaults";

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

  const styleChoices = $derived([
    { value: RoleMenuStyle.Dropdown, label: m.common.dropdown(), icon: "fa-square-caret-down" },
    { value: RoleMenuStyle.Buttons, label: m.common.buttons(), icon: "fa-grip" }
  ]);

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
      onerror(err?.message || m.roleMenus.pageSaveFailed());
    } finally {
      entry.busy = false;
    }
  }
</script>

{#snippet openLink(url: string)}
  <a href={url}
     target="_blank"
     rel="noopener noreferrer"
     class="flex items-center justify-center gap-2 px-4 rounded-lg min-h-[44px] text-sm font-medium"
     style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;">
    {m.roleMenus.menuOpenInDiscord()}
  </a>
{/snippet}

<div class="space-y-4 min-w-0">
  {#if sources.length === 0}
    <PluginCard title={m.roleMenus.tabMove()} alwaysOpen>
      <div class="flex flex-col items-center gap-3 py-8 text-center">
        <i class="fa-solid fa-arrow-right-arrow-left" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
        <p class="font-semibold" style="color: {$colorStore.text}">{m.roleMenus.importEmptyTitle()}</p>
        <p class="text-sm" style="color: {$colorStore.muted}">{m.roleMenus.importEmptyText()}</p>
      </div>
    </PluginCard>
  {:else}
    {#each sources as source, index (source.id)}
      {@const entry = settings[source.id]}
      <div class="relative" style="z-index: {sources.length - index};">
        <PluginCard
          title={source.channelName ? `#${source.channelName}` : m.roleMenus.channelDeleted()}
          alwaysOpen
          actions={source.exclusive ? exclusiveBadge : undefined}
        >
          <div class="flex flex-wrap items-center gap-2">
            {#each source.pairs as pair, pairIndex (`${pair.roleId.toString()}-${pairIndex}`)}
              {@const url = emojiImageUrl(pair.emoji)}
              <span class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                    style="background: {pair.roleExists ? `${$colorStore.primary}15` : `${$colorStore.muted}20`};
                           color: {pair.roleExists ? $colorStore.text : $colorStore.muted};">
                {#if url}
                  <img src={url} alt="" class="w-4 h-4" />
                {:else if pair.emoji}
                  <span>{pair.emoji}</span>
                {/if}
                {#if pair.roleExists}
                  <span>@{pair.roleName ?? pair.roleId.toString()}</span>
                {:else}
                  <span class="line-through">{m.common.deletedRole()}</span>
                {/if}
              </span>
            {/each}
            <span class="sm:ml-auto">{@render openLink(source.jumpUrl)}</span>
          </div>

          {#if entry}
            <div class="grid grid-cols-2 gap-2" role="group" aria-label={m.roleMenus.importMenuType()}>
              {#each styleChoices as choice (choice.value)}
                {@const selected = entry.style === choice.value}
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 px-3 rounded-lg border min-h-[50px] text-sm font-medium"
                  style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`};
                         border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`};
                         color: {$colorStore.text};"
                  aria-pressed={selected}
                  onclick={() => { entry.style = choice.value; }}
                >
                  <i class="fa-solid {choice.icon}" aria-hidden="true"></i>
                  {choice.label}
                </button>
              {/each}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingField label={m.roleMenus.importPostIn()} id="rm-import-{source.id}-channel">
                <DiscordSelector
                  id="rm-import-{source.id}-channel"
                  type="channel"
                  options={channelOptionsFor(source)}
                  selected={entry.channelId}
                  placeholder={m.common.pickChannelPlaceholder()}
                  onchange={(detail) => {
                    entry.channelId = typeof detail.selected === "string" && detail.selected ? detail.selected : null;
                  }}
                />
              </SettingField>
              <SettingField label={m.common.name()} id="rm-import-{source.id}-name">
                <input
                  id="rm-import-{source.id}-name"
                  type="text"
                  bind:value={entry.name}
                  maxlength={NAME_LENGTH}
                  placeholder={DEFAULT_NAME}
                  class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
                  style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
                >
              </SettingField>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ToggleRow
                checked={entry.copyMessage}
                title={m.roleMenus.importCopyTitle()}
                subtitle={m.roleMenus.importCopySubtitle()}
                colors={$colorStore}
                onchange={(checked) => { entry.copyMessage = checked; }}
              />
              <ToggleRow
                checked={entry.retireOriginal}
                title={m.roleMenus.importRetireTitle()}
                subtitle={m.roleMenus.importRetireSubtitle()}
                colors={$colorStore}
                onchange={(checked) => { entry.retireOriginal = checked; }}
              />
            </div>

            <button
              type="button"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              onclick={() => move(source)}
              disabled={entry.busy}
              aria-busy={entry.busy}
            >
              <i class="fa-solid {entry.busy ? 'fa-spinner fa-spin' : 'fa-arrow-right-arrow-left'}" aria-hidden="true"></i>
              {m.roleMenus.importMove()}
            </button>
          {/if}
        </PluginCard>
      </div>
    {/each}
  {/if}
</div>

{#snippet exclusiveBadge()}
  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.text};">{m.roleMenus.menuModePickOne()}</span>
{/snippet}

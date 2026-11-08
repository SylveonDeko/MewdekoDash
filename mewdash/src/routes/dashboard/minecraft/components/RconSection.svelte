<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { minecraftApi, type MinecraftServer } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { DEFAULT_RCON_PORT, FALLBACK_AVATAR, avatarUrl, type Notify } from "./minecraftModel";

  interface Props {
    guildId: bigint;
    server: MinecraftServer;
    onlinePlayers: string[];
    autoSave: AutoSave;
    notify: Notify;
    onupdate: (server: MinecraftServer) => void;
  }

  let { guildId, server, onlinePlayers, autoSave, notify, onupdate }: Props = $props();

  const initial = untrack(() => server);
  let enabled = $state(initial.rconEnabled);
  let port = $state(initial.rconPort || DEFAULT_RCON_PORT);
  let password = $state("");
  let whitelist: string[] = $state([]);
  let whitelistLoading = $state(false);
  let addName = $state("");

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const key = $derived(`${server.name}:rcon`);
  const rconOn = $derived(server.rconEnabled);
  const suggestions = $derived(onlinePlayers.filter(player => !whitelist.some(entry => entry.toLowerCase() === player.toLowerCase())));

  function save(next: { password?: string }, immediate: boolean) {
    const run = async () => {
      try {
        onupdate(
          await minecraftApi.setRconConfig(guildId, server.name, {
            enabled,
            port: Math.min(65535, Math.max(1, Math.floor(port) || DEFAULT_RCON_PORT)),
            password: next.password || undefined
          })
        );
        if (next.password) password = "";
      } catch (err) {
        enabled = server.rconEnabled;
        port = server.rconPort || DEFAULT_RCON_PORT;
        throw err;
      }
    };
    if (immediate) void autoSave.now(key, run);
    else autoSave.schedule(key, run);
  }

  async function loadWhitelist() {
    whitelistLoading = true;
    try {
      const result = await minecraftApi.sendRconCommand(guildId, server.name, "whitelist list");
      const match = result.success ? result.response?.match(/:\s*(.*)/) : null;
      whitelist = match?.[1] ? match[1].split(",").map(player => player.trim()).filter(Boolean) : [];
    } catch (err) {
      logger.error("Failed to load the whitelist:", err);
      whitelist = [];
    } finally {
      whitelistLoading = false;
    }
  }

  async function runWhitelist(command: string, success: string, failure: string) {
    whitelistLoading = true;
    try {
      const result = await minecraftApi.sendRconCommand(guildId, server.name, command);
      if (!result.success) throw new Error(result.response);
      notify(success);
    } catch (err) {
      logger.error("Whitelist command failed:", err);
      notify(failure, "error");
    }
    await loadWhitelist();
  }

  async function add(name: string) {
    const player = name.trim();
    if (!player || /[\r\n]/.test(player) || whitelistLoading) return;
    await runWhitelist(`whitelist add ${player}`, m.minecraft.notifyWhitelistAdded(), m.minecraft.notifyWhitelistAddFailed());
    if (player === addName.trim()) addName = "";
  }

  function remove(player: string) {
    return runWhitelist(`whitelist remove ${player}`, m.minecraft.notifyWhitelistRemoved({ player }), m.minecraft.notifyWhitelistRemoveFailed());
  }

  $effect(() => {
    if (rconOn) void untrack(loadWhitelist);
    else whitelist = [];
  });
</script>

<PluginCard title={m.minecraft.rconSettings()} alwaysOpen>
  <ToggleRow
    title={m.common.enabled()}
    checked={enabled}
    colors={$colorStore}
    onchange={(value) => {
      enabled = value;
      save({}, true);
    }}
  />
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <SettingField label={m.minecraft.rconPort()} id="mc-rcon-port">
      <input
        id="mc-rcon-port"
        type="number"
        inputmode="numeric"
        min="1"
        max="65535"
        bind:value={port}
        oninput={() => save({}, false)}
        onblur={() => autoSave.flush(key)}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
    <SettingField label={m.minecraft.rconPassword()} id="mc-rcon-password">
      <input
        id="mc-rcon-password"
        type="password"
        autocomplete="new-password"
        bind:value={password}
        placeholder={server.hasRconPassword ? m.minecraft.passwordUnchanged() : m.minecraft.passwordPlaceholder()}
        onchange={() => password.trim() && save({ password }, true)}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
  </div>
</PluginCard>

{#if server.rconEnabled}
  <PluginCard title={m.common.whitelist()} alwaysOpen>
    {#snippet actions()}
      <button
        type="button"
        class="rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-50"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        aria-label={m.common.refresh()}
        disabled={whitelistLoading}
        onclick={loadWhitelist}
      >
        <i class="fa-solid fa-arrows-rotate {whitelistLoading ? 'fa-spin' : ''}" aria-hidden="true"></i>
      </button>
    {/snippet}

    <div class="flex flex-col sm:flex-row gap-2">
      <input
        type="text"
        bind:value={addName}
        placeholder={m.minecraft.whitelistPlayerPlaceholder()}
        aria-label={m.minecraft.whitelistPlayerPlaceholder()}
        class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
        onkeydown={(e) => e.key === "Enter" && add(addName)}
      >
      <button
        type="button"
        class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={whitelistLoading || !addName.trim()}
        onclick={() => add(addName)}
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.common.add()}
      </button>
    </div>

    {#if suggestions.length}
      <div class="flex flex-wrap gap-2">
        {#each suggestions as player (player)}
          <button
            type="button"
            class="flex items-center gap-2 px-3 rounded-lg min-h-[44px] text-sm disabled:opacity-50"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            disabled={whitelistLoading}
            aria-label={`${m.minecraft.whitelistAdd()}: ${player}`}
            onclick={() => add(player)}
          >
            <i class="fa-solid fa-user-plus" aria-hidden="true"></i>
            {player}
          </button>
        {/each}
      </div>
    {/if}

    {#if whitelist.length}
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {#each whitelist as player (player)}
          <div class="flex items-center gap-2 p-2 rounded-xl min-w-0" style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}15;">
            <img src={avatarUrl(player, 48)} alt="" class="w-9 h-9 rounded-lg shrink-0" onerror={(e) => ((e.currentTarget as HTMLImageElement).src = FALLBACK_AVATAR)}>
            <span class="grow min-w-0 text-sm font-medium truncate" style="color: {$colorStore.text}">{player}</span>
            <button
              type="button"
              class="shrink-0 rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-50"
              style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              aria-label={`${m.minecraft.whitelistRemove()}: ${player}`}
              disabled={whitelistLoading}
              onclick={() => remove(player)}
            >
              <i class="fa-solid fa-user-minus" aria-hidden="true"></i>
            </button>
          </div>
        {/each}
      </div>
    {:else if !whitelistLoading}
      <p class="text-sm text-center py-2" style="color: {$colorStore.muted}">{m.minecraft.whitelistEmpty()}</p>
    {/if}
  </PluginCard>
{/if}

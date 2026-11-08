<script lang="ts">
  import { tick } from "svelte";
  import { m } from "$lib/i18n";
  import { minecraftApi, type MinecraftServer } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { mcToHtml } from "./minecraftModel";

  interface Props {
    guildId: bigint;
    servers: MinecraftServer[];
  }

  interface Entry {
    command: string;
    response: string;
    rawResponse: string | null;
    success: boolean;
    time: Date;
  }

  let { guildId, servers }: Props = $props();

  let serverName: string | null = $state(null);
  let command = $state("");
  let history: Entry[] = $state([]);
  let sending = $state(false);
  let logEl: HTMLElement | undefined = $state();

  const rconServers = $derived(servers.filter(server => server.rconEnabled));
  const options = $derived(rconServers.map(server => ({ id: server.name, name: server.name, icon: "fa-terminal" })));

  async function send() {
    const text = command.trim();
    if (!serverName || !text || sending) return;
    sending = true;
    command = "";
    try {
      const result = await minecraftApi.sendRconCommand(guildId, serverName, text);
      history = [...history, { command: text, response: result.response, rawResponse: result.rawResponse, success: result.success, time: new Date() }];
    } catch (err) {
      logger.error("RCON failed:", err);
      history = [...history, { command: text, response: m.minecraft.consoleSendFailed(), rawResponse: null, success: false, time: new Date() }];
    } finally {
      sending = false;
      await tick();
      logEl?.scrollTo({ top: logEl.scrollHeight });
    }
  }

  $effect(() => {
    if (!rconServers.some(server => server.name === serverName)) serverName = rconServers[0]?.name ?? null;
  });
</script>

{#if rconServers.length === 0}
  <PluginCard title={m.minecraft.tabConsole()} alwaysOpen>
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-terminal" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.minecraft.consoleNoRcon()}</p>
    </div>
  </PluginCard>
{:else}
  <PluginCard title={m.minecraft.tabConsole()} alwaysOpen>
    <SettingField label={m.minecraft.fieldServer()} id="mc-console-server">
      <DiscordSelector
        id="mc-console-server"
        type="custom"
        customIcon="fa-server"
        options={options}
        selected={serverName}
        clearable={false}
        placeholder={m.minecraft.consoleSelectServer()}
        onchange={(detail) => {
          if (typeof detail.selected !== "string" || detail.selected === serverName) return;
          serverName = detail.selected;
          history = [];
        }}
      />
    </SettingField>

    <div class="rounded-xl border overflow-hidden min-w-0" style="background: #0d1117; border-color: {$colorStore.primary}30;">
      <div bind:this={logEl} class="p-3 font-mono text-sm space-y-2 h-[320px] max-h-[60vh] overflow-y-auto overscroll-contain" style="color: #c9d1d9;">
        {#if history.length === 0}
          <p style="color: #8b949e;">{m.minecraft.consolePrompt()}</p>
        {/if}
        {#each history as entry, index (index)}
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span style="color: {$colorStore.primary};">$</span>
              <span class="break-all" style="color: #e6edf3;">{entry.command}</span>
              <span class="text-xs" style="color: #8b949e;">{entry.time.toLocaleTimeString()}</span>
            </div>
            {#if entry.success && entry.rawResponse}
              <pre class="mt-1 whitespace-pre-wrap break-words text-xs pl-4 font-mono">{@html mcToHtml(entry.rawResponse)}</pre>
            {:else}
              <pre class="mt-1 whitespace-pre-wrap break-words text-xs pl-4" style="color: {entry.success ? '#7ee787' : '#f85149'};">{entry.response}</pre>
            {/if}
          </div>
        {/each}
      </div>

      <div class="p-2 flex items-center gap-2" style="border-top: 1px solid {$colorStore.primary}20;">
        <span class="font-mono pl-1" style="color: {$colorStore.primary};" aria-hidden="true">$</span>
        <input
          type="text"
          bind:value={command}
          placeholder={m.minecraft.consoleInputPlaceholder()}
          aria-label={m.minecraft.consoleInputPlaceholder()}
          autocapitalize="none"
          autocomplete="off"
          class="grow min-w-0 bg-transparent font-mono text-sm min-h-[50px] focus:outline-none"
          style="color: #e6edf3;"
          disabled={sending}
          onkeydown={(e) => e.key === "Enter" && send()}
        >
        <button
          type="button"
          class="shrink-0 px-4 rounded-lg min-h-[50px] font-medium text-sm disabled:opacity-50"
          style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
          disabled={sending || !command.trim()}
          onclick={send}
        >
          {m.common.send()}
        </button>
      </div>
    </div>
  </PluginCard>
{/if}

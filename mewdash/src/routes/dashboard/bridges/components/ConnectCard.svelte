<script lang="ts">
  import { m } from "$lib/i18n";
  import { onDestroy } from "svelte";
  import { bridgesApi, type Bridge, type BridgeCode } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  const POLL_MS = 4000;
  const LINK_COMMAND = ".bridge link CODE";

  interface Props {
    guildId: bigint;
    userId?: string | bigint;
    channels: Array<{ id: string; name: string }>;
    bridges: Bridge[];
    notify: (message: string, type?: "success" | "error") => void;
    errorText: (err: unknown) => string;
    onbridges: (bridges: Bridge[]) => void;
  }

  let { guildId, userId, channels, bridges, notify, errorText, onbridges }: Props = $props();

  let channelId = $state<string | null>(null);
  let entering = $state(false);
  let code = $state<BridgeCode | null>(null);
  let codeChannelId = "";
  let now = $state(Date.now());
  let creating = $state(false);
  let linking = $state(false);
  let linkInput = $state("");
  let copied = $state(false);

  let poll: ReturnType<typeof setInterval> | null = null;
  let tick: ReturnType<typeof setInterval> | null = null;

  const bridgedIds = $derived(new Set(bridges.map((b) => b.channelId.toString())));
  const freeChannels = $derived(channels.filter((c) => !bridgedIds.has(c.id)));
  const remaining = $derived(code ? Math.max(0, Math.floor((new Date(code.expiresAt).getTime() - now) / 1000)) : 0);
  const expired = $derived(!!code && remaining === 0);
  const countdown = $derived(`${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`);

  const inputStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text};`);
  const buttonStyle = $derived(`background: ${$colorStore.primary}20; color: ${$colorStore.text};`);
  const primaryStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);

  function stopPolling() {
    if (poll) clearInterval(poll);
    if (tick) clearInterval(tick);
    poll = null;
    tick = null;
  }

  function startPolling() {
    stopPolling();
    now = Date.now();
    tick = setInterval(() => (now = Date.now()), 1000);
    poll = setInterval(refresh, POLL_MS);
  }

  function clearCode() {
    code = null;
    copied = false;
    stopPolling();
  }

  async function refresh() {
    let list: Bridge[];
    try {
      list = await bridgesApi.list(guildId);
    } catch (err) {
      logger.error("Failed to refresh bridges", err);
      return;
    }
    onbridges(list);

    if (!code) return;
    if (expired) {
      stopPolling();
      return;
    }
    const linked = list.find((b) => b.channelId.toString() === codeChannelId);
    if (linked) {
      notify(m.bridges.linked({ channel: linked.remoteChannelName, community: linked.remoteGuildName }));
      clearCode();
      channelId = null;
    }
  }

  async function createCode() {
    if (!channelId || !userId) return;
    creating = true;
    try {
      code = await bridgesApi.createCode(guildId, { channelId: BigInt(channelId), userId: BigInt(userId) });
      codeChannelId = channelId;
      copied = false;
      startPolling();
    } catch (err) {
      notify(errorText(err), "error");
      logger.error("Failed to create a bridge code", err);
    } finally {
      creating = false;
    }
  }

  async function linkWithCode() {
    if (!channelId || !userId || !linkInput.trim()) return;
    linking = true;
    try {
      const bridge = await bridgesApi.link(guildId, {
        code: linkInput.trim(),
        channelId: BigInt(channelId),
        userId: BigInt(userId)
      });
      notify(m.bridges.linked({ channel: bridge.remoteChannelName, community: bridge.remoteGuildName }));
      linkInput = "";
      channelId = null;
      entering = false;
      onbridges(await bridgesApi.list(guildId));
    } catch (err) {
      notify(errorText(err), "error");
      logger.error("Failed to link a bridge", err);
    } finally {
      linking = false;
    }
  }

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.code);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      logger.error("Failed to copy the bridge code", err);
    }
  }

  onDestroy(stopPolling);
</script>

<PluginCard title={m.bridges.connectTitle()} alwaysOpen>
  <SettingField label={m.bridges.pickChannelHint()} id="bridge-channel">
    <DiscordSelector
      id="bridge-channel"
      type="channel"
      options={freeChannels}
      selected={channelId}
      placeholder={m.common.selectAChannelPlaceholder()}
      onchange={(d) => (channelId = typeof d.selected === "string" ? d.selected : null)}
    />
  </SettingField>

  {#if code && !expired}
    <div class="rounded-lg p-4 space-y-3" style="background: {$colorStore.primary}10;">
      <p class="text-xs" style="color: {$colorStore.muted};">{m.bridges.codeLabel()}</p>
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-3xl font-mono font-bold tracking-widest break-all" style="color: {$colorStore.text};">{code.code}</span>
        <button type="button" class="px-4 min-h-[44px] rounded-lg text-sm font-medium" style={buttonStyle} onclick={copyCode}>
          {copied ? m.common.copied() : m.bridges.codeCopy()}
        </button>
      </div>
      <p class="text-sm" style="color: {$colorStore.muted};" aria-live="off">{m.bridges.codeExpiresIn({ time: countdown })}</p>
      <p class="text-sm" style="color: {$colorStore.muted};">{m.bridges.codeHint({ command: LINK_COMMAND })}</p>
    </div>
  {:else if entering}
    <div class="flex flex-wrap gap-2">
      <input type="text" bind:value={linkInput} placeholder={m.bridges.haveCodePlaceholder()} aria-label={m.bridges.codeLabel()} maxlength="32" autocomplete="off" class="rounded-lg p-2 min-h-[50px] font-mono uppercase flex-1 min-w-[10rem]" style={inputStyle} onkeydown={(e) => e.key === "Enter" && linkWithCode()} />
      <button type="button" class="px-4 min-h-[50px] rounded-lg text-sm font-medium disabled:opacity-50" style={primaryStyle} disabled={!channelId || !linkInput.trim() || linking} onclick={linkWithCode}>
        {m.bridges.link()}
      </button>
      <button type="button" class="px-4 min-h-[50px] rounded-lg text-sm font-medium" style={buttonStyle} onclick={() => (entering = false)}>{m.common.cancel()}</button>
    </div>
  {:else}
    {#if expired}
      <p class="text-sm" style="color: {$colorStore.muted};">{m.bridges.codeExpired()}</p>
    {/if}
    <div class="flex flex-wrap gap-2">
      <button type="button" class="px-4 min-h-[50px] rounded-lg text-sm font-medium disabled:opacity-50" style={primaryStyle} disabled={!channelId || creating} onclick={createCode}>
        {m.bridges.createCode()}
      </button>
      <button type="button" class="px-4 min-h-[50px] rounded-lg text-sm font-medium" style={buttonStyle} onclick={() => (entering = true)}>{m.bridges.haveCode()}</button>
    </div>
  {/if}
</PluginCard>
